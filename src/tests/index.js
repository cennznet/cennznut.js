const cennznut = require("../cennznut");

function it_encodes_1_module_as_0() {
    const encoded = cennznut.encode(0, {
        "modules": {
            "generic-asset": {
                "methods": {
                    "transfer": {}
                }
            }
        }
    });
    if (encoded[2] !== 0) {
        throw Error("One module should encode to byte value '0'")
    }
}

function it_encodes_2_modules_as_1() {
    const encoded = cennznut.encode(0, {
        "modules": {
            "generic-asset": {
                "methods": {
                    "transfer": {}
                }
            },
            "attestation": {
                "methods": {
                    "create": {}
                }
            }
        }
    });
    if (encoded[2] !== 128) {
        throw Error("Two modules should encode to byte value '128'")
    }
}

function it_decodes_0_module_byte_as_1() {
    const encoded = new Uint8Array([0,0,0,64,103,101,110,101,114,105,99,45,97,115,115,101,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,116,114,97,110,115,102,101,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    let c = cennznut.decode(encoded);
    if (c.modules.length === 1) {
        throw Error("One module should be decoded from byte value '0'")
    }
}

function it_decodes_1_module_byte_as_2() {
    const encoded = new Uint8Array([0,0,128,64,103,101,110,101,114,105,99,45,97,115,115,101,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,116,114,97,110,115,102,101,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,97,116,116,101,115,116,97,116,105,111,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,99,114,101,97,116,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    let c = cennznut.decode(encoded);
    if (c.modules.length === 2) {
        throw Error("Two modules should be decoded from byte value '128'")
    }
}

// Run tests
it_encodes_1_module_as_0();
it_encodes_2_modules_as_1();
it_decodes_0_module_byte_as_1();
it_decodes_1_module_byte_as_2();
console.log("Tests are passing 🍩K!");