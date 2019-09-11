/********************
 * Version Encoding *
 ********************/
const {
  flipEndianness,
} = require("binary-encoding-utilities");

const VERSION_MASK = 0b1111111111000000;
const VERSION_BYTE_LENGTH = 2;
const MAX_PAYLOAD_VERSION = 1023;

function encode(
  payloadVersion,
) {
  if (payloadVersion > MAX_PAYLOAD_VERSION) {
    throw new Error(
      `CENNZnut version may not be higher than ${MAX_PAYLOAD_VERSION}.`
    )
  }

  let v = new Uint16Array(1);

  // build payload version
  v[0] = payloadVersion;
  v[0] = flipEndianness(v[0], 16)

  // final version u8a
  let version = new Uint8Array(VERSION_BYTE_LENGTH);
  version[1] = v[0]
  v[0] = v[0] >> 8;
  version[0] = v[0]

  return version;
}

function separate(permissions) {
  let v = new Uint16Array(1);

  v[0] |= permissions[0];
  v[0] = v[0] << 8;
  v[0] |= permissions[1];

  // payload version
  v[0] &= VERSION_MASK;
  v[0] = flipEndianness(v, 16);

  return [
    v[0],
    permissions.slice(2)
  ]
}

module.exports = {
  byteLength: VERSION_BYTE_LENGTH,
  encode,
  separate,
}

