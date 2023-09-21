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
    return {
        quizId: 2
    }
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



