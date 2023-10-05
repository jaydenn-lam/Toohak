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