
import { getData, setData, quizSession, action } from './dataStore';
import { quizIdExists, tokenExists, findUserId, findSession, sessionIdExists } from './other';
import { error } from './auth';
import { tokenOwnsQuiz } from './quiz';

interface viewSession {
  activeSessions: number[],
  inactiveSessions: number[]
}

export interface parameterAction {
  action: string;
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
    timeCreated: 0,
    timeLastEdited: 0,
    description: '',
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
    state: 'LOBBY',
    atQuestion: 0,
    players: [],
    ownerId: ownerId,
    metadata: duplicateQuiz,
    messages: [],
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

export function adminSessionUpdate(token: string, quizId: number, sessionId: number, action: parameterAction): object | error {
  let data = getData();
  const desiredAction = action.action;
  const userId = findUserId(token);
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!sessionIdExists(sessionId)) {
    return { error: 'Invalid sessionId' };
  }
  const session = findSession(sessionId);
  const state = session?.state;
  console.log(state);
  if (userId !== session?.ownerId) {
    return { error: 'User is unauthorised to modify sessions' };
  }
  if ('error' in actionVerifier(session, desiredAction)) {
    return actionVerifier(session, desiredAction);
  }
  if (state === 'LOBBY') {
    data = lobbyUpdater(token, quizId, session, desiredAction);
  } else if (state === 'QUESTION_COUNTDOWN') {
    data = qCountdownUpdater(token, quizId, session, desiredAction);
  }
  if (state === 'QUESTION_OPEN') {
    data = qOpenUpdater(session, desiredAction);
  }
  if (state === 'QUESTION_CLOSE') {
    data = qCloseUpdater(token, quizId, session, desiredAction);
  }
  if (state === 'ANSWER_SHOW') {
    data = answerShowUpdater(token, quizId, session, desiredAction);
  }
  if (state === 'FINAL_RESULTS') {
    data = finalResultsUpdater(session, desiredAction);
  }
  console.log(`Successful input of ${desiredAction}`);
  setData(data);
  return {};
}

function lobbyUpdater(token: string, quizId: number, session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  let state;
  let qNum = session.atQuestion;
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'NEXT_QUESTION') {
    state = 'QUESTION_COUNTDOWN';
    qNum++;
    setTimeout(() => {
      const currentState = findSession(sessionId)?.state;
      if (currentState === 'QUESTION_COUNTDOWN') {
        adminSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      }
    }, 3000);
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
      existingSession.atQuestion = qNum;
    }
  }
  return data;
}

function qCountdownUpdater(token: string, quizId: number, session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  const qNum = session.atQuestion;
  const duration = questionDurationFinder(qNum, quizId);
  let state;
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'SKIP_COUNTDOWN') {
    state = 'QUESTION_OPEN';
    setTimeout(() => {
      const currentState = findSession(sessionId)?.state;
      if (currentState === 'QUESTION_OPEN') {
        adminSessionUpdate(token, quizId, sessionId, { action: 'OPEN_TO_CLOSE' });
      }
    }, duration * 1000);
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  return data;
}

function qCloseUpdater(token: string, quizId: number, session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  let state;
  let qNum = session.atQuestion;
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'GO_TO_ANSWER') {
    state = 'ANSWER_SHOW';
  }
  if (action === 'NEXT_QUESTION') {
    state = 'QUESTION_COUNTDOWN';
    qNum++;
    setTimeout(() => {
      const currentState = findSession(sessionId)?.state;
      if (currentState === 'QUESTION_COUNTDOWN') {
        adminSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      }
    }, 3000);
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
      existingSession.atQuestion = qNum;
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
  if (action === 'OPEN_TO_CLOSE') {
    state = 'QUESTION_CLOSE';
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  return data;
}

function questionDurationFinder(number: number, quizId: number) {
  const quiz = findQuiz(quizId);
  const question = quiz.questions[number - 1];
  console.log(number);
  const duration = question.duration;
  return duration;
}

function answerShowUpdater(token: string, quizId: number, session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  let state;
  let qNum = session.atQuestion;
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'NEXT_QUESTION') {
    state = 'QUESTION_COUNTDOWN';
    qNum++;
    setTimeout(() => {
      const currentState = findSession(sessionId)?.state;
      if (currentState === 'QUESTION_COUNTDOWN') {
        adminSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      }
    }, 3000);
  }
  if (action === 'GO_TO_FINAL_RESULTS') {
    state = 'FINAL_RESULTS';
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
      existingSession.atQuestion = qNum;
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
  if (!Object.keys(action).includes(desiredAction) && desiredAction !== 'OPEN_TO_CLOSE') {
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
    if (desiredAction === 'SKIP_COUNTDOWN') {
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
