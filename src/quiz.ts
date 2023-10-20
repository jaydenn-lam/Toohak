
import { getData, setData } from './dataStore';
import { userIdExists, quizIdExists } from './other';
const TRUE = 1;
const FALSE = 0;

interface error {
  error: string;
}

interface quizId {
  quizId: number;
}

interface quiz {
  quizId: number;
  name: string;
  timeCreated?: number;
  timeLastEdited?: number;
  description?: string;
  userId?: number;
}

interface quizList {
  quizzes: quiz[];
}

/*
This function given a users authUserId, provides the list of all quizzes owned by the currently logged in user.
@param {number} authUserId - Integer that contains their assigned authUserId
@returns {object} - An object containing quizId and name
*/
function adminQuizList(authUserId: number): quizList | error {
  const data = getData();
  const quizArray = data.quizzes;
  const quizList = [];
  let success = FALSE;
  for (const quiz of quizArray) {
    if (quiz.userId === authUserId) {
      const ownedQuiz = {
        quizId: quiz.quizId,
        name: quiz.name
      };
      quizList.push(ownedQuiz);
      success = TRUE;
    }
  }
  if (success === FALSE) {
    return { error: 'Invalid User Id' };
  }
  return { quizzes: quizList };
}

/*
This function creates a quiz for the logged-in user.
@param {number} authUserId - The user's assigned authUserId.
@param {string} name - The name of the quiz.
@param {string} description - The description of the quiz.
@returns {number} - The quizId of the newly created quiz.
*/

function adminQuizCreate(authUserId: number, name: string, description: string): quizId |error {
  const data = getData();
  const quizArray = data.quizzes;
  if (userIdExists(authUserId) === FALSE) {
    return { error: 'Invalid User Id' };
  }
  if (!validName(name)) {
    return { error: 'Invalid character(s) in name' };
  }
  if (name.length < 3) {
    return { error: 'Quiz name too short' };
  }
  if (name.length > 30) {
    return { error: 'Quiz name too long' };
  }
  for (const quiz in quizArray) {
    if (quizArray[quiz].name === name) {
      return { error: 'Name already being used' };
    }
  }
  if (description.length > 100) {
    return { error: 'Quiz description too long' };
  }
  const quizId = quizArray.length;
  const quizData = {
    quizId: quizId,
    name: name,
    TimeCreated: Date.now(),
    TimeLastEdited: Date.now(),
    Description: description,
    userId: authUserId
  };
  data.quizzes.push(quizData);
  setData(data);
  return ({ quizId: quizId });
}

/*
This function removes a quiz for the logged-in user.
@param {number} authUserId - The user's assigned authUserId.
@param {number} quizId - The quiz's assigned quizId.
@returns {} - Empty object.
*/
function adminQuizRemove(authUserId: number, quizId: number): error | object {
  // Error checking and early return
  const data = getData();
  const quizArray = data.quizzes;
  if (userIdExists(authUserId) === FALSE) {
    return { error: 'Invalid User Id' };
  }
  let quizIdExists = FALSE;
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      quizIdExists = TRUE;
    }
  }
  if (quizIdExists === FALSE) {
    return { error: 'Invalid quiz Id' };
  }
  // Error check for incorrect quizid for the specified user
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      if (quiz.userId !== authUserId) {
        return { error: 'Quiz Id is not owned by this user' };
      }
    }
  }
  // Remove a quiz
  for (let index = 0; index < data.quizzes.length; index++) {
    if (data.quizzes[index].quizId === quizId) {
      data.quizzes.splice(index, 1);
    }
  }
  setData(data);
  return {};
}

/*
Gives information about a quiz with the given quizId
Invalid quiz/user Ids or if the quiz isn't owned by the authUserId will give an error
@param {number} authuserId - The userId of the person who owns the quiz
@param {number} quizId - The quizId of the quiz which needs info returned
@returns {quizInfo} - An object containing all relevant info of the quiz
*/
function adminQuizInfo(authUserId: number, quizId: number):error | quiz {
  const data = getData();
  const quizArray = data.quizzes;
  let quizIdExists = FALSE;
  let quizInfo: quiz = {
    quizId: 0,
    name: '',
    userId: 0,
  };
  if (userIdExists(authUserId) === FALSE) {
    return { error: 'Invalid User Id' };
  }
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      quizIdExists = TRUE;
      quizInfo = {
        quizId: quiz.quizId,
        name: quiz.name,
        timeCreated: quiz.TimeCreated,
        timeLastEdited: quiz.TimeLastEdited,
        description: quiz.Description,
        userId: quiz.userId
      };
    }
  }
  if (quizIdExists === FALSE) {
    return { error: 'Invalid Quiz Id' };
  }
  if (quizInfo.userId !== authUserId) {
    return { error: 'Quiz not owned by user' };
  }
  delete quizInfo.userId;
  return quizInfo;
}

/*
Function allows the name of a quiz to be updated in our datastore, given that the quizId is owned by the userId given.
Error messages are returned if the name already exists under that userId, if it is invalid, or if the quiz is not owned by them.
Invalid user/quiz Ids will also cause an error.
@param {number} authuserId - The userId of the person who's quiz they are trying to rename
@param {number} quizId - The quizId of the quiz which they are renaming
@param {string} name - The new name of the quiz
@returns {object} - Nothing is returned
*/
function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): error | object {
  const data = getData();
  const quizArray = data.quizzes;
  if (name.length > 30 || name.length < 3) {
    return ({ error: 'Invalid new name' });
  }
  if (/^[a-zA-Z0-9]+$/.test(name) === false) {
    return ({ error: 'Invalid new name' });
  }
  if (userIdExists(authUserId) === FALSE) {
    return ({ error: 'Invalid userId' });
  }
  if (quizIdExists(quizId) === FALSE) {
    return ({ error: 'Invalid quizId' });
  }
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      if (quiz.userId !== authUserId) {
        return ({ error: 'Quiz not owned by user' });
      }
    }
    if (quiz.name === name) {
      return ({ error: 'Quiz name already in use' });
    }
  }
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      quiz.name = name;
    }
  }
  return {};
}

/*
This function updates the description of an existing quiz.
@param {number} authUserId - The user's assigned authUserId.
@param {number} quizId - The quiz's assigned quizId.
@param {string} description - The description of the quiz.
@returns {} - Empty object.
*/
function adminQuizDescriptionUpdate(authUserId: number, quizId: number, description: string):error | object {
  // Error checking and early return
  const data = getData();
  const quizArray = data.quizzes;
  if (userIdExists(authUserId) === FALSE) {
    return { error: 'Invalid User Id' };
  }
  let quizIdExists = FALSE;
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      quizIdExists = TRUE;
    }
  }
  if (quizIdExists === FALSE) {
    return { error: 'Invalid quiz Id' };
  }
  // Error check for incorrect quizid for the specified user
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      if (quiz.userId !== authUserId) {
        return { error: 'Quiz Id is not owned by this user' };
      }
    }
  }
  // Error checking for description
  if (description.length > 100 && description !== '') {
    return { error: 'Description is more than 100 characters in length' };
  }

  // Updating the description property of the quizzes object
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.Description = description;
    }
  }
  setData(data);
  return {};
}

// Helper function for determining if string is alphanumeric
function validName(name: string) {
  let invalidName = FALSE;
  for (let char = 0; char < name.length; char++) {
    const charCode = name.charCodeAt(char);
    if (charCode <= 47 && charCode !== 32) {
      invalidName = TRUE;
    }
    if (charCode >= 58 && charCode <= 64) {
      invalidName = TRUE;
    }
    if (charCode >= 91 && charCode <= 96) {
      invalidName = TRUE;
    }
    if (charCode >= 123) {
      invalidName = TRUE;
    }
  }
  if (invalidName) {
    return FALSE;
  } else {
    return TRUE;
  }
}

export {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizNameUpdate,
};
