
// anita's tests

test('Filler', () => {
  expect(1).toBe(1);
});
/*
   import request from 'sync-request-curl';
  import config from '../config.json';
  import { requestAuthRegister, requestQuizCreate, requestQuestionCreate, requestAdminLogout, requestSessionStart, requestSessionUpdate, requestSessionStatus
    , requestSessionsView, requestQuizInfo, requestPlayerJoin, requestPlayerStatus, requestPlayerQuestionInfo } from '../wrapper';
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

  describe('Post Player join tests', () => {
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
  test('successful player join', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const quizInfo = requestQuizInfo(token, quizId);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    requestSessionStatus(token, quizId, sessionId);
    const response = requestPlayerJoin(sessionId, 'Hayden', 'Smith');
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
    expect(response.body).toStrictEqual({playerId: expect.any(Number)});
  });

  test('Player not with unique name case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const quizInfo = requestQuizInfo(token, quizId);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    requestSessionStatus(token, quizId, sessionId);
    requestPlayerJoin(sessionId, 'Hayden', 'Smith');
    const response = requestPlayerJoin(sessionId, 'Hayden', 'Smith');
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
    expect(response).toStrictEqual({error: "Player with same name has already joined session!"});
  });

  test('Session not in lobby state', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const quizInfo = requestQuizInfo(token, quizId);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    requestSessionStatus(token, quizId, sessionId);
    requestSessionUpdate(token, quizId, sessionId, 'END');
    const response= requestPlayerJoin(sessionId, 'Hayden', 'Smith');
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
    expect(response.body).toStrictEqual({error: "Session is not in LOBBY state!"});
  });
});

describe('Get Player status tests', () => {
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
  test('Successful return of player status', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden', 'Smith').body.playerId;
    const response = requestPlayerStatus(playerId);
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
    expect(response.body).toStrictEqual({
        state: "LOBBY",
        numQuestions: expect.any(Number),
        atQuestion: expect.any(Number)
    });
});

test('Player ID does not exist case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden', 'Smith').body.playerId;
    const nonExistingPlayerId = playerId + 1;
    const response = requestPlayerStatus(nonExistingPlayerId);
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
    const body = response.body;
    expect(body).toStrictEqual({
        error: "Player ID does not exist"
    });
});

describe('Get Player question information tests', () => {
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
  test('Successful return of information about question that guest player is on', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden', 'Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    const response = requestPlayerQuestionInfo(playerId, 1);
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
    const expectedBody = {
        questionId: expect.any(Number),
        question: expect.any(String),
        duration: expect.any(String),
        thumbnailUrl: expect.any(String),
        points: expect.any(Number),
        answers: [
            {
                answerId: expect.any(Number),
                answer: expect.any(String),
                colour: expect.any(String)
            }
        ],
    };
    expect(response.body).toStrictEqual(expectedBody);
});

test('Player ID does not exist case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden', 'Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    const nonExistingPlayerId = playerId + 1;
    const response = requestPlayerQuestionInfo(nonExistingPlayerId, 1);
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
    const expectedBody = {error: "Player ID does not exist"};
    expect(response.body).toStrictEqual(expectedBody);
});
test('Question ID not valid for session case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden', 'Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    const invalidQuestionId = 9999;
    const response = requestPlayerQuestionInfo(playerId, invalidQuestionId);
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
    const expectedBody = {error: "Question position is not valid for the session this player is in"};
    expect(response.body).toStrictEqual(expectedBody);
});

test('Session is not currently on this question', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden', 'Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    const response = requestPlayerQuestionInfo(playerId, 2);
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
    const expectedBody = {error: "Session is not currently on this question"};
    expect(response.body).toStrictEqual(expectedBody);
});
test('Session is in LOBBY or END state', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden', 'Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, 'END');
    const response = requestPlayerQuestionInfo(playerId, 1);
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
    const expectedBody = {error: "Session is in LOBBY or END state"};
    expect(response.body).toStrictEqual(expectedBody);
});
});
});
*/
