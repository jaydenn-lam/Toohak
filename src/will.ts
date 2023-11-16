
import { getData, setData, quizSession, action, playerSubmission, questionResult } from './dataStore';
import { quizIdExists, tokenExists, findUserId, findSession, sessionIdExists } from './other';
import { error } from './auth';
import { tokenOwnsQuiz } from './quiz';
import { answerIds } from './wrapper';

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
  if (quiz?.numQuestions === 0) {
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
  return null;
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
  const emptyQuestionResults: questionResult[] = [];
  const newSession: quizSession = {
    sessionId,
    state: 'LOBBY',
    atQuestion: 0,
    players: [],
    playerProfiles: [],
    ownerId: ownerId,
    metadata: duplicateQuiz,
    messages: [],
    totalUpdates: 0,
    autoStartNum: autoStartNum
    questionResults: emptyQuestionResults,
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
  console.log(action.action);
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
  for (const sessionExist of data.quizSessions) {
    if (sessionExist.sessionId === sessionId) {
      sessionExist.totalUpdates++;
    }
  }
  setData(data);
  return {};
}

function lobbyUpdater(token: string, quizId: number, session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  const updates = session.totalUpdates;
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
      const currentUpdates = findSession(sessionId)?.totalUpdates;
      if (currentState === 'QUESTION_COUNTDOWN' && currentUpdates === updates + 1) {
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
    for (const currentSession of data.quizSessions) {
      if (currentSession.sessionId === session.sessionId) {
        const atQuestion = currentSession.atQuestion;
        currentSession.metadata.questions[atQuestion - 1].timeQuestionOpened = Math.round(Date.now() / 1000);
      }
    }
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
  const updates = session.totalUpdates;
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
      const currentUpdates = findSession(sessionId)?.totalUpdates;
      if (currentState === 'QUESTION_COUNTDOWN' && currentUpdates === updates + 1) {
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
  const question = quiz?.questions[number - 1];
  const duration = question?.duration;
  return duration;
}

function answerShowUpdater(token: string, quizId: number, session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  const updates = session.totalUpdates;
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
      const currentUpdates = findSession(sessionId)?.totalUpdates;
      if (currentState === 'QUESTION_COUNTDOWN' && currentUpdates === updates + 1) {
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
  let sessionStatus;
  for (const session of data.quizSessions) {
    if (session.sessionId === sessionId) {
      const { userId, ...returnedData } = session.metadata;
      sessionStatus = {
        state: session.state,
        atQuestion: session.atQuestion,
        players: session.players,
        metadata: returnedData
      };
    }
  }
  return sessionStatus;
}

export function playerAnswerSubmit(playerId: number, questionPosition: number, answerIds: answerIds): object | error {
  const data = getData();
  const questionIndex = questionPosition - 1;
  let sessionId = 0;
  if (playerSessionFinder(playerId) === 100000) {
    return { error: 'Invalid playerId' };
  } else {
    sessionId = playerSessionFinder(playerId);
  }
  const session = findSession(sessionId);
  const error = answerErrorThrower(questionPosition, answerIds, session);
  if (error) {
    return error;
  }
  const question = session?.metadata.questions[questionIndex];
  const correctAnswerArray: number[] = [];
  for (const answer of question.answers) {
    if (answer.correct === true) {
      correctAnswerArray.push(answer.answerId);
    }
  }
  const correct = answerIdChecker(answerIds.answerIds, correctAnswerArray);
  const playerEntry: playerSubmission = {
    playerId: playerId,
    submissionTime: Math.round(Date.now() / 1000),
  };
  if (correct) {
    if (!question?.correctPlayers) {
      question.correctPlayers = [];
    }
    question?.correctPlayers.push(playerEntry);
    for (const player of session.playerProfiles) {
      if (player.playerId === playerId) {
        player.score = player.score + question.points;
      }
    }
  } else if (!correct) {
    if (!question.incorrectPlayers) {
      question.incorrectPlayers = [];
    }
    question.incorrectPlayers.push(playerEntry);
  }

  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.metadata.questions[questionIndex] = question;
      existingSession.playerProfiles = session.playerProfiles;
    }
  }
  setData(data);
  return {};
}

function answerIdChecker(answerIds: number[], correctAnswers: number[]) {
  if (answerIds.length !== correctAnswers.length) {
    return false;
  }
  const sortSubmit = answerIds.slice().sort();
  const sortCorrect = correctAnswers.slice().sort();

  for (let index = 0; index < sortSubmit.length; index++) {
    if (sortSubmit[index] !== sortCorrect[index]) {
      return false;
    }
  }
  return true;
}

export function playerSessionFinder(playerId: number) {
  const data = getData();
  for (const session of data.quizSessions) {
    for (const existingPlayer of session.playerProfiles) {
      if (existingPlayer.playerId === playerId) {
        return session.sessionId;
      }
    }
  }
  return 100000;
}

function answerErrorThrower(questionPosition: number, answerIds: answerIds, session: quizSession) {
  const answerArray = answerIds.answerIds;
  if (session.state !== 'QUESTION_OPEN') {
    return { error: 'Session must be in QUESTION_OPEN state' };
  }
  if (session) {
    if (questionPosition > session.metadata.numQuestions) {
      return { error: 'Invalid questionPosition' };
    }
  }
  if (session?.atQuestion !== questionPosition) {
    return { error: 'Session is not up at that question position' };
  }
  if (new Set(answerArray).size !== answerArray.length) {
    return { error: 'Duplicate answerIds' };
  }
  const questionArray = session.metadata.questions;
  for (const submittedAnswerId of answerArray) {
    let answerExists = false;
    for (const answer of questionArray[questionPosition - 1].answers) {
      if (answer.answerId === submittedAnswerId) {
        answerExists = true;
      }
    }
    if (answerExists === false) {
      return { error: 'At least one invalid answerId' };
    }
  }
  if (answerArray.length <= 0) {
    return { error: 'No answerIds have been submitted' };
  }
}
