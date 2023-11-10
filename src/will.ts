
import { getData, setData, trash, Question, Answer } from './dataStore';
import { quizIdExists, findUserId, findUser, tokenExists } from './other';
import { error } from './auth'

export function adminSessionStart(token: string, quizId: number, autoStartNum: number): object | error {
  return { error: 'Invalid Token' };
}

export function adminSessionsView(token: string, quizId: number): object | error {
  return {}
}

export function adminSessionUpdate(token: string, quizId: number, sessionId: number, action: string): object | error {
  return {}
}

export function adminSessionStatus(token: string, quizId: number, sessionId: number): object | error {
  return {}
}
