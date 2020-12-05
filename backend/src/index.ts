import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import {RegisterRoutes} from './generated/routes';

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

RegisterRoutes(app);

app.all('*', (_req: Request, res: Response) => {
    return res.status(404).send('Route not found');
});

app.listen(8080, (err?: Error) => {
    if (err) {
        return console.error(err);
    }
    console.log('Server running on port 8080');
})
