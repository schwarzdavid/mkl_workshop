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
    "controllerPathGlobs": [
        "src/**/*Controller.ts"
    ],
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

`tsoa spec-and-routes` will generate all transpiled controllers and the swagger-specification-file. Optionally you can
split this task into `tsoa spec` and `tsoa routes` to only run one of those tasks.

`ts-node` is a run-environment for typesciprt-files. You dont need to manually compile your ts-files into js-files and
run them separately. For production purposes it is still recommended, which will be done
with `tsc && node ./dist/index.js`

## Task 2: First Route

1. Create folder `src` in your `backend`-folder
2. Create file `index.ts` inside the `src`-folder
3. Create folder `controller` inside the `src`-folder
4. Create file `MainController.ts` inside the `src/controller`-folder

### MainController

Paste following snippet into `MainController`

```typescript
import {Controller, Get, Route} from 'tsoa';

@Route('/main')
export class MainController extends Controller {

    @Get('/')
    ping(): string {
        return 'Pong';
    }

}
```

The `@Route`-decorator defines the route-prefix for all operations/routes inside the controller. Therefore the path for
the `ping`-route will be `/main/`.

### Basic HTTP-Server

Paste following snippet into `index.ts`

```typescript
import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.all('*', (_req: Request, res: Response) => {
    return res.status(404).send('Route not found');
});

app.listen(8080, (err?: Error) => {
    if (err) {
        return console.error(err);
    }
    console.log('Server running on port 8080');
})
```

[http://expressjs.com/](Express) is a NodeJS-Framework for HTTP(S)-Services.

Once you run `npm run dev`, you should get the message `Server running on port 8080` in your terminal. However, if you
send a HTTP-Request to `http://localhost:8080/main`, you will receive an 404-error. Thats because the `MainController`
has not been registered yet.

### Register TSOA-Controller

First, run `npm run build:api`, which will create a folder `generated` inside the `src`-folder and also an `api`-folder
in the project-root. If you open the `swagger.json` inside, you should see the specs for the ping-function you have
declared in the MainController before.

Now open `index.ts` again, and paste following snipped at the begin of the file

```typescript
import {RegisterRoutes} from './generated/routes';
```

and also the following snipped right after the two `app.use(...)`-lines:

```typescript
RegisterRoutes(app);
```

With `tsoa routes`, tsoa has generated a file which contains a runnable version of your MainController, and any other
Controllers you might create in the future. Now restart the server and you should get a 'Pong'-Response when you make a
GET-Request to `http://localhost:8080/main`

### Routes with body & parameters

For the sake of demonstration, open the `MainController` again update the file to following snippet:

```typescript
import {Controller, Post, Path, Query, Body, Get, Route} from 'tsoa';

interface DemoRequest {
    name: string,
    randomNumber: number,
    optionalBoolean?: boolean
}

interface DemoResponse {
    message: string,
    yourId: number,
    requestedPage?: number
}

@Route('/main')
export class MainController extends Controller {

    @Get('/')
    ping(): string {
        return 'Pong';
    }

    @Post('/demo/{id}')
    demo(
        @Path() id: number,
        @Body() payload: DemoRequest,
        @Query() page?: number
    ): DemoResponse {
        let message = `Hello ${payload.name}. Your lucky number is ${payload.randomNumber}.`;
        if (payload.optionalBoolean) {
            message = message + ' Well done!';
        }

        return {
            message,
            requestedPage: page,
            yourId: id
        }
    }
}
```

This will generate another route, which will contain an url- & query-parameter and also requires a body. You can test
those routes with [Postman](https://www.postman.com/) or with the `api.http`-file in this repo. Copy&Paste it into your
project and run it with your IDE.

## Task 3 _Frontend preparations_

1. Go to the project-root
2. Run `vue create frontend`
3. Select `Manually select features`
4. Make sure, `TypeScript` is enabled and finish setup process however you like
5. Go inside the `frontend`-folder
6. Run `npm i -D @openapitools/openapi-generator-cli`

Open the `package.json` inside the `frontend`-folder and add the following run-config:

```
"build:api": "openapi-generator-cli generate -i ../api/swagger.json -o src/generated -g typescript-fetch --additional-properties=typescriptThreePlus=true"
```

Next, create inside the `frontend`-folder a file named `vue.config.js` and paste the following snipped into it:

```typescript
module.exports = {
    devServer: {
        port: 3000,
        proxy: 'http://localhost:8080'
    }
}
```

With the `proxy`-option, the vue-devserver will redirect all requests, which do not lead to existing resources, to your
backend on port 8080.

### Generate API-Client

[Make sure you have Java 8 set as JAVA_HOME](https://github.com/OpenAPITools/openapi-generator#13---download-jar)

Next, run `npm run build:api`. You will see a new folder `generated` inside the `src`-folder.

Now, open the `HelloWorld.vue` and replace `script` and `template` with the following snippet:

```vue

<template>
    <div class="hello">
        <h3>API Calls</h3>
        <form @submit.prevent="sendDemoRequest">
            <input type="text" v-model="demoRequest.name" required>
            <br>
            <input type="number" v-model.number="demoRequest.randomNumber" required>
            <br>
            <input type="checkbox" v-model="demoRequest.optionalBoolean"> Optional Boolean
            <br>
            <button type="submit">Send Request</button>
        </form>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Configuration, DefaultApi, DemoRequest} from '@/generated';

    const apiConfiguration = new Configuration({
        basePath: location.origin
    });
    const api = new DefaultApi(apiConfiguration);

    export default Vue.extend({
        name: 'HelloWorld',
        data() {
            return {
                demoRequest: {
                    name: '',
                    randomNumber: 0,
                    optionalBoolean: false
                } as DemoRequest
            }
        },
        methods: {
            async sendDemoRequest() {
                const response = await api.demo({
                    id: 12,
                    page: 23,
                    demoRequest: this.demoRequest
                });
                alert(JSON.stringify(response));
            }
        }
    });
</script>
```

`DemoRequest` is the generated interface from the `MainController` in the backend. Also, the `id`-param and the
optional `page`-queryparam are needed. If you change the api in the future, those interfaces will also update and you
will get an error on compilation.

In larger projects, you should do HTTP-Requests inside a Vuex-Store. You can do the same in any store or vuex-module.
Simply instanciate the api you want to use.
