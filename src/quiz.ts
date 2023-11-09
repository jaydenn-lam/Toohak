import { getData, setData, trash, Question, Answer } from './dataStore';
import { quizIdExists, findUserId, findUser, tokenExists } from './other';

interface error {
  error: string;
}

interface quizId {
  quizId: number;
}

interface newQuestionId {
  newQuestionId: number;
}

interface questionBodyType {
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
}

interface quiz {
  quizId: number;
  name: string;
  timeCreated?: number;
  timeLastEdited?: number;
  description?: string;
  userId?: number;
  numQuestions?: number;
  questions?: questionBodyType[];
  duration?: number;
}

interface quizList {
  quizzes: quiz[];
}

interface questionId {
  questionId: number
}

/*
This function given a users authUserId, provides the list of all quizzes owned by the currently logged in user.
@param {number} authUserId - Integer that contains their assigned authUserId
@returns {object} - An object containing quizId and name
*/
function adminQuizList(token: string): quizList | error {
  const data = getData();
  const tokenArray = data.tokens;
  // Checking if valid token is given
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  const quizArray = data.quizzes;
  const quizList : quiz[] = [];
  let userId;
  // Get the userId
  for (const session of tokenArray) {
    if (session.token === token) {
      userId = session.userId;
    }
  }
  // Updating a quiz list with perameters
  for (const quiz of quizArray) {
    if (quiz.userId === userId) {
      const ownedQuiz = {
        quizId: quiz.quizId,
        name: quiz.name
      };
      quizList.push(ownedQuiz);
    }
  }
  return { quizzes: quizList };
}

/*
This function creates a quiz for the logged-in user.
@param {number} token - The session's assigned token.
@param {string} name - The name of the quiz.
@param {string} description - The description of the quiz.
@returns {number} - The quizId of the newly created quiz.
*/

function adminQuizCreate(token: string, name: string, description: string): quizId |error {
  const data = getData();
  const tokenArray = data.tokens;
  const quizArray = data.quizzes;
  // checking for valid token
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!validName(name)) {
    return { error: 'Invalid character(s) in name' };
  }
  // Error checking for valid name length
  if (nameLengthError(name) !== 'No error') {
    return { error: nameLengthError(name) };
  }

  let adminUserId;
  for (const tokenVal in tokenArray) {
    if (tokenArray[tokenVal].token === token) {
      adminUserId = tokenArray[tokenVal].userId;
    }
  }
  if (description.length > 100) {
    return { error: 'Quiz description too long' };
  }
  // Error check for invalid
  for (const quiz in quizArray) {
    if (quizArray[quiz].name === name) {
      if (quizArray[quiz].userId === adminUserId) {
        return { error: 'Name already being used' };
      }
    }
  }
  // Creating quiz including properties of questions
  const emptyQuestions: Question[] = [];
  const quizId = data.currentQuizId;
  data.currentQuizId = data.currentQuizId + 1;
  const quizData = {
    quizId: quizId,
    name: name,
    TimeCreated: Math.round(Date.now() / 1000),
    TimeLastEdited: Math.round(Date.now() / 1000),
    Description: description,
    userId: findUserId(token),
    numQuestions: 0,
    questions: emptyQuestions,
    duration: 0
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
function adminQuizRemove(token: string, quizId: number): error | object {
  // Error checking and early return
  const data = getData();
  const quizArray = data.quizzes;
  // Error check for valid token
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  const userId = findUserId(token);
  const desiredUser = findUser(userId);
  const trashArray = desiredUser.trash;

  // Check for invalid quiz
  if (!quizIdExists(quizId)) {
    return ({ error: 'Invalid quizId' });
  }
  // Error check for incorrect quizid for the specified user
  if (!tokenOwnsQuiz(quizArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
  }
  // Add quiz to trash and update the TimeLastEdited
  for (const quiz in quizArray) {
    if (quizArray[quiz].quizId === quizId) {
      quizArray[quiz].TimeLastEdited = Math.round(Date.now() / 1000);
      trashArray.push(quizArray[quiz]);
    }
  }
  for (const user of data.users) {
    if (user.userId === userId) {
      user.trash = trashArray;
    }
  }
  // Remove quiz from quizzes array (permanently)
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
function adminQuizInfo(token: string, quizId: number): error | quiz {
  // Check Error cases and early return
  const data = getData();
  const quizArray = data.quizzes;
  let quizInfo: quiz = {
    quizId: 0,
    name: '',
    userId: 0,
  };
  // valid token exists
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // update quizInfo which contains details about questions for each quiz
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      quizInfo = {
        quizId: quiz.quizId,
        name: quiz.name,
        timeCreated: quiz.TimeCreated,
        timeLastEdited: quiz.TimeLastEdited,
        description: quiz.Description,
        userId: quiz.userId,
        numQuestions: quiz.numQuestions,
        questions: quiz.questions,
        duration: quiz.duration
      };
    }
  }
  if (!quizIdExists(quizId)) {
    return ({ error: 'Invalid quizId' });
  }
  // The quiz is not owned by this user
  if (!tokenOwnsQuiz(quizArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
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
function adminQuizNameUpdate(token: string, quizId: number, name: string): error | object {
  const data = getData();
  const quizArray = data.quizzes;
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Error checking for invalid name given
  if (name.length > 30 || name.length < 3) {
    return ({ error: 'Invalid new name' });
  }
  if (!(/^[a-zA-Z0-9]+$/.test(name))) {
    return ({ error: 'Invalid new name' });
  }
  if (!quizIdExists(quizId)) {
    return ({ error: 'Invalid quizId' });
  }
  for (const quiz of quizArray) {
    if (quiz.name === name) {
      return ({ error: 'Quiz name already in use' });
    }
  }

  // Error check for incorrect quizid for the specified user
  if (!tokenOwnsQuiz(quizArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
  }
  // Finds the name and updates the name of the quiz
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.name = name;
    }
  }
  setData(data);
  return {};
}

/*
This function updates the description of an existing quiz.
@param {number} authUserId - The user's assigned authUserId.
@param {number} quizId - The quiz's assigned quizId.
@param {string} description - The description of the quiz.
@returns {} - Empty object.
*/
function adminQuizDescriptionUpdate(token: string, description: string, quizId: number): error | object {
  // Error checking and early return
  const data = getData();
  const quizArray = data.quizzes;
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!quizIdExists(quizId)) {
    return ({ error: 'Invalid quizId' });
  }
  // Error check for incorrect quizid for the specified user
  if (!tokenOwnsQuiz(quizArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
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

/*
This function restores a quiz for the logged-in user.
@param {string} token - The user's session token.
@param {number} quizId - The quiz's assigned quizId.
@returns {} - Empty object.
*/
function adminQuizRestore(token: string, quizId: number): error | object {
  // Error checking and early return
  const data = getData();
  // Initialize quizName as an empty string
  const quizName = '';
  const quizArray = data.quizzes;
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  const userId = findUserId(token);
  const desiredUser = findUser(userId);
  const trashArray = desiredUser.trash;

  // Error check for incorrect quizId for the specified user
  if (!tokenOwnsQuiz(trashArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
  }
  // If quizIdExists is still false, it returns an error
  if (!quizExistsInTrash(quizId, token)) {
    return { error: 'Invalid quizId' };
  }

  for (const quiz of quizArray) {
    if (quiz.name === quizName) {
      return ({ error: 'Quiz name already in use' });
    }
  }
  // Error check if the quiz name already exists
  for (const quiz of quizArray) {
    if (quiz.name === quizName) {
      return { error: 'Quiz Name already exists' };
    }
  }
  // Add the quiz to quizArray and update the TimeLastEdited
  for (const quiz of trashArray) {
    if (quiz.quizId === quizId) {
      quiz.TimeLastEdited = Math.round(Date.now() / 1000);
      quizArray.push(quiz);
    }
  }
  data.quizzes = quizArray;

  // Remove the quiz from the trash array
  for (const quiz of trashArray) {
    if (quiz.quizId === quizId) {
      const index = trashArray.indexOf(quiz);
      if (index !== -1) {
        // splice method to remove one item from data.trash collection at the index
        trashArray.splice(index, 1);
      }
    }
  }
  for (const user of data.users) {
    if (user.userId === userId) {
      user.trash = trashArray;
    }
  }
  setData(data);
  return {};
}
/*
The function allows to view the quizzes that are in trash
@param {string} token - The user's session token.
@returns {Array} - An array that contains quizzes.
*/
function adminQuizViewTrash(token: string): error | trash {
  // Test for invalid token
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  const userId = findUserId(token);
  const desiredUser = findUser(userId);
  const trashArray = desiredUser.trash;
  const trash: trash = {
    quizzes: []
  };
  for (const quiz of trashArray) {
    const returnQuiz = {
      quizId: quiz.quizId,
      name: quiz.name,
    };
    trash.quizzes.push(returnQuiz);
  }
  return trash;
}
/*
The function empties the trash when called
@param {string} token - The user's session token.
@param {number} quizId - The quiz's assigned quizId.
@returns {} - An empty object
*/
function adminTrashEmpty(token: string, quizIds: number[]) {
  const data = getData();
  // Test for invalid token
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  const userId = findUserId(token);
  const desiredUser = findUser(userId);
  const trashArray = desiredUser.trash;
  console.log(trashArray);
  // check whether user owns the quiz provided
  for (const quizId of quizIds) {
    if (!tokenOwnsQuiz(trashArray, quizId, token)) {
      return { error: 'User does not own quiz' };
    }
    if (!quizExistsInTrash(quizId, token)) {
      return { error: 'Invalid quizId' };
    }
  }
  // Empty the trash implementation
  for (const quiz of quizIds) {
    for (const trashedQuiz of trashArray) {
      if (trashedQuiz.quizId === quiz) {
        const index = trashArray.indexOf(trashedQuiz);
        trashArray.splice(index);
      }
    }
  }
  for (const user of data.users) {
    if (user.userId === userId) {
      user.trash = trashArray;
    }
  }
  setData(data);
  return {};
}
/*
Given some basic details as parameters function creates a question for the particular quiz
@param {string} token - The user's session token.
@param {number} quizId - The quiz's assigned quizId.
@param {object} questionBody - a stub for a question with parameters.
@returns {number} - A unique questionId for the created question
*/
function adminQuizQuestionCreate(token: string, quizId: number, questionBody: questionBodyType): error | questionId {
  // Error checking and early return
  const data = getData();
  const quizArray = data.quizzes;
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  const errorExists = questionPropertyErrorCheck(questionBody);
  if (errorExists != null) {
    return { error: errorExists };
  }
  if (!quizIdExists(quizId)) {
    return { error: 'quizId does not exist' }
  }
  // Error check for incorrect quizid for the specified user
  if (!tokenOwnsQuiz(quizArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
  }

  const incorrectAnswerType = answerTypeError(questionBody);
  if (incorrectAnswerType != null) {
    return { error: incorrectAnswerType };
  }

  // Checks for invalid quiz duration
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      if ((quiz.duration + questionBody.duration) > 180) {
        return { error: 'Question duration is too long' };
      }
    }
  }
  // Create an array of all answers for that question that need to be created
  const answerArray: Answer[] = [];
  let answerId = 0;
  for (const index in questionBody.answers) {
    answerId = data.currentAnswerId;
    data.currentAnswerId = data.currentAnswerId + 1;
    const selectedString: string = getRandomColour();
    const answerObject: Answer = {
      answerId: answerId,
      answer: questionBody.answers[index].answer,
      correct: questionBody.answers[index].correct,
      colour: selectedString,
    };
    answerArray.push(answerObject);
  }

  // Adds the question
  let questionId = 0;
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      questionId = data.currentQuestionId;
      data.currentQuestionId = data.currentQuestionId + 1;
      quiz.questions.push({
        questionId: questionId,
        question: questionBody.question,
        duration: questionBody.duration,
        points: questionBody.points,
        answers: answerArray,
      });
      quiz.numQuestions++;
      quiz.duration = quiz.duration + questionBody.duration;
      quiz.TimeLastEdited = quiz.TimeCreated;
    }
  }
  setData(data);
  return { questionId: questionId };
}
/*
Given some basic details about a specific question delete from the quiz
@param {string} token - The user's session token.
@param {number} quizId - The quiz's assigned quizId.
@param {number} questionId - A questions assigned questionId
@returns {number} - A unique questionId for the created question
*/
function adminQuestionDelete(token: string, quizId: number, questionId: number): error | object {
  const data = getData();
  const quizArray = data.quizzes;
  // Test for valid token Id
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!quizIdExists(quizId)) {
    return ({ error: 'Invalid quizId' });
  }
  // Error check for incorrect quizid for the specified user
  if (!tokenOwnsQuiz(quizArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
  }
  if (!questionIdExists(questionId, quizId)) {
    return { error: 'Invalid questionId' };
  }
  // Update the TimeLastEdited and delete question
  for (const quiz in quizArray) {
    if (quizArray[quiz].quizId === quizId) {
      quizArray[quiz].TimeLastEdited = Math.round(Date.now() / 1000);
      for (const question of quizArray[quiz].questions) {
        if (question.questionId === questionId) {
          const index = data.quizzes[quiz].questions.indexOf(question);
          data.quizzes[quiz].questions.splice(index, 1);
        }
      }
    }
  }
  setData(data);
  return {};
}
/*
Given some basic details as parameters function updates a question for the particular quiz
@param {string} token - The user's session token.
@param {number} quizId - The quiz's assigned quizId.
@param {object} questionBody - a stub for a question with parameters.
@param {number} questionId - The quiz's assigned quizId.
@returns {} - An empty object
*/
function adminQuestionUpdate(token: string, quizId: number, questionBody: questionBodyType, questionId: number): object | error {
  // Error checking and early return
  const data = getData();
  const quizArray = data.quizzes;
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Error check for incorrect quizid for the specified user
  if (!tokenOwnsQuiz(quizArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
  }
  const errorExists = questionPropertyErrorCheck(questionBody);
  if (errorExists != null) {
    return { error: errorExists };
  }
  const incorrectAnswerType = answerTypeError(questionBody);
  if (incorrectAnswerType != null) {
    return { error: incorrectAnswerType };
  }

  // Checks for invalid quiz duration
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      if ((quiz.duration + questionBody.duration) > 180) {
        return { error: 'Question duration is too long' };
      }
    }
  }

  // Update duration of quiz
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      if (quiz.duration !== questionBody.duration) {
        quiz.duration = quiz.duration + questionBody.duration;
      }
    }
  }

  // Update question details
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      for (const question of quiz.questions) {
        if (question.questionId === questionId) {
          question.question = questionBody.question;
          question.duration = questionBody.duration;
          question.points = questionBody.points;
          for (const index in question.answers) {
            question.answers[index].answer = questionBody.answers[index].answer;
            question.answers[index].correct = questionBody.answers[index].correct;
            question.answers[index].colour = getRandomColour();
          }
        }
      }
      // Update time last edited
      quiz.TimeLastEdited = Math.round(Date.now() / 1000);
    }
  }
  setData(data);
  return {};
}

/*
This function transfers a quiz given basic parameters
@param {string} token - The user's session token.
@param {string} userEmail - The new owner's email.
@returns {} - Empty object.
*/
function adminQuizTransfer(token: string, userEmail: string, quizId: number): error | object {
  const data = getData();
  const quizArray = data.quizzes;
  const tokenArray = data.tokens;
  const userArray = data.users;
  // check if the token provided valid
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!tokenOwnsQuiz(quizArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
  }
  // checks if the user email provided exists in the userArray
  let realEmail = false;
  for (const user of userArray) {
    if (user.email === userEmail) {
      realEmail = true;
      break;
    }
  }
  if (!realEmail) {
    return { error: 'userEmail does not exist' };
  }
  let userId = -1;
  for (const tokenValues of tokenArray) {
    if (tokenValues.token === token) {
      userId = tokenValues.userId;
      break;
    }
  }
  for (const user in userArray) {
    if (userArray[user].email === userEmail && userArray[user].userId === userId) {
      return { error: 'userEmail is the current logged in user' };
    }
  }
  let userId2 = -1;
  for (const user of userArray) {
    if (user.email === userEmail) {
      userId2 = user.userId;
      break;
    }
  }
  // Error check for repeating name
  for (const quiz of quizArray) {
    if (quiz.userId === userId2) {
      if (quiz.name === quizArray[quizId].name) {
        return { error: 'Quiz ID refers to a quiz that has a name that is already used by the target user' };
      }
    }
  }
  data.quizzes[quizId].userId = userId2;
  data.quizzes[quizId].TimeLastEdited = Math.round(Date.now() / 1000);
  setData(data);
  return {};
}
/*
This function move a question from one position to another
@param {string} token - The user's session token.
@param {number} quizId - unique quizid
@param {number} questionId - unique questionId
@param {number} newPosition - new position at which the question is sent to
@returns {} - Empty object.
*/
function adminQuizQuestionMove(token: string, quizId: number, questionId: number, newPosition: number): error | object {
  const data = getData();
  let quizIndex = 0;
  const quizArray = data.quizzes;
  const currentPosition = positionFinder(questionId, quizId);
  // return {currentPosition};
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Error checking and early return
  if (!tokenOwnsQuiz(quizArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
  }
  if (!questionIdExists(questionId, quizId)) {
    return { error: 'Invalid questionId' };
  }
  if (newPosition === currentPosition) {
    return { error: 'New position cannot be the current position' };
  }
  if (newPosition < 0 || newPosition > questionArrayLength(quizId)) {
    return { error: 'New position must be in the length of the question array' };
  }
  // moves question to desired place
  for (const existingQuiz of quizArray) {
    if (existingQuiz.quizId === quizId) {
      const questionArray = existingQuiz.questions;
      const moverQuestion = questionArray[currentPosition];
      questionArray.splice(currentPosition, 1);
      questionArray.splice(newPosition, 0, moverQuestion);
      existingQuiz.TimeLastEdited = Math.round(Date.now() / 1000);
      data.quizzes = quizArray;
      data.quizzes[quizIndex].questions = questionArray;
    } else {
      quizIndex++;
    }
  }
  setData(data);
  return {};
}
/*
This function duplicates a question after the source
@param {string} token - The user's session token.
@param {number} quizId - unique quizid
@param {number} questionId - unique questionId
@param {number} newPosition - new position at which the question is sent to
@returns {number} - newQuestionId - the id of the new question.
*/
function adminQuizQuestionDuplicate(token: string, quizId: number, questionId: number): newQuestionId | error | object {
  const data = getData();
  const quizArray = data.quizzes;
  let quizIndex = 0;
  let newQuestionId = 0;
  // Simple parameter error checks and early return
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  if (!tokenOwnsQuiz(quizArray, quizId, token)) {
    return { error: 'Quiz Id is not owned by this user' };
  }
  if (!questionIdExists(questionId, quizId)) {
    return { error: 'Invalid questionId' };
  }
  // Implementation of duplicating the question
  const currentPosition = positionFinder(questionId, quizId);
  for (const existingQuiz of quizArray) {
    if (existingQuiz.quizId === quizId) {
      const questionArray = existingQuiz.questions;
      const newDuplicate = { ...questionArray[currentPosition] };
      newQuestionId = questionArray.length + 1;

      newDuplicate.questionId = newQuestionId;
      questionArray.splice(currentPosition + 1, 0, newDuplicate);
      existingQuiz.TimeLastEdited = Math.round(Date.now() / 1000);
      existingQuiz.duration = existingQuiz.duration + newDuplicate.duration;
      existingQuiz.numQuestions++;

      data.quizzes = quizArray;
      data.quizzes[quizIndex].questions = questionArray;
    } else {
      quizIndex++;
    }
  }
  setData(data);
  return { newQuestionId };
}

// Helper function which determines whether the quiz name length is valid or not
function nameLengthError(name: string): string {
  if (name.length < 3) {
    return 'Quiz name too short';
  }
  if (name.length > 30) {
    return 'Quiz name too long';
  }
  return 'No error';
}

// Helper function for common types of errors in the questionBody returns a string
// with the error message or null
function questionPropertyErrorCheck(questionBody: questionBodyType): string | null {
  if (questionBody.question.length < 5) {
    return 'Question too short';
  }
  if (questionBody.question.length > 50) {
    return 'Question too long';
  }
  if (questionBody.answers.length < 2) {
    return 'Too little answers';
  }
  if (questionBody.answers.length > 6) {
    return 'Number of answers greater than 6';
  }
  if (questionBody.duration <= 0) {
    return 'Question duration is not positive';
  }
  if (questionBody.points < 1) {
    return 'Question points is zero or negative';
  }
  if (questionBody.points > 10) {
    return 'Question points exceeded max value';
  }
  return null;
}

// Helper function for incorrect answer type returns error string or null
function answerTypeError(questionBody: questionBodyType): string | null {
  for (const answer of questionBody.answers) {
    if (answer.answer.length < 1) {
      return 'Length of an answer is less than 1 character';
    }
    if (answer.answer.length > 30) {
      return 'Length of an answer is greater than 30 characters';
    }
  }
  for (const answer in questionBody.answers) {
    for (const check in questionBody.answers) {
      if (questionBody.answers[answer].answer === questionBody.answers[check].answer && answer !== check) {
        return 'Duplicate answers';
      }
    }
  }
  let error = true;
  for (const answer of questionBody.answers) {
    if (answer.correct === true) {
      error = false;
    }
  }
  if (error) {
    return 'No correct answers';
  }
  return null;
}

// Helper function for determining if quizId is in the trash
function quizExistsInTrash(quizId: number, token: string) {
  const userId = findUserId(token);
  const user = findUser(userId);
  const trashArray = user.trash;
  for (const quiz of trashArray) {
    if (quiz.quizId === quizId) {
      return true;
    }
  }
  return false;
}

// Helper function for determining if the user of the token owns the quiz.
function tokenOwnsQuiz(quizArray: quiz[], quizId: number, token: string) {
  const userId = findUserId(token);
  if (quizArray.length === 0) {
    return false;
  }
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      if (quiz.userId !== userId) {
        return false;
      }
    }
  }
  return true;
}

// Helper function for determining if string is alphanumeric
function validName(name: string) {
  let invalidName = false;
  for (let char = 0; char < name.length; char++) {
    const charCode = name.charCodeAt(char);
    if (charCode <= 47 && charCode !== 32) {
      invalidName = true;
    }
    if (charCode >= 58 && charCode <= 64) {
      invalidName = true;
    }
    if (charCode >= 91 && charCode <= 96) {
      invalidName = true;
    }
    if (charCode >= 123) {
      invalidName = true;
    }
  }
  if (invalidName) {
    return false;
  } else {
    return true;
  }
}

// Gets the number of questions in a question array
function questionArrayLength(quizId: number): number {
  const data = getData();
  const quizArray = data.quizzes;
  for (const quiz of quizArray) {
    if (quiz.quizId === quizId) {
      return quiz.questions.length - 1;
    }
  }
  return 0;
}
// Helper for generating a random colour
function getRandomColour(): string {
  const strings: string[] = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
  const randomIndex: number = Math.floor(Math.random() * strings.length);
  return strings[randomIndex];
}
// Helper for determining whether questionIdExists
function questionIdExists(questionId: number, quizId: number): boolean {
  const data = getData();
  let quiz;
  const quizArray = data.quizzes;
  for (const existingQuiz of quizArray) {
    if (existingQuiz.quizId === quizId) {
      quiz = existingQuiz;
    }
  }
  for (const question of quiz.questions) {
    if (question.questionId === questionId) {
      return true;
    }
  }
  return false;
}
// Finds the position with basic details about a question
function positionFinder(questionId: number, quizId: number): number {
  const data = getData();
  const quizArray = data.quizzes;
  let position = 0;
  let questionArray;
  for (const existingQuiz of quizArray) {
    if (existingQuiz.quizId === quizId) {
      questionArray = existingQuiz.questions;
    }
  }
  for (const qIndex in questionArray) {
    if (questionArray[qIndex].questionId === questionId) {
      position = parseInt(qIndex);
    }
  }
  return position;
}

export {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizRestore,
  tokenExists,
  adminQuizTransfer,
  adminQuizViewTrash,
  adminTrashEmpty,
  adminQuizQuestionCreate,
  adminQuizQuestionMove,
  adminQuestionDelete,
  adminQuizQuestionDuplicate,
  adminQuestionUpdate
};
