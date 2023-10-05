import {getData, setData} from './dataStore.js';

// Stub for the adminQuizList function
function adminQuizList(authUserId) {
    return {
        quizzes: [
            {
                quizId: 1,
                name: 'My Quiz',
            }
        ]
    }
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
    Description: description
  };
  data.quizzes.push(quizData);
  setData(data);
  return(quizId);
}

// Stub for adminQuizRemove function
function adminQuizRemove(authUserId, quizId) {
    return {};
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
  adminQuizCreate
};

