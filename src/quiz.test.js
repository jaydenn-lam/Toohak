import {adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo, 
    adminQuizNameUpdate, adminQuizDescriptionUpdate} from './quiz.js';
import {adminAuthRegister} from './auth.js';
import {clear} from './other.js';

describe('adminQuizCreate', () => {
    
  test('Working Entry', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let quizId = adminQuizCreate(0, 'Animal Quiz', 
    'Test your knowledge on animals!');
    expect(quizId).toStrictEqual(0);
  });

  test('Multiple Working Entries', () => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let quizId = adminQuizCreate(0, 'Animal Quiz', 
    'Test your knowledge on animals!');
    expect(quizId).toStrictEqual(0);
    let quizId2 = adminQuizCreate(0, 'Country Quiz', 
    'Test your knowledge on countries!');
    expect(quizId2).toStrictEqual(1);
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
  ])('Name contains invalid characters ERROR', (UserId, name, description, 
    expected) => {
    clear();
    const AuthUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    expect(adminQuizCreate(UserId, name, description)).toEqual(expected) 
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
    expect(quizId).toStrictEqual(0);
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


describe('adminQuizRemvoe testing', () => {

  test('Valid AuthUserId', () => {
    clear();
    let testauthuserId = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    let quizId_valid = adminQuizCreate(testauthuserId, 'q1', "");
    let authUserId_error = adminQuizRemove(2, quizId_valid);
    expect(authUserId_error).toStrictEqual({error: 'Invalid User Id'});
  });

  test('Valid quizId', () => {
    clear();
    let authUserId1 = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    adminQuizCreate(authUserId1, 'Q1', "");
    let quizId_error = adminQuizRemove(authUserId1, 2);
    expect(quizId_error).toStrictEqual({error: "Invalid quiz Id"});
  });

  test('quizId is not owned by user', () => {
    clear();
    let authUserId_play1 = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    adminAuthRegister('valid2email@gmail.com', '456abc!@#', 'Tim', 'Andy');
    adminQuizCreate(authUserId_play1, 'Q1', "");
    let quizId_play2 = adminQuizCreate(authUserId_play2, Q2, "");
    let invalid_UsertoquizId_error = adminQuizRemove(authUserId_play1, quizId_play2);
    expect(invalid_UsertoquizId_error).toStrictEqual({error: "Quiz Id is not owned by this user"});
  });

  test('Check if quiz is removed by function, adminQuizRemove', () => {
    clear();
    let UserId_player = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    let quizId_player = adminQuizCreate(UserId_player, 'Q1', "");
    adminQuizRemove(UserId_player, quizId_player);
    expect(adminQuizList(UserId_player, quizId_player)).toStrictEqual({});
  })
});
