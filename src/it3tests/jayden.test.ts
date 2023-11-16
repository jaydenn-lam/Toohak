
import request from 'sync-request-curl';
import config from '../config.json';
import {
  requestAuthRegister, requestQuizCreate, requestQuestionCreate, requestSessionStart, requestSessionUpdate
  , requestQuizInfo, requestThumbnailUpdate, requestPlayerJoin, requestAnswerSubmit, requestPlayerQuestionResults
  , requestQuizResults, requestQuizResultsCSV
} from '../wrapper';

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

const questionbody: questionBodyType = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    {
      answer: 'Prince Charles',
      correct: true,
    },
    {
      answer: 'Choice one',
      correct: false,
    },
    {
      answer: 'Choice two',
      correct: false,
    }
  ]
};

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
});

const validThumbnail = { imgUrl: 'https://www.applesfromny.com/wp-content/uploads/2020/05/20Ounce_NYAS-Apples2.png' };
const invalidThumbnailHTTP = { imgUrl: '//www.applesfromny.com/wp-content/uploads/2020/05/20Ounce_NYAS-Apples2.png' };
const invalidThumbnail = { imgUrl: 'http://google.com/some/image/path.invalid' };

describe('Thumbnail Update', () => {
  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    const response = requestThumbnailUpdate(token, quizId, validThumbnail);
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

  test('Invalid Image Url HTTP ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    const response = requestThumbnailUpdate(token, quizId, invalidThumbnailHTTP);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid Image Url' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });
});

describe('GET Quiz final results', () => {
  test('Invalid token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });

    const response = requestQuizResults(token + 'INVALID', quizId, sessionId);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid Token' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(401);
  });

  test('Invalid Session Id', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });

    const response = requestQuizResults(token, quizId, sessionId + 400);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid sessionId' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('User does not own quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '5678efgh', 'Jayden', 'Lam').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });
    requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });
    const response = requestQuizResults(token2, quizId, sessionId);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'User is unauthorised to modify sessions' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(403);
  });

  test('Session is not in FINAL_RESULTS state', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const response = requestQuizResults(token, quizId, sessionId);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Session not in FINAL_RESULTS state' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Success case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const currentTime = Date.now();
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });
    const answerTime = Date.now();
    const timeDifference = answerTime - currentTime;
    requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });
    const responseA = requestPlayerQuestionResults(playerId, 1);
    const bodyA = responseA.body;
    expect(bodyA).toStrictEqual({
      questionId: 0,
      playersCorrectList: [
        'Hayden',
      ],
      averageAnswerTime: Math.round(timeDifference / 1000),
      percentCorrect: 100,
    });
    requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });

    const response = requestQuizResults(token, quizId, sessionId);
    const body = response.body;
    expect(body).toStrictEqual({
      usersRankedByScore: [{
        name: 'Hayden',
        score: 5
      }],
      questionResults: [{
        questionId: 0,
        playersCorrectList: [
          'Hayden'
        ],
        averageAnswerTime: Math.round(timeDifference / 1000),
        percentCorrect: 100,
      }]
    });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });
});

describe('GET Quiz final results CSV', () => {
  test('Invalid token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });

    const response = requestQuizResultsCSV(token + 'INVALID', quizId, sessionId);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid Token' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(401);
  });

  test('Invalid Session Id', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });

    const response = requestQuizResultsCSV(token, quizId, sessionId + 400);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid sessionId' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('User does not own quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '5678efgh', 'Jayden', 'Lam').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });
    requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });
    const response = requestQuizResultsCSV(token2, quizId, sessionId);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'User is unauthorised to modify sessions' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(403);
  });

  test('Session is not in FINAL_RESULTS state', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const response = requestQuizResultsCSV(token, quizId, sessionId);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Session not in FINAL_RESULTS state' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Success case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const currentTime = Date.now();
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });
    const answerTime = Date.now();
    const timeDifference = answerTime - currentTime;
    requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });
    const responseA = requestPlayerQuestionResults(playerId, 1);
    const bodyA = responseA.body;
    expect(bodyA).toStrictEqual({
      questionId: 0,
      playersCorrectList: [
        'Hayden',
      ],
      averageAnswerTime: Math.round(timeDifference / 1000),
      percentCorrect: 100,
    });
    requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });

    const response = requestQuizResultsCSV(token, quizId, sessionId);
    const body = response.body;
    const url = SERVER_URL + '/public/output.csv';
    expect(body).toStrictEqual({ url });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });
});
