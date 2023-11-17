import { getData, setData } from './dataStore';
import * as crypto from 'crypto';

/*
Function completely sets the data in dataStore.js to an empty version of the original dataStore we had saved there
@param {void} - Nothing is passed in
@returns {void} - Nothing is returned
*/
function clear() {
  setData(
    {
      users: [],
      quizzes: [],
      tokens: [],
      quizSessions: [],
      currentUserId: 0,
      currentQuizId: 0,
      currentQuestionId: 0,
      currentAnswerId: 0,
      sessionIds: [],
      currentPlayerId: 0,
    }
  );
  return {};
}

function quizIdExists(quizId: number): boolean {
  const data = getData();
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      return true;
    }
  }
  return false;
}

function findUserId(token: string) {
  const data = getData();
  for (const existingToken of data.tokens) {
    if (token === existingToken.token) {
      return existingToken.userId;
    }
  }
  return 10000;
}

function findUser(userId: number) {
  const data = getData();
  for (const existingUser of data.users) {
    if (existingUser.userId === userId) {
      return existingUser;
    }
  }
  // This below line should NEVER run
  return null;
}

// Helper function for determining if token exists
function tokenExists(token: string) {
  const data = getData();
  const tokenArray = data.tokens;
  if (token === '') {
    return false;
  }
  for (const existingToken of tokenArray) {
    if (token === existingToken.token) {
      return true;
    }
  }
  return false;
}

export function findSession(sessionId: number) {
  const data = getData();
  for (const session of data.quizSessions) {
    if (session.sessionId === sessionId) {
      return session;
    }
  }
  return null;
}

export function sessionIdExists(sessionId: number) {
  const data = getData();
  for (const session of data.quizSessions) {
    if (session.sessionId === sessionId) {
      return true;
    }
  }
  return false;
}

export function hashPassword(password: string) {
  const sha256 = crypto.createHash('sha256');
  sha256.update(password);
  const hash = sha256.digest('hex');
  return hash;
}

export { clear, quizIdExists, findUserId, findUser, tokenExists };
