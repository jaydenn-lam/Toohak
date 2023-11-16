import { getData, setData, quizSession, action } from './dataStore';
import { quizIdExists, tokenExists, findUserId, findSession, sessionIdExists } from './other';
import { error } from './auth';
import { tokenOwnsQuiz } from './quiz';
import { findQuiz } from './will';

export interface urlBody {
  imgUrl: string;
};

function checkHTTP(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return true;
  }
  else { 
    return false;
  }
}

function checkJPGPNG(url: string) {
  if (url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg")) {
    return true;
  }
  else {
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
    return { error: 'Invalid Image Url'};
  }
  const quiz = findQuiz(quizId);
  quiz.thumbnail = thumbnail;
  data.quizzes[data.quizzes.indexOf(quiz)] = quiz;
  setData(data);
  return {};
};

export function adminQuizResults (token: string, quizId: number, sessionId: number) {
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
  if (state != 'FINAL_RESULTS') {
    return { error: 'Session is not in final results state'};
  }
  if (userId !== session?.ownerId) {
    return { error: 'User is unauthorised to modify sessions' };
  }
};

export function adminQuizResultsCSV (token: string, quizId: number, sessionId: number) {
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
  if (state != 'FINAL_RESULTS') {
    return { error: 'Session is not in final results state'};
  }
  if (userId !== session?.ownerId) {
    return { error: 'User is unauthorised to modify sessions' };
  }
};