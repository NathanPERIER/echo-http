import express from 'express';
import bodyParser from 'body-parser';
import { echo_handler } from './handler.js';

const app = express();

app.use(bodyParser.raw({ inflate: true, limit: '100kb', type: '*/*' }));
app.use(echo_handler);

export default app;