import { getData, setData } from './dataStore';

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
      currentUserId: 0,
      currentQuizId: 0,
      currentQuestionId: 0,
      currentAnswerId: 0,
    }
  );
  return {};
}

function userIdExists(userId: number): boolean {
  const data = getData();
  for (const user of data.users) {
    if (user.userId === userId) {
      return true;
    }
  }
  return false;
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

function findUserId(token: string): number {
  const data = getData();
  for (const existingToken of data.tokens) {
    if (token === existingToken.token) {
      return existingToken.userId;
    }
  }
}

export { clear, userIdExists, quizIdExists, findUserId };
