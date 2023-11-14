test('Filler', () => {
    expect(1).toBe(1);
  });

import request from 'sync-request-curl';
import config from '../config.json';
import { requestAuthRegister, requestQuizCreate, requestQuestionCreate, requestAdminLogout, requestSessionStart, requestSessionUpdate, requestSessionStatus
, requestSessionsView, requestQuizInfo, requestThumbnailUpdate } from '../wrapper';

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

interface Answer {
answer: string;
correct: boolean;
}

interface questionBodyType {
question: string;
duration: number;
points: number;
answers: Answer[];
}

beforeEach(() => {
request(
    'DELETE',
    SERVER_URL + '/v1/clear'
);
});

const validThumbnail = {imgUrl: "https://www.applesfromny.com/wp-content/uploads/2020/05/20Ounce_NYAS-Apples2.png"}
const invalidThumbnail = {imgUrl: "http://google.com/some/image/path.jpg"}

describe('Thumbnail Update', () => {
  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    const response = requestThumbnailUpdate(token, quizId, validThumbnail)
    expect(response.body).toEqual({});
    expect(response.status).toEqual(200);
  });
  
  test('Invalid Token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    const invalidToken = token + 'Invalid';
    const response = requestThumbnailUpdate(invalidToken, quizId, validThumbnail);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid Token' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(401);
  });

  test('User is not owner of quiz ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const quizId = requestQuizCreate(token2, 'Quiz1', 'description').body.quizId;
    const response = requestThumbnailUpdate(token1, quizId, validThumbnail);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'quizId is not owned by user' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(403);
  });

  test('Invalid Image Url ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    const response = requestThumbnailUpdate(token, quizId, invalidThumbnail);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid Image Url' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });
});

describe('Quiz Final Results', () => {
  
});