import { getData, setData, playerProfile, quiz } from './dataStore';
import { quizIdExists, tokenExists, findUserId, findSession, sessionIdExists } from './other';
import { tokenOwnsQuiz } from './quiz';
import { findQuiz } from './will';
import { getPlayerName, usersRanked, sessionResultsType, sortNames } from './Avi';
import fs from 'fs';
import config from './config.json';

const port = config.port;
const url = config.url;
export const SERVER_URL = `${url}:${port}`;

export interface urlBody {
  imgUrl: string;
}

function checkHTTP(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  } else {
    return false;
  }
}

function checkJPGPNG(url: string) {
  if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
    return true;
  } else {
    return false;
  }
}

export function adminThumbnailUpdate (token: string, quizId: number, body: urlBody) {
  const data = getData();
  const thumbnail = body.imgUrl;
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!quizIdExists(quizId) || !tokenOwnsQuiz(data.quizzes, quizId, token)) {
    return { error: 'quizId is not owned by user' };
  }
  if (thumbnail === '' || !checkHTTP(thumbnail) || !checkJPGPNG(thumbnail)) {
    return { error: 'Invalid Image Url' };
  }
  const quiz = findQuiz(quizId) as quiz;
  quiz.thumbnail = thumbnail;
  data.quizzes[data.quizzes.indexOf(quiz)] = quiz;
  setData(data);
  return {};
}

export function adminQuizResults (token: string, quizId: number, sessionId: number) {
  const data = getData();
  const userId = findUserId(token);
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!sessionIdExists(sessionId)) {
    return { error: 'Invalid sessionId' };
  }
  const currentSession = findSession(sessionId);
  const state = currentSession?.state;
  if (state !== 'FINAL_RESULTS') {
    return { error: 'Session not in FINAL_RESULTS state' };
  }
  if (userId !== currentSession?.ownerId) {
    return { error: 'User is unauthorised to modify sessions' };
  }
  const playersRanked: playerProfile[] = currentSession.playerProfiles;
  playersRanked.sort((playerA, playerB) => playerB.score - playerA.score);
  const usersRankedScoreArray: usersRanked[] = [];
  for (const player of playersRanked) {
    const userRankedScore: usersRanked = {
      name: getPlayerName(player.playerId, currentSession),
      score: player.score
    };
    usersRankedScoreArray.push(userRankedScore);
  }
  const sessionResults: sessionResultsType = {
    usersRankedByScore: usersRankedScoreArray,
    questionResults: currentSession.questionResults
  };
  setData(data);
  return sessionResults;
}

export function adminQuizResultsCSV (token: string, quizId: number, sessionId: number) {
  const data = getData();
  const userId = findUserId(token);
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!sessionIdExists(sessionId)) {
    return { error: 'Invalid sessionId' };
  }
  const session = findSession(sessionId);
  const state = session?.state;
  if (state !== 'FINAL_RESULTS') {
    return { error: 'Session not in FINAL_RESULTS state' };
  }
  if (userId !== session?.ownerId) {
    return { error: 'User is unauthorised to modify sessions' };
  }
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
  let players = data.quizSessions[quizIndex].playerProfiles;
  for(let i = 0; i < players.length; i++){
    for(let j = 0; j < players.length - i - 1; j++){
      if(players[j + 1].name < players[j].name){
          [players[j + 1],players[j]] = [players[j],players[j + 1]]
      }
    }
  }
  for (let i = 0; i < players.length; i++) {
    csv += players[i].name;
    for (let j = 0; j < data.quizSessions[quizIndex].metadata.numQuestions; j++) {
      if (data.quizSessions[quizIndex].metadata.questions[j].correctPlayers !== undefined) {
        let correctQuestionProfiles = data.quizSessions[quizIndex].metadata.questions[j].correctPlayers;
        for (let k = 0; k < correctQuestionProfiles.length; k++) {
          if (correctQuestionProfiles[k].name === players[i].name) {
            csv += ',' + correctQuestionProfiles[k].score.toString();
          } 
        }
      }
      if (data.quizSessions[quizIndex].metadata.questions[j].incorrectPlayers !== undefined) {
        let wrongQuestionProfiles = data.quizSessions[quizIndex].metadata.questions[j].incorrectPlayers;
        for (let k = 0; k < wrongQuestionProfiles.length; k++) {
          if (wrongQuestionProfiles[k].name === players[i].name) {
            csv += ',' + wrongQuestionProfiles[k].score.toString();
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
