import {getData, setData} from './dataStore.js';
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
  return{};
}

function userIdExists(userId) {
  const data = getData();
  let exists = 0;
  for (let user of data.users) {
    if (user.userId === userId) {
      exists++;
    }
  }
  if (exists !== 0) {
    return 1;
  }
  else {
    return 0;
  }
}

export {clear, userIdExists};