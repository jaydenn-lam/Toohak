import express, { json, Request, Response } from 'express';
import { echo } from './echoes/newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { adminAuthLogin, adminAuthRegister, adminUserDetails, adminAuthLogout, adminPasswordUpdate, adminDetailsUpdate } from './auth';
import {
  adminQuizCreate, adminQuizRestore, adminQuizDescriptionUpdate, adminQuizInfo, adminQuizList, adminQuizRemove,
  adminQuizNameUpdate, adminTrashEmpty, adminQuizViewTrash, adminQuizQuestionCreate, adminQuizQuestionMove, adminQuizTransfer, adminQuizQuestionDuplicate, adminQuestionDelete, adminQuestionUpdate
} from './quiz';
import { adminSessionStart, adminSessionStatus, adminSessionUpdate, adminSessionsView, playerAnswerSubmit } from './will';
import { clear } from './other';
import HTTPError from 'http-errors';
import { playerJoin, playerStatus } from './anita';
import { sessionChatView, sendChatMessage, playerQuestionResults } from './Avi';

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

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  res.status(200).json(clear());
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const response = adminQuizCreate(token, name, description);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);
  if ('error' in result) {
    throw HTTPError(400, result.error);
  }
  res.status(200).json(result);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const response = adminAuthLogout(token);
  if ('error' in response) {
    throw HTTPError(401, response.error);
  }
  res.status(200).json(response);
});
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const response = adminAuthLogout(token);
  if ('error' in response) {
    throw HTTPError(401, response.error);
  }
  res.status(200).json(response);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminUserDetails(token);
  if ('error' in response) {
    throw HTTPError(401, response.error);
  }
  res.status(200).json(response);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const response = adminUserDetails(token);
  if ('error' in response) {
    throw HTTPError(401, response.error);
  }
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizList(token);
  if ('error' in response) {
    throw HTTPError(401, response.error);
  }
  res.status(200).json(response);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const response = adminQuizList(token);
  if ('error' in response) {
    throw HTTPError(401, response.error);
  }
  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, description } = req.body;
  const response = adminQuizDescriptionUpdate(token, description, quizId);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token') as string;
  const { description } = req.body;
  const response = adminQuizDescriptionUpdate(token, description, quizId);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizViewTrash(token);
  if ('error' in response) {
    throw HTTPError(401, response.error);
  }
  res.status(200).json(response);
});
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const response = adminQuizViewTrash(token);
  if ('error' in response) {
    throw HTTPError(401, response.error);
  }
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;
  const response = adminQuizInfo(token, quizId);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token') as string;
  const response = adminQuizInfo(token, quizId);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizRemove(token, parseInt(req.params.quizid));
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(403, response.error);
  }
  res.status(200).json(response);
});
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizRemove(token, parseInt(req.params.quizid));
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(403, response.error);
  }
  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizRestore(token, quizId);
  if ('error' in response) {
    if (response.error === 'Invalid Token') {
      throw HTTPError(401, response.error);
    } else if (response.error === 'Quiz Id is not owned by this user') {
      throw HTTPError(403, response.error);
    } else {
      throw HTTPError(400, response.error);
    }
  }
  res.status(200).json(response);
});
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizRestore(token, quizId);
  if ('error' in response) {
    if (response.error === 'Invalid Token') {
      throw HTTPError(401, response.error);
    } else if (response.error === 'Quiz Id is not owned by this user') {
      throw HTTPError(403, response.error);
    } else {
      throw HTTPError(400, response.error);
    }
  }
  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, name } = req.body;
  const response = adminQuizNameUpdate(token, quizId, name);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token') as string;
  const { name } = req.body;
  const response = adminQuizNameUpdate(token, quizId, name);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizzes = JSON.parse(req.query.quizIds as string);
  const response = adminTrashEmpty(token, quizzes);
  if ('error' in response && response.error === 'Invalid quizId') {
    throw HTTPError(400, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response && response.error === 'User does not own quiz') {
    throw HTTPError(403, response.error);
  }
  res.status(200).json(response);
});
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizzes = JSON.parse(req.query.quizIds as string);
  const response = adminTrashEmpty(token, quizzes);
  if ('error' in response && response.error === 'Invalid quizId') {
    throw HTTPError(400, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response && response.error === 'User does not own quiz') {
    throw HTTPError(403, response.error);
  }
  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, questionBody } = req.body;
  const response = adminQuizQuestionCreate(token, quizId, questionBody);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token') as string;
  const { questionBody } = req.body;
  const response = adminQuizQuestionCreate(token, quizId, questionBody);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = adminPasswordUpdate(token, oldPassword, newPassword);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { oldPassword, newPassword } = req.body;
  const response = adminPasswordUpdate(token, oldPassword, newPassword);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const { token, userEmail } = req.body;
  const response = adminQuizTransfer(token, userEmail, parseInt(req.params.quizid));
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { userEmail } = req.body;
  const response = adminQuizTransfer(token, userEmail, parseInt(req.params.quizid));
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = adminPasswordUpdate(token, oldPassword, newPassword);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { oldPassword, newPassword } = req.body;
  const response = adminPasswordUpdate(token, oldPassword, newPassword);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, newPosition } = req.body;
  const response = adminQuizQuestionMove(token, quizId, questionId, newPosition);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.header('token') as string;
  const { newPosition } = req.body;
  const response = adminQuizQuestionMove(token, quizId, questionId, newPosition);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    throw HTTPError(403, response.error);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const response = adminDetailsUpdate(token, email, nameFirst, nameLast);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { email, nameFirst, nameLast } = req.body;
  const response = adminDetailsUpdate(token, email, nameFirst, nameLast);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  }
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.query.token as string;
  const response = adminQuestionDelete(token, quizId, questionId);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    return res.status(403).json(response);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.header('token') as string;
  const response = adminQuestionDelete(token, quizId, questionId);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    return res.status(403).json(response);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token } = req.body;
  const response = adminQuizQuestionDuplicate(token, quizId, questionId);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    return res.status(403).json(response);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.header('token') as string;
  const response = adminQuizQuestionDuplicate(token, quizId, questionId);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    return res.status(403).json(response);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, questionBody } = req.body;
  const response = adminQuestionUpdate(token, quizId, questionBody, questionId);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    return res.status(403).json(response);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token') as string;
  const questionId = parseInt(req.params.questionid);
  const { questionBody } = req.body;
  const response = adminQuestionUpdate(token, quizId, questionBody, questionId);
  if ('error' in response && response.error === 'Quiz Id is not owned by this user') {
    return res.status(403).json(response);
  } else if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  } else if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const { autoStartNum } = req.body;
  const response = adminSessionStart(token, quizId, autoStartNum);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  }
  if ('error' in response && response.error === 'quizId is not owned by user') {
    throw HTTPError(403, response.error);
  }
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const response = adminSessionsView(token, quizId);
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  }
  if ('error' in response) {
    throw HTTPError(403, response.error);
  }
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const response = adminSessionStatus(token, quizId, sessionId);
  if ('error' in response && response.error === 'Invalid sessionId') {
    throw HTTPError(400, response.error);
  }
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  }
  if ('error' in response) {
    throw HTTPError(403, response.error);
  }
  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const { action } = req.body;
  const response = adminSessionUpdate(token, quizId, sessionId, action);
  if ('error' in response && response.error === 'User is unauthorised to modify sessions') {
    throw HTTPError(403, response.error);
  }
  if ('error' in response && response.error === 'Invalid Token') {
    throw HTTPError(401, response.error);
  }
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }

  res.status(200).json(response);
});
app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  const response = playerJoin(sessionId, name);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.get('/v1/player/:playerId', (req: Request, res: Response) => {
  const response = playerStatus(parseInt(req.params.playerId));
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.get('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const response = sessionChatView(playerId);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});
app.post('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const { message } = req.body;
  const response = sendChatMessage(playerId, message);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const { answerIds } = req.body;
  const response = playerAnswerSubmit(playerId, questionPosition, answerIds);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

app.get('/v1/player/:playerId/question/:questionPosition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const questionPosition = parseInt(req.params.questionPosition);
  const response = playerQuestionResults(playerId, questionPosition);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.status(200).json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    404 Not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
