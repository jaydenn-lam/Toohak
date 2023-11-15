import { getData, setData, quizSession } from './dataStore';
import { error } from './auth';
// import { playerStatus } from './anita';
/*
interface playerQuestionResultsType {
  questionId: number,
  playersCorrectList: string[],
  averageAnswerTime: number,
  percentCorrect: number,
}
*/
interface message {
  messageBody: string,
  playerId: number,
  playerName: string,
  timeSent: number,
}

interface messagesType {
  messages: message[],
}

interface messageArgumentType {
  messageBody: string,
}
/*
interface usersRanked {
  name: string,
  score: number
}

interface questionResult {
  questionId: number,
  playersCorrectList: string[],
  averageAnswerTime: number,
  percentCorrect: number
}

interface sessionResultsType {
  usersRankedByScore: usersRanked[],
  questionResults: questionResult[],
}
*/
/*
export function playerQuestionResults(playerId: number, questionPosition: number): playerQuestionResultsType | error {
  const data = getData();
  const sessionArray = data.quizSessions;
  // Error check for valid playerId
  if (!validPlayerIdCheck(playerId)) {
    return { error: 'Invalid playerId' };
  }
  // Find the session this player is in
  const sessionId = playerSessionFinder(playerId);
  let currentSession;
  for (const session of sessionArray) {
    if (session.sessionId === sessionId) {
      currentSession = session;
    }
  }
  // Error check for question position is not valid for this player
  if (questionPosition < 0 || questionPosition > currentSession.metadata.questions.length) {
    return { error: 'Question position is not valid for this players session' };
  }
  // Error check to make sure session is in ANSWER_SHOW state
  if (currentSession.state !== 'ANSWER_SHOW') {
    return { error: 'Session not in ANSWER_SHOW state' };
  }
  // Error check to make sure session is up to this question
  const atQuestion = playerStatus(playerId).atQuestion;
  if (questionPosition !== atQuestion) {
    return { error: 'Session is not yet up to this question' };
  }
  // Create player results object to return

  const returnResults: playerQuestionResultsType = {
    questionId: currentSession.metadata.questions[questionPosition - 1].questionId,
    playersCorrectList: [],
    averageAnswerTime: 5,
    percentCorrect: 4
  }
  setData(data);
  return returnResults;
}

export function sessionResults(playerId: number): sessionResultsType | error {
  const data = getData();
  const sessionArray = data.quizSessions;
  // Error check for valid playerId
  if (!validPlayerIdCheck(playerId)) {
    return { error: 'Invalid playerId' };
  }
  // Find the session this player is in
  const sessionId = playerSessionFinder(playerId);
  let currentSession;
  for (const session of sessionArray) {
    if (session.sessionId === sessionId) {
      currentSession = session;
    }
  }
  // Error check to make sure session is in FINAL_RESULTS state
  if (currentSession.state !== 'FINAL_RESULTS') {
    return { error: 'Session not in FINAL_RESULTS state' };
  }

  setData(data);
  return;
}

*/
export function sessionChatView(playerId: number): error | messagesType {
  const data = getData();
  const sessionArray = data.quizSessions;
  // Error check for valid playerId
  if (!validPlayerIdCheck(playerId)) {
    return { error: 'Invalid playerId' };
  }
  // Find the session this player is in
  const sessionId = playerSessionFinder(playerId);
  let currentSession;
  for (const session of sessionArray) {
    if (session.sessionId === sessionId) {
      currentSession = session;
    }
  }
  return { messages: currentSession.messages };
}

export function sendChatMessage(playerId: number, message: messageArgumentType): error | object {
  const data = getData();
  const sessionArray = data.quizSessions;
  // Error check for valid playerId
  if (!validPlayerIdCheck(playerId)) {
    return { error: 'Invalid playerId' };
  }
  // Error check for valid message given
  if (!validMessageBodyCheck(message)) {
    return { error: 'Message Body is of invalid type' };
  }
  // Find the session this player is in
  const sessionId = playerSessionFinder(playerId);
  let currentSession;
  for (const session of sessionArray) {
    if (session.sessionId === sessionId) {
      currentSession = session;
    }
  }
  // Get the player's name given its playerId
  const playerName = getPlayerName(playerId, currentSession);
  // Create message to be posted
  const sendMessage: message = {
    messageBody: message.messageBody,
    playerId: playerId,
    playerName: playerName,
    timeSent: Math.round(Date.now() / 1000),
  };
  currentSession.messages.push(sendMessage);
  setData(data);
  return {};
}

// /////////////////////////HELPER FUNCTIONS BELOW/////////////////////////////////////

// Helper that checks for valid playerId
function validPlayerIdCheck(playerId: number): boolean {
  const data = getData();
  const sessionArray = data.quizSessions;
  for (const session of sessionArray) {
    for (const player of session.playerProfiles) {
      if (player.playerId === playerId) {
        return true;
      }
    }
  }
  return false;
}

// Helper function finds the session that a player is in returning the sessionId given playerId
function playerSessionFinder(playerId: number): number {
  const data = getData();
  const sessionArray = data.quizSessions;
  for (const session of sessionArray) {
    for (const player of session.playerProfiles) {
      if (player.playerId === playerId) {
        return session.sessionId;
      }
    }
  }
  return 10000;
}

// Helper function that checks that the message body is of valid type
function validMessageBodyCheck(message: messageArgumentType) {
  if (message.messageBody.length < 1 || message.messageBody.length > 100) {
    return false;
  }
  return true;
}

// Helper function that finds the corresponding player's name given the playerId
function getPlayerName(playerId: number, currentSession: quizSession) {
  let finderIndex = 0;
  for (let playerIdIndex = 0; playerIdIndex < currentSession.playerProfiles.length; playerIdIndex++) {
    if (currentSession.playerProfiles[playerIdIndex].playerId === playerId) {
      finderIndex = playerIdIndex;
    }
  }
  return currentSession.players[finderIndex];
}
