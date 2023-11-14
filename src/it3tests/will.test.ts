import request from 'sync-request-curl';
import config from '../config.json';
import {
  requestAuthRegister, requestQuizCreate, requestQuestionCreate, requestAdminLogout, requestSessionStart, requestSessionUpdate, requestSessionStatus
  , requestSessionsView, requestQuizInfo
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

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
});

afterEach(() => {
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
    const response = requestSessionStart(token, quizId, invalidNum);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'autoStartNum cannot be greater than 50 or negative' });

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
    requestQuestionCreate(token, quizId, questionbody);
    requestSessionStart(token, quizId, 2);
    requestSessionStart(token, quizId, 2);
    requestSessionStart(token, quizId, 2);
    requestSessionStart(token, quizId, 2);
    requestSessionStart(token, quizId, 2);
    requestSessionStart(token, quizId, 2);
    requestSessionStart(token, quizId, 2);
    requestSessionStart(token, quizId, 2);
    requestSessionStart(token, quizId, 2);
    requestSessionStart(token, quizId, 2);

    const response = requestSessionStart(token, quizId, 2);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'There are already a maximum of 10 active sessions' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
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
    const invalidQuizId = 1;
    const response = requestSessionsView(token, invalidQuizId);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'quizId is not owned by user' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(403);
  });

  test('Working Sessions View Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const sessionId2 = requestSessionStart(token, quizId, 2).body.sessionId;
    // requestSessionUpdate(token, quizId, sessionId, {action: 'END'});
    const response = requestSessionsView(token, quizId);

    const body = response.body;
    expect(body).toStrictEqual({
      activeSessions: [sessionId, sessionId2],
      inactiveSessions: []
    });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });

  test('Multiple Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
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

    const viewResponse = requestSessionsView(token, quizId).body;
    expect(viewResponse).toStrictEqual({
      activeSessions: [
        s1, s2, s3, s4, s5, s6, s7, s8, s9, s10
      ],
      inactiveSessions: []
    });

    const statusCode = requestSessionsView(token, quizId).status;
    expect(statusCode).toStrictEqual(200);
  });
});

describe('PUT Session State Update', () => {
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
  /*
  const questionbody2: questionBodyType = {
    question: 'Who is the Prime Minister?',
    duration: 3,
    points: 5,
    answers: [
      {
        answer: 'William Lu',
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
  */

  test('Invalid Token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const invalidToken = token + 'Invalid';
    const response = requestSessionUpdate(invalidToken, quizId, sessionId, { action: 'NEXT_QUESTION' });

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid Token' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(401);
  });

  test('User is unauthorised ERROR', () => {
    const ownerToken = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(ownerToken, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(ownerToken, quizId, questionbody);
    const sessionId = requestSessionStart(ownerToken, quizId, 2).body.sessionId;
    requestAdminLogout(ownerToken);
    const playerToken = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const response = requestSessionUpdate(playerToken, quizId, sessionId, { action: 'NEXT_QUESTION' });

    const error = response.body;
    expect(error).toStrictEqual({ error: 'User is unauthorised to modify sessions' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(403);
  });

  test('Invalid sessionId ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const invalidSessionId = sessionId + 1;
    const response = requestSessionUpdate(token, quizId, invalidSessionId, { action: 'NEXT_QUESTION' });

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid sessionId' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Invalid action ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const response = requestSessionUpdate(token, quizId, sessionId, { action: 'invalid' });

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid action' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  describe('Action cannot currently be applied ERROR', () => {
    test('Lobby SKIP_CD', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      const state = requestSessionStatus(token, quizId, sessionId).body.state;
      expect(state).toStrictEqual('LOBBY');

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
    test('Lobby GO_TO_ANSWER', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
    test('Lobby GO_TO_FINAL_RESULTS', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
  });

  describe('Question Countdown', () => {
    test('qCountDown NEXT_QUESTION', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
      const state = requestSessionStatus(token, quizId, sessionId).body.state;
      expect(state).toStrictEqual('QUESTION_COUNTDOWN');

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });

    test('qCountDown GO_TO_ANSWER', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });

    test('qCountDown GO_TO_FINAL_RESULTS', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
    /*
    test('qCountdown Wait v1', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, {action: 'NEXT_QUESTION'});
      setTimeout(() => {
        const response = requestSessionStatus(token, quizId, sessionId).body;
        const state = response.state;
        expect(state).toStrictEqual('QUESTION_OPEN');
      }, 3000);
    });

    test('qCountdown Wait v2', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      requestQuestionCreate(token, quizId, questionbody2);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, {action: 'NEXT_QUESTION'});
      requestSessionUpdate(token, quizId, sessionId, {action: 'SKIP_COUNTDOWN'});
      requestSessionUpdate(token, quizId, sessionId, {action: 'GO_TO_ANSWER'});
      requestSessionUpdate(token, quizId, sessionId, {action: 'NEXT_QUESTION'});
      setTimeout(() => {
        const response = requestSessionStatus(token, quizId, sessionId).body;
        const state = response.state;
        expect(state).toStrictEqual('QUESTION_OPEN');
      }, 3000);
    });

    test('qCountdown Wait v3', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      requestQuestionCreate(token, quizId, questionbody2);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, {action: 'NEXT_QUESTION'});
      requestSessionUpdate(token, quizId, sessionId, {action: 'SKIP_COUNTDOWN'});
      setTimeout(() => {
        const response = requestSessionStatus(token, quizId, sessionId).body;
        const state = response.state;
        expect(state).toStrictEqual('QUESTION_CLOSE');
        requestSessionUpdate(token, quizId, sessionId, {action: 'NEXT_QUESTION'});
        const response2 = requestSessionStatus(token, quizId, sessionId).body;
        const state2 = response2.state;
        expect(state2).toStrictEqual('QUESTION_COUNTDOWN');
        setTimeout(() => {
          const response1 = requestSessionStatus(token, quizId, sessionId).body;
          const state1 = response1.state;
          expect(state1).toStrictEqual('QUESTION_OPEN');
        }, 3000);
      }, 4000);
    })
    */
  });

  describe('Question Open', () => {
    test('qOpen GO_TO_FINAL_RESULTS', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      const state = requestSessionStatus(token, quizId, sessionId).body.state;
      expect(state).toStrictEqual('QUESTION_OPEN');

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });

    test('qOpen NEXT_QUESTION', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });

    test('qOpen SKIP_COUNTDOWN', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
  });

  /*
  describe('Question Close', () => {

    test('qClose SKIP_COUNTDOWN', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, {action: 'NEXT_QUESTION'});
      requestSessionUpdate(token, quizId, sessionId, {action: 'SKIP_COUNTDOWN'});

      setTimeout(() => {
        const state = requestSessionStatus(token, quizId, sessionId).body.state;
        expect(state).toStrictEqual('QUESTION_CLOSE');
        const response = requestSessionUpdate(token, quizId, sessionId, {action: 'SKIP_COUNTDOWN'});
        const error = response.body;
        expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

        const statusCode = response.status;
        expect(statusCode).toStrictEqual(400);
        console.log('Ran Session update delayed');
      }, 4000);
    });
  });
  */

  describe('Answer Show', () => {
    test('aShow SKIP_COUNTDOWN', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });
      const state = requestSessionStatus(token, quizId, sessionId).body.state;
      expect(state).toStrictEqual('ANSWER_SHOW');

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });

    test('aShow GO_TO_ANSWER', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });
      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
  });

  describe('Final Results', () => {
    test('fResults NEXT_QUESTION', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });
      const state = requestSessionStatus(token, quizId, sessionId).body.state;
      expect(state).toStrictEqual('FINAL_RESULTS');

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });

    test('fResults SKIP_COUNTDOWN', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });
      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });

    test('fResults GO_TO_ANSWER', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });
      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });

    test('fResults GO_TO_FINAL_RESULTS', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });
      requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });
      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
  });

  describe('end', () => {
    test('end NEXT_QUESTION', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'END' });
      const state = requestSessionStatus(token, quizId, sessionId).body.state;
      expect(state).toStrictEqual('END');

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
    test('end SKIP_COUNTDOWN', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'END' });
      const state = requestSessionStatus(token, quizId, sessionId).body.state;
      expect(state).toStrictEqual('END');

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
    test('end GO_TO_ANSWER', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'END' });
      const state = requestSessionStatus(token, quizId, sessionId).body.state;
      expect(state).toStrictEqual('END');

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_ANSWER' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
    test('end GO_TO_FINAL_RESULTS', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'END' });
      const state = requestSessionStatus(token, quizId, sessionId).body.state;
      expect(state).toStrictEqual('END');

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'GO_TO_FINAL_RESULTS' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
    test('end END', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      requestSessionUpdate(token, quizId, sessionId, { action: 'END' });
      const state = requestSessionStatus(token, quizId, sessionId).body.state;
      expect(state).toStrictEqual('END');

      const response = requestSessionUpdate(token, quizId, sessionId, { action: 'END' });

      const error = response.body;
      expect(error).toStrictEqual({ error: 'Action cannot currently be performed' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400);
    });
  });
});

describe('GET Session Status', () => {
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

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const invalidToken = token + 'Invalid';
    const response = requestSessionStatus(invalidToken, quizId, sessionId);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid Token' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(401);
  });

  test('User is unauthorised ERROR', () => {
    const ownerToken = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(ownerToken, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(ownerToken, quizId, questionbody);
    const sessionId = requestSessionStart(ownerToken, quizId, 2).body.sessionId;
    requestAdminLogout(ownerToken);
    const playerToken = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const response = requestSessionStatus(playerToken, quizId, sessionId);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'User is unauthorised to view sessions' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(403);
  });

  test('Invalid sessionId ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const invalidSessionId = sessionId + 1;
    const response = requestSessionStatus(token, quizId, invalidSessionId);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid sessionId' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const quizInfo = requestQuizInfo(token, quizId).body;
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

    const response = requestSessionStatus(token, quizId, sessionId);

    const body = response.body;
    const expectedOutput = {
      quizId: quizInfo.quizId,
      name: quizInfo.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quizInfo.description,
      numQuestions: quizInfo.numQuestions,
      questions: quizInfo.questions,
      duration: quizInfo.duration,
    };
    expect(body).toStrictEqual({
      state: 'LOBBY',
      atQuestion: 0,
      players: [],
      metadata: expectedOutput,
    });
  });
});
