import {getData, setData} from './dataStore.js';
import {adminAuthLogin} from './auth.js';


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


export function adminQuizRemove(authUserId, quizId) {

    let authUserIdValidation = isValidAuthUserId(authUserId);
    let quizIdValidation = isValidQuizId(quizId);

    if (!authUserIdValidation) {
        return { error: 'authUserId is invalid' };
    }
    if (!quizIdValidation) {
        return { error: 'quizId is invalid' };
    }
    return {};
}

function isValidAuthUserId(authUserId) { 
    return typeof authUserId === 'string' && authUserId.length > 0 && /^\d+$/.test(authUserId);
  }
  
function isValidQuizId(quizId) {
    return typeof quizId === 'string' && quizId.length > 0 && /^\d+$/.test(quizId);
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




