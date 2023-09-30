import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
} from './quiz.js';

import { clear } from './other.js';

beforeEach(() => {
  clear();
});

describe('adminQuizRemove', () => {
  test('authUserId is empty', () => {
    const authUserId = '';
    const quizId = '12345';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'authUserId is invalid' });
  });
  test('authUserId is not a valid user', () => {
    const authUserId = 'authUserId';
    const quizId = '12345';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'authUserId is invalid' });
  });
  test('authUserId is not made up of integers ', () => {
    const authUserId = '3.14';
    const quizId = '12345';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'authUserId is invalid' });
  });
  test('Quiz ID is empty', () => {
    const authUserId = '12345';
    const quizId = '';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'quizId is invalid' });
  });
  test('Quiz ID is not made up of integers', () => {
    const authUserId = '12345';
    const quizId = 'quizId';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'quizId is invalid' });
  });
  test('Quiz ID is not made up of integers', () => {
    const authUserId = '12345';
    const quizId = '3.14';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'quizId is invalid' });
  });
  test('Quiz ID does not refer to a valid quiz', () => {
    const authUserId = '12345';
    const quizId = '';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'Quiz ID does not refer to a valid quiz' });
  });
  test('Quiz ID does not refer to a valid quiz', () => {
    const authUserId = '12345';
    const quizId = 'quizId';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'Quiz ID does not refer to a valid quiz' });
  });
  
  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const authUserId = '12345';
    const quizId = 'quiz456';
    const result = adminQuizRemove(authUserId, quizId);
    expect(result).toEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
  });
  
});
////
