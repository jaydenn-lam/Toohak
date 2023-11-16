
import { getData, setData, quizSession, action } from './dataStore';
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
    if (session.metadata.quizId === quizId && session.state !== 'END') {
      totalSessions++;
    }
  }
  if (totalSessions >= 10) {
    return { error: 'There are already a maximum of 10 active sessions' };
  }
  return {};
}

export function findQuiz(quizId: number) {
  const data = getData();
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      return quiz;
    }
  }
  return {
    quizId: -1,
    name: 'NO_QUIZ_FOUND',
    timeCreated: 0,
    timeLastEdited: 0,
    description: '',
    userId: -1,
    numQuestions: -1,
    questions: [],
    duration: -1,
    thumbnail: ''
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
    state: 'LOBBY',
    atQuestion: 0,
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
  };
  for (const session of data.quizSessions) {
    if (session.state === 'END') {
      viewSession.inactiveSessions.push(session.sessionId);
    } else {
      viewSession.activeSessions.push(session.sessionId);
    }
  }
  return viewSession;
}

export function adminSessionUpdate(token: string, quizId: number, sessionId: number, desiredAction: string): object | error {
  let data = getData();
  const userId = findUserId(token);
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!sessionIdExists(sessionId)) {
    return { error: 'Invalid sessionId' };
  }
  const session = findSession(sessionId);
  const state = session?.state;
  if (userId !== session?.ownerId) {
    return { error: 'User is unauthorised to modify sessions' };
  }
  if ('error' in actionVerifier(session, desiredAction)) {
    return actionVerifier(session, desiredAction);
  }
  if (state === 'LOBBY') {
    data = lobbyUpdater(session, desiredAction);
  }
  if (state === 'QUESTION_COUNTDOWN') {
    data = qCountdownUpdater(session, desiredAction);
  }
  if (state === 'QUESTION_OPEN') {
    data = qOpenUpdater(session, desiredAction);
  }
  if (state === 'QUESTION_CLOSE') {
    data = qCloseUpdater(session, desiredAction);
  }
  if (state === 'ANSWER_SHOW') {
    data = answerShowUpdater(session, desiredAction);
  }
  if (state === 'FINAL_RESULTS') {
    data = finalResultsUpdater(session, desiredAction);
  }
  setData(data);
  return {};
}

function lobbyUpdater(session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  let state;
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'NEXT_QUESTION') {
    state = 'QUESTION_COUNTDOWN';
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  return data;
}

function qCountdownUpdater(session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  let state;
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'SKIP_COUNTDOWN') {
    state = 'QUESTION_OPEN';
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  return data;
}

function qCloseUpdater(session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  let state;
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'GO_TO_ANSWER') {
    state = 'ANSWER_SHOW';
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  return data;
}

function qOpenUpdater(session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  let state;
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'GO_TO_ANSWER') {
    state = 'ANSWER_SHOW';
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  return data;
}

function answerShowUpdater(session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  let state;
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'NEXT_QUESTION') {
    state = 'ANSWER_COUNTDOWN';
  }
  if (action === 'GO_TO_FINAL_RESULTS') {
    state = 'FINAL_RESULTS';
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  return data;
}

function finalResultsUpdater(session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  let state;
  if (action === 'END') {
    state = 'END';
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  return data;
}

function actionVerifier(session: quizSession, desiredAction: string) {
  const state = session.state;
  if (!Object.keys(action).includes(desiredAction)) {
    return { error: 'Invalid action' };
  }
  if (state === 'LOBBY') {
    if (desiredAction === 'SKIP_COUNTDOWN' || desiredAction === 'GO_TO_ANSWER' || desiredAction === 'GO_TO_FINAL_RESULTS') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'QUESTION_COUNTDOWN') {
    if (desiredAction === 'NEXT_QUESTION' || desiredAction === 'GO_TO_ANSWER' || desiredAction === 'GO_TO_FINAL_RESULTS') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'QUESTION_OPEN') {
    if (desiredAction === 'NEXT_QUESTION' || desiredAction === 'SKIP_COUNTDOWN' || desiredAction === 'GO_TO_FINAL_RESULTS') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'QUESTION_CLOSE') {
    if (desiredAction === 'NEXT_QUESTION' || desiredAction === 'SKIP_COUNTDOWN') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'ANSWER_SHOW') {
    if (desiredAction === 'GO_TO_ANSWER' || desiredAction === 'SKIP_COUNTDOWN') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'FINAL_RESULTS') {
    if (desiredAction === 'NEXT_QUESTION' || desiredAction === 'SKIP_COUNTDOWN' || desiredAction === 'GO_TO_FINAL_RESULTS' || desiredAction === 'GO_TO_ANSWER') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'END') {
    return { error: 'Action cannot currently be performed' };
  }
  return {};
}

export function adminSessionStatus(token: string, quizId: number, sessionId: number): object | error {
  const data = getData();
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!sessionIdExists(sessionId)) {
    return { error: 'Invalid sessionId' };
  }
  const userId = findUserId(token);
  const ownerId = findSession(sessionId)?.ownerId;
  if (userId !== ownerId) {
    return { error: 'User is unauthorised to view sessions' };
  }
  for (const session of data.quizSessions) {
    if (session.sessionId === sessionId) {
      const { userId, ...returnedData } = session.metadata;
      const sessionStatus = {
        state: session.state,
        atQuestion: session.atQuestion,
        players: session.players,
        metadata: returnedData
      };
      return sessionStatus;
    }
  }
  return {};
}
