import express from 'express';
import { echo_handler } from './handler.js';

const app = express();


app.get('/*', echo_handler);

export default app;