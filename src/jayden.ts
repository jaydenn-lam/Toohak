import { getData, setData, playerProfile, quiz } from './dataStore';
import { quizIdExists, tokenExists, findUserId, findSession, sessionIdExists } from './other';
import { tokenOwnsQuiz } from './quiz';
import { findQuiz } from './will';
import { getPlayerName, usersRanked, sessionResultsType } from './Avi';
import fs from 'fs';
import config from './config.json';

const port = config.port;
const url = config.url;
export const SERVER_URL = `${url}:${port}`;

export interface urlBody {
  imgUrl: string;
}
/**
 * Checks whether the given URL starts with 'http://' or 'https://'.
 *
 * @param {string} url - The URL to be checked.
 * @returns {boolean} - True if the URL starts with 'http://' or 'https://', otherwise false.
 */
function checkHTTP(url: string): boolean {
  // Check if the URL starts with 'http://' or 'https://'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  } else {
    return false;
  }
}
/**
 * Checks whether the given URL ends with '.png', '.jpg', or '.jpeg'.
 *
 * @param {string} url - The URL to be checked.
 * @returns {boolean} - True if the URL ends with '.png', '.jpg', or '.jpeg', otherwise false.
 */
function checkJPGPNG(url: string): boolean {
  // Check if the URL ends with '.png', '.jpg', or '.jpeg'
  if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
    return true;
  } else {
    return false;
  }
}
/**
 * Updates the thumbnail of a quiz using the provided image URL.
 *
 * @param {string} token - The authentication token.
 * @param {number} quizId - The ID of the quiz to update.
 * @param {urlBody} body - The object containing the new thumbnail URL.
 * @returns {object | error} - An empty object on success or an error object on failure.
 */
export function adminThumbnailUpdate (token: string, quizId: number, body: urlBody) {
  const data = getData();
  // Extract the thumbnail URL from the request body
  const thumbnail = body.imgUrl;
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Check if the quiz ID exists and is owned by the user
  if (!quizIdExists(quizId) || !tokenOwnsQuiz(data.quizzes, quizId, token)) {
    return { error: 'quizId is not owned by user' };
  }
  // Check if the thumbnail URL is valid
  if (thumbnail === '' || !checkHTTP(thumbnail) || !checkJPGPNG(thumbnail)) {
    return { error: 'Invalid Image Url' };
  }
  const quiz = findQuiz(quizId) as quiz;
  quiz.thumbnail = thumbnail;
  data.quizzes[data.quizzes.indexOf(quiz)] = quiz;
  setData(data);
  // Return an empty object to indicate success
  return {};
}
/**
 * Retrieves the results of a quiz session, including player rankings and question results.
 *
 * @param {string} token - The authentication token.
 * @param {number} quizId - The ID of the quiz associated with the session.
 * @param {number} sessionId - The ID of the quiz session for which to retrieve results.
 * @returns {sessionResultsType | error} - An object containing session results on success or an error object on failure.
 */
export function adminQuizResults (token: string, quizId: number, sessionId: number) {
  // Retrieve the current data
  const data = getData();
  // Find the user ID associated with the token
  const userId = findUserId(token);
  // Check if the authentication token is valid
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Check if the session ID exists
  if (!sessionIdExists(sessionId)) {
    return { error: 'Invalid sessionId' };
  }
  // Check if the quiz ID exists
  if (!quizIdExists(quizId)) {
    return { error: 'Invalid quizId' };
  }
  // Find the current session and its state
  const currentSession = findSession(sessionId);
  const state = currentSession?.state;
  // Check if the session is in the FINAL_RESULTS state
  if (state !== 'FINAL_RESULTS') {
    return { error: 'Session not in FINAL_RESULTS state' };
  }
  // Check if the user is authorized to view the results
  if (userId !== currentSession?.ownerId) {
    return { error: 'User is unauthorised to modify sessions' };
  }
  // Sort players by score in descending order
  const playersRanked: playerProfile[] = currentSession.playerProfiles;
  playersRanked.sort((playerA, playerB) => playerB.score - playerA.score);
  // Prepare an array of ranked users with their scores
  const usersRankedScoreArray: usersRanked[] = [];
  for (const player of playersRanked) {
    const userRankedScore: usersRanked = {
      name: getPlayerName(player.playerId, currentSession),
      score: player.score
    };
    usersRankedScoreArray.push(userRankedScore);
  }
  // Prepare the session results object
  const sessionResults: sessionResultsType = {
    usersRankedByScore: usersRankedScoreArray,
    questionResults: currentSession.questionResults
  };
  // Save the updated data
  setData(data);
  return sessionResults;
}
/**
 * Generates a CSV file containing quiz results, including player scores and rankings for each question.
 *
 * @param {string} token - The authentication token.
 * @param {number} quizId - The ID of the quiz associated with the session.
 * @param {number} sessionId - The ID of the quiz session for which to generate CSV results.
 * @returns {object | error} - An object containing the URL to the generated CSV file on success or an error object on failure.
 */
export function adminQuizResultsCSV (token: string, quizId: number, sessionId: number) {
  const data = getData();
  // Find the user ID associated with the token
  const userId = findUserId(token);
  // Check if the authentication token is valid
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Check if the session ID exists
  if (!sessionIdExists(sessionId)) {
    return { error: 'Invalid sessionId' };
  }
  // Check if the quiz ID exists
  if (!quizIdExists(quizId)) {
    return { error: 'Invalid quizId' };
  }
  const session = findSession(sessionId);
  const state = session?.state;
  if (state !== 'FINAL_RESULTS') {
    return { error: 'Session not in FINAL_RESULTS state' };
  }
  if (userId !== session?.ownerId) {
    return { error: 'User is unauthorised to modify sessions' };
  }
  // Initialize CSV string with header row
  let csv = 'Player';
  let quizIndex;
  for (let quiz = 0; quiz < data.quizSessions.length; quiz++) {
    if (data.quizSessions[quiz].sessionId === sessionId) {
      quizIndex = quiz;
    }
  }
  for (let i = 0; i < data.quizzes[quizIndex].numQuestions; i++) {
    csv += ',question' + (i + 1).toString() + 'score,' + 'question' + (i + 1).toString() + 'rank';
  }
  csv += '\n';
  const players = data.quizSessions[quizIndex].playerProfiles;
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < players.length - i - 1; j++) {
      if (players[j + 1].name < players[j].name) {
        [players[j + 1], players[j]] = [players[j], players[j + 1]];
      }
    }
  }
  for (let i = 0; i < players.length; i++) {
    csv += players[i].name;
    for (let j = 0; j < data.quizSessions[quizIndex].metadata.numQuestions; j++) {
      if (data.quizSessions[quizIndex].metadata.questions[j].correctPlayers !== undefined) {
        const correctQuestionProfiles = data.quizSessions[quizIndex].metadata.questions[j].correctPlayers;
        for (let k = 0; k < correctQuestionProfiles.length; k++) {
          if (correctQuestionProfiles[k].name === players[i].name) {
            csv += ',' + correctQuestionProfiles[k].score.toString();
            csv += ',' + correctQuestionProfiles[k].rank.toString();
          }
        }
      }
      if (data.quizSessions[quizIndex].metadata.questions[j].incorrectPlayers !== undefined) {
        const wrongQuestionProfiles = data.quizSessions[quizIndex].metadata.questions[j].incorrectPlayers;
        for (let k = 0; k < wrongQuestionProfiles.length; k++) {
          if (wrongQuestionProfiles[k].name === players[i].name) {
            csv += ',' + wrongQuestionProfiles[k].score.toString();
            csv += ',' + wrongQuestionProfiles[k].rank.toString();
          }
        }
      }
    }
    csv += '\n';
  }
  fs.writeFile('public/output.csv', csv, (err) => {
    console.log('File written successfully\n');
  });
  const url = SERVER_URL + '/public/output.csv';
  return { url: url };
}
