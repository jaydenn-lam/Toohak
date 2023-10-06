import {getData, setData} from './dataStore.js';

// Stub for the adminQuizList function
function adminQuizList(authUserId) {
  let error = false;
  const data = getData();
  const quizArray = data.quizzes;
  const listArray = [];
  let success = 0;
  for (let i = 0; i < quizArray.length; i++) {
    if (quizArray[i].UserId === authUserId) {
      const newObject = {
        quizId: quizArray[i].QuizId,
        name: quizArray[i].Name
      }
      listArray.push(newObject);
      success = 1;
    }
  }
  if (success === 0) {
    return {error: 'Invalid User Id'};
  }
  return {quizzes: listArray};
}

// Stub for adminQuizCreate
function adminQuizCreate(authUserId, name, description) {
  let error = false;
  const data = getData();
  const quizArray = data.quizzes;
  const userArray = data.users;
  let userIdExists = 0;
  for (const user in userArray) {
    if (userArray[user].UserId === authUserId) {
      userIdExists = 1;
    }
  }
  if (userIdExists === 0) {
    return {error: 'Invalid User Id'};
  }
  let invalidName = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    if (char <= 47 && char != 32) {
      invalidName = 1;
    }
    if (char >= 58 && char <= 64) {
      invalidName = 1;
    }
    if (char >= 91 && char <= 96) {
      invalidName = 1;
    }
    if (char >= 123) {
      invalidName = 1;
    }
  }
  if (invalidName === 1) {
    return {error: "Invalid character(s) in name"};
  }
  if (name.length < 3) {
    return {error: 'Quiz name too short'};
  }
  if (name.length > 30) {
    return {error: 'Quiz name too long'};
  }
  for (const quiz in quizArray) {
    if (quizArray[quiz].Name === name) {
      return {error: 'Name already being used'};
    }
  }
  if (description.length > 100) {
    return {error: 'Quiz description too long'};
  }
  const quizId = quizArray.length;
  const quizData = {
    QuizId: quizId,
    Name: name,
    TimeCreated: Date.now(),
    TimeLastEdited: Date.now(),
    Description: description,
    UserId: authUserId
  };
  data.quizzes.push(quizData);
  setData(data);
  return(quizId);
}

// Stub for adminQuizRemove function
function adminQuizRemove(authUserId, quizId) {
  // Error checking and early return
	const data = getData();
	const quizArray = data.quizzes;
	const userArray = data.users;
	let userIdExists = 0;

  for (let userindex in userArray) {
    if (userArray[userindex].UserId === authUserId) {
      userIdExists = 1;
    }
  }

  if (userIdExists === 0) {
    return {error: 'Invalid User Id'};
  }

	let quizIdExists = 0;
	for (let quizindex in quizArray) {
		if (quizArray[quizindex].QuizId === quizId) {
			quizIdExists = 1;
		}
	}

	if (quizIdExists === 0) {
    return {error: 'Invalid quiz Id'};
  }

	// Error check for incorrect quizid for the specified user
  for (let checkcount in quizArray) {
		if (quizArray[checkcount].UserId === authUserId) {
			if (quizArray[checkcount].QuizId != quizId) {
				return {error: "Quiz Id is not owned by this user"};
			}
		}
	}

	// Remove a quiz
	for (let quizcounter in data.quizzes) {
		if (data.quizzes[quizcounter].QuizId === quizId) {
			data.quizzes.splice(quizcounter);
		}
	}
	setData(data);
}

// Stub for adminQuizInfo function
function adminQuizInfo(authUserId, quizId) {
  let error = false;
  const data = getData();
  const userArray = data.users;
  const quizArray = data.quizzes;
  let userIdExists = 0, quizIdExists = 0;
  let quizInfo = {};
  for (const user in userArray) {
    if (userArray[user].UserId === authUserId) {
      userIdExists = 1;
    }
  }
  if (userIdExists === 0) {
    return {error: 'Invalid User Id'};
  }
  for (const quiz in quizArray) {
    if (quizArray[quiz].QuizId === quizId) {
      quizIdExists = 1;
      const q = quizArray[quiz];
      quizInfo = {
        quizId: q.QuizId,
        name: q.Name,
        timeCreated: q.TimeCreated,
        timeLastEdited: q.TimeLastEdited,
        description: q.Description,
        UserId: q.UserId
      };
    }
  }
  if (quizIdExists === 0) {
    return {error: 'Invalid Quiz Id'};
  }
  if (quizInfo.UserId !== authUserId) {
    return {error: 'Quiz not owned by user'};
  }
  delete quizInfo.UserId;
  return quizInfo;
}

/*
Function allows the name of a quiz to be updated in our datastore, given that the quizId is owned by the userId given.
Error messages are returned if the name already exists under that userId, if it is invalid, or if the quiz is not owned by them.
Invalid user/quiz Ids will also cause an error.
@param {number} authuserId - The userId of the person who's quiz they are trying to rename
@param {number} quizId - The quizId of the quiz which they are renaming
@param {string} name - The new name of the quiz
@returns {void} - Nothing is returned
*/
function adminQuizNameUpdate(authUserId, quizId, name) {
  const data = getData();
  const userArray = data.users;
  const quizArray = data.quizzes;
  if (name.length > 30 || name.length < 3) {
    return ({error: 'Invalid new name'});
  } 
  if (/^[a-zA-Z0-9]+$/.test(name) === false) {
    return ({error: 'Invalid new name'});
  }
  let userexists = 0, quizexists = 0;
  for (const users in userArray) {
    if (userArray[users].UserId === authUserId) {
      userexists = 1;
    }
  }
  if (userexists === 0) {
    return ({error: 'Invalid userId'});
  }
  for (const quiz in quizArray) {
    if (quizArray[quiz].QuizId === quizId) {
      quizexists = 1;
      if (quizArray[quiz].UserId != authUserId) {
        return ({error: 'Quiz not owned by user'});
      } 
    }
    if (quizArray[quiz].Name === name) {
      return ({error: 'Quiz name already in use'});
    }
  }
  for (const quiz in quizArray) {
    if (quizArray[quiz].QuizId === quizId) {
      quizArray[quiz].Name = name;
    }
  }
  if (quizexists === 0) {
    return ({error: 'Invalid quizId'});
  }
  return {};
}

//Stub for adminQuizDescriptionUpdate function
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  // Error checking and early return
	const data = getData();
	const quizArray = data.quizzes;
	const userArray = data.users;
	let userIdExists = 0;

  for (let userindex in userArray) {
    if (userArray[userindex].UserId === authUserId) {
      userIdExists = 1;
    }
  }

  if (userIdExists === 0) {
    return {error: 'Invalid User Id'};
  }

	let quizIdExists = 0;
	for (let quizindex in quizArray) {
		if (quizArray[quizindex].QuizId === quizId) {
			quizIdExists = 1;
		}
	}

	if (quizIdExists === 0) {
    return {error: 'Invalid quiz Id'};
  }

	// Error check for incorrect quizid for the specified user
  for (let checkcount in quizArray) {
		if (quizArray[checkcount].UserId === authUserId) {
			if (quizArray[checkcount].QuizId != quizId) {
				return {error: "Quiz Id is not owned by this user"};
			}
		}
	}

	// Error checking for description
	if (description.length > 100 && description !== "") {
		return {error: "Description is more than 100 characters in length"};
	}

	// Updating the description property of the quizzes object
	for (let quizcount in data.quizzes) {
		if (data.quizzes[quizcount].QuizId === quizId) {
			data.quizzes[quizcount].Description = description;
		}
	}

	setData(data);
}

export {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizNameUpdate,
};

