import request from 'sync-request-curl';
import config from './config.json';
import {
  requestAuthRegister, requestQuizCreate, requestQuizList, requestQuizInfo, requestQuizDescriptionUpdate, requestQuizRemove
  , requestQuizRemove2, requestQuizViewTrash, requestQuiznameUpdate, requestadminQuizRestore, requestTrashEmpty, requestadminQuizTransfer, requestQuestionCreate, requestQuizViewTrash2,
  requestQuestionMove, requestQuestionDelete, requestQuestionDuplicate, requestQuestionUpdate, requestadminQuizTransfer2, requestQuizCreate2, requestQuestionUpdate2, requestQuestionCreate2, requestQuizInfo2, requestQuizList2, requestQuizDescriptionUpdate2,
  requestadminQuizRestore2, requestQuiznameUpdate2, requestTrashEmpty2, requestQuestionMove2, requestQuestionDelete2, requestQuestionDuplicate2
} from './wrapper';

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

const questionBody1: questionBodyType = {
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

const questionBody2: questionBodyType = {
  question: 'Who is the President of the US?',
  duration: 4,
  points: 5,
  answers: [
    {
      answer: 'Joe Biden',
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

const questionBody3: questionBodyType = {
  question: 'Who is the best boxer?',
  duration: 4,
  points: 5,
  answers: [
    {
      answer: 'Mike Tyson',
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

afterEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
});

describe('POST /v1/admin/quiz', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate(token, 'Animal Quiz',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ quizId: expect.any(Number) });
    expect(response.status).toStrictEqual(200);
  });

  test('Success for version 2', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate2(token, 'Animal Quiz',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ quizId: expect.any(Number) });
    expect(response.status).toStrictEqual(200);
  });

  test('Multiple Working Entries', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate(token, 'Animal Quiz',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ quizId: expect.any(Number) });
    expect(response.status).toStrictEqual(200);
    expect(requestQuizCreate(token, 'Food Quiz',
      'Test your knowledge on food!').body)
      .toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate(token + 'Invalid', 'Animal Quiz',
      'Test your knowledge on animals!');
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Invalid character(s) ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate(token, 'Invalid?!',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ error: 'Invalid character(s) in name' });
    expect(response.status).toStrictEqual(400);
    expect(requestQuizCreate(token, 'Invalid=1',
      'Test your knowledge on food!').body)
      .toStrictEqual({ error: 'Invalid character(s) in name' });
    expect(requestQuizCreate(token, 'Invalid()',
      'Test your knowledge on food!').body)
      .toStrictEqual({ error: 'Invalid character(s) in name' });
  });

  test('Name too short ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate(token, 'XX', 'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ error: 'Quiz name too short' });
    expect(response.status).toStrictEqual(400);
  });

  test('Name too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate(token, 'The worlds longest ever invalid quiz name',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ error: 'Quiz name too long' });
    expect(response.status).toStrictEqual(400);
  });

  test('Name already used by current user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuizCreate(token, 'Animal Quiz',
      'Test your knowledge on animals!').body)
      .toStrictEqual({ quizId: expect.any(Number) });
    const response = requestQuizCreate(token, 'Animal Quiz',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ error: 'Name already being used' });
    expect(response.status).toStrictEqual(400);
  });

  test('Description too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate(token, 'Animal Quiz',
      'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz');
    expect(response.body)
      .toStrictEqual({ error: 'Quiz description too long' });
    expect(response.status).toStrictEqual(400);
  });
});

describe('POST /v1/admin/quiz', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate2(token, 'Animal Quiz',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ quizId: expect.any(Number) });
    expect(response.status).toStrictEqual(200);
  });

  test('Multiple Working Entries', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate2(token, 'Animal Quiz',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ quizId: expect.any(Number) });
    expect(response.status).toStrictEqual(200);
    expect(requestQuizCreate2(token, 'Food Quiz',
      'Test your knowledge on food!').body)
      .toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate2(token + 'Invalid', 'Animal Quiz',
      'Test your knowledge on animals!');
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Invalid character(s) ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate2(token, 'Invalid?!',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ error: 'Invalid character(s) in name' });
    expect(response.status).toStrictEqual(400);
    expect(requestQuizCreate2(token, 'Invalid=1',
      'Test your knowledge on food!').body)
      .toStrictEqual({ error: 'Invalid character(s) in name' });
    expect(requestQuizCreate2(token, 'Invalid()',
      'Test your knowledge on food!').body)
      .toStrictEqual({ error: 'Invalid character(s) in name' });
  });

  test('Name too short ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate2(token, 'XX', 'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ error: 'Quiz name too short' });
    expect(response.status).toStrictEqual(400);
  });

  test('Name too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate2(token, 'The worlds longest ever invalid quiz name',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ error: 'Quiz name too long' });
    expect(response.status).toStrictEqual(400);
  });

  test('Name already used by current user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuizCreate2(token, 'Animal Quiz',
      'Test your knowledge on animals!').body)
      .toStrictEqual({ quizId: expect.any(Number) });
    const response = requestQuizCreate2(token, 'Animal Quiz',
      'Test your knowledge on animals!');
    expect(response.body)
      .toStrictEqual({ error: 'Name already being used' });
    expect(response.status).toStrictEqual(400);
  });

  test('Description too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizCreate2(token, 'Animal Quiz',
      'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz');
    expect(response.body)
      .toStrictEqual({ error: 'Quiz description too long' });
    expect(response.status).toStrictEqual(400);
  });
});

describe('GET /v1/admin/quiz/list', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!');
    const response = requestQuizList(token);
    expect(response.body).toStrictEqual({ quizzes: expect.any(Array) });
    expect(response.status).toStrictEqual(200);
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!');
    const invalidToken = token + 'Invalid';
    const response = requestQuizList(invalidToken);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });
});

describe('GET /v2/admin/quiz/list', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!');
    const response = requestQuizList2(token);
    expect(response.body).toStrictEqual({ quizzes: expect.any(Array) });
    expect(response.status).toStrictEqual(200);
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!');
    const invalidToken = token + 'Invalid';
    const response = requestQuizList2(invalidToken);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });
});

describe('GET /v1/admin/quiz/{quizid} (quizInfo)', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const invalidToken = token + 'Invalid';
    const response = requestQuizInfo(invalidToken, quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('User is not Owner of Quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const response = requestQuizInfo(token2, quizId);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('Invalid QuizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const invalidQuizId = quizId + 1;
    const response = requestQuizInfo(token, invalidQuizId);
    expect(response.body).toStrictEqual({ error: 'Invalid quizId' });
    expect(response.status).toStrictEqual(400);
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const response = requestQuizInfo(token, quizId);
    expect(response.body).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
    expect(response.status).toStrictEqual(200);
  });
});

describe('GET /v1/admin/quiz/{quizid} (quizInfo)', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const invalidToken = token + 'Invalid';
    const response = requestQuizInfo2(invalidToken, quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('User is not Owner of Quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const response = requestQuizInfo2(token2, quizId);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('Invalid QuizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const invalidQuizId = quizId + 1;
    const response = requestQuizInfo2(token, invalidQuizId);
    expect(response.body).toStrictEqual({ error: 'Invalid quizId' });
    expect(response.status).toStrictEqual(400);
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const response = requestQuizInfo2(token, quizId);
    expect(response.body).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
    expect(response.status).toStrictEqual(200);
  });
});

describe('PUT /v1/admin/quiz/{quizid}/description', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Description too long', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const response = requestQuizDescriptionUpdate(token, 'InvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescription', quizId);
    expect(response.body).toStrictEqual({ error: 'Description is more than 100 characters in length' });
    expect(response.status).toStrictEqual(400);
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const invalidToken = token + 'Invalid';
    const response = requestQuizDescriptionUpdate(invalidToken, 'Valid Description', quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('User is not Owner of Quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const response = requestQuizDescriptionUpdate(token2, 'Valid Description', quizId);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('Invalid quizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const invalidQuizId = quizId + 1;
    const response = requestQuizDescriptionUpdate(token, 'Valid Description', invalidQuizId);
    expect(response.body).toStrictEqual({ error: 'Invalid quizId' });
    expect(response.status).toStrictEqual(400);
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const returnedValue = requestQuizDescriptionUpdate(token, 'Valid New Description', quizId).body;
    expect(returnedValue).toStrictEqual({});

    const response = requestQuizInfo(token, quizId);
    expect(response.body).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Valid New Description',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
    expect(response.status).toStrictEqual(200);
  });
});

describe('PUT /v2/admin/quiz/{quizid}/description', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Description too long', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const response = requestQuizDescriptionUpdate2(token, 'InvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescription', quizId);
    expect(response.body).toStrictEqual({ error: 'Description is more than 100 characters in length' });
    expect(response.status).toStrictEqual(400);
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const invalidToken = token + 'Invalid';
    const response = requestQuizDescriptionUpdate2(invalidToken, 'Valid Description', quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('User is not Owner of Quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const response = requestQuizDescriptionUpdate2(token2, 'Valid Description', quizId);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('Invalid quizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const invalidQuizId = quizId + 1;
    const response = requestQuizDescriptionUpdate2(token, 'Valid Description', invalidQuizId);
    expect(response.body).toStrictEqual({ error: 'Invalid quizId' });
    expect(response.status).toStrictEqual(400);
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const returnedValue = requestQuizDescriptionUpdate2(token, 'Valid New Description', quizId).body;
    expect(returnedValue).toStrictEqual({});

    const response = requestQuizInfo(token, quizId);
    expect(response.body).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Valid New Description',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
    expect(response.status).toStrictEqual(200);
  });
});

describe('/v1/admin/quiz/{quizid}', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuizRemove(token + 'Invalid', quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });
  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuizRemove('', quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Correct behaviour', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuizRemove(token, quizId);
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    const response = requestQuizRemove(token, quizId2);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('successful remove', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    expect(requestQuizList(token).body).toStrictEqual({ quizzes: [{ quizId: quizId, name: 'quiz1' }] });
    requestQuizRemove(token, quizId);
    expect(requestQuizList(token).body).toStrictEqual({ quizzes: [] });
  });
});

describe('/v1/admin/quiz/{quizid}', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuizRemove2(token + 'Invalid', quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });
  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuizRemove2('', quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Correct behaviour', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuizRemove2(token, quizId);
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    const response = requestQuizRemove2(token, quizId2);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('successful remove', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    expect(requestQuizList(token).body).toStrictEqual({ quizzes: [{ quizId: quizId, name: 'quiz1' }] });
    requestQuizRemove2(token, quizId);
    expect(requestQuizList(token).body).toStrictEqual({ quizzes: [] });
  });
});

describe('/v1/admin/quiz/{quizid}/name', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuiznameUpdate(token + 'Invalid', quizId, 'quiz2');
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });
  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuiznameUpdate('', quizId, 'quiz2');
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Correct behaviour', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuiznameUpdate(token, quizId, 'quiz2');
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    const response = requestQuiznameUpdate(token, quizId2, 'quiz3');
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('Normal Run', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const QuizInfo = requestQuizInfo(token, quizId).body;
    expect(QuizInfo).toStrictEqual({
      quizId: expect.any(Number),
      name: 'quiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
    requestQuiznameUpdate(token, quizId, 'newquiz1');
    const QuizInfo2 = requestQuizInfo(token, quizId).body;
    expect(QuizInfo2).toStrictEqual({
      quizId: expect.any(Number),
      name: 'newquiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
  });
  test('Invalid new name', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuiznameUpdate(token, quizId, 'quiz1#');
    expect(response.body).toStrictEqual({ error: 'Invalid new name' });
    expect(response.status).toStrictEqual(400);
    expect(requestQuiznameUpdate(token, quizId, 'quiz1/').body).toStrictEqual({ error: 'Invalid new name' });
    expect(requestQuiznameUpdate(token, quizId, 'q1').body).toStrictEqual({ error: 'Invalid new name' });
    expect(requestQuiznameUpdate(token, quizId, 'quiz1quiz1quiz1quiz1quiz1quiz1quiz1').body).toStrictEqual({ error: 'Invalid new name' });
  });

  test('Quiz name already used', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'quiz1', '');
    const quizId = requestQuizCreate(token, 'quiz2', '').body.quizId;
    const response = requestQuiznameUpdate(token, quizId, 'quiz1');
    expect(response.body).toStrictEqual({ error: 'Quiz name already in use' });
    expect(response.status).toStrictEqual(400);
  });
});

describe('/v2/admin/quiz/{quizid}/name', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuiznameUpdate2(token + 'Invalid', quizId, 'quiz2');
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });
  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuiznameUpdate2('', quizId, 'quiz2');
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Correct behaviour', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuiznameUpdate2(token, quizId, 'quiz2');
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    const response = requestQuiznameUpdate2(token, quizId2, 'quiz3');
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('Normal Run', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const QuizInfo = requestQuizInfo(token, quizId).body;
    expect(QuizInfo).toStrictEqual({
      quizId: expect.any(Number),
      name: 'quiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
    requestQuiznameUpdate2(token, quizId, 'newquiz1');
    const QuizInfo2 = requestQuizInfo(token, quizId).body;
    expect(QuizInfo2).toStrictEqual({
      quizId: expect.any(Number),
      name: 'newquiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
  });
  test('Invalid new name', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    const response = requestQuiznameUpdate2(token, quizId, 'quiz1#');
    expect(response.body).toStrictEqual({ error: 'Invalid new name' });
    expect(response.status).toStrictEqual(400);
    expect(requestQuiznameUpdate2(token, quizId, 'quiz1/').body).toStrictEqual({ error: 'Invalid new name' });
    expect(requestQuiznameUpdate2(token, quizId, 'q1').body).toStrictEqual({ error: 'Invalid new name' });
    expect(requestQuiznameUpdate2(token, quizId, 'quiz1quiz1quiz1quiz1quiz1quiz1quiz1').body).toStrictEqual({ error: 'Invalid new name' });
  });

  test('Quiz name already used', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'quiz1', '');
    const quizId = requestQuizCreate(token, 'quiz2', '').body.quizId;
    const response = requestQuiznameUpdate2(token, quizId, 'quiz1');
    expect(response.body).toStrictEqual({ error: 'Quiz name already in use' });
    expect(response.status).toStrictEqual(400);
  });
});

describe('/v1/admin/quiz/{quizid}/restore', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('successful restore', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    requestQuizRemove(token, quizId);
    requestadminQuizRestore(token, quizId);
    const response = requestQuizList(token);
    expect(response.body).toStrictEqual({ quizzes: [{ quizId: quizId, name: 'quiz1' }] });
    expect(response.status).toStrictEqual(200);
  });
  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    requestQuizRemove(token, quizId);
    const response = requestadminQuizRestore(token + 'Invalid', quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });
  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    requestQuizRemove(token, quizId);
    const response = requestadminQuizRestore('', quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Correct behaviour', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    requestQuizRemove(token, quizId);
    const response = requestadminQuizRestore(token, quizId);
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    requestQuizRemove(token2, quizId2);
    const response = requestadminQuizRestore(token, quizId2);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });
  test('Quiz name already used', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'quiz1', '');
    const quizId = requestQuizCreate(token, 'quiz2', '').body.quizId;
    const response = requestQuiznameUpdate(token, quizId, 'quiz1');
    expect(response.body).toStrictEqual({ error: 'Quiz name already in use' });
    expect(response.status).toStrictEqual(400);
  });
  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    requestQuizRemove(token, quizId);
    const response = requestadminQuizRestore(token, quizId + 1);
    expect(response.body).toStrictEqual({ error: 'Invalid quizId' });
    expect(response.status).toStrictEqual(400);
  });
});

describe('/v1/admin/quiz/{quizid}/restore', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('successful restore', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    requestQuizRemove(token, quizId);
    requestadminQuizRestore2(token, quizId);
    const response = requestQuizList(token);
    expect(response.body).toStrictEqual({ quizzes: [{ quizId: quizId, name: 'quiz1' }] });
    expect(response.status).toStrictEqual(200);
  });
  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    requestQuizRemove(token, quizId);
    const response = requestadminQuizRestore2(token + 'Invalid', quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });
  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    requestQuizRemove(token, quizId);
    const response = requestadminQuizRestore2('', quizId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Correct behaviour', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    requestQuizRemove(token, quizId);
    const response = requestadminQuizRestore2(token, quizId);
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    requestQuizRemove(token2, quizId2);
    const response = requestadminQuizRestore2(token, quizId2);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });
  test('Quiz name already used', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'quiz1', '');
    const quizId = requestQuizCreate(token, 'quiz2', '').body.quizId;
    const response = requestQuiznameUpdate(token, quizId, 'quiz1');
    expect(response.body).toStrictEqual({ error: 'Quiz name already in use' });
    expect(response.status).toStrictEqual(400);
  });
  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').body.quizId;
    requestQuizRemove(token, quizId);
    const response = requestadminQuizRestore2(token, quizId + 1);
    expect(response.body).toStrictEqual({ error: 'Invalid quizId' });
    expect(response.status).toStrictEqual(400);
  });
});

describe('ViewQuizTrash', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const invalidToken = token + 'Invalid';
    const response = requestQuizViewTrash(invalidToken);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
    const response2 = requestQuizViewTrash('');
    expect(response2.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response2.status).toStrictEqual(401);
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz Name', 'Description').body.quizId;
    requestQuizRemove(token, quizId);
    const response = requestQuizViewTrash(token);
    expect(response.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz Name'
        }
      ]
    });
    expect(response.status).toStrictEqual(200);
  });

  test('Multiple Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz Name', 'Description').body.quizId;
    const quizId2 = requestQuizCreate(token, 'Quiz Name 2', 'Description').body.quizId;
    requestQuizRemove(token, quizId);
    requestQuizRemove(token, quizId2);
    const response = requestQuizViewTrash(token);
    expect(response.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz Name'
        },
        {
          quizId: quizId2,
          name: 'Quiz Name 2'
        }
      ]
    });
    expect(response.status).toStrictEqual(200);
  });
});

describe('ViewQuizTrash version 2', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const invalidToken = token + 'Invalid';
    const response = requestQuizViewTrash2(invalidToken);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
    const response2 = requestQuizViewTrash2('');
    expect(response2.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response2.status).toStrictEqual(401);
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz Name', 'Description').body.quizId;
    requestQuizRemove(token, quizId);
    const response = requestQuizViewTrash2(token);
    expect(response.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz Name'
        }
      ]
    });
    expect(response.status).toStrictEqual(200);
  });

  test('Multiple Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz Name', 'Description').body.quizId;
    const quizId2 = requestQuizCreate(token, 'Quiz Name 2', 'Description').body.quizId;
    requestQuizRemove(token, quizId);
    requestQuizRemove(token, quizId2);
    const response = requestQuizViewTrash2(token);
    expect(response.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz Name'
        },
        {
          quizId: quizId2,
          name: 'Quiz Name 2'
        }
      ]
    });
    expect(response.status).toStrictEqual(200);
  });
});

describe('DELETE /v1/admin/quiz/trash/empty', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const quizArray = [quizId];
    requestQuizRemove(token, quizId);
    const response = requestTrashEmpty(token, quizArray);
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
  });

  test('Invalid quizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const invalidQuizId = quizId - 401;
    const quizArray = [invalidQuizId];
    requestQuizRemove(token, quizId);
    const response = requestTrashEmpty(token, quizArray);
    expect(response.body).toStrictEqual({ error: 'Invalid quizId' });
    expect(response.status).toStrictEqual(400);
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const quizArray = [quizId];
    const invalidToken = token + 'Invalid';
    const response = requestTrashEmpty(invalidToken, quizArray);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('User does not own this quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    requestQuizRemove(token, quizId);
    const tokenNotOwner = requestAuthRegister('jayden@unsw.edu.au', '5678efgh', 'Jayden', 'Lam').body.token;
    const quizArray = [quizId];
    const response = requestTrashEmpty(tokenNotOwner, quizArray);
    expect(response.body).toStrictEqual({ error: 'User does not own quiz' });
    expect(response.status).toStrictEqual(403);
  });
});

describe('DELETE /v2/admin/quiz/trash/empty', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const quizArray = [quizId];
    requestQuizRemove(token, quizId);
    const response = requestTrashEmpty2(token, quizArray);
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
  });

  test('Invalid quizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const invalidQuizId = quizId - 401;
    const quizArray = [invalidQuizId];
    requestQuizRemove(token, quizId);
    const response = requestTrashEmpty2(token, quizArray);
    expect(response.body).toStrictEqual({ error: 'Invalid quizId' });
    expect(response.status).toStrictEqual(400);
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const quizArray = [quizId];
    const invalidToken = token + 'Invalid';
    const response = requestTrashEmpty2(invalidToken, quizArray);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('User does not own this quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    requestQuizRemove(token, quizId);
    const tokenNotOwner = requestAuthRegister('jayden@unsw.edu.au', '5678efgh', 'Jayden', 'Lam').body.token;
    const quizArray = [quizId];
    const response = requestTrashEmpty2(tokenNotOwner, quizArray);
    expect(response.body).toStrictEqual({ error: 'User does not own quiz' });
    expect(response.status).toStrictEqual(403);
  });
});

describe('/v1/admin/quiz/{quizid}/transfer', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Invalid token ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token1, 'quiz1', '').body.quizId;
    const response = requestadminQuizTransfer(token1 + 'Invalid', quizId, 'william@unsw.edu.au');
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });
  test('Empty token ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token1, 'quiz1', '').body.quizId;
    const response = requestadminQuizTransfer('', quizId, 'william2@unsw.edu.au');
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Quiz not owned by user ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    const response = requestadminQuizTransfer(token1, quizId2, 'validem@unsw.edu.au');
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });
  test('User email does not exist ERROR', () => {
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    const response = requestadminQuizTransfer(token2, quizId2, 'invalid@invalid.edu');
    expect(response.body).toStrictEqual({ error: 'userEmail does not exist' });
    expect(response.status).toStrictEqual(400);
  });
  test('userEmail is the current logged in user ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId1 = requestQuizCreate(token1, 'quiz1', '').body.quizId;
    const response = requestadminQuizTransfer(token1, quizId1, 'william@unsw.edu.au');
    expect(response.body).toStrictEqual({ error: 'userEmail is the current logged in user' });
    expect(response.status).toStrictEqual(400);
  });
  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId1 = requestQuizCreate(token1, 'quiz1', '').body.quizId;
    const quizId2 = requestQuizCreate(token2, 'quiz1', '').body.quizId;
    const response = requestadminQuizTransfer(token1, quizId1, 'validem@unsw.edu.au');
    const quizList2 = requestQuizList(token2);
    expect(quizList2.body.quizzes).toContainEqual({ quizId: quizId2, name: 'quiz1' });
    expect(response.body).toStrictEqual({ error: 'Quiz ID refers to a quiz that has a name that is already used by the target user' });
    expect(response.status).toStrictEqual(400);
  });
  test('successful restore', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'Anita', 'Byun').body.token;
    const quizId1 = requestQuizCreate(token1, 'quiz1', '').body.quizId;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    requestadminQuizTransfer(token1, quizId1, 'validem@unsw.edu.au');
    const success = requestQuizList(token2);
    expect(success.body).toStrictEqual({ quizzes: [{ quizId: quizId1, name: 'quiz1' }, { quizId: quizId2, name: 'quiz2' }] });
  });
});

describe('/v2/admin/quiz/{quizid}/transfer', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Invalid token ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token1, 'quiz1', '').body.quizId;
    const response = requestadminQuizTransfer2(token1 + 'Invalid', quizId, 'william@unsw.edu.au');
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });
  test('Empty token ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token1, 'quiz1', '').body.quizId;
    const response = requestadminQuizTransfer2('', quizId, 'william2@unsw.edu.au');
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Quiz not owned by user ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    const response = requestadminQuizTransfer2(token1, quizId2, 'validem@unsw.edu.au');
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });
  test('User email does not exist ERROR', () => {
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    const response = requestadminQuizTransfer2(token2, quizId2, 'invalid@invalid.edu');
    expect(response.body).toStrictEqual({ error: 'userEmail does not exist' });
    expect(response.status).toStrictEqual(400);
  });
  test('userEmail is the current logged in user ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId1 = requestQuizCreate2(token1, 'quiz1', '').body.quizId;
    const response = requestadminQuizTransfer2(token1, quizId1, 'william@unsw.edu.au');
    expect(response.body).toStrictEqual({ error: 'userEmail is the current logged in user' });
    expect(response.status).toStrictEqual(400);
  });
  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId1 = requestQuizCreate(token1, 'quiz1', '').body.quizId;
    const quizId2 = requestQuizCreate(token2, 'quiz1', '').body.quizId;
    const response = requestadminQuizTransfer2(token1, quizId1, 'validem@unsw.edu.au');
    const quizList2 = requestQuizList(token2);
    expect(quizList2.body.quizzes).toContainEqual({ quizId: quizId2, name: 'quiz1' });
    expect(response.body).toStrictEqual({ error: 'Quiz ID refers to a quiz that has a name that is already used by the target user' });
    expect(response.status).toStrictEqual(400);
  });
  test('successful restore', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'Anita', 'Byun').body.token;
    const quizId1 = requestQuizCreate(token1, 'quiz1', '').body.quizId;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    requestadminQuizTransfer2(token1, quizId1, 'validem@unsw.edu.au');
    const success = requestQuizList(token2);
    expect(success.body).toStrictEqual({ quizzes: [{ quizId: quizId1, name: 'quiz1' }, { quizId: quizId2, name: 'quiz2' }] });
  });
});

describe('POST /v1/admin/quiz/{quizId}/question', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body.questionId).toStrictEqual(expect.any(Number));
    expect(response.status).toStrictEqual(200);
    const quizInfo = requestQuizInfo(token, quizId).body;
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!',
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        }
      ],
      duration: 4,
    });
  });

  test('Question too short ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Wh?',
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question too short' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Whoooooooooooooooooooooooooooooooooooooooooooooooooooooooooo?',
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question too long' });
    expect(response.status).toStrictEqual(400);
  });

  test('Too little number of answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true,
        }
      ]
    };
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Too little answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of answers greater than 6 ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
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
        },
        {
          answer: 'Choice three',
          correct: true,
        },
        {
          answer: 'Choice four',
          correct: false,
        },
        {
          answer: 'Choice five',
          correct: false,
        },
        {
          answer: 'Choice invalid',
          correct: false,
        }
      ]
    };
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Number of answers greater than 6' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question Duration is a negative number ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: -4,
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question duration is not positive' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question Duration is a negative number ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 400,
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question duration is too long' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of points less than 1 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: -5,
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question points is zero or negative' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of points greater than 10 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 11,
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question points exceeded max value' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer length is too small ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: '',
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Length of an answer is less than 1 character' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer length too large ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumbernumbernumbernumbernumbernumbernumber',
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Length of an answer is greater than 30 characters' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer strings are duplicate within question ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Choice one',
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Duplicate answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('No correct answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: false,
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
    const response = requestQuestionCreate(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'No correct answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('invalid token ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
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
    const response = requestQuestionCreate(token + 'invalid', quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
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
    const response = requestQuestionCreate(token, quizId2, questionbody);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });
});

describe('POST /v1/admin/quiz/{quizId}/question', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body.questionId).toStrictEqual(expect.any(Number));
    expect(response.status).toStrictEqual(200);
    const quizInfo = requestQuizInfo(token, quizId).body;
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!',
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        }
      ],
      duration: 4,
    });
  });

  test('Question too short ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Wh?',
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question too short' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Whoooooooooooooooooooooooooooooooooooooooooooooooooooooooooo?',
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question too long' });
    expect(response.status).toStrictEqual(400);
  });

  test('Too little number of answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true,
        }
      ]
    };
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Too little answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of answers greater than 6 ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
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
        },
        {
          answer: 'Choice three',
          correct: true,
        },
        {
          answer: 'Choice four',
          correct: false,
        },
        {
          answer: 'Choice five',
          correct: false,
        },
        {
          answer: 'Choice invalid',
          correct: false,
        }
      ]
    };
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Number of answers greater than 6' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question Duration is a negative number ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: -4,
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question duration is not positive' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question Duration is a negative number ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 400,
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question duration is too long' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of points less than 1 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: -5,
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question points is zero or negative' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of points greater than 10 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 11,
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Question points exceeded max value' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer length is too small ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: '',
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Length of an answer is less than 1 character' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer length too large ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumbernumbernumbernumbernumbernumbernumber',
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Length of an answer is greater than 30 characters' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer strings are duplicate within question ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Choice one',
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Duplicate answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('No correct answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: false,
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
    const response = requestQuestionCreate2(token, quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'No correct answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('invalid token ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
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
    const response = requestQuestionCreate2(token + 'invalid', quizId, questionbody);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
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
    const response = requestQuestionCreate2(token, quizId2, questionbody);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });
});

describe('quiz/QuestionMove', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const moverQuestionId = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    requestQuestionCreate(token, quizId, questionBody2);
    requestQuestionCreate(token, quizId, questionBody3);
    const response = requestQuestionMove(token, quizId, moverQuestionId, 2);

    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);

    const quizInfo = requestQuizInfo(token, quizId).body;
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!',
      numQuestions: 3,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'Who is the President of the US?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Joe Biden',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'Who is the best boxer?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Mike Tyson',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        },
      ],
      duration: 12,
    });
  });

  test('Invalid Token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    const invalidToken = token + 'Invalid';

    const response = requestQuestionMove(invalidToken, quizId, questionId, 1);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);

    const response2 = requestQuestionMove('', quizId, questionId, 1);
    expect(response2.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('User is not owner of quiz ERROR', () => {
    const originalToken = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(originalToken, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(originalToken, quizId, questionBody1).body.questionId;
    const newToken = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;

    const response = requestQuestionMove(newToken, quizId, questionId, 1);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('Invalid questionId ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    const invalidQuestionId = questionId + 1;

    const response = requestQuestionMove(token, quizId, invalidQuestionId, 0);
    expect(response.body).toStrictEqual({ error: 'Invalid questionId' });
    expect(response.status).toStrictEqual(400);
  });

  test('New Position is the current position ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    requestQuestionCreate(token, quizId, questionBody1);
    const position1QuestionId = requestQuestionCreate(token, quizId, questionBody2).body.questionId;

    const response = requestQuestionMove(token, quizId, position1QuestionId, 1);
    expect(response.body).toStrictEqual({ error: 'New position cannot be the current position' });
    expect(response.status).toStrictEqual(400);
  });

  test('Invalid New Position ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    requestQuestionCreate(token, quizId, questionBody1);
    const moverQuestionId = requestQuestionCreate(token, quizId, questionBody2).body.questionId;

    const responseNegative = requestQuestionMove(token, quizId, moverQuestionId, -1);
    expect(responseNegative.body).toStrictEqual({ error: 'New position must be in the length of the question array' });
    expect(responseNegative.status).toStrictEqual(400);

    const responseOver = requestQuestionMove(token, quizId, moverQuestionId, 2);
    expect(responseOver.body).toStrictEqual({ error: 'New position must be in the length of the question array' });
    expect(responseOver.status).toStrictEqual(400);
  });
});

describe('quiz/QuestionMove version 2', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const moverQuestionId = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    requestQuestionCreate(token, quizId, questionBody2);
    requestQuestionCreate(token, quizId, questionBody3);
    const response = requestQuestionMove2(token, quizId, moverQuestionId, 2);

    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);

    const quizInfo = requestQuizInfo(token, quizId).body;
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!',
      numQuestions: 3,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'Who is the President of the US?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Joe Biden',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'Who is the best boxer?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Mike Tyson',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        },
      ],
      duration: 12,
    });
  });

  test('Invalid Token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    const invalidToken = token + 'Invalid';

    const response = requestQuestionMove2(invalidToken, quizId, questionId, 1);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);

    const response2 = requestQuestionMove2('', quizId, questionId, 1);
    expect(response2.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('User is not owner of quiz ERROR', () => {
    const originalToken = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(originalToken, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(originalToken, quizId, questionBody1).body.questionId;
    const newToken = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;

    const response = requestQuestionMove2(newToken, quizId, questionId, 1);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('Invalid questionId ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    const invalidQuestionId = questionId + 1;

    const response = requestQuestionMove2(token, quizId, invalidQuestionId, 0);
    expect(response.body).toStrictEqual({ error: 'Invalid questionId' });
    expect(response.status).toStrictEqual(400);
  });

  test('New Position is the current position ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    requestQuestionCreate(token, quizId, questionBody1);
    const position1QuestionId = requestQuestionCreate(token, quizId, questionBody2).body.questionId;

    const response = requestQuestionMove2(token, quizId, position1QuestionId, 1);
    expect(response.body).toStrictEqual({ error: 'New position cannot be the current position' });
    expect(response.status).toStrictEqual(400);
  });

  test('Invalid New Position ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    requestQuestionCreate(token, quizId, questionBody1);
    const moverQuestionId = requestQuestionCreate(token, quizId, questionBody2).body.questionId;

    const responseNegative = requestQuestionMove2(token, quizId, moverQuestionId, -1);
    expect(responseNegative.body).toStrictEqual({ error: 'New position must be in the length of the question array' });
    expect(responseNegative.status).toStrictEqual(400);

    const responseOver = requestQuestionMove2(token, quizId, moverQuestionId, 2);
    expect(responseOver.body).toStrictEqual({ error: 'New position must be in the length of the question array' });
    expect(responseOver.status).toStrictEqual(400);
  });
});

describe('DELETE /v1/admin/quiz/:quizid/question/:questionid', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  const questionBody: questionBodyType = {
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

  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).body.questionId;
    const response = requestQuestionDelete(token, quizId, questionId);
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
  });

  test('Invalid questionId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).body.questionId;
    const invalidQuestionId = questionId + 1;
    const response = requestQuestionDelete(token, quizId, invalidQuestionId);
    expect(response.body).toStrictEqual({ error: 'Invalid questionId' });
    expect(response.status).toStrictEqual(400);
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).body.questionId;
    const invalidToken = token + 'Invalid';
    const response = requestQuestionDelete(invalidToken, quizId, questionId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('User does not own this quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).body.questionId;
    const tokenNotOwner = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuestionDelete(tokenNotOwner, quizId, questionId);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });
});

describe('DELETE /v2/admin/quiz/:quizid/question/:questionid', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  const questionBody: questionBodyType = {
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

  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).body.questionId;
    const response = requestQuestionDelete2(token, quizId, questionId);
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
  });

  test('Invalid questionId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).body.questionId;
    const invalidQuestionId = questionId + 1;
    const response = requestQuestionDelete2(token, quizId, invalidQuestionId);
    expect(response.body).toStrictEqual({ error: 'Invalid questionId' });
    expect(response.status).toStrictEqual(400);
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).body.questionId;
    const invalidToken = token + 'Invalid';
    const response = requestQuestionDelete2(invalidToken, quizId, questionId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('User does not own this quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).body.questionId;
    const tokenNotOwner = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuestionDelete2(tokenNotOwner, quizId, questionId);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });
});

describe('POST quizQuestionDuplicate', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Working case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId1 = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    requestQuestionCreate(token, quizId, questionBody2);

    const response = requestQuestionDuplicate(token, quizId, questionId1);
    expect(response.body.newQuestionId).toStrictEqual(expect.any(Number));
    expect(response.status).toStrictEqual(200);

    const quizInfo = requestQuizInfo(token, quizId).body;
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!',
      numQuestions: 3,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'Who is the President of the US?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Joe Biden',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        }
      ],
      duration: 12,
    });
  });

  test('Invalid Token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    const invalidToken = token + 'Invalid';

    const responseInvalid = requestQuestionDuplicate(invalidToken, quizId, questionId);
    expect(responseInvalid.body).toStrictEqual({ error: 'Invalid Token' });
    expect(responseInvalid.status).toStrictEqual(401);

    const responseEmpty = requestQuestionDuplicate('', quizId, questionId);
    expect(responseEmpty.body).toStrictEqual({ error: 'Invalid Token' });
    expect(responseInvalid.status).toStrictEqual(401);
  });

  test('User is not an owner of the quiz ERROR', () => {
    const originalToken = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(originalToken, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(originalToken, quizId, questionBody1).body.questionId;
    const newToken = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const response = requestQuestionDuplicate(newToken, quizId, questionId);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('Invalid questionId ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    const invalidQuestionId = questionId + 1;
    const response = requestQuestionDuplicate(token, quizId, invalidQuestionId);
    expect(response.body).toStrictEqual({ error: 'Invalid questionId' });
    expect(response.status).toStrictEqual(400);
  });
});

describe('POST quizQuestionDuplicate version 2', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Working case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId1 = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    requestQuestionCreate(token, quizId, questionBody2);

    const response = requestQuestionDuplicate2(token, quizId, questionId1);
    expect(response.body.newQuestionId).toStrictEqual(expect.any(Number));
    expect(response.status).toStrictEqual(200);

    const quizInfo = requestQuizInfo(token, quizId).body;
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!',
      numQuestions: 3,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'Who is the President of the US?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Joe Biden',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        }
      ],
      duration: 12,
    });
  });

  test('Invalid Token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    const invalidToken = token + 'Invalid';

    const responseInvalid = requestQuestionDuplicate2(invalidToken, quizId, questionId);
    expect(responseInvalid.body).toStrictEqual({ error: 'Invalid Token' });
    expect(responseInvalid.status).toStrictEqual(401);

    const responseEmpty = requestQuestionDuplicate2('', quizId, questionId);
    expect(responseEmpty.body).toStrictEqual({ error: 'Invalid Token' });
    expect(responseInvalid.status).toStrictEqual(401);
  });

  test('User is not an owner of the quiz ERROR', () => {
    const originalToken = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(originalToken, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(originalToken, quizId, questionBody1).body.questionId;
    const newToken = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const response = requestQuestionDuplicate2(newToken, quizId, questionId);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });

  test('Invalid questionId ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').body.quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).body.questionId;
    const invalidQuestionId = questionId + 1;
    const response = requestQuestionDuplicate2(token, quizId, invalidQuestionId);
    expect(response.body).toStrictEqual({ error: 'Invalid questionId' });
    expect(response.status).toStrictEqual(400);
  });
});

describe('PUT /v1/admin/quiz/{quizId}/question/{questionId}', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const quizInfo = requestQuizInfo(token, quizId).body;
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test yourr knowledge on animals!',
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        }
      ],
      duration: 4,
    });
    const updateQuestion: questionBodyType = {
      question: 'What is the colour of the sky',
      duration: 3,
      points: 2,
      answers: [
        {
          answer: 'blue',
          correct: true,
        },
        {
          answer: 'pink',
          correct: false,
        },
        {
          answer: 'red',
          correct: false,
        }
      ]
    };
    const response = requestQuestionUpdate(token, quizId, updateQuestion, questionId);
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
    const quizInfo2 = requestQuizInfo(token, quizId).body;
    expect(quizInfo2).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test yourr knowledge on animals!',
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'What is the colour of the sky',
          duration: 3,
          points: 2,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'blue',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'pink',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'red',
              colour: expect.any(String),
              correct: false,
            }
          ]
        }
      ],
      duration: 7,
    });
  });

  test('Question too short ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Wh?',
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
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question too short' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Whoooooooooooooooooooooooooooooooooooooooooooooooooooooooooo?',
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
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question too long' });
    expect(response.status).toStrictEqual(400);
  });

  test('Too little number of answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true,
        }
      ]
    };
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Too little answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of answers greater than 6 ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
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
        },
        {
          answer: 'Choice three',
          correct: true,
        },
        {
          answer: 'Choice four',
          correct: false,
        },
        {
          answer: 'Choice five',
          correct: false,
        },
        {
          answer: 'Choice invalid',
          correct: false,
        }
      ]
    };
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Number of answers greater than 6' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question Duration is a negative number ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: -4,
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
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question duration is not positive' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question Duration is a greater than 3 mins ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 400,
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
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question duration is too long' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of points less than 1 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: -5,
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
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question points is zero or negative' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of points greater than 10 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 11,
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
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question points exceeded max value' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer length is too small ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: '',
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
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Length of an answer is less than 1 character' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer length too large ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumbernumbernumbernumbernumbernumbernumber',
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
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Length of an answer is greater than 30 characters' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer strings are duplicate within question ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Choice one',
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
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Duplicate answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('No correct answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumber',
          correct: false,
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
    const response = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'No correct answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('invalid token ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of Australia?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumber',
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
    const response = requestQuestionUpdate(token + 'invalid', quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId = requestQuizCreate(token, 'quiz2', '').body.quizId;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumber',
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
    requestQuestionCreate(token, quizId, questionbody);
    const questionbody2: questionBodyType = {
      question: 'Who is the of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumber',
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
    const questionId2 = requestQuestionCreate(token2, quizId2, questionbody2).body.questionId;
    const response = requestQuestionUpdate(token, quizId2, questionbody2, questionId2);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });
});

describe('PUT /v1/admin/quiz/{quizId}/question/{questionId}', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const quizInfo = requestQuizInfo(token, quizId).body;
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test yourr knowledge on animals!',
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice one',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'Choice two',
              colour: expect.any(String),
              correct: false,
            }
          ]
        }
      ],
      duration: 4,
    });
    const updateQuestion: questionBodyType = {
      question: 'What is the colour of the sky',
      duration: 3,
      points: 2,
      answers: [
        {
          answer: 'blue',
          correct: true,
        },
        {
          answer: 'pink',
          correct: false,
        },
        {
          answer: 'red',
          correct: false,
        }
      ]
    };
    const response = requestQuestionUpdate2(token, quizId, updateQuestion, questionId);
    expect(response.body).toStrictEqual({});
    expect(response.status).toStrictEqual(200);
    const quizInfo2 = requestQuizInfo(token, quizId).body;
    expect(quizInfo2).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test yourr knowledge on animals!',
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'What is the colour of the sky',
          duration: 3,
          points: 2,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'blue',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'pink',
              colour: expect.any(String),
              correct: false,
            },
            {
              answerId: expect.any(Number),
              answer: 'red',
              colour: expect.any(String),
              correct: false,
            }
          ]
        }
      ],
      duration: 7,
    });
  });

  test('Question too short ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Wh?',
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
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question too short' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Whoooooooooooooooooooooooooooooooooooooooooooooooooooooooooo?',
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
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question too long' });
    expect(response.status).toStrictEqual(400);
  });

  test('Too little number of answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true,
        }
      ]
    };
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Too little answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of answers greater than 6 ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
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
        },
        {
          answer: 'Choice three',
          correct: true,
        },
        {
          answer: 'Choice four',
          correct: false,
        },
        {
          answer: 'Choice five',
          correct: false,
        },
        {
          answer: 'Choice invalid',
          correct: false,
        }
      ]
    };
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Number of answers greater than 6' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question Duration is a negative number ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: -4,
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
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question duration is not positive' });
    expect(response.status).toStrictEqual(400);
  });

  test('Question Duration is a greater than 3 mins ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 400,
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
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question duration is too long' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of points less than 1 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: -5,
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
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question points is zero or negative' });
    expect(response.status).toStrictEqual(400);
  });

  test('Number of points greater than 10 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 11,
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
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Question points exceeded max value' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer length is too small ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: '',
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
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Length of an answer is less than 1 character' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer length too large ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumbernumbernumbernumbernumbernumbernumber',
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
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Length of an answer is greater than 30 characters' });
    expect(response.status).toStrictEqual(400);
  });

  test('Answer strings are duplicate within question ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Choice one',
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
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Duplicate answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('No correct answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumber',
          correct: false,
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
    const response = requestQuestionUpdate2(token, quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'No correct answers' });
    expect(response.status).toStrictEqual(400);
  });

  test('invalid token ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').body.quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).body.questionId;
    const updatebody: questionBodyType = {
      question: 'Who is the Monarch of Australia?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumber',
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
    const response = requestQuestionUpdate2(token + 'invalid', quizId, updatebody, questionId);
    expect(response.body).toStrictEqual({ error: 'Invalid Token' });
    expect(response.status).toStrictEqual(401);
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId = requestQuizCreate(token, 'quiz2', '').body.quizId;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').body.quizId;
    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumber',
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
    requestQuestionCreate(token, quizId, questionbody);
    const questionbody2: questionBodyType = {
      question: 'Who is the of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Crnumber',
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
    const questionId2 = requestQuestionCreate(token2, quizId2, questionbody2).body.questionId;
    const response = requestQuestionUpdate2(token, quizId2, questionbody2, questionId2);
    expect(response.body).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
    expect(response.status).toStrictEqual(403);
  });
});
