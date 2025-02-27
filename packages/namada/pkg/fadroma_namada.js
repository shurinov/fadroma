let wasm;

function logError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        let error = (function () {
            try {
                return e instanceof Error ? `${e.message}\n\nStack:\n${e.stack}` : e.toString();
            } catch(_) {
                return "<failed to stringify thrown value>";
            }
        }());
        console.error("wasm-bindgen: imported JS function that was not marked as `catch` threw an error:", error);
        throw e;
    }
}

function _assertNum(n) {
    if (typeof(n) !== 'number') throw new Error(`expected a number argument, found ${typeof(n)}`);
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function _assertBoolean(n) {
    if (typeof(n) !== 'boolean') {
        throw new Error(`expected a boolean argument, found ${typeof(n)}`);
    }
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_2.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (typeof(arg) !== 'string') throw new Error(`expected a string argument, found ${typeof(arg)}`);

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);
        if (ret.read !== arg.length) throw new Error('failed to pass whole string');
        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function _assertBigInt(n) {
    if (typeof(n) !== 'bigint') throw new Error(`expected a bigint argument, found ${typeof(n)}`);
}

const DecodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_decode_free(ptr >>> 0, 1));

export class Decode {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DecodeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_decode_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} source
     * @returns {bigint}
     */
    static u32(source) {
        const ret = wasm.decode_u32(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {bigint}
     */
    static u64(source) {
        const ret = wasm.decode_u64(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {Array<any>}
     */
    static vec_string(source) {
        const ret = wasm.decode_vec_string(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {string}
     */
    static code_hash(source) {
        const ret = wasm.decode_code_hash(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {object}
     */
    static storage_keys() {
        const ret = wasm.decode_storage_keys();
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static epoch_duration(source) {
        const ret = wasm.decode_epoch_duration(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static gas_cost_table(source) {
        const ret = wasm.decode_gas_cost_table(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static tx(source) {
        const ret = wasm.decode_tx(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {string}
     */
    static address(source) {
        const ret = wasm.decode_address(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {Array<any>}
     */
    static addresses(source) {
        const ret = wasm.decode_addresses(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static address_to_amount(source) {
        const ret = wasm.decode_address_to_amount(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} block_json
     * @param {string | null} [_block_results_json]
     * @returns {object}
     */
    static block(block_json, _block_results_json) {
        const ptr0 = passStringToWasm0(block_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(_block_results_json) ? 0 : passStringToWasm0(_block_results_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.decode_block(ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static pos_parameters(source) {
        const ret = wasm.decode_pos_parameters(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static pos_validator_metadata(source) {
        const ret = wasm.decode_pos_validator_metadata(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static pos_commission_pair(source) {
        const ret = wasm.decode_pos_commission_pair(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {any}
     */
    static pos_validator_state(source) {
        const ret = wasm.decode_pos_validator_state(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {any}
     */
    static pos_validator_set(source) {
        const ret = wasm.decode_pos_validator_set(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static pgf_parameters(source) {
        const ret = wasm.decode_pgf_parameters(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static gov_parameters(source) {
        const ret = wasm.decode_gov_parameters(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static gov_proposal(source) {
        const ret = wasm.decode_gov_proposal(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {bigint} id
     * @returns {string}
     */
    static gov_proposal_code_key(id) {
        let deferred1_0;
        let deferred1_1;
        try {
            _assertBigInt(id);
            const ret = wasm.decode_gov_proposal_code_key(id);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} token
     * @param {string} owner
     * @returns {string}
     */
    static balance_key(token, owner) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(token, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(owner, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.decode_balance_key(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {Uint8Array} source
     * @returns {Array<any>}
     */
    static gov_votes(source) {
        const ret = wasm.decode_gov_votes(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static gov_result(source) {
        const ret = wasm.decode_gov_result(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {Uint8Array} source
     * @returns {object}
     */
    static bonds_and_unbonds(source) {
        const ret = wasm.decode_bonds_and_unbonds(source);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_BigInt_470dd987b8190f8e = function() { return logError(function (arg0) {
        const ret = BigInt(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_add_883d9432f9188ef2 = function() { return logError(function (arg0, arg1) {
        const ret = arg0.add(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function() { return logError(function (arg0) {
        const ret = arg0.buffer;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_from_2a5d3e218e67aa85 = function() { return logError(function (arg0) {
        const ret = Array.from(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_length_a446193dc22c12f8 = function() { return logError(function (arg0) {
        const ret = arg0.length;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_405e22f390576ce2 = function() { return logError(function () {
        const ret = new Object();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_78feb108b6472713 = function() { return logError(function () {
        const ret = new Array();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_a12002a7f91c75be = function() { return logError(function (arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_a239edaa1dc2968f = function() { return logError(function (arg0) {
        const ret = new Set(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_c68d7209be747379 = function() { return logError(function (arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_push_737cfc8c1432c2c6 = function() { return logError(function (arg0, arg1) {
        const ret = arg0.push(arg1);
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_65595bdd868b3009 = function() { return logError(function (arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_set_bb8cecf6a62b9f46 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_array_new = function() {
        const ret = [];
        return ret;
    };
    imports.wbg.__wbindgen_array_push = function(arg0, arg1) {
        arg0.push(arg1);
    };
    imports.wbg.__wbindgen_bigint_from_i128 = function(arg0, arg1) {
        const ret = arg0 << BigInt(64) | BigInt.asUintN(64, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_i64 = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        const ret = BigInt.asUintN(64, arg0);
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_2;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }


    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
