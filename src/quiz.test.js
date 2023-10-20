import {adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate} from './quiz';
import {adminAuthRegister} from './auth';
import {clear} from './other';

test('Temporary Placeholder', () => {
  let var1 = 0;
  expect(var1).toStrictEqual(0);
})

describe('adminQuizList', () => {
  beforeEach(() => {
    clear();
  });
  test('Working Entry', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!');
    let QuizList = adminQuizList(AuthUserId);
    expect(QuizList).toStrictEqual({ 
      quizzes: [
        {
          quizId: 0,
          name: 'Animal Quiz',
        }
      ]
    });
  });

  test('Multiple quiz working entry', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!');
    adminQuizCreate(AuthUserId, 'Food Quiz', 
    'Test your knowledge on food!');
    let QuizList = adminQuizList(AuthUserId);
    expect(QuizList).toStrictEqual({ 
      quizzes: [
        {
          quizId: 0,
          name: 'Animal Quiz',
        },
        {
          quizId: 1,
          name: 'Food Quiz',
        }
      ]
    });
  });

  test('Invalid AuthUserId ERROR', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!');
    let QuizList = adminQuizList(AuthUserId + 1);
    expect(QuizList).toStrictEqual({error: 'Invalid User Id'});
  });
});

describe('adminQuizCreate', () => {
  beforeEach(() => {
    clear();
  });
  test('Working Entry', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    let quizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!').quizId;
    expect(quizId).toStrictEqual({ quizId: 0 });
  });

  test('Multiple Working Entries', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    let quizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!').quizId;
    expect(quizId).toStrictEqual({ quizId: 0 });
    let quizId2 = adminQuizCreate(AuthUserId, 'Country Quiz', 
    'Test your knowledge on countries!').quizId;
    expect(quizId2).toStrictEqual({ quizId: 1 });
  })

  test('Invalid AuthUserId ERROR', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    let quizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!');
    expect(quizId).toStrictEqual({error: 'Invalid User Id'});
  });

  test.each([
    [0, 'Animal Quiz!?', 'Test your knowledge on animals!', 
    {error: "Invalid character(s) in name"}],
    [0, 'Animal Quiz+', 'Test your knowledge on animals!', 
    {error: "Invalid character(s) in name"}],
    [0, 'Animal Quiz()', 'Test your knowledge on animals!', 
    {error: "Invalid character(s) in name"}],
  ])('Name contains invalid characters ERROR', (userId, name, description, 
    expected) => {

    adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    expect(adminQuizCreate(userId, name, description)).toEqual(expected) 
  });

  test('Name too short ERROR', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    let quizId = adminQuizCreate(AuthUserId, 'AQ', 
    'Test your knowledge on animals!');
    expect(quizId).toStrictEqual({error: 'Quiz name too short'});
  });

  test('Name too long ERROR', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    let quizId = adminQuizCreate(AuthUserId, 'The worlds hardest ever animal quiz', 
    'Test your knowledge on animals!');
    expect(quizId).toStrictEqual({error: 'Quiz name too long'});
  });

  test('Name already used by current user ERROR', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    let quizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!').quizId;
    expect(quizId).toStrictEqual({ quizId: 0 });
    let quizId2 = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test more of your knowledge on animals!');
    expect(quizId2).toStrictEqual({error: 'Name already being used'});
  });

  test('Description too long ERROR', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    let quizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    `abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz 
    abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz`);
    expect(quizId).toStrictEqual({error: 'Quiz description too long'});
  });
});

describe('adminQuizInfo', () => {
  beforeEach(() => {
    clear();
  });
  test('Working Entry', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!').quizId;
    let QuizInfo = adminQuizInfo(AuthUserId, QuizId);
    expect(QuizInfo).toStrictEqual({ 
      quizId: 0,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!'
    });
  });

  test('Invalid AuthUserId ERROR', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!').quizId;
    let QuizInfo = adminQuizInfo(AuthUserId + 1, QuizId);
    expect(QuizInfo).toStrictEqual({error: 'Invalid User Id'});
  });

  test('Invalid QuizId ERROR', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!').quizId;
    let QuizInfo = adminQuizInfo(AuthUserId, QuizId + 1);
    expect(QuizInfo).toStrictEqual({error: 'Invalid Quiz Id'});
  });

  test('Quiz not owned by this user ERROR', () => {

    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    const AuthUserId2 = adminAuthRegister('jayden@unsw.edu.au', '1234abcd', 
    'Jayden', "Lam").authUserId;
    const Quiz1 = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!').quizId;
    let QuizInfo = adminQuizInfo(AuthUserId2, Quiz1);
    expect(QuizInfo).toStrictEqual({error: 'Quiz not owned by user'});
  });
});

describe('adminQuizNameUpdate', () => {
  beforeEach(() => {
    clear();
  });

  test('Normal Run', () => {
    let userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', "Lu").authUserId;
    let quizId = adminQuizCreate(userId, 'quiz1', '').quizId;
    let QuizInfo = adminQuizInfo(userId, quizId);
    expect(QuizInfo).toStrictEqual({ 
      quizId: 0,
      name: 'quiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: ''
    });
    adminQuizNameUpdate(userId, quizId, 'newquiz1');
    let QuizInfo2 = adminQuizInfo(userId, quizId);
    expect(QuizInfo2).toStrictEqual({ 
      quizId: 0,
      name: 'newquiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: ''
    });
  });

  test('Invalid userId', () => {
    let userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', "Lu").authUserId;
    let quizId = adminQuizCreate(userId, 'quiz1', '').quizId;
    expect(adminQuizNameUpdate(userId + 1, quizId, 'newquiz1')).toStrictEqual({error: 'Invalid userId'});
  });

  test('Invalid quizId', () => {
    let userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', "Lu").authUserId;
    let quizId = adminQuizCreate(userId, 'quiz1', '').quizId;
    expect(adminQuizNameUpdate(userId, quizId + 1, 'newquiz1')).toStrictEqual({error: 'Invalid quizId'});
  });

  test('User does not own quizId', () => {
    let userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', "Lu").authUserId;
    let userId2 = adminAuthRegister('anita@unsw.edu.au', '1234abcd', 'Anita', "Byun").authUserId;
    let quizId = adminQuizCreate(userId2, 'quiz1', '').quizId;
    expect(adminQuizNameUpdate(userId, quizId, 'newquiz1')).toStrictEqual({error: 'Quiz not owned by user'});
  });

  test('Invalid new name', () => {
    let userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', "Lu").authUserId;
    let quizId = adminQuizCreate(userId, 'quiz1', '').quizId;
    expect(adminQuizNameUpdate(userId, quizId, 'quiz1#')).toStrictEqual({error: 'Invalid new name'});
    expect(adminQuizNameUpdate(userId, quizId, 'quiz1/')).toStrictEqual({error: 'Invalid new name'});
    expect(adminQuizNameUpdate(userId, quizId, 'q1')).toStrictEqual({error: 'Invalid new name'});
    expect(adminQuizNameUpdate(userId, quizId, 'quiz1quiz1quiz1quiz1quiz1quiz1quiz1')).toStrictEqual({error: 'Invalid new name'});
  });

  test('Quiz name already used', () => {
    let userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', "Lu").authUserId;
    adminQuizCreate(userId, 'quiz1', '');
    let quizId =  adminQuizCreate(userId, 'quiz2', '').quizId;
    expect(adminQuizNameUpdate(userId, quizId, 'quiz1')).toStrictEqual({error: 'Quiz name already in use'});
  });

});

describe('adminQuizRemove testing', () => {
  beforeEach(() => {
    clear();
  });
  test('Valid AuthUserId', () => {

    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'quiz1', "").quizId;
    let authUserId_error = adminQuizRemove(AuthUserId + 1, QuizId);
    expect(authUserId_error).toStrictEqual({error: 'Invalid User Id'});
  });

  test('Valid quizId', () => {

    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Quiz1', "").quizId;
    const quizId_error = adminQuizRemove(AuthUserId, QuizId + 1);
    expect(quizId_error).toStrictEqual({error: "Invalid quiz Id"});
  });

  test('quizId is not owned by user', () => {

    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const AuthUserId2 = adminAuthRegister('palidemail@gmail.com', '456abc!@#', 'Tim', 'Andy').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Quiz1', "Description").quizId;
    const QuizId2 = adminQuizCreate(AuthUserId2, 'Quiz2', "Description").quizId;
    const invalid_UsertoquizId_error = adminQuizRemove(AuthUserId, QuizId2);
    expect(invalid_UsertoquizId_error).toStrictEqual({error: "Quiz Id is not owned by this user"});
  });

  test('Check if quiz is removed by function, adminQuizRemove', () => {

    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const AuthUserId2 = adminAuthRegister('palidemail@gmail.com', '456abc!@#', 'Tim', 'Andy').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Quiz1', "Description").quizId;
    const QuizId2 = adminQuizCreate(AuthUserId2, 'Quiz2', "Description").quizId;
    adminQuizRemove(AuthUserId2, QuizId2);
    expect(adminQuizList(AuthUserId)).toStrictEqual({ 
      quizzes: [
        {
          quizId: quizId_player,
          name: 'Quiz1',
        }
      ]
    });
  })
});


describe('adminQuizDescriptionUpdate testing', () => {
  beforeEach(() => {
    clear();
  });
  test('Valid AuthUserId', () => {
 
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'quiz1', "Description").quizId;
    const authUserId_error = adminQuizDescriptionUpdate(AuthUserId + 1, QuizId, "");
    expect(authUserId_error).toStrictEqual({error: 'Invalid User Id'});
  });
  test('Valid quizId', () => {

    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Quiz1', "Description").quizId;
    const quizIderror = adminQuizDescriptionUpdate(AuthUserId, QuizId + 1, "Description");
    expect(quizIderror).toStrictEqual({error: "Invalid quiz Id"});
  });

  test('quizId is not owned by user', () => {

    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const AuthUserId2 = adminAuthRegister('valid2email@gmail.com', '456abc!@#', 'Tim', 'Andy').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'Quiz1', "Desription").quizId;
    const QuizId2 = adminQuizCreate(AuthUserId, 'Quiz2', "Description").quizId;
    const invalidUsertoquizId_error = adminQuizDescriptionUpdate(AuthUserId, QuizId2, "Description");
    expect(invalidUsertoquizId_error).toStrictEqual({error: "Quiz Id is not owned by this user"});
  });

  test('Description is more than 100 characters', () => {

    const text = "more than 100 characters description is more than 100 characters description is more than 100 characterssssssss";
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'quiz1', "Description").quizId;
    const descriperror = adminQuizDescriptionUpdate(AuthUserId, QuizId, text);
    expect(descriperror).toStrictEqual({error: "Description is more than 100 characters in length"});
  });
  
  test('Test that the description has been updated', () => {

    const text = "more than 100 characters description";
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'quiz1', "Description").quizId;
    adminQuizDescriptionUpdate(AuthUserId, QuizId, text);
    const quizobjectinfo = adminQuizInfo(AuthUserId, QuizId);
    expect(quizobjectinfo.description).toStrictEqual(text);
  });

  test('Description is an empty string', () => {

    const text = "";
    const AuthUserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    const QuizId = adminQuizCreate(AuthUserId, 'quiz1', "").quizId;
    adminQuizDescriptionUpdate(AuthUserId, QuizId, text);
    const quizobjectinfo = adminQuizInfo(testuserid, testquizId);
    expect(quizobjectinfo.description).toStrictEqual(text);
  });
});

