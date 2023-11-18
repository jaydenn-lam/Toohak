import { getData, setData, quizSession, playerProfile } from './dataStore';
import { error } from './auth';
import { findSession } from './other';

export interface playerQuestionResultsType {
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

export interface usersRanked {
 name: string,
 score: number
}

export interface questionResult {
 questionId: number,
 playersCorrectList: string[],
 averageAnswerTime: number,
 percentCorrect: number
}

export interface sessionResultsType {
 usersRankedByScore: usersRanked[],
 questionResults: questionResult[],
}
/**
* Retrieves player question results for a given question position in a quiz session.
*
* @param {number} playerId - The unique identifier for the player.
* @param {number} questionPosition - The position of the question for which results are requested.
*
* @returns {playerQuestionResultsType} - Player question results including questionId, playersCorrectList, averageAnswerTime, and percentCorrect.
* @returns {error} - Error object with a description if there is an issue with the request.
*/
export function playerQuestionResults(playerId: number, questionPosition: number): playerQuestionResultsType | error {
  const data = getData();
  const sessionArray = data.quizSessions;
  // Error check for valid playerId
  if (!validPlayerIdCheck(playerId)) {
    return { error: 'Invalid playerId' };
  }
  // Find the session this player is in
  const sessionId = playerSessionFinder(playerId) as number;
  const currentSession = findSession(sessionId) as quizSession;
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
  const correctPlayerArray = currentSession.metadata.questions[questionPosition - 1].correctPlayers as playerProfile[];
  const incorrectPlayerArray = currentSession.metadata.questions[questionPosition - 1].incorrectPlayers as playerProfile[];
  if (correctPlayerArray) {
    playerArray = linkPlayerIdArrayWithName(correctPlayerArray, currentSession);
  }
  // Convert these player Names into an array with accending order by first name
  const sortedPlayerArray = sortNames(playerArray);
  // Find the average answer time for all players who submitted an answer
  const averageTime = computeAverageAnswerTime(correctPlayerArray, incorrectPlayerArray, currentSession, questionPosition);
  // Find the percent correct
  let correctAnswerArray = 0;
  let incorrectAnswerArray = 0;
  if (correctPlayerArray) {
    correctAnswerArray = correctPlayerArray.length;
  }
  if (incorrectPlayerArray) {
    incorrectAnswerArray = incorrectPlayerArray.length;
  }
  const percentage = (((correctAnswerArray) / (correctAnswerArray + incorrectAnswerArray)) * 100);
  // Create the return type
  const returnResults: playerQuestionResultsType = {
    questionId: currentSession.metadata.questions[questionPosition - 1].questionId,
    playersCorrectList: sortedPlayerArray,
    averageAnswerTime: averageTime,
    percentCorrect: percentage,
  };
  for (const session of sessionArray) {
    if (session.sessionId === currentSession.sessionId) {
      session.questionResults.push(returnResults);
    }
  }
  setData(data);
  return returnResults;
}
/**
* Retrieves the session results, including users ranked by score and question results.
*
* @param {number} playerId - The unique identifier for the player.
*
* @returns {sessionResultsType} - Session results including users ranked by score and question results.
* @returns {error} - Error object with a description if there is an issue with the request.
*/
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
  // Create the users ranked by score array
  console.log(currentSession.playerProfiles);
  const playersRanked: playerProfile[] = currentSession.playerProfiles;
  playersRanked.sort((playerA, playerB) => playerB.score - playerA.score);
  console.log(playersRanked);
  // convert the array to have playerNames instead of playerId for each element
  const usersRankedScoreArray: usersRanked[] = [];
  for (const player of playersRanked) {
    console.log(getPlayerName(player.playerId, currentSession));
    const userRankedScore: usersRanked = {
      name: player.name,
      score: player.score
    };
    usersRankedScoreArray.push(userRankedScore);
  }
  // Store the question results for each question in dataStore
  const sessionResults: sessionResultsType = {
    usersRankedByScore: usersRankedScoreArray,
    questionResults: currentSession.questionResults
  };
  setData(data);
  return sessionResults;
}
/**
* Retrieves the chat messages for the session that the player is in.
*
* @param {number} playerId - The unique identifier for the player.
*
* @returns {messagesType} - Object containing an array of chat messages.
* @returns {error} - Error object with a description if there is an issue with the request.
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
/**
* Sends a chat message on behalf of a player in the current session.
*
* @param {number} playerId - The unique identifier for the player sending the message.
* @param {messageArgumentType} message - Object containing the message body.
*
* @returns {object} - Empty object indicating success.
* @returns {error} - Error object with a description if there is an issue with the request.
*/
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
  for (const session of sessionArray) {
    if (session.sessionId === currentSession.sessionId) {
      session.messages.push(sendMessage);
    }
  }
  setData(data);
  return {};
}

// /////////////////////////HELPER FUNCTIONS BELOW/////////////////////////////////////
/**
* Checks if a given player ID is valid within the current quiz sessions.
*
* @param {number} playerId - The unique identifier for the player.
*
* @returns {boolean} - True if the player ID is valid, false otherwise.
*/
function validPlayerIdCheck(playerId: number): boolean {
  // Fetch quiz session data
  const data = getData();
  const sessionArray = data.quizSessions;
  // Iterate through quiz sessions and player profiles
  for (const session of sessionArray) {
    for (const player of session.playerProfiles) {
      // Check if the player ID matches
      if (player.playerId === playerId) {
        return true;
      }
    }
  }
  // Player ID is not found in any session
  return false;
}
/**
* Finds the session ID associated with a given player ID within the current quiz sessions.
*
* @param {number} playerId - The unique identifier for the player.
*
* @returns {number | undefined} - The session ID if the player is found, undefined otherwise.
*/
function playerSessionFinder(playerId: number): number | undefined {
  // Fetch quiz session data
  const data = getData();
  const sessionArray = data.quizSessions;
  // Iterate through quiz sessions and player profiles
  for (const session of sessionArray) {
    for (const player of session.playerProfiles) {
      // Check if the player ID matches
      if (player.playerId === playerId) {
        return session.sessionId;
      }
    }
  }
  // Player ID is not found in any session
  return undefined;
}
/**
* Helper function that checks if the message body is of a valid type and length.
*
* @param {messageArgumentType} message - The message object containing the message body.
*
* @returns {boolean} - True if the message body is valid, false otherwise.
*/
function validMessageBodyCheck(message: messageArgumentType): boolean {
  // Check if the message body is not empty and does not exceed the maximum allowed length
  if (message.messageBody.length >= 1 && message.messageBody.length <= 100) {
    return true;
  }
  return false;
}
/**
* Retrieves the player name associated with a given playerId from the current session.
*
* @param {number} playerId - The unique identifier of the player.
* @param {quizSession} currentSession - The current quiz session containing player profiles and names.
*
* @returns {string} - The name of the player associated with the given playerId.
*/
export function getPlayerName(playerId: number, currentSession: quizSession): string {
  let finderIndex = 0;
  // Iterate through player profiles in the current session
  for (let playerIdIndex = 0; playerIdIndex < currentSession.playerProfiles.length; playerIdIndex++) {
    // Check if the playerId matches the current player profile
    if (currentSession.playerProfiles[playerIdIndex].playerId === playerId) {
      // Store the index of the matching player profile
      finderIndex = playerIdIndex;
    }
  }
  // Return the player name associated with the playerId
  return currentSession.players[finderIndex];
}
/**
* Given an array of player profiles, returns an array of corresponding player names for those who answered correctly.
*
* @param {playerProfile[]} playerCorrectArray - Array of player profiles who answered correctly.
* @param {quizSession} currentSession - The current quiz session containing player profiles and names.
*
* @returns {string[]} - Array of player names corresponding to the given player profiles.
*/
function linkPlayerIdArrayWithName(playerCorrectArray: playerProfile[], currentSession: quizSession): string[] {
  const playerNames: string[] = [];
  // Iterate through player profiles in the correct player array
  for (const player of playerCorrectArray) {
    // Iterate through player profiles in the current session
    for (const playerProfile in currentSession.playerProfiles) {
      // Check if the playerId in the correct player array matches the playerId in the current player profile
      if (player.playerId === currentSession.playerProfiles[playerProfile].playerId) {
        playerNames.push(currentSession.players[playerProfile]); // Add the corresponding player name to the array
      }
    }
  }
  return playerNames;
}
/**
* Sorts an array of strings in ascending order.
*
* @param {string[]} arr - Array of strings to be sorted.
*
* @returns {string[]} - Sorted array of strings.
*/
function sortNames(arr: string[]): string[] {
  return arr.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    return 1;
  });
}
/**
* Computes the average answer time for players who answered a specific question.
*
* @param {playerProfile[]} playerCorrectArray - Array of player profiles who answered the question correctly.
* @param {playerProfile[]} playerIncorrectArray - Array of player profiles who answered the question incorrectly.
* @param {quizSession} currentSession - The current quiz session containing player profiles and question metadata.
* @param {number} questionPosition - The position of the question for which to compute the average answer time.
*
* @returns {number} - The average answer time for the specified question.
*/
function computeAverageAnswerTime(playerCorrectArray: playerProfile[], playerIncorrectArray: playerProfile[], currentSession: quizSession, questionPosition: number): number {
  let answerTime = 0;
  let timeDifference = 0;
  let incorrectLength;
  let correctLength;
  const questionOpenTime = currentSession.metadata.questions[questionPosition - 1].timeQuestionOpened as number;
  // Calculate answer time for players who answered correctly
  if (playerCorrectArray) {
    for (const player of playerCorrectArray) {
      timeDifference = player.submissionTime - questionOpenTime;
      answerTime += timeDifference;
    }
    correctLength = playerCorrectArray.length;
  } else {
    correctLength = 0;
  }
  // Calculate answer time for players who answered incorrectly
  if (playerIncorrectArray) {
    for (const player of playerIncorrectArray) {
      timeDifference = player.submissionTime - questionOpenTime;
      answerTime += timeDifference;
    }
    incorrectLength = playerIncorrectArray.length;
  } else {
    incorrectLength = 0;
  }
  // Calculate the total number of players
  const numPlayers = correctLength + incorrectLength;
  // Compute and return the average answer time
  return numPlayers > 0 ? answerTime / numPlayers : 0;
}
