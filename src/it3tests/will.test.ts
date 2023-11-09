import request from 'sync-request-curl';
import config from '../config.json';
import { state } from '../dataStore';
import { stat } from 'fs';

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

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

function requestQuizCreate(token: string, name: string, description: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      json: {
        token,
        name,
        description
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

function requestQuestionCreate(token: string, quizId: number, questionBody: questionBodyType) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz/' + quizId + '/question',
    {
      json: {
        token,
        questionBody,
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

function requestSessionStart(token: string, quizId:number, autoStartNum: number) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/start`,
    {
      headers: {
        token: token
      },
      json: {
        autoStartNum,
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

function requestSessionsView(token: string, quizId: number) {
  const res = request(
    'GET',
    SERVER_URL + `v1/admin/quiz/${quizId}/sessions`,
    {
      headers: {
        token,
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

function requestSessionUpdate(token: string, quizId: number, sessionId: number, action: state) {
  const res = request(
    'PUT',
    SERVER_URL + `v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: {
        token,
      },
      json: {
        action,
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

function requestSessionStatus(token: string, quizId: number, sessionId: number) {
  const res = request(
    'GET',
    SERVER_URL + `v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: {
        token,
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
});

describe('POST Session Start', () => {
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

  test('Invalid Token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const invalidToken = token + 'Invalid';
    const response = requestSessionStart(invalidToken, quizId, 2);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid Token' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(401);
  });

  test('User is not owner of quiz ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const quizId = requestQuizCreate(token2, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token2, quizId, questionbody);
    const response = requestSessionStart(token1, quizId, 2);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'quizId is not owned by user' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(403);
  });

  test('autoStartNum ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const invalidNum = 51;
    const response = requestSessionStart(token, quizId, invalidNum).body.sessionId;
    const error = response.body;
    expect(error).toStrictEqual({ error: 'autoStartNum cannot be greater than 50' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Quiz has no questions ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    const response = requestSessionStart(token, quizId, 2);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Quiz has no questions' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('10 Sessions (Non-END state) exist', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    const s1 = requestSessionStart(token, quizId, 2).body.sessionId;
    const s2 = requestSessionStart(token, quizId, 2).body.sessionId;
    const s3 = requestSessionStart(token, quizId, 2).body.sessionId;
    const s4 = requestSessionStart(token, quizId, 2).body.sessionId;
    const s5 = requestSessionStart(token, quizId, 2).body.sessionId;
    const s6 = requestSessionStart(token, quizId, 2).body.sessionId;
    const s7 = requestSessionStart(token, quizId, 2).body.sessionId;
    const s8 = requestSessionStart(token, quizId, 2).body.sessionId;
    const s9 = requestSessionStart(token, quizId, 2).body.sessionId;
    const s10 = requestSessionStart(token, quizId, 2).body.sessionId;

    const response = requestSessionStart(token, quizId, 2);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'There are already a maximum of 10 active sessions' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);

    const viewResponse = requestSessionsView(token, quizId).body;
    expect(viewResponse).toStrictEqual({
      activeSessions: [
        s1, s2, s3, s4, s5, s6, s7, s8, s9, s10
      ],
      inactiveSessions: []
    });
  });

  test('Successful Session Start', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const response = requestSessionStart(token, quizId, 2);
    const body = response.body;
    expect(body).toStrictEqual({ sessionId: expect.any(Number) });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);

    const viewResponse = requestSessionsView(token, quizId).body;
    expect(viewResponse).toStrictEqual({
      activeSessions: [
        response.body.sessionId
      ],
      inactiveSessions: []
    });
  });
});

describe('GET Sessions View', () => {
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

  test('Invalid Token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    requestSessionStart(token, quizId, 2);
    const invalidToken = token + 'Invalid';
    const response = requestSessionsView(invalidToken, quizId);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid Token' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(401);
  });

  test('User is not owner of quiz ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    requestSessionStart(token, quizId, 2);
    const response = requestSessionsView(token2, quizId);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'quizId is not owned by user' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(403);
  });

  test('Invalid quizId ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const invalidQuizId = 1;
    const response = requestSessionsView(token2, invalidQuizId);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid quizId' });
  });

  test('Working Sessions View Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const sessionId2 = requestSessionStart(token, quizId, 2).body.sessionId;
    requestSessionUpdate(token, quizId, sessionId, state.END);
    const response = requestSessionsView(token, quizId);

    const body = response.body;
    expect(body).toStrictEqual({
      activeSessions: [sessionId2],
      inactiveSessions: [sessionId]
    });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });
});

// Is the admin who starts a quiz session a player? NO
