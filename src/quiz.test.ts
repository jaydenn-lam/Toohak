import request from 'sync-request-curl';
import config from './config.json';
import {
  requestAuthRegister, requestQuizCreate, requestQuizList, requestQuizInfo, requestQuizDescriptionUpdate, requestQuizRemove
  , requestQuizViewTrash, requestQuiznameUpdate, requestadminQuizRestore, requestTrashEmpty, requestadminQuizTransfer, requestQuestionCreate,
  requestQuestionMove, requestQuestionDelete, requestQuestionDuplicate, requestQuestionUpdate
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
  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuizCreate(token, 'Animal Quiz',
      'Test your knowledge on animals!'))
      .toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Multiple Working Entries', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuizCreate(token, 'Animal Quiz',
      'Test your knowledge on animals!'))
      .toStrictEqual({ quizId: expect.any(Number) });
    expect(requestQuizCreate(token, 'Food Quiz',
      'Test your knowledge on food!'))
      .toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuizCreate(token + 'Invalid', 'Animal Quiz',
      'Test your knowledge on animals!'))
      .toStrictEqual({ error: 'Invalid Token' });
  });

  test('Invalid character(s) ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuizCreate(token, 'Invalid?!',
      'Test your knowledge on animals!'))
      .toStrictEqual({ error: 'Invalid character(s) in name' });
    expect(requestQuizCreate(token, 'Invalid=1',
      'Test your knowledge on food!'))
      .toStrictEqual({ error: 'Invalid character(s) in name' });
    expect(requestQuizCreate(token, 'Invalid()',
      'Test your knowledge on food!'))
      .toStrictEqual({ error: 'Invalid character(s) in name' });
  });

  test('Name too short ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuizCreate(token, 'XX',
      'Test your knowledge on animals!'))
      .toStrictEqual({ error: 'Quiz name too short' });
  });

  test('Name too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuizCreate(token, 'The worlds longest ever invalid quiz name',
      'Test your knowledge on animals!'))
      .toStrictEqual({ error: 'Quiz name too long' });
  });

  test('Name already used by current user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuizCreate(token, 'Animal Quiz',
      'Test your knowledge on animals!'))
      .toStrictEqual({ quizId: expect.any(Number) });
    expect(requestQuizCreate(token, 'Animal Quiz',
      'Test your knowledge on animals!'))
      .toStrictEqual({ error: 'Name already being used' });
  });

  test('Description too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuizCreate(token, 'Animal Quiz',
      'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz'))
      .toStrictEqual({ error: 'Quiz description too long' });
  });
});

describe('GET /v1/admin/quiz/list', () => {
  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!');
    expect(requestQuizList(token)).toStrictEqual({ quizzes: expect.any(Array) });
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!');
    const invalidToken = token + 'Invalid';
    expect(requestQuizList(invalidToken)).toStrictEqual({ error: 'Invalid Token' });
  });
});

describe('GET /v1/admin/quiz/{quizid} (quizInfo)', () => {
  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const invalidToken = token + 'Invalid';
    const error = requestQuizInfo(invalidToken, quizId);
    expect(error).toStrictEqual({ error: 'Invalid Token' });
  });

  test('User is not Owner of Quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const error = requestQuizInfo(token2, quizId);
    expect(error).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Invalid QuizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const invalidQuizId = quizId + 1;
    const error = requestQuizInfo(token, invalidQuizId);
    expect(error).toStrictEqual({ error: 'Invalid quizId' });
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const quizInfo = requestQuizInfo(token, quizId);
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
  });
});

describe('PUT /v1/admin/quiz/{quizid}/description', () => {
  test('Description too long', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const error = requestQuizDescriptionUpdate(token, 'InvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescription', quizId);
    expect(error).toStrictEqual({ error: 'Description is more than 100 characters in length' });
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const invalidToken = token + 'Invalid';
    const error = requestQuizDescriptionUpdate(invalidToken, 'Valid Description', quizId);
    expect(error).toStrictEqual({ error: 'Invalid Token' });
  });

  test('User is not Owner of Quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
    const error = requestQuizDescriptionUpdate(token2, 'Valid Description', quizId);
    expect(error).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Invalid quizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const invalidQuizId = quizId + 1;
    const error = requestQuizDescriptionUpdate(token, 'Valid Description', invalidQuizId);
    expect(error).toStrictEqual({ error: 'Invalid quizId' });
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const returnedValue = requestQuizDescriptionUpdate(token, 'Valid New Description', quizId);
    expect(returnedValue).toStrictEqual({});

    const quizInfo = requestQuizInfo(token, quizId);
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Valid New Description',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
  });
});

describe('/v1/admin/quiz/{quizid}', () => {
  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuizRemove(token + 'Invalid', quizId)).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuizRemove('', quizId)).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Correct behaviour', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuizRemove(token, quizId)).toStrictEqual({});
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').quizId;
    expect(requestQuizRemove(token, quizId2)).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('successful remove', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuizList(token)).toStrictEqual({ quizzes: [{ quizId: quizId, name: 'quiz1' }] });
    requestQuizRemove(token, quizId);
    expect(requestQuizList(token)).toStrictEqual({ quizzes: [] });
    expect(requestQuizViewTrash(token)).toStrictEqual({
      quizzes: [{
        quizId: quizId,
        name: 'quiz1'
      }]
    });
  });

  test('Empty view', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestQuizViewTrash(token);
    expect(response).toStrictEqual({ quizzes: [] });
  });
});

describe('/v1/admin/quiz/{quizid}/name', () => {
  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuiznameUpdate(token + 'Invalid', quizId, 'quiz2')).toStrictEqual({ error: 'Invalid Token' });
  });
  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuiznameUpdate('', quizId, 'quiz2')).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Correct behaviour', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuiznameUpdate(token, quizId, 'quiz2')).toStrictEqual({});
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').quizId;
    expect(requestQuiznameUpdate(token, quizId2, 'quiz3')).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Normal Run', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    const QuizInfo = requestQuizInfo(token, quizId);
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
    const QuizInfo2 = requestQuizInfo(token, quizId);
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
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuiznameUpdate(token, quizId, 'quiz1#')).toStrictEqual({ error: 'Invalid new name' });
    expect(requestQuiznameUpdate(token, quizId, 'quiz1/')).toStrictEqual({ error: 'Invalid new name' });
    expect(requestQuiznameUpdate(token, quizId, 'q1')).toStrictEqual({ error: 'Invalid new name' });
    expect(requestQuiznameUpdate(token, quizId, 'quiz1quiz1quiz1quiz1quiz1quiz1quiz1')).toStrictEqual({ error: 'Invalid new name' });
  });

  test('Quiz name already used', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'quiz1', '');
    const quizId = requestQuizCreate(token, 'quiz2', '').quizId;
    expect(requestQuiznameUpdate(token, quizId, 'quiz1')).toStrictEqual({ error: 'Quiz name already in use' });
  });
});

describe('/v1/admin/quiz/{quizid}/restore', () => {
  test('successful restore', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    requestQuizRemove(token, quizId);
    requestadminQuizRestore(token, quizId);
    const error = requestQuizList(token);
    expect(error).toStrictEqual({ quizzes: [{ quizId: quizId, name: 'quiz1' }] });
  });
  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    requestQuizRemove(token, quizId);
    const error = requestadminQuizRestore(token + 'Invalid', quizId);
    expect(error).toStrictEqual({ error: 'Invalid Token' });
  });
  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    requestQuizRemove(token, quizId);
    const error = requestadminQuizRestore('', quizId);
    expect(error).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Correct behaviour', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    requestQuizRemove(token, quizId);
    const error = requestadminQuizRestore(token, quizId);
    expect(error).toStrictEqual({});
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').quizId;
    requestQuizRemove(token2, quizId2);
    const error = requestadminQuizRestore(token, quizId2);
    expect(error).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });
  test('Quiz name already used', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestQuizCreate(token, 'quiz1', '');
    const quizId = requestQuizCreate(token, 'quiz2', '').quizId;
    const error = requestQuiznameUpdate(token, quizId, 'quiz1');
    expect(error).toStrictEqual({ error: 'Quiz name already in use' });
  });
  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    requestQuizRemove(token, quizId);
    const error = requestadminQuizRestore(token, quizId + 1);
    expect(error).toStrictEqual({ error: 'Invalid quizId' });
  });
});

describe('ViewQuizTrash', () => {
  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const invalidToken = token + 'Invalid';
    const error = requestQuizViewTrash(invalidToken);
    expect(error).toStrictEqual({ error: 'Invalid Token' });
    const error2 = requestQuizViewTrash('');
    expect(error2).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz Name', 'Description').quizId;
    requestQuizRemove(token, quizId);
    const trash = requestQuizViewTrash(token);
    expect(trash).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz Name'
        }
      ]
    });
  });

  test('Multiple Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Quiz Name', 'Description').quizId;
    const quizId2 = requestQuizCreate(token, 'Quiz Name 2', 'Description').quizId;
    requestQuizRemove(token, quizId);
    requestQuizRemove(token, quizId2);
    const trash = requestQuizViewTrash(token);
    expect(trash).toStrictEqual({
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
  });
});

describe('DELETE /v1/admin/quiz/trash/empty', () => {
  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const quizArray = [quizId];
    requestQuizRemove(token, quizId);
    expect(requestQuizViewTrash(token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Animal Quiz'
        }
      ]
    });
    expect(requestTrashEmpty(token, quizArray)).toStrictEqual({});
    expect(requestQuizViewTrash(token)).toStrictEqual({ quizzes: [] });
  });

  test('Invalid quizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const invalidQuizId = quizId - 401;
    const quizArray = [invalidQuizId];
    requestQuizRemove(token, quizId);
    expect(requestTrashEmpty(token, quizArray)).toStrictEqual({ error: 'Invalid quizId' });
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const quizArray = [quizId];
    const invalidToken = token + 'Invalid';
    expect(requestTrashEmpty(invalidToken, quizArray)).toStrictEqual({ error: 'Invalid Token' });
  });

  test('User does not own this quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    requestQuizRemove(token, quizId);
    const tokenNotOwner = requestAuthRegister('jayden@unsw.edu.au', '5678efgh', 'Jayden', 'Lam').body.token;
    const quizArray = [quizId];
    expect(requestTrashEmpty(tokenNotOwner, quizArray)).toStrictEqual({ error: 'User does not own quiz' });
  });
});

describe('/v1/admin/quiz/{quizid}/transfer', () => {
  test('Invalid token ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token1, 'quiz1', '').quizId;
    const error = requestadminQuizTransfer(token1 + 'Invalid', quizId, 'william@unsw.edu.au');
    expect(error).toStrictEqual({ error: 'Invalid Token' });
  });
  test('Empty token ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token1, 'quiz1', '').quizId;
    const error = requestadminQuizTransfer('', quizId, 'william2@unsw.edu.au');
    expect(error).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Quiz not owned by user ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').quizId;
    const error = requestadminQuizTransfer(token1, quizId2, 'validem@unsw.edu.au');
    expect(error).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });
  test('User email does not exist ERROR', () => {
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').quizId;
    const error = requestadminQuizTransfer(token2, quizId2, 'invalid@invalid.edu');
    expect(error).toStrictEqual({ error: 'userEmail does not exist' });
  });
  test('userEmail is the current logged in user ERROR', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId1 = requestQuizCreate(token1, 'quiz1', '').quizId;
    const error = requestadminQuizTransfer(token1, quizId1, 'william@unsw.edu.au');
    expect(error).toStrictEqual({ error: 'userEmail is the current logged in user' });
  });
  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId1 = requestQuizCreate(token1, 'quiz1', '').quizId;
    const quizId2 = requestQuizCreate(token2, 'quiz1', '').quizId;
    const error = requestadminQuizTransfer(token1, quizId1, 'validem@unsw.edu.au');
    const quizList2 = requestQuizList(token2);
    expect(quizList2.quizzes).toContainEqual({ quizId: quizId2, name: 'quiz1' });
    expect(error).toStrictEqual({ error: 'Quiz ID refers to a quiz that has a name that is already used by the target user' });
  });
  test('successful restore', () => {
    const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'Anita', 'Byun').body.token;
    const quizId1 = requestQuizCreate(token1, 'quiz1', '').quizId;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').quizId;
    requestadminQuizTransfer(token1, quizId1, 'validem@unsw.edu.au');
    const success = requestQuizList(token2);
    expect(success).toStrictEqual({ quizzes: [{ quizId: quizId1, name: 'quiz1' }, { quizId: quizId2, name: 'quiz2' }] });
  });
});

describe('POST /v1/admin/quiz/{quizId}/question', () => {
  test('Success case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
    expect(questionId).toStrictEqual(expect.any(Number));
    const quizInfo = requestQuizInfo(token, quizId);
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
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Question too short' });
  });

  test('Question too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Question too long' });
  });

  test('Too little number of answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Too little answers' });
  });

  test('Number of answers greater than 6 ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Number of answers greater than 6' });
  });

  test('Question Duration is a negative number ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Question duration is not positive' });
  });

  test('Question Duration is a negative number ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Question duration is too long' });
  });

  test('Number of points less than 1 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Question points is zero or negative' });
  });

  test('Number of points greater than 10 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Question points exceeded max value' });
  });

  test('Answer length is too small ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Length of an answer is less than 1 character' });
  });

  test('Answer length too large ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Length of an answer is greater than 30 characters' });
  });

  test('Answer strings are duplicate within question ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'Duplicate answers' });
  });

  test('No correct answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token, quizId, questionbody)).toStrictEqual({ error: 'No correct answers' });
  });

  test('invalid token ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
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
    expect(requestQuestionCreate(token + 'invalid', quizId, questionbody)).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').quizId;
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
    expect(requestQuestionCreate(token, quizId2, questionbody)).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });
});

describe('quiz/QuestionMove', () => {
  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const moverQuestionId = requestQuestionCreate(token, quizId, questionBody1).questionId;
    requestQuestionCreate(token, quizId, questionBody2);
    requestQuestionCreate(token, quizId, questionBody3);
    requestQuestionMove(token, quizId, moverQuestionId, 2);

    const quizInfo = requestQuizInfo(token, quizId);
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
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).questionId;
    const invalidToken = token + 'Invalid';

    const invalidError = requestQuestionMove(invalidToken, quizId, questionId, 1);
    expect(invalidError).toStrictEqual({ error: 'Invalid Token' });

    const emptyError = requestQuestionMove('', quizId, questionId, 1);
    expect(emptyError).toStrictEqual({ error: 'Invalid Token' });
  });

  test('User is not owner of quiz ERROR', () => {
    const originalToken = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(originalToken, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId = requestQuestionCreate(originalToken, quizId, questionBody1).questionId;
    const newToken = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;

    const error = requestQuestionMove(newToken, quizId, questionId, 1);
    expect(error).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Invalid questionId ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).questionId;
    const invalidQuestionId = questionId + 1;

    const error = requestQuestionMove(token, quizId, invalidQuestionId, 0);
    expect(error).toStrictEqual({ error: 'Invalid questionId' });
  });

  test('New Position is the current position ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    requestQuestionCreate(token, quizId, questionBody1);
    const position1QuestionId = requestQuestionCreate(token, quizId, questionBody2).questionId;

    const error = requestQuestionMove(token, quizId, position1QuestionId, 1);
    expect(error).toStrictEqual({ error: 'New position cannot be the current position' });
  });

  test('Invalid New Position ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    requestQuestionCreate(token, quizId, questionBody1);
    const moverQuestionId = requestQuestionCreate(token, quizId, questionBody2).questionId;

    const negativeError = requestQuestionMove(token, quizId, moverQuestionId, -1);
    expect(negativeError).toStrictEqual({ error: 'New position must be in the length of the question array' });

    const overError = requestQuestionMove(token, quizId, moverQuestionId, 2);
    expect(overError).toStrictEqual({ error: 'New position must be in the length of the question array' });
  });
});

describe('DELETE /v1/admin/quiz/:quizid/question/:questionid', () => {
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
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).questionId;
    expect(requestQuestionDelete(token, quizId, questionId)).toStrictEqual({});
  });

  test('Invalid questionId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).questionId;
    const invalidQuestionId = questionId + 1;
    expect(requestQuestionDelete(token, quizId, invalidQuestionId)).toStrictEqual({ error: 'Invalid questionId' });
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).questionId;
    const invalidToken = token + 'Invalid';
    expect(requestQuestionDelete(invalidToken, quizId, questionId)).toStrictEqual({ error: 'Invalid Token' });
  });

  test('User does not own this quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody).questionId;
    const tokenNotOwner = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    expect(requestQuestionDelete(tokenNotOwner, quizId, questionId)).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });
});

describe('POST quizQuestionDuplicate', () => {
  test('Working case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId1 = requestQuestionCreate(token, quizId, questionBody1).questionId;
    requestQuestionCreate(token, quizId, questionBody2);

    const duplicateQuestionId = requestQuestionDuplicate(token, quizId, questionId1).newQuestionId;
    expect(duplicateQuestionId).toStrictEqual(expect.any(Number));

    const quizInfo = requestQuizInfo(token, quizId);
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
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).questionId;
    const invalidToken = token + 'Invalid';

    const invalidError = requestQuestionDuplicate(invalidToken, quizId, questionId);
    expect(invalidError).toStrictEqual({ error: 'Invalid Token' });

    const emptyError = requestQuestionDuplicate('', quizId, questionId);
    expect(emptyError).toStrictEqual({ error: 'Invalid Token' });
  });

  test('User is not an owner of the quiz ERROR', () => {
    const originalToken = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(originalToken, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId = requestQuestionCreate(originalToken, quizId, questionBody1).questionId;
    const newToken = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;

    const error = requestQuestionDuplicate(newToken, quizId, questionId);
    expect(error).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Invalid questionId ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const questionId = requestQuestionCreate(token, quizId, questionBody1).questionId;
    const invalidQuestionId = questionId + 1;
    const error = requestQuestionDuplicate(token, quizId, invalidQuestionId);
    expect(error).toStrictEqual({ error: 'Invalid questionId' });
  });
});

describe('PUT /v1/admin/quiz/{quizId}/question/{questionId}', () => {
  test('Success case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
    const quizInfo = requestQuizInfo(token, quizId);
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
    requestQuestionUpdate(token, quizId, updateQuestion, questionId);
    const quizInfo2 = requestQuizInfo(token, quizId);
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
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Question too short' });
  });

  test('Question too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Question too long' });
  });

  test('Too little number of answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Too little answers' });
  });

  test('Number of answers greater than 6 ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errortype = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errortype).toStrictEqual({ error: 'Number of answers greater than 6' });
  });

  test('Question Duration is a negative number ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Question duration is not positive' });
  });

  test('Question Duration is a greater than 3 mins ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Question duration is too long' });
  });

  test('Number of points less than 1 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Question points is zero or negative' });
  });

  test('Number of points greater than 10 ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Question points exceeded max value' });
  });

  test('Answer length is too small ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Length of an answer is less than 1 character' });
  });

  test('Answer length too large ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Length of an answer is greater than 30 characters' });
  });

  test('Answer strings are duplicate within question ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Duplicate answers' });
  });

  test('No correct answers ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token, quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'No correct answers' });
  });

  test('invalid token ERROR ', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
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
    const questionId = requestQuestionCreate(token, quizId, questionbody).questionId;
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
    const errorType = requestQuestionUpdate(token + 'invalid', quizId, updatebody, questionId);
    expect(errorType).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').body.token;
    const quizId = requestQuizCreate(token, 'quiz2', '').quizId;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').quizId;
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
    const questionId2 = requestQuestionCreate(token2, quizId2, questionbody2).questionId;
    const errorType = requestQuestionUpdate(token, quizId2, questionbody2, questionId2);
    expect(errorType).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });
});

request(
  'DELETE',
  SERVER_URL + '/v1/clear'
);
