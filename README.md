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

