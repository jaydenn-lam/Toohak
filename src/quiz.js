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
    return {
      quizId: 1,
      name: 'My Quiz',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'This is my quiz',
    };
  }

// Stub for adminQuizNameUpdate function
function adminQuizNameUpdate(authUserId, quizId, name) {
    return {};
}

//Stub for adminQuizDescriptionUpdate function
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
    return {};
}

export {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizDescriptionUpdate
};

