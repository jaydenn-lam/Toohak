import request from 'sync-request-curl';
import config from './config.json';

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

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

  return JSON.parse(res.body.toString());
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
  return JSON.parse(res.body.toString());
}

function requestQuizList(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/list',
    {
      qs: {
        token
      },
      timeout: 100
    }
  );
  return JSON.parse(res.body.toString());
}

function requestQuizDescriptionUpdate(token: string, description: string, quizId: number) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/quiz/' + quizId + '/description',
    {
      json: {
        token,
        description
      },
      timeout: 100
    }
  );
  return JSON.parse(res.body.toString());
}

function requestQuizInfo(token: string, quizId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/' + quizId,
    {
      qs: {
        token,
      },
      timeout: 100
    }
  );
  return JSON.parse(res.body.toString());
}

function requestQuizRemove(token: string, quizId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}`,
    {
      qs: {
        token,
      },
      timeout: 100
    }
  );
  return JSON.parse(res.body.toString());
}

function requestQuiznameUpdate(token: string, quizId: number, name: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/quiz/' + quizId + '/name',
    {
      json: {
        token,
        name
      },
      timeout: 100
    }
  );
  return JSON.parse(res.body.toString());
}

function requestQuizViewTrash(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/trash',
    {
      qs: {
        token
      },
      timeout: 100
    }
  );
  return JSON.parse(res.body.toString());
}

function requestTrashEmpty(token: string, quizzesArray: number[]) {
  const quizzes = JSON.stringify(quizzesArray);
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/admin/quiz/trash/empty',
    {
      qs: {
        token,
        quizzes
      },
      timeout: 100
    }
  );
  return JSON.parse(res.body.toString());
}

describe('POST /v1/admin/quiz', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    expect(requestQuizCreate(token, 'Animal Quiz',
      'Test yourr knowledge on animals!'))
      .toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Multiple Working Entries', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    expect(requestQuizCreate(token, 'Animal Quiz',
      'Test yourr knowledge on animals!'))
      .toStrictEqual({ quizId: expect.any(Number) });
    expect(requestQuizCreate(token, 'Food Quiz',
      'Test yourr knowledge on food!'))
      .toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Invalid token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    expect(requestQuizCreate(token + 'Invalid', 'Animal Quiz',
      'Test yourr knowledge on animals!'))
      .toStrictEqual({ error: 'Invalid Token' });
  });

  test('Invalid character(s) ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    expect(requestQuizCreate(token, 'Invalid?!',
      'Test yourr knowledge on animals!'))
      .toStrictEqual({ error: 'Invalid character(s) in name' });
    expect(requestQuizCreate(token, 'Invalid=1',
      'Test yourr knowledge on food!'))
      .toStrictEqual({ error: 'Invalid character(s) in name' });
    expect(requestQuizCreate(token, 'Invalid()',
      'Test yourr knowledge on food!'))
      .toStrictEqual({ error: 'Invalid character(s) in name' });
  });

  test('Name too short ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    expect(requestQuizCreate(token, 'XX',
      'Test yourr knowledge on animals!'))
      .toStrictEqual({ error: 'Quiz name too short' });
  });

  test('Name too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    expect(requestQuizCreate(token, 'The worlds longest ever invalid quiz name',
      'Test yourr knowledge on animals!'))
      .toStrictEqual({ error: 'Quiz name too long' });
  });

  test('Name already used by current user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    expect(requestQuizCreate(token, 'Animal Quiz',
      'Test yourr knowledge on animals!'))
      .toStrictEqual({ quizId: expect.any(Number) });
    expect(requestQuizCreate(token, 'Animal Quiz',
      'Test yourr knowledge on animals!'))
      .toStrictEqual({ error: 'Name already being used' });
  });

  test('Description too long ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    expect(requestQuizCreate(token, 'Animal Quiz',
      'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz'))
      .toStrictEqual({ error: 'Quiz description too long' });
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
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!');
    expect(requestQuizList(token)).toStrictEqual({ quizzes: expect.any(Array) });
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!');
    const invalidToken = token + 'Invalid';
    expect(requestQuizList(invalidToken)).toStrictEqual({ error: 'Invalid Token' });
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
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const invalidToken = token + 'Invalid';
    const error = requestQuizInfo(invalidToken, quizId);
    expect(error).toStrictEqual({ error: 'Invalid Token' });
  });

  test('User is not Owner of Quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').token;
    const error = requestQuizInfo(token2, quizId);
    expect(error).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Invalid QuizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const invalidQuizId = quizId + 1;
    const error = requestQuizInfo(token, invalidQuizId);
    expect(error).toStrictEqual({ error: 'Invalid Quiz Id' });
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const quizInfo = requestQuizInfo(token, quizId);
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!'
    });
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
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const error = requestQuizDescriptionUpdate(token, 'InvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescriptionInvalidDescription', quizId);
    expect(error).toStrictEqual({ error: 'Description is more than 100 characters in length' });
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const invalidToken = token + 'Invalid';
    const error = requestQuizDescriptionUpdate(invalidToken, 'Valid Description', quizId);
    expect(error).toStrictEqual({ error: 'Invalid Token' });
  });

  test('User is not Owner of Quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').token;
    const error = requestQuizDescriptionUpdate(token2, 'Valid Description', quizId);
    expect(error).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Invalid quizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const invalidQuizId = quizId + 1;
    const error = requestQuizDescriptionUpdate(token, 'Valid Description', invalidQuizId);
    expect(error).toStrictEqual({ error: 'Invalid quiz Id' });
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
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
    });
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
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    const invalidToken = token + 'Invalid';
    expect(requestQuizRemove(invalidToken, quizId)).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuizRemove('', quizId)).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Invalid quizId ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    const invalidQuizId = quizId + 1;
    const error = requestQuizRemove(token, invalidQuizId);
    expect(error).toStrictEqual({ error: 'Invalid quiz Id' });
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').quizId;
    expect(requestQuizRemove(token, quizId2)).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Successful Remove', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuizList(token)).toStrictEqual({ quizzes: [{ quizId: quizId, name: 'quiz1' }] });
    const removeOutput = requestQuizRemove(token, quizId);
    expect(removeOutput).toStrictEqual({});
    expect(requestQuizList(token)).toStrictEqual({ quizzes: [] });
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
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuiznameUpdate(token + 'Invalid', quizId, 'quiz2')).toStrictEqual({ error: 'Invalid Token' });
  });
  test('Empty token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuiznameUpdate('', quizId, 'quiz2')).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Correct behaviour', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuiznameUpdate(token, quizId, 'quiz2')).toStrictEqual({});
  });

  test('Quiz not owned by user ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const token2 = requestAuthRegister('validem@unsw.edu.au', '4321abcd', 'First', 'Last').token;
    const quizId2 = requestQuizCreate(token2, 'quiz2', '').quizId;
    expect(requestQuiznameUpdate(token, quizId2, 'quiz3')).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Normal Run', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    const QuizInfo = requestQuizInfo(token, quizId);
    expect(QuizInfo).toStrictEqual({
      quizId: expect.any(Number),
      name: 'quiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: ''
    });
    requestQuiznameUpdate(token, quizId, 'newquiz1');
    const QuizInfo2 = requestQuizInfo(token, quizId);
    expect(QuizInfo2).toStrictEqual({
      quizId: expect.any(Number),
      name: 'newquiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: ''
    });
  });
  test('Invalid new name', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'quiz1', '').quizId;
    expect(requestQuiznameUpdate(token, quizId, 'quiz1#')).toStrictEqual({ error: 'Invalid new name' });
    expect(requestQuiznameUpdate(token, quizId, 'quiz1/')).toStrictEqual({ error: 'Invalid new name' });
    expect(requestQuiznameUpdate(token, quizId, 'q1')).toStrictEqual({ error: 'Invalid new name' });
    expect(requestQuiznameUpdate(token, quizId, 'quiz1quiz1quiz1quiz1quiz1quiz1quiz1')).toStrictEqual({ error: 'Invalid new name' });
  });

  test('Quiz name already used', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    requestQuizCreate(token, 'quiz1', '');
    const quizId = requestQuizCreate(token, 'quiz2', '').quizId;
    expect(requestQuiznameUpdate(token, quizId, 'quiz1')).toStrictEqual({ error: 'Quiz name already in use' });
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
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const invalidToken = token + 'Invalid';
    const error = requestQuizViewTrash(invalidToken);
    expect(error).toStrictEqual({ error: 'Invalid Token' });

    const error2 = requestQuizViewTrash('');
    expect(error2).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Working Case', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
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
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
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
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const quizArray = [quizId];
    requestQuizRemove(token, quizId);
    expect(requestTrashEmpty(token, quizArray)).toStrictEqual({});
  });

  test('Invalid quizId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const invalidQuizId = quizId - 401;
    const quizArray = [invalidQuizId];
    requestQuizRemove(token, quizId);
    expect(requestTrashEmpty(token, quizArray)).toStrictEqual({ error: 'Invalid quizId' });
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    const quizArray = [quizId];
    const invalidToken = token + 'Invalid';
    expect(requestTrashEmpty(invalidToken, quizArray)).toStrictEqual({ error: 'Invalid Token' });
  });

  test('User does not own this quiz', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const quizId = requestQuizCreate(token, 'Animal Quiz', 'Test your knowledge on animals!').quizId;
    requestQuizRemove(token, quizId);
    const tokenNotOwner = requestAuthRegister('jayden@unsw.edu.au', '5678efgh', 'Jayden', 'Lam').token;
    const quizArray = [quizId];
    expect(requestTrashEmpty(tokenNotOwner, quizArray)).toStrictEqual({ error: 'User does not own quiz' });
  });
});
