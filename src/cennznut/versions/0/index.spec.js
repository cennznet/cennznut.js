/*********************
 * CENNZnut V0 Tests *
 *********************/

const cennznut = require("./");

/*********
 * Tests *
 *********/

describe("Encode CENNZnut", () => {
  it("encodes 1 module as 0", () => {
      const encoded = cennznut.encode({
          "modules": {
              "generic-asset": {
                  "methods": {
                      "transfer": {}
                  }
              }
          }
      });
      expect(encoded[0]).toEqual(0b00000000);
  });

  it("encodes 2 modules as 1", () => {
      const encoded = cennznut.encode({
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
      expect(encoded[0]).toEqual(0b10000000);
  });

  it("encodes with valid block cooldown", () => {
    expect(() => {
      cennznut.encode({
        "modules": {
          "generic-asset": {
            "methods": {
              "transfer": { "blockCooldown": cennznut.MAX_BLOCK_COOLDOWN + 1 }
            }
          }
        }
      })
    }).toThrow(
      `Module "generic-asset"'s method "transfer" has a block cooldown ` +
      `larger than the allowed ${cennznut.MAX_BLOCK_COOLDOWN}`
    );
  });

  it("encodes with valid number of constraints", () => {
    const constraints = new Array(cennznut.MAX_CONSTRAINTS_COUNT + 1);
    expect(() => {
      cennznut.encode({
        "modules": {
          "generic-asset": {
            "methods": { "transfer": { "constraints": constraints } }
          }
        }
      })
    }).toThrow(
      `Module "generic-asset"'s method "transfer" has more constraints than ` +
      `the allowed ${cennznut.MAX_CONSTRAINTS_COUNT}`);
  });
});

describe("Decode CENNZnut", () => {
  it("decodes 0 module byte as 1", () => {
      const encoded = new Uint8Array([0,0,0,64,103,101,110,101,114,105,99,45,97,115,115,101,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,116,114,97,110,115,102,101,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
      let c = cennznut.decode(encoded);
      expect(Object.keys(c.modules).length).toEqual(1);
  });

  it("decodes 1 module byte as 2", () => {
      const encoded = new Uint8Array([128,64,103,101,110,101,114,105,99,45,97,115,115,101,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,116,114,97,110,115,102,101,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,97,116,116,101,115,116,97,116,105,111,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,99,114,101,97,116,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
      let c = cennznut.decode(encoded);
      expect(Object.keys(c.modules).length).toEqual(2);
  });
});
