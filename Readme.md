# CENNZnut.js
[![CircleCI](https://circleci.com/gh/cennznet/cennznut.js.svg?style=svg)](https://circleci.com/gh/cennznet/cennznut.js)

`CENNZnut.js` implements the [Doughnut](https://github.com/cennznet/doughnut-paper) protocol [CENNZnet Permission Domain](https://github.com/cennznet/doughnut-paper/blob/master/CENNZnet_format.md) in JavaScript.

## Installing

This package is not yet in the NPM registry, but you may still install it via npm:

```
npm install --save cennznet/cennznut.js
```

## Development

Run tests:
```
npm test
```

Run lint:
```
npm run lint
```

## API

```
Interface {
    encode: encodePermissions,
    decode: decodePermissions
}
```

## CENNZnet Permissions Object

Versioned JSON representations of the CENNZnet (`cennznet`) Doughnut Permission Domain.

### v0


```
Object {
    "modules": {
        "<MODULE_NAME>": {
            "blockCooldown": 5
            "methods": {
                "<METHOD_NAME>": {
                    "blockCooldown": 5,
                    "constraints"": [
                        0, 192, 128, 16, 246, 0, 0, 0, 0, 0, 0, 0, 128, 16,
                        178, 128, 0, 0, 0, 0, 0, 0, 0, 224, 116, 101, 115, 116,
                        105, 110, 103, 5, 0, 0, 1, 0, 5, 0, 1, 1, 1
                    ]
                },
                ...
            }
        },
        ...
    }
}
```

##### Notes
* `blockCooldown` indicates how many blocks may pass before the permission set is valid again
* When `blockCooldown` is 0 or not present, there is no block cooldown
* When a module is specified without any methods, access is granted to all methods
* When both a module and one of its methods have `blockCooldown`, method's `blockCooldown` is used when calling method
* `<MODULE_NAME>` is the crate name, with any `*rml-` prefix removed

## `encodePermissions`

Encode a CENNZnet permission set. Returns a `Uint8Array`.

```
encodePermissions(
  version,                   // Currently 0
  CENNZnetPermissionsObject, // The CENNZnet Permissions Object described above
) -> Uint8Array
```

## `decodePermissions`

Decode the JSON representation. Returns a `CENNZnetPermissionsObject` if valid.

```
decodePermissions(
    permissions: Uint8Array
) -> Object
```
