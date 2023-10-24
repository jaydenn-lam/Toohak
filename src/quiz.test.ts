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

    const quizInfo = requestQuizInfo(quizId, token);
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Valid New Description',
    });
  });
});

/*

describe('adminQuizList', () => {
  beforeEach(() => {
    clear();
  });
  test('Working Entry', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    adminQuizCreate(AuthUserId, 'Animal Quiz', 'Test yourr knowledge on animals!');
    const QuizList = adminQuizList(AuthUserId);
    expect(QuizList).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Animal Quiz',
        }
      ]
    });
  });

  test('Multiple quiz working entry', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    adminQuizCreate(AuthUserId, 'Animal Quiz', 'Test yourr knowledge on animals!');
    adminQuizCreate(AuthUserId, 'Food Quiz', 'Test yourr knowledge on food!');
    const QuizList = adminQuizList(AuthUserId);
    expect(QuizList).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Animal Quiz',
        },
        {
          quizId: expect.any(Number),
          name: 'Food Quiz',
        }
      ]
    });
  });

  test('Invalid AuthUserId ERROR', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    adminQuizCreate(AuthUserId, 'Animal Quiz', 'Test yourr knowledge on animals!');
    const QuizList = adminQuizList(AuthUserId + 1);
    expect(QuizList).toStrictEqual({ error: 'Invalid User Id' });
  });
});

describe('adminQuizCreate', () => {
  beforeEach(() => {
    clear();
  });
  test('Working Entry', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 'Test yourr knowledge on animals!');
    expect(quizId).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Multiple Working Entries', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 'Test yourr knowledge on animals!');
    expect(quizId).toStrictEqual({ quizId: expect.any(Number) });
    const quizId2 = adminQuizCreate(AuthUserId, 'Country Quiz', 'Test yourr knowledge on countries!');
    expect(quizId2).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Invalid AuthUserId ERROR', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(AuthUserId + 1, 'Animal Quiz', 'Test yourr knowledge on animals!');
    expect(quizId).toStrictEqual({ error: 'Invalid User Id' });
  });

  test.each([
    [0, 'Animal Quiz!?', 'Test yourr knowledge on animals!',
      { error: 'Invalid character(s) in name' }],
    [0, 'Animal Quiz+', 'Test yourr knowledge on animals!',
      { error: 'Invalid character(s) in name' }],
    [0, 'Animal Quiz()', 'Test yourr knowledge on animals!',
      { error: 'Invalid character(s) in name' }],
  ])('Name contains invalid characters ERROR', (userId, name, description, expected) => {
    adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    expect(adminQuizCreate(userId, name, description)).toEqual(expected);
  });

  test('Name too short ERROR', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(AuthUserId, 'AQ', 'Test yourr knowledge on animals!');
    expect(quizId).toStrictEqual({ error: 'Quiz name too short' });
  });

  test('Name too long ERROR', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(AuthUserId, 'The worlds hardest ever animal quiz', 'Test yourr knowledge on animals!');
    expect(quizId).toStrictEqual({ error: 'Quiz name too long' });
  });

  test('Name already used by current user ERROR', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 'Test yourr knowledge on animals!');
    expect(quizId).toStrictEqual({ quizId: expect.any(Number) });
    const quizId2 = adminQuizCreate(AuthUserId, 'Animal Quiz', 'Test more of your knowledge on animals!');
    expect(quizId2).toStrictEqual({ error: 'Name already being used' });
  });

  test('Description too long ERROR', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(AuthUserId, 'Animal Quiz',
      'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz');
    expect(quizId).toStrictEqual({ error: 'Quiz description too long' });
  });
});

describe('adminQuizInfo', () => {
  beforeEach(() => {
    clear();
  });
  test('Working Entry', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 'Test yourr knowledge on animals!').quizId;
    const QuizInfo = adminQuizInfo(AuthUserId, QuizId);
    expect(QuizInfo).toStrictEqual({
      quizId: 0,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test yourr knowledge on animals!'
    });
  });

  test('Invalid AuthUserId ERROR', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Animal Quiz',
      'Test yourr knowledge on animals!').quizId;
    const QuizInfo = adminQuizInfo(AuthUserId + 1, QuizId);
    expect(QuizInfo).toStrictEqual({ error: 'Invalid User Id' });
  });

  test('Invalid QuizId ERROR', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Animal Quiz',
      'Test yourr knowledge on animals!').quizId;
    const QuizInfo = adminQuizInfo(AuthUserId, QuizId + 1);
    expect(QuizInfo).toStrictEqual({ error: 'Invalid Quiz Id' });
  });

  test('Quiz not owned by this user ERROR', () => {
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu').authUserId;
    const AuthUserId2 = adminAuthRegister('jayden@unsw.edu.au', '1234abcd',
      'Jayden', 'Lam').authUserId;
    const Quiz1 = adminQuizCreate(AuthUserId, 'Animal Quiz',
      'Test yourr knowledge on animals!').quizId;
    const QuizInfo = adminQuizInfo(AuthUserId2, Quiz1);
    expect(QuizInfo).toStrictEqual({ error: 'Quiz not owned by user' });
  });
});

describe('adminQuizNameUpdate', () => {
  beforeEach(() => {
    clear();
  });
  test('Normal Run', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(userId, 'quiz1', '').quizId;
    const QuizInfo = adminQuizInfo(userId, quizId);
    expect(QuizInfo).toStrictEqual({
      quizId: expect.any(Number),
      name: 'quiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: ''
    });
    adminQuizNameUpdate(userId, quizId, 'newquiz1');
    const QuizInfo2 = adminQuizInfo(userId, quizId);
    expect(QuizInfo2).toStrictEqual({
      quizId: expect.any(Number),
      name: 'newquiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: ''
    });
  });

  test('Invalid userId', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(userId, 'quiz1', '').quizId;
    expect(adminQuizNameUpdate(userId + 1, quizId, 'newquiz1')).toStrictEqual({ error: 'Invalid userId' });
  });

  test('Invalid quizId', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(userId, 'quiz1', '').quizId;
    expect(adminQuizNameUpdate(userId, quizId + 1, 'newquiz1')).toStrictEqual({ error: 'Invalid quizId' });
  });

  test('User does not own quizId', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const userId2 = adminAuthRegister('anita@unsw.edu.au', '1234abcd', 'Anita', 'Byun').authUserId;
    const quizId = adminQuizCreate(userId2, 'quiz1', '').quizId;
    expect(adminQuizNameUpdate(userId, quizId, 'newquiz1')).toStrictEqual({ error: 'Quiz not owned by user' });
  });

  test('Invalid new name', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    const quizId = adminQuizCreate(userId, 'quiz1', '').quizId;
    expect(adminQuizNameUpdate(userId, quizId, 'quiz1#')).toStrictEqual({ error: 'Invalid new name' });
    expect(adminQuizNameUpdate(userId, quizId, 'quiz1/')).toStrictEqual({ error: 'Invalid new name' });
    expect(adminQuizNameUpdate(userId, quizId, 'q1')).toStrictEqual({ error: 'Invalid new name' });
    expect(adminQuizNameUpdate(userId, quizId, 'quiz1quiz1quiz1quiz1quiz1quiz1quiz1')).toStrictEqual({ error: 'Invalid new name' });
  });

  test('Quiz name already used', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').authUserId;
    adminQuizCreate(userId, 'quiz1', '');
    const quizId = adminQuizCreate(userId, 'quiz2', '').quizId;
    expect(adminQuizNameUpdate(userId, quizId, 'quiz1')).toStrictEqual({ error: 'Quiz name already in use' });
  });
});

describe('adminQuizRemove testing', () => {
  beforeEach(() => {
    clear();
  });
  test('Valid AuthUserId', () => {
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'quiz1', '').quizId;
    const authUserIdError = adminQuizRemove(AuthUserId + 1, QuizId);
    expect(authUserIdError).toStrictEqual({ error: 'Invalid User Id' });
  });

  test('Valid quizId', () => {
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Quiz1', '').quizId;
    const quizIdError = adminQuizRemove(AuthUserId, QuizId + 1);
    expect(quizIdError).toStrictEqual({ error: 'Invalid quiz Id' });
  });

  test('quizId is not owned by user', () => {
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const AuthUserId2 = adminAuthRegister('palidemail@gmail.com', '456abc!@#', 'Tim', 'Andy').authUserId;
    adminQuizCreate(AuthUserId, 'Quiz1', 'Description');
    const QuizId2 = adminQuizCreate(AuthUserId2, 'Quiz2', 'Description').quizId;
    const error = adminQuizRemove(AuthUserId, QuizId2);
    expect(error).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Check if quiz is removed by function, adminQuizRemove', () => {
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId1 = adminQuizCreate(AuthUserId, 'Quiz1', 'Description').quizId;
    const QuizId2 = adminQuizCreate(AuthUserId, 'Quiz2', 'Description').quizId;
    adminQuizRemove(AuthUserId, QuizId1);
    expect(adminQuizList(AuthUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: QuizId2,
          name: 'Quiz2',
        }
      ]
    });
  });
});

describe('adminQuizDescriptionUpdate testing', () => {
  beforeEach(() => {
    clear();
  });
  test('Valid AuthUserId', () => {
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'quiz1', 'Description').quizId;
    const authUserIdError = adminQuizDescriptionUpdate(AuthUserId + 1, QuizId, '');
    expect(authUserIdError).toStrictEqual({ error: 'Invalid User Id' });
  });

  test('Valid quizId', () => {
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Quiz1', 'Description').quizId;
    const quizIderror = adminQuizDescriptionUpdate(AuthUserId, QuizId + 1, 'Description');
    expect(quizIderror).toStrictEqual({ error: 'Invalid quiz Id' });
  });

  test('quizId is not owned by user', () => {
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const AuthUserId2 = adminAuthRegister('valid2email@gmail.com', '456abc!@#', 'Tim', 'Andy').authUserId;
    adminQuizCreate(AuthUserId, 'Quiz1', 'Desription');
    const QuizId2 = adminQuizCreate(AuthUserId2, 'Quiz2', 'Description').quizId;
    const error = adminQuizDescriptionUpdate(AuthUserId, QuizId2, 'Description');
    expect(error).toStrictEqual({ error: 'Quiz Id is not owned by this user' });
  });

  test('Description is more than 100 characters', () => {
    const text = 'more than 100 characters description is more than 100 characters description is more than 100 characterssssssss';
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'quiz1', 'Description').quizId;
    const descriperror = adminQuizDescriptionUpdate(AuthUserId, QuizId, text);
    expect(descriperror).toStrictEqual({ error: 'Description is more than 100 characters in length' });
  });

  test('Test that the description has been updated', () => {
    const text = 'more than 100 characters description';
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'quiz1', 'Description').quizId;
    adminQuizDescriptionUpdate(AuthUserId, QuizId, text);
    const quizobjectinfo = adminQuizInfo(AuthUserId, QuizId);
    expect(quizobjectinfo.description).toStrictEqual(text);
  });

  test('Description is an empty string', () => {
    const text = '';
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'quiz1', '').quizId;
    adminQuizDescriptionUpdate(AuthUserId, QuizId, text);
    const quizobjectinfo = adminQuizInfo(AuthUserId, QuizId);
    expect(quizobjectinfo.description).toStrictEqual(text);
  });
});
*/
