import { getData, setData, quizSession, playerSubmission } from './dataStore';
import { error } from './auth';

interface playerQuestionResultsType {
  questionId: number,
  playersCorrectList: string[],
  averageAnswerTime: number,
  percentCorrect: number,
}

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
  const atQuestion = currentSession.atQuestion;
  if (questionPosition > atQuestion) {
    return { error: 'Session is not yet up to this question' };
  }
  // Create player results object to return
  // function that returns the playerNames given their playerIds
  let playerArray: string[] = [];
  if (currentSession.metadata.questions[questionPosition - 1].correctPlayers) {
    playerArray = linkPlayerIdArrayWithName(currentSession.metadata.questions[questionPosition - 1].correctPlayers, currentSession);
  }
  // Convert these player Names into an array with accending order by first name
  const sortedPlayerArray = sortNames(playerArray);
  // Find the average answer time for all players who submitted an answer
  const averageTime = computeAverageAnswerTime(currentSession.metadata.questions[questionPosition - 1].correctPlayers, currentSession.metadata.questions[questionPosition - 1].incorrectPlayers, currentSession, questionPosition);
  // Find the percent correct
  let correctAnswerArray = 0;
  let incorrectAnswerArray = 0;
  if (currentSession.metadata.questions[questionPosition - 1].correctPlayers) {
    correctAnswerArray = currentSession.metadata.questions[questionPosition - 1].correctPlayers.length;
  }
  if (currentSession.metadata.questions[questionPosition - 1].incorrectPlayers) {
    incorrectAnswerArray = currentSession.metadata.questions[questionPosition - 1].incorrectPlayers.length;
  }
  const percentage = (((correctAnswerArray) / (correctAnswerArray + incorrectAnswerArray)) * 100);
  // Create the return type
  const returnResults: playerQuestionResultsType = {
    questionId: currentSession.metadata.questions[questionPosition - 1].questionId,
    playersCorrectList: sortedPlayerArray,
    averageAnswerTime: averageTime,
    percentCorrect: percentage,
  };
  setData(data);
  return returnResults;
}
/*
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

// Helper function that given an array of playerIds returns the an array of corresponding players that got it correct
function linkPlayerIdArrayWithName(playerCorrectArray: playerSubmission[], currentSession: quizSession): string[] {
  // Find the index that the playerId is at -> find the corresponding name for that index in playerName array in quizSession
  const playerNames: string[] = [];
  for (const player of playerCorrectArray) {
    for (const playerProfile in currentSession.playerProfiles) {
      if (player.playerId === currentSession.playerProfiles[playerProfile].playerId) {
        playerNames.push(currentSession.players[playerProfile]);
      }
    }
  }
  return playerNames;
}

function sortNames(arr: string[]): string[] {
  return arr.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
}

function computeAverageAnswerTime(playerCorrectArray: playerSubmission[], playerIncorrectArray: playerSubmission[], currentSession: quizSession, questionPosition: number): number {
  let answerTime = 0;
  let timeDifference = 0;
  let incorrectLength;
  let correctLength;
  const questionOpenTime = currentSession.metadata.questions[questionPosition - 1].timeQuestionOpened;
  // players correct list answer time computation
  if (playerCorrectArray) {
    for (const player of playerCorrectArray) {
      timeDifference = player.submissionTime - questionOpenTime;
      answerTime = answerTime + timeDifference;
    }
    correctLength = playerCorrectArray.length;
  } else {
    correctLength = 0;
  }
  if (playerIncorrectArray) {
    for (const player of playerIncorrectArray) {
      timeDifference = player.submissionTime - questionOpenTime;
      answerTime = answerTime + timeDifference;
    }
    incorrectLength = playerIncorrectArray.length;
  } else {
    incorrectLength = 0;
  }
  const numPlayers = correctLength + incorrectLength;
  return (answerTime / numPlayers);
}
