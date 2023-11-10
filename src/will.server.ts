import HTTPError from 'http-errors';
import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { clear } from './other';
import { adminSessionStart, adminSessionStatus, adminSessionUpdate, adminSessionsView } from './will';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const { autoStartNum } = req.body;
  const response = adminSessionStart(token, quizId, autoStartNum);
  if ('error' in response && response.error === 'Invalid token') {
    throw HTTPError(401, response.error);
  }
  if ('error' in response && response.error === 'quizId is not owned by user') {
    throw HTTPError(403, response.error);
  }
  if ('error' in response) {
    throw HTTPError(400, response.error)
  }
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const response = adminSessionsView(token, quizId);
  if ('error' in response && response.error === 'Invalid token') {
    throw HTTPError(401, response.error);
  }
  if ('error' in response) {
    throw HTTPError(403, response.error)
  }
  res.status(200).json(response)
})

app.get('v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid)
  const response = adminSessionStatus(token, quizId, sessionId)
  if ('error' in response && response.error === 'Invalid sessionId') {
    throw HTTPError(400, response.error)
  }
  if ('error' in response && response.error === 'Invalid token') {
    throw HTTPError(401, response.error);
  }
  if ('error' in response) {
    throw HTTPError(403, response.error)
  }
  res.status(200).json(response)
})

app.put('/v1/admin/1uiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid)
  const { action } = req.body;
  const response = adminSessionUpdate(token, quizId, sessionId, action)
  if ('error' in response && response.error === 'User is unauthorised to modify sessions') {
    throw HTTPError(403, response.error)
  }
  if ('error' in response && response.error === 'Invalid token') {
    throw HTTPError(401, response.error);
  }
  if ('error' in response) {
    throw HTTPError(400, response.error)
  }
  
  res.status(200).json(response)
})