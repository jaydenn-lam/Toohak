
import { getData, setData, state, quizSession } from './dataStore';
import { quizIdExists, tokenExists } from './other';
import { error } from './auth';
import { tokenOwnsQuiz } from './quiz';

function sessionValidator(startNum: number, quizId: number) {
  const data = getData();
  let totalSessions = 0;
  const quiz = findQuiz(quizId);
  if (startNum > 50 || startNum < 0) {
    return { error: 'autoStartNum cannot be greater than 50 or negative' };
  }
  if (quiz.numQuestions === 0) {
    return { error: 'Quiz has no questions' };
  }
  for (const session of data.quizSessions) {
    if (session.metadata.quizId === quizId && session.state !== state.END) {
      totalSessions++;
    }
  }
  if (totalSessions >= 10) {
    return { error: 'There are already a maximum of 10 active sessions' };
  }
  return {};
}

function findQuiz(quizId: number) {
  const data = getData();
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      return quiz;
    }
  }
  return {
    quizId: -1,
    name: 'NO_QUIZ_FOUND',
    TimeCreated: 0,
    TimeLastEdited: 0,
    Description: '',
    userId: -1,
    numQuestions: -1,
    questions: [],
    duration: -1
  };
}

export function adminSessionStart(token: string, quizId: number, autoStartNum: number): object | error {
  const data = getData();
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!quizIdExists(quizId) || !tokenOwnsQuiz(data.quizzes, quizId, token)) {
    return { error: 'quizId is not owned by user' };
  }
  if ('error' in sessionValidator(autoStartNum, quizId)) {
    console.log('YAYAYAYAYA');
    console.log(sessionValidator(autoStartNum, quizId));
    return sessionValidator(autoStartNum, quizId);
  }
  const duplicateQuiz = { ...findQuiz(quizId) };
  const sessionId = data.currentSessionId;
  data.currentSessionId++;
  const newSession: quizSession = {
    sessionId,
    state: state.LOBBY,
    players: [],
    metadata: duplicateQuiz
  };
  data.quizSessions.push(newSession);
  setData(data);
  return { sessionId };
}

export function adminSessionsView(token: string, quizId: number): object | error {
  return {};
}

export function adminSessionUpdate(token: string, quizId: number, sessionId: number, action: string): object | error {
  return {};
}

export function adminSessionStatus(token: string, quizId: number, sessionId: number): object | error {
  return {};
}
