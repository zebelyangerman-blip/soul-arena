'use strict';

(function initSoulArenaCloudSync() {
    const ENGINE_VERSION = 'R36.0.0';
    const SCHEMA_VERSION = 1;
    const META_KEY = 'sad_r36_meta';
    const CHUNK_PREFIX = 'sad_r36_';
    const MAX_CHUNK_BYTES = 2800;
    const MAX_CHUNKS = 64;

    function utf8Bytes(value) {
        const text = String(value ?? '');
        if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
        try { return unescape(encodeURIComponent(text)).length; } catch (_) { return text.length; }
    }

    function splitUtf8(value, maxBytes = MAX_CHUNK_BYTES) {
        const text = String(value ?? '');
        const out = [];
        let part = '';
        let partBytes = 0;
        for (const char of text) {
            const charBytes = utf8Bytes(char);
            if (part && partBytes + charBytes > maxBytes) {
                out.push(part);
                part = '';
                partBytes = 0;
            }
            if (charBytes > maxBytes) throw new Error('Single character exceeds cloud chunk size');
            part += char;
            partBytes += charBytes;
        }
        if (part || !out.length) out.push(part);
        return out;
    }

    function fnv1a(value) {
        const text = String(value ?? '');
        let hash = 0x811c9dc5;
        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193) >>> 0;
        }
        return hash.toString(16).padStart(8, '0');
    }

    function parseJson(value, fallback = null) {
        try { return JSON.parse(String(value ?? '')); } catch (_) { return fallback; }
    }

    function validateEnvelope(value) {
        if (!value || typeof value !== 'object') return false;
        if (Number(value.schemaVersion) !== SCHEMA_VERSION) return false;
        if (!value.payload || typeof value.payload !== 'object') return false;
        return true;
    }

    function makeEnvelope(payload, revision = 1, updatedAt = Date.now()) {
        return {
            schemaVersion: SCHEMA_VERSION,
            revision: Math.max(1, Number.parseInt(revision, 10) || 1),
            updatedAt: Math.max(1, Number(updatedAt) || Date.now()),
            payload: payload && typeof payload === 'object' ? payload : {}
        };
    }

    function createVkAdapter(bridge) {
        if (!bridge || typeof bridge.send !== 'function') return null;
        return {
            id: 'vk',
            async getMany(keys) {
                const res = await bridge.send('VKWebAppStorageGet', { keys:Array.from(keys || []) });
                const map = {};
                for (const row of Array.isArray(res?.keys) ? res.keys : []) map[String(row.key)] = String(row.value ?? '');
                return map;
            },
            async setOne(key, value) {
                await bridge.send('VKWebAppStorageSet', { key:String(key), value:String(value ?? '') });
                return true;
            }
        };
    }

    function createOkAdapter(FAPI) {
        if (!FAPI?.Client?.call) return null;
        function call(params) {
            return new Promise((resolve, reject) => {
                try {
                    FAPI.Client.call(params, (status, data, error) => {
                        if (status === 'ok') resolve(data);
                        else reject(error || new Error('OK API call failed'));
                    });
                } catch (error) { reject(error); }
            });
        }
        return {
            id: 'ok',
            async getMany(keys) {
                const list = Array.from(keys || []).map(String);
                const data = await call({ method:'storage.get', keys:list, scope:'CUSTOM' });
                const source = data?.data && typeof data.data === 'object' ? data.data : (data && typeof data === 'object' ? data : {});
                const map = {};
                for (const key of list) map[key] = source[key] == null ? '' : String(source[key]);
                return map;
            },
            async setOne(key, value) {
                const data = await call({ method:'storage.set', key:String(key), value:String(value ?? ''), scope:'CUSTOM' });
                if (data && Object.prototype.hasOwnProperty.call(data, 'success') && data.success !== true) throw new Error('OK storage.set returned success=false');
                return true;
            }
        };
    }

    async function load(adapter) {
        if (!adapter) return { ok:false, empty:true, reason:'adapter-unavailable' };
        const metaMap = await adapter.getMany([META_KEY]);
        const meta = parseJson(metaMap?.[META_KEY], null);
        if (!meta || Number(meta.schemaVersion) !== SCHEMA_VERSION || !(Number(meta.chunks) > 0)) {
            return { ok:true, empty:true, revision:0, envelope:null };
        }
        const count = Math.min(MAX_CHUNKS, Math.max(1, Number.parseInt(meta.chunks, 10) || 0));
        const keys = Array.from({length:count}, (_, i) => `${CHUNK_PREFIX}${i}`);
        const values = await adapter.getMany(keys);
        let serialized = '';
        for (const key of keys) {
            const part = values?.[key];
            if (typeof part !== 'string' || !part.length) return { ok:false, empty:false, reason:'missing-chunk', key };
            serialized += part;
        }
        if (Number(meta.bytes) !== utf8Bytes(serialized)) return { ok:false, empty:false, reason:'byte-length-mismatch' };
        if (String(meta.hash || '') !== fnv1a(serialized)) return { ok:false, empty:false, reason:'checksum-mismatch' };
        const envelope = parseJson(serialized, null);
        if (!validateEnvelope(envelope)) return { ok:false, empty:false, reason:'invalid-envelope' };
        return { ok:true, empty:false, revision:Number(envelope.revision)||0, envelope };
    }

    async function save(adapter, envelope, previousChunkCount = 0) {
        if (!adapter) throw new Error('Cloud adapter unavailable');
        if (!validateEnvelope(envelope)) throw new Error('Invalid cloud envelope');
        const serialized = JSON.stringify(envelope);
        const chunks = splitUtf8(serialized, MAX_CHUNK_BYTES);
        if (chunks.length > MAX_CHUNKS) throw new Error(`Cloud payload requires ${chunks.length} chunks; max is ${MAX_CHUNKS}`);
        for (let i = 0; i < chunks.length; i++) await adapter.setOne(`${CHUNK_PREFIX}${i}`, chunks[i]);
        const staleCount = Math.min(MAX_CHUNKS, Math.max(0, Number.parseInt(previousChunkCount, 10) || 0));
        for (let i = chunks.length; i < staleCount; i++) await adapter.setOne(`${CHUNK_PREFIX}${i}`, '');
        const meta = {
            schemaVersion: SCHEMA_VERSION,
            revision: Number(envelope.revision)||1,
            updatedAt: Number(envelope.updatedAt)||Date.now(),
            chunks: chunks.length,
            bytes: utf8Bytes(serialized),
            hash: fnv1a(serialized)
        };
        await adapter.setOne(META_KEY, JSON.stringify(meta));
        return { ok:true, meta, envelope };
    }

    async function inspectMeta(adapter) {
        if (!adapter) return null;
        const metaMap = await adapter.getMany([META_KEY]);
        return parseJson(metaMap?.[META_KEY], null);
    }

    function validate() {
        const sample = makeEnvelope({ text:'Тест cloud sync', rating:{rating:800} }, 7, 123456);
        const serialized = JSON.stringify(sample);
        const chunks = splitUtf8(serialized, 32);
        const rebuilt = chunks.join('');
        const errors = [];
        if (rebuilt !== serialized) errors.push('UTF-8 chunk rebuild mismatch');
        if (chunks.some(x => utf8Bytes(x) > 32)) errors.push('Chunk byte limit exceeded');
        if (!validateEnvelope(parseJson(rebuilt))) errors.push('Envelope validation failed');
        if (fnv1a(rebuilt) !== fnv1a(serialized)) errors.push('Checksum is unstable');
        return Object.freeze({ ok:errors.length===0, engineVersion:ENGINE_VERSION, schemaVersion:SCHEMA_VERSION, maxChunkBytes:MAX_CHUNK_BYTES, errors:Object.freeze(errors) });
    }

    window.SOUL_ARENA_CLOUD_SYNC = Object.freeze({
        engineVersion:ENGINE_VERSION,
        schemaVersion:SCHEMA_VERSION,
        metaKey:META_KEY,
        chunkPrefix:CHUNK_PREFIX,
        maxChunkBytes:MAX_CHUNK_BYTES,
        utf8Bytes,
        splitUtf8,
        fnv1a,
        makeEnvelope,
        createVkAdapter,
        createOkAdapter,
        inspectMeta,
        load,
        save,
        validate
    });
})();
