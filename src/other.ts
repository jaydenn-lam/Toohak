import { getData, setData } from './dataStore';
const TRUE = 1;
const FALSE = 0;
/*
Function completely sets the data in dataStore.js to an empty version of the original dataStore we had saved there
@param {void} - Nothing is passed in
@returns {void} - Nothing is returned
*/
function clear() {
  setData(
    {
      users: [],
      quizzes: []
    }
  );
  return {};
}

function userIdExists(userId: number): number {
  const data = getData();
  for (const user of data.users) {
    if (user.userId === userId) {
      return TRUE;
    }
  }
  return FALSE;
}

function quizIdExists(quizId: number): number {
  const data = getData();
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      return TRUE;
    }
  }
  return FALSE;
}

export { clear, userIdExists, quizIdExists };
