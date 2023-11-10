
import { getData, setData, state, quizSession, action } from './dataStore';
import { quizIdExists, tokenExists, findUserId, findSession, sessionIdExists } from './other';
import { error } from './auth';
import { tokenOwnsQuiz } from './quiz';

interface viewSession {
  activeSessions: number[],
  inactiveSessions: number[]
}

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
    if (session.metadata.quizId === quizId && session.state !== "END") {
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
    return sessionValidator(autoStartNum, quizId);
  }
  const duplicateQuiz = { ...findQuiz(quizId) };
  const sessionId = data.currentSessionId;
  data.currentSessionId++;
  const ownerId = findUserId(token);
  const newSession: quizSession = {
    sessionId,
    state: "LOBBY",
    players: [],
    ownerId: ownerId,
    metadata: duplicateQuiz
  };
  data.quizSessions.push(newSession);
  setData(data);
  return { sessionId };
}

export function adminSessionsView(token: string, quizId: number): object | error {
  const data = getData();
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!quizIdExists(quizId) || !tokenOwnsQuiz(data.quizzes, quizId, token)) {
    return { error: 'quizId is not owned by user' };
  }
  const viewSession: viewSession = {
    activeSessions: [],
    inactiveSessions: []
  }
  for (const session of data.quizSessions) {
    if (session.state === "END") {
      viewSession.inactiveSessions.push(session.sessionId)
    } else {
      viewSession.activeSessions.push(session.sessionId)
    }
  }
  return viewSession;
}

export function adminSessionUpdate(token: string, quizId: number, sessionId: number, desiredAction: string): object | error {
  const data = getData();
  const userId = findUserId(token);
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!sessionIdExists(sessionId)) {
    return { error: 'Invalid sessionId' }
  }
  const session = findSession(sessionId);
  let state = session?.state
  if (userId !== session?.ownerId) {
    return { error: 'User is unauthorised to modify sessions' }
  }
  if ('error' in actionVerifier(session, desiredAction)) {
    return actionVerifier(session, desiredAction)
  }


  return {};
}

function actionVerifier(session: quizSession, desiredAction: string) {
  const state = session.state;
  if (!Object.keys(action).includes(desiredAction)) {
    return { error: 'Invalid action' }
  }
  if (state === "LOBBY") {
    if (desiredAction === "SKIP_COUNTDOWN" || desiredAction === "GOT_TO_ANSWER" || desiredAction === "GO_TO_FINAL_RESULTS") {
      return { error: 'Action cannot currently be performed' }
    }
  }
  if (state === "QUESTION_COUNTDOWN") {
    if (desiredAction === "NEXT_QUESTION" || desiredAction === "GO_TO_ANSWER" || desiredAction === "GO_TO_FINAL_RESULTS") {
      return { error: 'Action cannot currently be performed' }
    }
  }
  if (state === "QUESTION_OPEN") {
    if (desiredAction === "NEXT_QUESTION" || desiredAction === "SKIP_COUNTDOWN" || desiredAction === "GO_TO_FINAL_RESULTS") {
      return { error: 'Action cannot currently be performed' }
    }
  }
  if (state === "QUESTION_CLOSE") {
    if (desiredAction === "NEXT_QUESTION" || desiredAction === "SKIP_COUNTDOWN") {
      return { error: 'Action cannot currently be performed' }
    }
  }
  if (state === "ANSWER_SHOW") {
    if (desiredAction === "GO_TO_ANSWER" || desiredAction === "SKIP_COUNTDOWN") {
      return { error: 'Action cannot currently be performed' }
    }
  }
  if (state === "FINAL_RESULTS") {
    if (desiredAction === "NEXT_QUESTION" || desiredAction === "SKIP_COUNTDOWN" || desiredAction === "GO_TO_FINAL_RESULTS" || desiredAction === "GO_TO_ANSWER") {
      return { error: 'Action cannot currently be performed' }
    }
  }
  if (state === "END") {
    return { error: 'Action cannot currently be performed' }
  }
  return {}
}

export function adminSessionStatus(token: string, quizId: number, sessionId: number): object | error {
  return {};
}
