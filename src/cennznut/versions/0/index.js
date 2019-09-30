/***************
 * V0 CENNZnut *
 ***************/

const MODULE_META_DATA_BYTE_LENGTH = 1;
const METHOD_META_DATA_BYTE_LENGTH = 1;
const KEY_BYTE_LENGTH = 32;
const MODULE_COUNT_BYTE_LENGTH = 1;
const BLOCK_COOLDOWN_BYTE_LENGTH = 4;
const CONSTRAINTS_LENGTH_BYTE_LENGTH = 1;
const MAX_MODULE_COUNT = 257;
const MAX_METHOD_COUNT = 127;
const MAX_CONSTRAINTS_BYTE_LENGTH = 257;
const MAX_BLOCK_COOLDOWN = Math.pow(2, BLOCK_COOLDOWN_BYTE_LENGTH * 8);

const { stringToU8a } = require("@polkadot/util");
const {
  isObject,
  numberToLEBytes,
  LEBytesToNumber,
  getStringFromU8a,
  flipEndianness,
} = require("@plugnet/binary-encoding-utilities");

function normaliseBlockCooldown(
  obj,
  invalidMsg,
  tooLargeMsg,
) {
  if (obj.blockCooldown == null) {
    obj.blockCooldown = 0;
    return;
  }

  if (typeof obj.blockCooldown !== 'number') {
    throw new Error(invalidMsg);
  }

  if (obj.blockCooldown > MAX_BLOCK_COOLDOWN) {
    throw new Error(tooLargeMsg);
  }
}

function verifyConstraints(method, moduleName, methodName) {
  if (method.constraints) {
    if (!Array.isArray(method.constraints)) {
      throw new Error(
        `Module "${moduleName}"'s method "${methodName}" ` +
        `has invalid constraints specified (expected an Array)`
      )
    }
    if (method.constraints.length == 0) {
      throw new Error(
        `Module "${moduleName}"'s method "${methodName}" ` +
        `has no constraints specified`
      )
    }
    if (method.constraints.length > MAX_CONSTRAINTS_BYTE_LENGTH) {
      throw new Error(
        `Module "${moduleName}"'s method "${methodName}" ` +
        `has more constraints than the allowed ${MAX_CONSTRAINTS_BYTE_LENGTH}`
      )
    }
  }
}

function verifyJSON(permissions) {
  if (!isObject(permissions)) {
    throw new Error("Input should be a certificate object");
  }

  if (!Object.keys(permissions).includes('modules')) {
    throw new Error('Permissions object must have a "modules" object');
  }
  if (!isObject(permissions.modules)) {
    throw new Error('Key "modules" must be an object');
  }


  // Module validation
  let modulesCount = 0;
  Object.keys(permissions.modules)
    .forEach((moduleName) => {
      const module = permissions.modules[moduleName];

      if (!Object.keys(module).includes('methods')) {
        throw new Error(`Module "${moduleName}" must have a "methods" object`);
      }
      if (!isObject(module.methods)) {
        throw new Error(`Key "methods" must be an object on module "${moduleName}"`);
      }

      normaliseBlockCooldown(
        module,
        `Module "${moduleName}" has an invalid "blockCooldown": "${module.blockCooldown}"`,
        `Module "${moduleName}" has a block cooldown larger than the allowed ${MAX_BLOCK_COOLDOWN}`,
      )

      modulesCount++;
      let methodsCount = 0;

      //Method validation
      Object.keys(module.methods)
        .forEach((methodName) => {
          const method = module.methods[methodName];
          verifyConstraints(method, moduleName, methodName);
          normaliseBlockCooldown(
            method,
            `Module "${moduleName}"'s method "${methodName}" has an invalid "blockCooldown": "${method.blockCooldown}"`,
            `Module "${moduleName}"'s method "${methodName}" has a block cooldown larger than the allowed ${MAX_BLOCK_COOLDOWN}`,
          )
          methodsCount++;
        });

      if (methodsCount > MAX_METHOD_COUNT) {
        throw new Error(
          `Module "${moduleName}" may not have more than ${MAX_METHOD_COUNT} methods.`
        )
      }
    });

    if (modulesCount > MAX_MODULE_COUNT) {
      throw new Error(
        `May not have more than ${MAX_MODULE_COUNT} modules.`
      )
    }
}

function processModulesAndMethods(
  permissionsJSON,
  moduleProcessor,
  methodProcessor,
) {
  Object.keys(permissionsJSON.modules)
    .forEach((moduleName) => {
      const module = permissionsJSON.modules[moduleName];

      moduleProcessor(module, moduleName);

      Object.keys(module.methods)
        .forEach((methodName) => {
          const method = module.methods[methodName];

          methodProcessor(module, moduleName, method, methodName);
        });
    });
}

function encode(permissionsJSON) {
  verifyJSON(permissionsJSON);

  let PERMISSIONS_BYTE_LENGTH = 0
  let MODULES_COUNT = 0
  let METHOD_COUNTS = {}
  PERMISSIONS_BYTE_LENGTH += MODULE_COUNT_BYTE_LENGTH;

  // Get byte lengths ahead of time
  processModulesAndMethods(
    permissionsJSON,
    (module, moduleName) => {
      MODULES_COUNT++;
      METHOD_COUNTS[moduleName] = 0;

      const hasBlockCooldown = module.blockCooldown !== 0;
      PERMISSIONS_BYTE_LENGTH += MODULE_META_DATA_BYTE_LENGTH;
      PERMISSIONS_BYTE_LENGTH += KEY_BYTE_LENGTH;
      if (hasBlockCooldown) {
        PERMISSIONS_BYTE_LENGTH += BLOCK_COOLDOWN_BYTE_LENGTH;
      }
    },
    (module, moduleName, method, methodName) => { // eslint-disable-line no-unused-vars
      METHOD_COUNTS[moduleName]++;

      const hasBlockCooldown = method.blockCooldown !== 0;
      PERMISSIONS_BYTE_LENGTH += METHOD_META_DATA_BYTE_LENGTH;
      PERMISSIONS_BYTE_LENGTH += KEY_BYTE_LENGTH;
      if (hasBlockCooldown) {
        PERMISSIONS_BYTE_LENGTH += BLOCK_COOLDOWN_BYTE_LENGTH;
      }
      if (method.constraints) {
        PERMISSIONS_BYTE_LENGTH += CONSTRAINTS_LENGTH_BYTE_LENGTH;
        PERMISSIONS_BYTE_LENGTH += method.constraints.length;
      }
    },
  );

  // Create cennznut byte array
  const permissions = new Uint8Array(PERMISSIONS_BYTE_LENGTH)

  let cursor = 0;
  numberToLEBytes(
    MODULES_COUNT - 1,
    permissions,
    MODULE_COUNT_BYTE_LENGTH,
    cursor
  );
  cursor += MODULE_COUNT_BYTE_LENGTH;

  processModulesAndMethods(
    permissionsJSON,


    /* MODULE ENCODING */
    (module, moduleName) => {
      // set method count
      numberToLEBytes(
        METHOD_COUNTS[moduleName],
        permissions,
        MODULE_META_DATA_BYTE_LENGTH,
        cursor,
      );
      permissions[cursor] = permissions[cursor] >> 1;

      // set has_block_cooldown
      if (module.blockCooldown) {
        permissions[cursor] |= (1 << 7);
      }

      // increment cursor past meta data byte
      cursor += MODULE_META_DATA_BYTE_LENGTH;

      // set module name
      const moduleNameBinary = stringToU8a(moduleName)
      permissions.set(moduleNameBinary, cursor)
      cursor += KEY_BYTE_LENGTH;

      // if has_block_cooldown
      if (module.blockCooldown) {
        // set block_cooldown
        numberToLEBytes(
          module.blockCooldown,
          permissions,
          BLOCK_COOLDOWN_BYTE_LENGTH,
          cursor,
        );
        cursor += BLOCK_COOLDOWN_BYTE_LENGTH;
      }
    /* END MODULE ENCODING */


    /* METHOD ENCODING */
    },
    (module, moduleName, method, methodName) => {
      // set has_block_cooldown
      if (method.blockCooldown) {
        permissions[cursor] |= (1 << 7);
      }

      if (method.constraints) {
        permissions[cursor] |= (1 << 6);
      }

      // increment cursor past meta data byte
      cursor += METHOD_META_DATA_BYTE_LENGTH;

      const methodNameBinary = stringToU8a(methodName)
      permissions.set(methodNameBinary, cursor)
      cursor += KEY_BYTE_LENGTH;

      // if has_block_cooldown
      if (method.blockCooldown) {
        // set block_cooldown
        numberToLEBytes(
          method.blockCooldown,
          permissions,
          BLOCK_COOLDOWN_BYTE_LENGTH,
          cursor,
        );
        cursor += BLOCK_COOLDOWN_BYTE_LENGTH;
      }

      if (method.constraints) {
        permissions[cursor] = flipEndianness(method.constraints.length);
        cursor += CONSTRAINTS_LENGTH_BYTE_LENGTH;
        permissions.set(method.constraints, cursor)
      }
    }
    /* END METHOD ENCODING */
  );

  return permissions;
}

function decode(permissions) {
  if (!(permissions instanceof Uint8Array)) {
    throw new Error(
      "Tried to decode a CENNZnet permissions domain that was not a Uint8Array"
    )
  }

  const result = {};

  let cursor = 0;
  const MODULES_COUNT = LEBytesToNumber(
    permissions,
    MODULE_COUNT_BYTE_LENGTH,
    cursor,
  ) + 1;
  cursor += MODULE_COUNT_BYTE_LENGTH;

  if (MODULES_COUNT) {
    result.modules = {}
  }

  /* READ MODULES */
  for (
    let i = 0;
    i < MODULES_COUNT;
    i++
  ) {
    // get moduleHasBlockCooldown
    const moduleHasBlockCooldown = (
      (permissions[cursor] & (1 << 7)) != 0
    );

    // get methods count
    permissions[cursor] = permissions[cursor] << 1
    const METHODS_COUNT = LEBytesToNumber(
      permissions,
      METHOD_META_DATA_BYTE_LENGTH,
      cursor
    );
    cursor += MODULE_META_DATA_BYTE_LENGTH;

    // get moduleName
    const moduleName = getStringFromU8a(
      permissions,
      KEY_BYTE_LENGTH,
      cursor,
    )
    cursor += KEY_BYTE_LENGTH;

    // create module object
    result.modules[moduleName] = {};

    let methods;
    if (METHODS_COUNT) {
      methods = result.modules[moduleName].methods = {}
    }

    // set blockCooldown if needed
    if (moduleHasBlockCooldown) {
      result.modules[moduleName].blockCooldown =
        LEBytesToNumber(
          permissions,
          BLOCK_COOLDOWN_BYTE_LENGTH,
          cursor,
        );
      cursor += BLOCK_COOLDOWN_BYTE_LENGTH;
    } else {
      result.modules[moduleName].blockCooldown = 0;
    }


    /* READ METHODS */
    for (
      let i = 0;
      i < METHODS_COUNT;
      i++
    ) {
        // get methodHasBlockCooldown & methodHasConstraints
        const methodHasBlockCooldown = (
          (permissions[cursor] & (1 << 7)) != 0
        );
        const methodHasConstraints = (
          (permissions[cursor] & (1 << 6)) != 0
        );
        cursor += METHOD_META_DATA_BYTE_LENGTH;

        // get methodName
        const methodName = getStringFromU8a(
          permissions,
          KEY_BYTE_LENGTH,
          cursor,
        )
        cursor += KEY_BYTE_LENGTH;

        // create method object
        methods[methodName] = {}

        // set blockCooldown if needed
        if (methodHasBlockCooldown) {
          methods[methodName].blockCooldown =
            LEBytesToNumber(
              permissions,
              BLOCK_COOLDOWN_BYTE_LENGTH,
              cursor,
            );
          cursor += BLOCK_COOLDOWN_BYTE_LENGTH;
        } else {
          methods[methodName].blockCooldown = 0;
        }

        // set constraints if needed
        if (methodHasConstraints) {
          const constraintsLength = LEBytesToNumber(
            permissions,
            CONSTRAINTS_LENGTH_BYTE_LENGTH,
            cursor,
          );
          cursor += CONSTRAINTS_LENGTH_BYTE_LENGTH;

          methods[methodName].constraints = Array.from(
            permissions.slice(
              cursor,
              cursor + constraintsLength,
            )
          );
          cursor += constraintsLength;
        } else {
          methods[methodName].constraints = [];
        }
    }
    /* END READ METHODS */

  }
  /* END READ MODULES */

  return result;
}

module.exports = {
  encode,
  decode,
  MAX_BLOCK_COOLDOWN,
  MAX_CONSTRAINTS_BYTE_LENGTH,
}
