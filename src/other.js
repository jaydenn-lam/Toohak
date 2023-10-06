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
}

export {clear};