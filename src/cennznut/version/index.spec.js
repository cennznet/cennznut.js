/*************************
 * Version Encoding Test *
 *************************/
const versionEncoding = require("./");

describe("Version Encoding", () => {
  it("should generate and separate cleanly", () => {
    const payloadVersion = 1000;

    const versionBinary =
      versionEncoding.encode(
        payloadVersion,
    );

    const result = versionEncoding.separate(versionBinary);

    expect(result[0]).toEqual(payloadVersion);
  });
});


