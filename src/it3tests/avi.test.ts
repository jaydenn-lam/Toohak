import request from 'sync-request-curl';
import config from '../config.json';
import {
  requestAuthRegister, requestQuizCreate, requestQuestionCreate, requestSessionStart,
  requestPlayerJoin, requestSessionChatView, requestSendChatMessage, requestAnswerSubmit, requestPlayerQuestionResults, requestSessionUpdate, requestQuizInfo, requestSessionResults
} from '../wrapper';

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

interface answerSubmissionType {
  answerIds: number[];
}

interface actionType {
  action: string;
}

interface chatMessageType {
  messageBody: string;
}

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

const questionbody2: questionBodyType = {
  question: 'Who is the day today',
  duration: 4,
  points: 5,
  answers: [
    {
      answer: 'Friday',
      correct: true,
    },
    {
      answer: 'Monday',
      correct: false,
    },
    {
      answer: 'Thursday',
      correct: false,
    }
  ]
};

describe('GET Question results', () => {
  const playerAction: actionType = {
    action: 'NEXT_QUESTION',
  };

  const playerAction2: actionType = {
    action: 'SKIP_COUNTDOWN',
  };

  const playerAction3: actionType = {
    action: 'GO_TO_ANSWER',
  };

  test('Invalid playerId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;

    const response = requestPlayerQuestionResults(playerId + 1, 1);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid playerId' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Invalid question position is not valid for players session', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;

    const response = requestPlayerQuestionResults(playerId, 2);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Question position is not valid for this players session' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Session is not in ANSWER_SHOW state', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;

    const response = requestPlayerQuestionResults(playerId, 1);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Session not in ANSWER_SHOW state' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Session is not yet up to this question', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    requestQuestionCreate(token, quizId, questionbody2);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, playerAction);
    requestSessionUpdate(token, quizId, sessionId, playerAction2);
    const answerSubmissions: answerSubmissionType = {
      answerIds: [1],
    };
    requestAnswerSubmit(playerId, 1, answerSubmissions);
    requestSessionUpdate(token, quizId, sessionId, playerAction3);
    const response = requestPlayerQuestionResults(playerId, 2);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Session is not yet up to this question' });

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
    const timeBefore = Date.now();
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });
    const answerSubmissionTime = Date.now();
    const timeDifference = answerSubmissionTime - timeBefore;
    requestSessionUpdate(token, quizId, sessionId, playerAction3);
    const response = requestPlayerQuestionResults(playerId, 1);
    const body = response.body;
    expect(body).toStrictEqual({
      questionId: 0,
      playersCorrectList: [
        'Hayden',
      ],
      averageAnswerTime: Math.round(timeDifference / 1000),
      percentCorrect: 100,
    });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });

  test('Success case with no correct players', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const timeBefore = Date.now();
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId + 1] });
    const answerSubmissionTime = Date.now();
    const timeDifference = answerSubmissionTime - timeBefore;
    requestSessionUpdate(token, quizId, sessionId, playerAction3);
    const response = requestPlayerQuestionResults(playerId, 1);
    const body = response.body;
    expect(body).toStrictEqual({
      questionId: 0,
      playersCorrectList: [],
      averageAnswerTime: Math.round(timeDifference / 1000),
      percentCorrect: 0,
    });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });

  test('Success case with multiple players', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Avi').body.playerId;
    const playerId2 = requestPlayerJoin(sessionId, 'Hayden').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const timeBefore = Date.now();
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });
    requestAnswerSubmit(playerId2, 1, { answerIds: [answerId] });
    const answerSubmissionTime = Date.now();
    const timeDifference = answerSubmissionTime - timeBefore;
    requestSessionUpdate(token, quizId, sessionId, playerAction3);
    const response = requestPlayerQuestionResults(playerId, 1);
    const body = response.body;
    expect(body).toStrictEqual({
      questionId: 0,
      playersCorrectList: ['Avi', 'Hayden'],
      averageAnswerTime: Math.round(timeDifference / 1000),
      percentCorrect: 100,
    });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });

  test('Success case with multiple players - test whether players Correct list gives ascending order', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden').body.playerId;
    const playerId2 = requestPlayerJoin(sessionId, 'Avi').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const timeBefore = Date.now();
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });
    requestAnswerSubmit(playerId2, 1, { answerIds: [answerId] });
    const answerSubmissionTime = Date.now();
    const timeDifference = answerSubmissionTime - timeBefore;
    requestSessionUpdate(token, quizId, sessionId, playerAction3);
    const response = requestPlayerQuestionResults(playerId, 1);
    const body = response.body;
    expect(body).toStrictEqual({
      questionId: 0,
      playersCorrectList: ['Avi', 'Hayden'],
      averageAnswerTime: Math.round(timeDifference / 1000),
      percentCorrect: 100,
    });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });
});

describe('GET Final results', () => {
  test('Invalid playerId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    requestSessionUpdate(token, quizId, sessionId, { action: 'NEXT_QUESTION' });
    requestSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
    const answerId = requestQuizInfo(token, quizId).body.questions[0].answers[0].answerId;
    requestAnswerSubmit(playerId, 1, { answerIds: [answerId] });

    const response = requestSessionResults(playerId + 1);
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid playerId' });
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Session is not in FINAL_RESULTS state', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    const response = requestSessionResults(playerId);

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

    const response = requestSessionResults(playerId);
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

describe('GET Players session chat', () => {
  test('Invalid playerId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    const response = requestSessionChatView(playerId + 1);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid playerId' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Success case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    requestSendChatMessage(playerId, {
      messageBody: 'Hello everyone! Nice to chat.',
    });
    const realMessageTime = Math.round(Date.now() / 1000);
    const messageTime = Math.round(Date.now());
    const response = requestSessionChatView(playerId);
    const body = response.body;
    const currentTime = Math.round(Date.now());
    expect(body).toStrictEqual({
      messages: [
        {
          messageBody: 'Hello everyone! Nice to chat.',
          playerId: playerId,
          playerName: 'Hayden Smith',
          timeSent: realMessageTime,
        }
      ]
    });

    expect(isInOneSecondRange(messageTime, currentTime)).toBe(true);
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });
});

describe('POST a message in session chat', () => {
  const message: chatMessageType = {
    messageBody: 'Hello everyone! Nice to chat.',
  };

  test('Invalid playerId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;

    const response = requestSendChatMessage(playerId + 1, message);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid playerId' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('message body is less than one character ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;

    const messageError: chatMessageType = {
      messageBody: '',
    };

    const response = requestSendChatMessage(playerId, messageError);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Message Body is of invalid type' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('message body is more than 100 characters ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;

    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;

    const messageError: chatMessageType = {
      messageBody: 'The message is more than 100 characters The message is more than 100 characters The message is more than 100 characters The message is more than 100 characters',
    };

    const response = requestSendChatMessage(playerId, messageError);

    const error = response.body;
    expect(error).toStrictEqual({ error: 'Message Body is of invalid type' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Success case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
    requestQuestionCreate(token, quizId, questionbody);
    const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
    const playerId = requestPlayerJoin(sessionId, 'Hayden Smith').body.playerId;
    requestSendChatMessage(playerId, message);
    const realMessageTime = Math.round(Date.now() / 1000);
    const messageTime = Math.round(Date.now());
    const response = requestSessionChatView(playerId);
    const body = response.body;
    const currentTime = Math.round(Date.now());
    expect(body).toStrictEqual({
      messages: [
        {
          messageBody: 'Hello everyone! Nice to chat.',
          playerId: playerId,
          playerName: 'Hayden Smith',
          timeSent: realMessageTime,
        }
      ]
    });
    expect(isInOneSecondRange(messageTime, currentTime)).toBe(true);
    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });
});

function isInOneSecondRange(messageTime: number, currentTime: number): boolean {
  messageTime = messageTime + 1000;
  if (messageTime <= currentTime) {
    return true;
  } else if ((messageTime - currentTime) <= 1000) {
    return true;
  }
  return false;
}
