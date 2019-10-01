// Copyright 2019 Centrality Investments Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*****************
 * CENNZnut Core *
 *****************/

const versions = require('./versions');
const version = require('./version');

const VERSION_BYTE_LENGTH = version.byteLength;


function encode(
  permissionsVersion,
  permissions,
) {
  if (versions[permissionsVersion] == null) {
    throw new Error('That permissions version isn\'t supported.');
  }

  const encode = versions[permissionsVersion].encode;

  // cursor, indicating current offset in permissions
  let cursor = 0;

  const permissionsBinary = encode(permissions)

  // Uint8Array to hold permissions
  const cennznutBinary = new Uint8Array(
    permissionsBinary.length +
    VERSION_BYTE_LENGTH
  );

  // set version
  const versionBinay = version.encode(permissionsVersion);
  cennznutBinary.set(versionBinay, cursor);
  cursor += VERSION_BYTE_LENGTH;

  // set permissions
  cennznutBinary.set(permissionsBinary, cursor);

  return cennznutBinary;
}



function decode(permissions) {
  if (!(permissions instanceof Uint8Array)) {
    throw new Error("Input should be a Uint8Array");
  }

  // separate and decode the version
  const [permissionsVersion, permissionsBinary] =
    version.separate(permissions)

  // validate the version numbers
  if (versions[permissionsVersion] == null) {
    throw new Error('That version isn\'t supported.');
  }

  // get relevant version decoder
  const decode = versions[permissionsVersion].decode;

  // decode the permissions
  const decodedPermissions = decode(permissionsBinary);

  return decodedPermissions;
}



module.exports = {
  encode,
  decode,
};
