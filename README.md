# MKL Workshop

## Task 1: _Backend preparations_

1. Create folder `backend` and navigate inside created folder
2. Run `npm init`
3. Run `npm i -S tsoa express body-parser`
4. Run `npm i -D ts-node typescript mkdirp`
5. Run `npx tsc --init`
6. Open `tsconfig.json`
    - Inside `compilerOptions`, set `experimentalDecorators` and `esModuleInterop` to `true`
7. Create file `tsoa.json`

### Tsoa Configuration

Open `tsoa.json` and copy&paste following snippet

```json
{
    "entryFile": "src/index.ts",
    "noImplicitAdditionalProperties": "throw-on-extras",
    "controllerPathGlobs": ["src/**/*Controller.ts"],
    "spec": {
        "outputDirectory": "../api",
        "specVersion": 3
    },
    "routes": {
        "routesDir": "src/generated"
    }
}
```

Next open your `package.json` and create following run-configs:

```json
"build:api": "mkdirp ../api && mkdirp src/generated && tsoa spec-and-routes",
"build:server": "npm run build:api && tsc",
"dev": "npm run build:api && ts-node ./src/index.ts",
"start": "node ./dist/index.js"
```

`mkdirp` will check, if the specified folders exist and will create them otherwise

`tsoa spec-and-routes` will generate all transpiled controllers and the swagger-specification-file. Optionally you can split this task into `tsoa spec` and `tsoa routes` to only run one of those tasks.

`ts-node` is a run-environment for typesciprt-files. You dont need to manually compile your ts-files into js-files and run them separately. For production purposes it is still recommended, which will be done with `tsc && node ./dist/index.js`

