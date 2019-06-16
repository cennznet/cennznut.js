/***********************
 * CENNZnut Core Tests *
 ***********************/

const sdk = require("./");

/*********
 * Setup *
 *********/

const CENNZnetDomain = {
  modules: {
    'generic-asset': {
      blockCooldown: 15046032,
      methods: {
        transfer: {
          blockCooldown: 43125664,
        },
        transfer2: {
          blockCooldown: 0,
        },
      },
    },
  }
}


/*********
 * Tests *
 *********/

describe("Encode CENNZnut", () => {
  it("should encode a valid CENNZnut v0", () => {
    const version = 0;
    const permissions = sdk.encode(
      version,
      CENNZnetDomain
    );

    const result = sdk.decode(permissions);

    expect(result).toEqual(CENNZnetDomain)
  });


  it("should decode Rust generated permissions", () => {
    const permissions = new Uint8Array([
      0, 0, 64, 160, 109, 111, 100, 117, 108, 101, 95, 116, 101, 115, 116, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 138, 128, 0, 128, 109, 101, 116, 104,
      111, 100, 95, 116, 101, 115, 116, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 130, 128, 0, 0, 128, 109, 101, 116, 104, 111, 100, 95, 116, 101, 115, 116,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 222, 0, 0, 0, 160, 109,
      111, 100, 117, 108, 101, 95, 116, 101, 115, 116, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 155, 0, 0, 128, 109, 101, 116, 104, 111, 100, 95, 116,
      101, 115, 116, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 130,
      128, 0, 0, 128, 109, 101, 116, 104, 111, 100, 95, 116, 101, 115, 116, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 222, 0, 0, 0
    ]);

    const result = sdk.decode(permissions);

    expect(result).toEqual({
      modules:
       { module_test:
          { methods:
             { method_test2: { blockCooldown: 321 },
               method_test: { blockCooldown: 123 } },
            blockCooldown: 86400 },
         module_test2:
          { methods:
             { method_test2: { blockCooldown: 321 },
               method_test: { blockCooldown: 123 } },
            blockCooldown: 55555 } }
    })
  });
});


