import {adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate} from './quiz.js';
import {adminAuthRegister} from './auth';
import {clear} from './other';

test('Temporary Placeholder', () => {
  let var1 = 0;
  expect(var1).toStrictEqual(0);
})
/*
describe('adminQuizList', () => {
    
  test('Working Entry', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    const Quiz1 = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!');
    let QuizList = adminQuizList(0);
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
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    const Quiz1 = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!');
    const Quiz2 = adminQuizCreate(AuthUserId, 'Food Quiz', 
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
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu").authUserId;
    const Quiz1 = adminQuizCreate(AuthUserId, 'Animal Quiz', 
    'Test your knowledge on animals!');
    let QuizList = adminQuizList(AuthUserId + 1);
    expect(QuizList).toStrictEqual({error: 'Invalid User Id'});
  });
});

describe('adminQuizCreate', () => {
    
  test('Working Entry', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let quizId = adminQuizCreate(0, 'Animal Quiz', 
    'Test your knowledge on animals!');
    expect(quizId).toStrictEqual({ quizId: 0 });
  });

  test('Multiple Working Entries', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let quizId = adminQuizCreate(0, 'Animal Quiz', 
    'Test your knowledge on animals!');
    expect(quizId).toStrictEqual({ quizId: 0 });
    let quizId2 = adminQuizCreate(0, 'Country Quiz', 
    'Test your knowledge on countries!');
    expect(quizId2).toStrictEqual({ quizId: 1 });
  })

  test('Invalid AuthUserId ERROR', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let quizId = adminQuizCreate(1, 'Animal Quiz', 
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
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    expect(adminQuizCreate(userId, name, description)).toEqual(expected) 
  });

  test('Name too short ERROR', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let quizId = adminQuizCreate(0, 'AQ', 
    'Test your knowledge on animals!');
    expect(quizId).toStrictEqual({error: 'Quiz name too short'});
  });

  test('Name too long ERROR', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let quizId = adminQuizCreate(0, 'The worlds hardest ever animal quiz', 
    'Test your knowledge on animals!');
    expect(quizId).toStrictEqual({error: 'Quiz name too long'});
  });

  test('Name already used by current user ERROR', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let quizId = adminQuizCreate(0, 'Animal Quiz', 
    'Test your knowledge on animals!');
    expect(quizId).toStrictEqual({ quizId: 0 });
    let quizId2 = adminQuizCreate(0, 'Animal Quiz', 
    'Test more of your knowledge on animals!');
    expect(quizId2).toStrictEqual({error: 'Name already being used'});
  });

  test('Description too long ERROR', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let quizId = adminQuizCreate(0, 'Animal Quiz', 
    `abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz 
    abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz`);
    expect(quizId).toStrictEqual({error: 'Quiz description too long'});
  });
});

describe('adminQuizInfo', () => {
    
  test('Working Entry', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    const Quiz1 = adminQuizCreate(0, 'Animal Quiz', 
    'Test your knowledge on animals!');
    let QuizInfo = adminQuizInfo(0, 0);
    expect(QuizInfo).toStrictEqual({ 
      quizId: 0,
      name: 'Animal Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test your knowledge on animals!'
    });
  });

  test('Invalid AuthUserId ERROR', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    const Quiz1 = adminQuizCreate(0, 'Animal Quiz', 
    'Test your knowledge on animals!');
    let QuizInfo = adminQuizInfo(1, 0);
    expect(QuizInfo).toStrictEqual({error: 'Invalid User Id'});
  });

  test('Invalid QuizId ERROR', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    const Quiz1 = adminQuizCreate(0, 'Animal Quiz', 
    'Test your knowledge on animals!');
    let QuizInfo = adminQuizInfo(0, 1);
    expect(QuizInfo).toStrictEqual({error: 'Invalid Quiz Id'});
  });

  test('Quiz not owned by this user ERROR', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    const AuthUserId2 = adminAuthRegister('jayden@unsw.edu.au', '1234abcd', 
    'Jayden', "Lam");
    const Quiz1 = adminQuizCreate(0, 'Animal Quiz', 
    'Test your knowledge on animals!');
    let QuizInfo = adminQuizInfo(1, 0);
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
    expect(adminQuizNameUpdate(0, quizId + 1, 'newquiz1')).toStrictEqual({error: 'Invalid quizId'});
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

  test('Valid AuthUserId', () => {
    clear();
    let testauthuserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    let quizId_valid = adminQuizCreate(testauthuserId, 'quiz1', "").quizId;
    let authUserId_error = adminQuizRemove(2, quizId_valid);
    expect(authUserId_error).toStrictEqual({error: 'Invalid User Id'});
  });

  test('Valid quizId', () => {
    clear();
    let authUserId1 = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    adminQuizCreate(authUserId1, 'Quiz1', "");
    let quizId_error = adminQuizRemove(authUserId1, 2);
    expect(quizId_error).toStrictEqual({error: "Invalid quiz Id"});
  });

  test('quizId is not owned by user', () => {
    clear();
    let authUserId_play1 = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    let authUserId_play2 = adminAuthRegister('palidemail@gmail.com', '456abc!@#', 'Tim', 'Andy').authUserId;
    let quizId_play1 = adminQuizCreate(authUserId_play1, 'Quiz1', "Description").quizId;
    let quizId_play2 = adminQuizCreate(authUserId_play2, 'Quiz2', "Description").quizId;
    let invalid_UsertoquizId_error = adminQuizRemove(authUserId_play1, quizId_play2);
    expect(invalid_UsertoquizId_error).toStrictEqual({error: "Quiz Id is not owned by this user"});
  });

  test('Check if quiz is removed by function, adminQuizRemove', () => {
    clear();
    let UserId_player = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    let authUserId_play2 = adminAuthRegister('palidemail@gmail.com', '456abc!@#', 'Tim', 'Andy').authUserId;
    let quizId_player = adminQuizCreate(UserId_player, 'Quiz1', "Description").quizId;
    let quizId_play2 = adminQuizCreate(authUserId_play2, 'Quiz2', "Description").quizId;
    adminQuizRemove(authUserId_play2, quizId_play2);
    expect(adminQuizList(UserId_player)).toStrictEqual({ 
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

  test('Valid AuthUserId', () => {
    clear();
    let result_id = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    let validquizId = adminQuizCreate(result_id, 'quiz1', "Description").quizId;
    let authUserId_error = adminQuizDescriptionUpdate(2, validquizId, "");
    expect(authUserId_error).toStrictEqual({error: 'Invalid User Id'});
  });
  test('Valid quizId', () => {
    clear();
    let authUserId1 = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    adminQuizCreate(authUserId1, 'Quiz1', "Description");
    let quizIderror = adminQuizDescriptionUpdate(authUserId1, 2, "Description");
    expect(quizIderror).toStrictEqual({error: "Invalid quiz Id"});
  });

  test('quizId is not owned by user', () => {
    clear();
    let authUserIdplay1 = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    let authUserId_play2 = adminAuthRegister('valid2email@gmail.com', '456abc!@#', 'Tim', 'Andy').authUserId;
    adminQuizCreate(authUserIdplay1, 'Quiz1', "Desription");
    let quizIdplay2 = adminQuizCreate(authUserId_play2, 'Quiz2', "Description").quizId;
    let invalidUsertoquizId_error = adminQuizDescriptionUpdate(authUserIdplay1, quizIdplay2, "Description");
    expect(invalidUsertoquizId_error).toStrictEqual({error: "Quiz Id is not owned by this user"});
  });

  test('Description is more than 100 characters', () => {
    clear();
    let text = "more than 100 characters description is more than 100 characters description is more than 100 characterssssssss";
    let testuserid = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    let testquizId = adminQuizCreate(testuserid, 'quiz1', "Description").quizId;
    let descriperror = adminQuizDescriptionUpdate(testuserid, testquizId, text);
    expect(descriperror).toStrictEqual({error: "Description is more than 100 characters in length"});
  });
  
  test('Test that the description has been updated', () => {
    clear();
    let text = "more than 100 characters description";
    let testuserid = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    let testquizId = adminQuizCreate(testuserid, 'quiz1', "Description").quizId;
    adminQuizDescriptionUpdate(testuserid, testquizId, text);
    let quizobjectinfo = adminQuizInfo(testuserid, testquizId);
    expect(quizobjectinfo.description).toStrictEqual(text);
  });

  test('Description is an empty string', () => {
    clear();
    let text = "";
    let testuserid = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella').authUserId;
    let testquizId = adminQuizCreate(testuserid, 'quiz1', "").quizId;
    adminQuizDescriptionUpdate(testuserid, testquizId, text);
    let quizobjectinfo = adminQuizInfo(testuserid, testquizId);
    expect(quizobjectinfo.description).toStrictEqual(text);
  });
});

*/
