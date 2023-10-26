
import { getData, setData, token } from './dataStore';
import { quizIdExists, findUserId } from './other';
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
function adminQuizList(token: string): quizList | error {
  const data = getData();
  const tokenArray = data.tokens;
  if (!tokenExists(token, tokenArray)) {
    return { error: 'Invalid Token' };
  }
  const quizArray = data.quizzes;
  const quizList : quiz[] = [];
  let userId;
  for (const session of tokenArray) {
    if (session.token === token) {
      userId = session.userId;
    }
  }
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
  const quizArray = data.quizzes;
  const tokenArray = data.tokens;
  if (!tokenExists(token, tokenArray)) {
    return { error: 'Invalid Token' };
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
    TimeCreated: Math.round(Date.now() / 1000),
    TimeLastEdited: Math.round(Date.now() / 1000),
    Description: description,
    userId: findUserId(token),
    numQuestions: 0,
    questions: [{
      questionId: 1,
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{
        answer: 'Prince Charles',
        correct: true
      }]
    }],
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
  const tokenArray = data.tokens;
  const trashArray = data.trash;
  if (!tokenExists(token, tokenArray)) {
    return { error: 'Invalid Token' };
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
  if (!tokenOwnsQuiz(quizArray, quizId, token, tokenArray)) {
    return { error: 'Quiz Id is not owned by this user' };
  }
  // Add quiz to trash and update the TimeLastEdited
  for (const quiz in quizArray) {
    if (quizArray[quiz].quizId === quizId) {
      quizArray[quiz].TimeLastEdited = Math.round(Date.now() / 1000);
      trashArray.push(quizArray[quiz]);
    }
  }
  // Remove quiz from quizzes array
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
  const data = getData();
  const quizArray = data.quizzes;
  const tokenArray = data.tokens;
  let quizIdExists = FALSE;
  let quizInfo: quiz = {
    quizId: 0,
    name: '',
    userId: 0,
  };
  if (!tokenExists(token, tokenArray)) {
    return { error: 'Invalid Token' };
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
  if (!tokenOwnsQuiz(quizArray, quizId, token, tokenArray)) {
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
  const tokenArray = data.tokens;
  if (!tokenExists(token, tokenArray)) {
    return { error: 'Invalid Token' };
  }

  if (name.length > 30 || name.length < 3) {
    return ({ error: 'Invalid new name' });
  }
  if (!(/^[a-zA-Z0-9]+$/.test(name))) {
    return ({ error: 'Invalid new name' });
  }

  if (quizIdExists(quizId) === FALSE) {
    return ({ error: 'Invalid quizId' });
  }
  for (const quiz of quizArray) {
    if (quiz.name === name) {
      return ({ error: 'Quiz name already in use' });
    }
  }

  // Error check for incorrect quizid for the specified user
  if (!tokenOwnsQuiz(quizArray, quizId, token, tokenArray)) {
    return { error: 'Quiz Id is not owned by this user' };
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
function adminQuizDescriptionUpdate(token: string, description: string, quizId: number): error | object {
  // Error checking and early return
  const data = getData();
  const quizArray = data.quizzes;
  const tokenArray = data.tokens;
  if (!tokenExists(token, tokenArray)) {
    return { error: 'Invalid Token' };
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
  if (!tokenOwnsQuiz(quizArray, quizId, token, tokenArray)) {
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

interface Answer {
  answer: string;
  correct: boolean;
}

interface questionBodyType {
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
}

interface questionId {
  questionId: number
}

function adminQuizQuestionCreate(token: string, quizId: number, questionBody: questionBodyType): error | questionId {
  // Error checking and early return
  const data = getData();
  const quizArray = data.quizzes;
  const tokenArray = data.tokens;
  if (!tokenExists(token, tokenArray)) {
    return { error: 'Invalid Token' };
  }

  const errorExists = questionPropertyErrorCheck(questionBody);
  if (errorExists != null) {
    return { error: errorExists };
  }
  // Error check for incorrect quizid for the specified user
  if (!tokenOwnsQuiz(quizArray, quizId, token, tokenArray)) {
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

  // Adds the question
  let questionId = 0;
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.questions.pop();
      questionId = quiz.questions.length;
      quiz.questions.push({
        questionId: questionId,
        question: questionBody.question,
        duration: questionBody.duration,
        points: questionBody.points,
        answers: questionBody.answers
      });
      quiz.numQuestions++;
      quiz.duration = quiz.duration + questionBody.duration;
      quiz.TimeLastEdited = quiz.TimeCreated;
    }
  }
  return { questionId: questionId };
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
  if (questionBody.duration < 0) {
    return 'Question duration is negative';
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

function tokenOwnsQuiz(quizArray: quiz[], quizId: number, token: string, tokenArray: token[]): boolean {
  let userId;
  for (const session of tokenArray) {
    if (token === session.token) {
      userId = session.userId;
    }
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

// Helper function for determining if token exists
function tokenExists(token: string, tokenArray: token[]) {
  for (const existingToken of tokenArray) {
    if (token === existingToken.token) {
      return TRUE;
    }
  }
  return FALSE;
}

export {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizQuestionCreate,
};
