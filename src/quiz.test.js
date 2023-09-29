import {adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate,} from 'quiz.js';

beforeEach(() => {
  clear();
});

describe('adminQuizRemove', () => {
  test('authUserId is not a string', () => {
    const authUserId = 123; 
    const quizId = 'quiz456';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'AuthUserId must be a string' });
  });
  test('authUserId is not a valid user', () => {
    const authUserId = 'invalid_user'; 
    // AuthUserId does not refer to a valid user
    const quizId = 'quiz456';

    const result = adminQuizRemove(authUserId, quizId);

    expect(result).toEqual({ error: 'AuthUserId is not a valid user' });
  });

  test('authUserId is empty', () => {
    const authUserId = ''; 
    const quizId = 'quiz456';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'AuthUserId is empty' });
  });

  test('authUserId does not match quizId', () => {
    const authUserId = 'user123';
    const quizId = 'quiz789'; 
    // AuthUserId and QuizId do not match

    const result = adminQuizRemove(authUserId, quizId);

    expect(result).toEqual({ error: 'AuthUserId does not match Quiz ID' });
  });

  test('quizId is empty', () => {
    const authUserId = 'user123';
    const quizId = ''; 
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'QuizId is empty' });
  });

  test('quizId is not a string', () => {
    const authUserId = 'user123';
    const quizId = 123; 
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'QuizId must be a string' });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const authUserId = 'user123';
    const quizId = 'invalid_quiz'; 
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {  
    const authUserId = 'user123';
    const quizId = 'quiz456'; 
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
  });
});