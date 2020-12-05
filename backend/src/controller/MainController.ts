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
        if(payload.optionalBoolean) {
            message = message + ' Well done!';
        }

        return {
            message,
            requestedPage: page,
            yourId: id
        }
    }
}
