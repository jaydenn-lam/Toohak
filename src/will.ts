
import { getData, setData, quizSession, action, questionResult, quiz, playerProfile } from './dataStore';
import { quizIdExists, tokenExists, findUserId, findSession, sessionIdExists } from './other';
import { error } from './auth';
import { tokenOwnsQuiz } from './quiz';

interface viewSession {
  activeSessions: number[],
  inactiveSessions: number[]
}

interface parameterAction {
  action: string;
}

interface answerIds {
  answerIds: number[]
}
/**
 * Validates whether a new quiz session can be started based on specified criteria.
 * 
 * @param {number} startNum - The auto-start number for the new quiz session.
 * @param {number} quizId - The ID of the quiz for which to start a new session.
 * 
 * @returns {object} - An empty object if validation passes, otherwise an object with an error message.
 */
function sessionValidator(startNum: number, quizId: number): object {
  const data = getData();
  let totalSessions = 0;
  // Find the quiz based on the provided quizId
  const quiz = findQuiz(quizId);
  // Validate auto-start number range
  if (startNum > 50 || startNum < 0) {
    return { error: 'autoStartNum cannot be greater than 50 or negative' };
  }
  // Validate that the quiz has questions
  if (quiz?.numQuestions === 0) {
    return { error: 'Quiz has no questions' };
  }
  // Count the total number of active sessions for the specified quiz
  for (const session of data.quizSessions) {
    if (session.metadata.quizId === quizId && session.state !== 'END') {
      totalSessions++;
    }
  }
  // Check if the maximum number of active sessions has been reached
  if (totalSessions >= 10) {
    return { error: 'There are already a maximum of 10 active sessions' };
  }
  // Return an empty object if validation passes
  return {};
}
/**
 * Finds and returns a quiz based on the provided quizId.
 * 
 * @param {number} quizId - The ID of the quiz to find.
 * 
 * @returns {object | undefined} - The quiz object if found, or undefined if not found.
 */
export function findQuiz(quizId: number): object | undefined {
  const data = getData();
  // Iterate through quizzes to find the one with the specified quizId
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      return quiz;
    }
  }
  // Return undefined if the quiz with the specified quizId is not found
  return undefined;
}
/**
 * Initiates a new quiz session, updating the state to LOBBY and setting up necessary metadata.
 * 
 * @param {string} token - The authentication token of the user initiating the session.
 * @param {number} quizId - The ID of the quiz for which the session is started.
 * @param {number} autoStartNum - The number of players required to automatically start the session.
 * 
 * @returns {object | error} - An object containing the newly created sessionId if successful, 
 *                             or an error object if any validation fails.
 */
export function adminSessionStart(token: string, quizId: number, autoStartNum: number): object | error {
  const data = getData();
  // Check if the token is valid
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Check if the quizId is valid and if the user owns the quiz
  if (!quizIdExists(quizId) || !tokenOwnsQuiz(data.quizzes, quizId, token)) {
    return { error: 'quizId is not owned by user' };
  }
  // Validate the session start conditions using sessionValidator function
  const sessionValidationResult = sessionValidator(autoStartNum, quizId);
  if ('error' in sessionValidationResult) {
    return sessionValidationResult;
  }
  // Create a duplicate of the quiz metadata for the session
  const duplicateQuiz = { ...findQuiz(quizId) } as quiz;
  // Generate a unique sessionId
  const sessionId = generateUniqueSessionId();
  data.sessionIds.push(sessionId);
  // Find the user ID of the token owner
  const ownerId = findUserId(token);
  // Create an empty question results array
  const emptyQuestionResults: questionResult[] = [];
  // Create a new session with initial settings
  const newSession: quizSession = {
    sessionId: sessionId,
    state: 'LOBBY',
    atQuestion: 0,
    players: [],
    playerProfiles: [],
    ownerId: ownerId,
    metadata: duplicateQuiz,
    messages: [],
    totalUpdates: 0,
    autoStartNum: autoStartNum,
    questionResults: emptyQuestionResults,
  };
  // Add the new session to the data
  data.quizSessions.push(newSession);
  // Save the updated data
  setData(data);
  // Return the created sessionId
  return { sessionId };
}
/**
 * Retrieves information about active and inactive quiz sessions associated with a quiz.
 * 
 * @param {string} token - The authentication token of the user requesting the session information.
 * @param {number} quizId - The ID of the quiz for which the session information is requested.
 * 
 * @returns {object | error} - An object containing arrays of active and inactive session IDs 
 *                             if successful, or an error object if any validation fails.
 */
export function adminSessionsView(token: string, quizId: number): object | error {
  const data = getData();
  // Check if the token is valid
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Check if the quizId is valid and if the user owns the quiz
  if (!quizIdExists(quizId) || !tokenOwnsQuiz(data.quizzes, quizId, token)) {
    return { error: 'quizId is not owned by user' };
  }
  // Initialize an object to store active and inactive session IDs
  const viewSession: viewSession = {
    activeSessions: [],
    inactiveSessions: []
  };
  // Iterate through quiz sessions to categorize them as active or inactive
  for (const session of data.quizSessions) {
    if (session.state === 'END') {
      viewSession.inactiveSessions.push(session.sessionId);
    } else {
      viewSession.activeSessions.push(session.sessionId);
    }
  }
  // Return the categorized session IDs
  return viewSession;
}
/**
 * Updates the state and properties of a quiz session based on the specified action.
 * 
 * @param {string} token - The authentication token of the user initiating the session update.
 * @param {number} quizId - The ID of the quiz associated with the session to be updated.
 * @param {number} sessionId - The ID of the session to be updated.
 * @param {parameterAction} action - The action object specifying the desired update.
 * 
 * @returns {object | error} - An empty object if the update is successful, or an error object 
 *                             if any validation fails during the update process.
 */
export function adminSessionUpdate(token: string, quizId: number, sessionId: number, action: parameterAction): object | error {
  let data = getData();
  const desiredAction = action.action;
  const userId = findUserId(token);
  // Check if the token is valid
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Check if the session ID is valid
  if (!sessionIdExists(sessionId)) {
    return { error: 'Invalid sessionId' };
  }
  // Find the session based on the provided session ID
  const session = findSession(sessionId);
  const state = session?.state;
  // Check if the user is authorized to modify the session
  if (userId !== session?.ownerId) {
    return { error: 'User is unauthorised to modify sessions' };
  }
  // Validate the action based on the current state of the session
  if ('error' in actionVerifier(session, desiredAction)) {
    return actionVerifier(session, desiredAction);
  }
  // Update the session based on its current state and the desired action
  if (state === 'LOBBY') {
    data = lobbyUpdater(token, quizId, session, desiredAction);
  } else if (state === 'QUESTION_COUNTDOWN') {
    data = qCountdownUpdater(token, quizId, session, desiredAction);
  } else if (state === 'QUESTION_OPEN') {
    data = qOpenUpdater(quizId, session, desiredAction);
  } else if (state === 'QUESTION_CLOSE') {
    data = qCloseUpdater(token, quizId, session, desiredAction);
  } else if (state === 'ANSWER_SHOW') {
    data = answerShowUpdater(token, quizId, session, desiredAction);
  } else if (state === 'FINAL_RESULTS') {
    data = finalResultsUpdater(session, desiredAction);
  }
  // Increment the total updates count for the modified session
  for (const sessionExist of data.quizSessions) {
    if (sessionExist.sessionId === sessionId) {
      sessionExist.totalUpdates++;
    }
  }
  // Save the updated data
  setData(data);
  // Return an empty object indicating a successful update
  return {};
}
/**
 * Updates the state and properties of a quiz session in the lobby state based on the specified action.
 * 
 * @param {string} token - The authentication token of the user initiating the session update.
 * @param {number} quizId - The ID of the quiz associated with the session to be updated.
 * @param {quizSession} session - The quiz session object to be updated.
 * @param {string} action - The action to be performed on the session in the lobby state.
 * 
 * @returns {object} - The updated data object containing the modified quiz session.
 */
function lobbyUpdater(token: string, quizId: number, session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  const updates = session.totalUpdates;
  let state;
  let qNum = session.atQuestion;
  // Update the state based on the specified action
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'NEXT_QUESTION') {
    state = 'QUESTION_COUNTDOWN';
    qNum++;
    // Set a timeout to automatically skip the countdown after 3 seconds
    setTimeout(() => {
      const currentState = findSession(sessionId)?.state;
      const currentUpdates = findSession(sessionId)?.totalUpdates;
      // Check if the state and updates are unchanged before skipping countdown
      if (currentState === 'QUESTION_COUNTDOWN' && currentUpdates === updates + 1) {
        adminSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      }
    }, 3000);
  }
  // Update the session properties in the data object
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
      existingSession.atQuestion = qNum;
    }
  }
  // Return the updated data object
  return data;
}
/**
 * Updates the quiz session state during the QUESTION_COUNTDOWN phase.
 *
 * @param {string} token - The authentication token.
 * @param {number} quizId - The ID of the quiz.
 * @param {quizSession} session - The quiz session to be updated.
 * @param {string} action - The action to be performed during the countdown (e.g., 'END', 'SKIP_COUNTDOWN').
 *
 * @returns {object} - The updated data object.
 */
function qCountdownUpdater(token: string, quizId: number, session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  const qNum = session.atQuestion;
  const updates = session.totalUpdates;
  const duration = questionDurationFinder(qNum, quizId) as number;
  let state;
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'SKIP_COUNTDOWN') {
    state = 'QUESTION_OPEN';
    for (const currentSession of data.quizSessions) {
      if (currentSession.sessionId === session.sessionId) {
        const atQuestion = currentSession.atQuestion;
        currentSession.metadata.questions[atQuestion - 1].timeQuestionOpened = Math.round(Date.now() / 1000);
      }
    }
    setTimeout(() => {
      const currentState = findSession(sessionId)?.state;
      const currentUpdates = findSession(sessionId)?.totalUpdates;
      if (currentState === 'QUESTION_OPEN' && currentUpdates === updates + 1) {
        adminSessionUpdate(token, quizId, sessionId, { action: 'OPEN_TO_CLOSE' });
      }
    }, duration * 1000);
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  return data;
}
/**
 * Updates the quiz session state during the QUESTION_CLOSE phase.
 *
 * @param {string} token - The authentication token.
 * @param {number} quizId - The ID of the quiz.
 * @param {quizSession} session - The quiz session to be updated.
 * @param {string} action - The action to be performed after closing the question (e.g., 'END', 'GO_TO_ANSWER', 'NEXT_QUESTION').
 *
 * @returns {object} - The updated data object.
 */
function qCloseUpdater(token: string, quizId: number, session: quizSession, action: string) {
  // Get the current data object
  const data = getData();
  // Extract session details
  const sessionId = session.sessionId;
  const updates = session.totalUpdates;
  let state;
  let qNum = session.atQuestion;
  // Check if the action is to end the session
  if (action === 'END') {
    state = 'END';
  }
  // Check if the action is to move to the ANSWER_SHOW phase
  if (action === 'GO_TO_ANSWER') {
    state = 'ANSWER_SHOW';
  }
  // Check if the action is to move to the next question
  if (action === 'NEXT_QUESTION') {
    // Set the state to QUESTION_COUNTDOWN
    state = 'QUESTION_COUNTDOWN';
    // Increment the question number
    qNum++;
    // Set a timeout to automatically move to the next state (SKIP_COUNTDOWN) after a delay
    setTimeout(() => {
      const currentState = findSession(sessionId)?.state;
      const currentUpdates = findSession(sessionId)?.totalUpdates;
      // Check if the current state is QUESTION_COUNTDOWN and the total updates have increased
      if (currentState === 'QUESTION_COUNTDOWN' && currentUpdates === updates + 1) {
        adminSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      }
    }, 3000); 
  }
  // Update the state and question number in the existing session
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
      existingSession.atQuestion = qNum;
    }
  }
  // Return the updated data object
  return data;
}
/**
 * Updates the quiz session state during the QUESTION_OPEN phase.
 *
 * @param {number} quizId - The ID of the quiz.
 * @param {quizSession} session - The quiz session to be updated.
 * @param {string} action - The action to be performed after opening the question (e.g., 'END', 'GO_TO_ANSWER', 'OPEN_TO_CLOSE').
 *
 * @returns {object} - The updated data object.
 */
function qOpenUpdater(quizId: number, session: quizSession, action: string) {
  // Get the current data object
  let data = getData();
  // Extract session details
  const sessionId = session.sessionId;
  let state;
  // Check if the action is to end the session
  if (action === 'END') {
    state = 'END';
  }
  // Check if the action is to move to the ANSWER_SHOW phase
  if (action === 'GO_TO_ANSWER') {
    // Calculate scores before moving to the ANSWER_SHOW phase
    data = scoreCalculator(quizId, session);
    state = 'ANSWER_SHOW';
  }
  // Check if the action is to move to the QUESTION_CLOSE phase
  if (action === 'OPEN_TO_CLOSE') {
    data = scoreCalculator(quizId, session);
    state = 'QUESTION_CLOSE';
  }
  // Update the state in the existing session
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  // Return the updated data object
  return data;
}
/**
 * Calculates scores for players in a quiz session based on their submitted answers.
 *
 * @param {number} quizId - The ID of the quiz.
 * @param {quizSession} session - The quiz session for which scores are calculated.
 *
 * @returns {object} - The updated data object.
 */
function scoreCalculator(quizId: number, session: quizSession) {
  // Get the current data object
  const data = getData();
  // Determine the index of the current question
  const questionIndex = session.atQuestion - 1;
  const question = session.metadata.questions[questionIndex];
  // Array to store correct answer IDs
  const correctAnswerArray = [];
  // Populate correctAnswerArray with correct answer IDs
  for (const answer of question.answers) {
    if (answer.correct === true) {
      correctAnswerArray.push(answer.answerId);
    }
  }
  // Iterate through player profiles in the session
  for (const player of session.playerProfiles) {
    // Check if the player's last submitted answer is correct
    const correct = answerIdChecker(player.lastSubmittedAnswer, correctAnswerArray);
    // Create a player entry with default values
    const playerEntry = {
      name: player.name,
      playerId: player.playerId,
      submissionTime: player.submissionTime,
      lastSubmittedAnswer: [],
      score: 0,
    };
    // Update scores based on correctness
    if (correct) {
      if (!question.correctPlayers) {
        question.correctPlayers = [];
      }
      // Calculate and add scores
      const add = addScoreCalc(question.answerOrder, question.points, player.playerId);
      playerEntry.score += add;
      player.score += add;
      // Add player entry to correctPlayers array
      question.correctPlayers.push(playerEntry);
    } else if (!correct) {
      if (!question.incorrectPlayers) {
        question.incorrectPlayers = [];
      }
      // Add player entry to incorrectPlayers array
      question.incorrectPlayers.push(playerEntry);
    }
  }
  // Update the question and player profiles in the existing session
  for (const existingSession of data.quizSessions) {
    if (session.sessionId === existingSession.sessionId) {
      existingSession.metadata.questions[questionIndex] = question;
      existingSession.playerProfiles = session.playerProfiles;
    }
  }
  // Save the updated data object
  setData(data);
  // Return the updated data object
  return data;
}
/**
 * Calculates the score to be added for a player based on their position in the answer order.
 *
 * @param {number[]} orderArray - Array representing the order of player IDs who answered correctly.
 * @param {number} points - Points awarded for the question.
 * @param {number} playerId - ID of the player for whom the score is calculated.
 *
 * @returns {number} - The calculated score to be added.
 */
function addScoreCalc(orderArray: number[], points: number, playerId: number) {
  // Initialize variables
  let index = 1;
  let add = 0;
  // Iterate through the orderArray to find the player's position
  for (const orderPlayerId of orderArray) {
    if (orderPlayerId === playerId) {
      // Calculate the score based on position
      add = points * (1 / index);
    }
    index++;
  }
  // Round the calculated score to one decimal place
  const roundedAdd = Number(add.toFixed(1));
  // Return the calculated and rounded score
  return roundedAdd;
}
/**
 * Finds the duration of a specific question in a quiz.
 *
 * @param {number} number - The position of the question in the quiz.
 * @param {number} quizId - The ID of the quiz containing the question.
 *
 * @returns {number | undefined} - The duration of the question, or undefined if not found.
 */
function questionDurationFinder(number: number, quizId: number) {
  // Find the quiz based on the provided quizId
  const quiz = findQuiz(quizId);
  // Retrieve the specified question based on its position
  const question = quiz?.questions[number - 1];
  // Extract the duration of the question, if available
  const duration = question?.duration;
  // Return the duration of the question, or undefined if not found
  return duration;
}
/**
 * Handles updates to a quiz session during the "ANSWER_SHOW" state.
 *
 * @param {string} token - The authentication token of the user making the update.
 * @param {number} quizId - The ID of the quiz associated with the session.
 * @param {quizSession} session - The quiz session being updated.
 * @param {string} action - The specific action to perform during the "ANSWER_SHOW" state.
 *
 * @returns {object} - The updated data object.
 */
function answerShowUpdater(token: string, quizId: number, session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  const updates = session.totalUpdates;
  let state;
  let qNum = session.atQuestion;
  // Handle the specified action during the "ANSWER_SHOW" state
  if (action === 'END') {
    state = 'END';
  }
  if (action === 'NEXT_QUESTION') {
    state = 'QUESTION_COUNTDOWN';
    qNum++;
    // Set a timeout to automatically skip the countdown after 3000 milliseconds (3 seconds)
    setTimeout(() => {
      const currentState = findSession(sessionId)?.state;
      const currentUpdates = findSession(sessionId)?.totalUpdates;
      // Perform the skip countdown action if the session is still in the expected state
      if (currentState === 'QUESTION_COUNTDOWN' && currentUpdates === updates + 1) {
        adminSessionUpdate(token, quizId, sessionId, { action: 'SKIP_COUNTDOWN' });
      }
    }, 3000);
  }
  if (action === 'GO_TO_FINAL_RESULTS') {
    state = 'FINAL_RESULTS';
  }
  // Update the session information in the data object
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
      existingSession.atQuestion = qNum;
    }
  }
  return data;
}
/**
 * Updates the state of a quiz session to "END" during the "FINAL_RESULTS" state.
 *
 * @param {quizSession} session - The quiz session being updated.
 * @param {string} action - The specific action to perform during the "FINAL_RESULTS" state.
 *
 * @returns {object} - The updated data object.
 */
function finalResultsUpdater(session: quizSession, action: string) {
  const data = getData();
  const sessionId = session.sessionId;
  let state;
  // Handle the specified action during the "FINAL_RESULTS" state
  if (action === 'END') {
    state = 'END';
  }
  // Update the session information in the data object
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.state = state;
    }
  }
  return data;
}
/**
 * Verifies if a specified action is valid based on the current state of a quiz session.
 *
 * @param {quizSession} session - The quiz session for which the action is being verified.
 * @param {string} desiredAction - The action to be performed.
 *
 * @returns {object} - An error object if the action is invalid for the current state, otherwise an empty object.
 */
function actionVerifier(session: quizSession, desiredAction: string) {
  const state = session.state;
  // Check if the desired action is a valid action for the current state
  if (!Object.keys(action).includes(desiredAction) && desiredAction !== 'OPEN_TO_CLOSE') {
    return { error: 'Invalid action' };
  }
  // Check specific invalid actions for each state
  if (state === 'LOBBY') {
    if (desiredAction === 'SKIP_COUNTDOWN' || desiredAction === 'GO_TO_ANSWER' || desiredAction === 'GO_TO_FINAL_RESULTS') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'QUESTION_COUNTDOWN') {
    if (desiredAction === 'NEXT_QUESTION' || desiredAction === 'GO_TO_ANSWER' || desiredAction === 'GO_TO_FINAL_RESULTS') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'QUESTION_OPEN') {
    if (desiredAction === 'NEXT_QUESTION' || desiredAction === 'SKIP_COUNTDOWN' || desiredAction === 'GO_TO_FINAL_RESULTS') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'QUESTION_CLOSE') {
    if (desiredAction === 'SKIP_COUNTDOWN') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'ANSWER_SHOW') {
    if (desiredAction === 'GO_TO_ANSWER' || desiredAction === 'SKIP_COUNTDOWN') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'FINAL_RESULTS') {
    if (desiredAction === 'NEXT_QUESTION' || desiredAction === 'SKIP_COUNTDOWN' || desiredAction === 'GO_TO_FINAL_RESULTS' || desiredAction === 'GO_TO_ANSWER') {
      return { error: 'Action cannot currently be performed' };
    }
  }
  if (state === 'END') {
    return { error: 'Action cannot currently be performed' };
  }
  // If no error conditions are met, return an empty object
  return {};
}
/**
 * Retrieves the status of a quiz session for an admin user.
 *
 * @param {string} token - The authentication token of the user.
 * @param {number} quizId - The ID of the quiz associated with the session.
 * @param {number} sessionId - The ID of the quiz session for which status is requested.
 *
 * @returns {object|error} - The status of the quiz session or an error object if authentication fails or the session is not found.
 */
export function adminSessionStatus(token: string, quizId: number, sessionId: number): object | error {
  const data = getData();
  // Check if the token is valid
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Check if the session ID is valid
  if (!sessionIdExists(sessionId)) {
    return { error: 'Invalid sessionId' };
  }
  // Find the user ID associated with the token
  const userId = findUserId(token);
  // Find the owner ID of the session
  const ownerId = findSession(sessionId)?.ownerId;
  // Check if the user is authorized to view the session
  if (userId !== ownerId) {
    return { error: 'User is unauthorised to view sessions' };
  }
  let sessionStatus;
  // Loop through quiz sessions to find the requested session
  for (const session of data.quizSessions) {
    if (session.sessionId === sessionId) {
      // Remove sensitive information from the metadata
      for (const question of session.metadata.questions) {
        delete question.answerOrder;
      }
      // Extract metadata excluding user-specific information
      const { userId, ...returnedData } = session.metadata;
      // Create session status object
      sessionStatus = {
        state: session.state,
        atQuestion: session.atQuestion,
        players: session.players,
        metadata: returnedData
      };
    }
  }
  return sessionStatus;
}
/**
 * Handles the submission of answers from a player in a quiz session.
 *
 * @param {number} playerId - The ID of the player submitting the answers.
 * @param {number} questionPosition - The position of the question in the quiz.
 * @param {object} answerIds - Object containing the answer IDs submitted by the player.
 *
 * @returns {object|error} - An empty object if the submission is successful, or an error object if validation fails.
 */
export function playerAnswerSubmit(playerId: number, questionPosition: number, answerIds: answerIds): object | error {
  const data = getData();
  // Calculate the index of the question
  const questionIndex = questionPosition - 1;
  let sessionId = 0;
  // Check if the player's session is valid
  if (playerSessionFinder(playerId) === 100000) {
    return { error: 'Invalid playerId' };
  } else {
    sessionId = playerSessionFinder(playerId);
  }
  // Find the quiz session associated with the player
  const session = findSession(sessionId) as quizSession;
  // Check for validation errors in the submitted answers
  const error = answerErrorThrower(questionPosition, answerIds, session);
  if (error) {
    return error;
  }
  // Retrieve the question from the session metadata
  const question = session?.metadata.questions[questionIndex];
  // Update player's submitted answers and submission time
  for (const player of session.playerProfiles) {
    if (player.playerId === playerId) {
      player.lastSubmittedAnswer = answerIds.answerIds;
      player.submissionTime = Math.round(Date.now() / 1000);
    }
  }
  // Remove player from the previous answer order
  for (const submittedPlayer of question.answerOrder) {
    if (submittedPlayer === playerId) {
      question.answerOrder = question.answerOrder.filter((value) => value !== playerId);
    }
  }
  // Add the player to the new answer order
  question.answerOrder.push(playerId);
  // Update session metadata with the modified question and player profiles
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      existingSession.metadata.questions[questionIndex] = question;
      existingSession.playerProfiles = session.playerProfiles;
    }
  }
  setData(data);
  return {};
}
/**
 * Checks if the submitted answer IDs match the correct answer IDs.
 *
 * @param {number[]} answerIds - The submitted answer IDs.
 * @param {number[]} correctAnswers - The correct answer IDs.
 *
 * @returns {boolean} - True if the submitted answer IDs match the correct answer IDs, false otherwise.
 */
function answerIdChecker(answerIds: number[], correctAnswers: number[]) {
  // Check if the number of submitted and correct answers match
  if (answerIds.length !== correctAnswers.length) {
    return false;
  }
  // Sort both arrays for comparison
  const sortSubmit = answerIds.slice().sort();
  const sortCorrect = correctAnswers.slice().sort();
  // Compare each element in the sorted arrays
  for (let index = 0; index < sortSubmit.length; index++) {
    if (sortSubmit[index] !== sortCorrect[index]) {
      return false;
    }
  }
  // All elements matched, return true
  return true;
}
/**
 * Finds the session ID associated with a given player ID.
 *
 * @param {number} playerId - The ID of the player.
 *
 * @returns {number} - The session ID if the player is found, otherwise a default value (100000).
 */
export function playerSessionFinder(playerId: number) {
  // Retrieve data
  const data = getData();
  // Iterate through quiz sessions
  for (const session of data.quizSessions) {
    // Iterate through player profiles in the session
    for (const existingPlayer of session.playerProfiles) {
      // Check if the player ID matches
      if (existingPlayer.playerId === playerId) {
        // Return the session ID if found
        return session.sessionId;
      }
    }
  }
  // Return a default value if player is not found in any session
  return 100000;
}
/**
 * Validates answer data for a given question in a quiz session.
 *
 * @param {number} questionPosition - The position of the question.
 * @param {object} answerIds - Object containing an array of answer IDs.
 * @param {quizSession} session - The quiz session object.
 *
 * @returns {object | undefined} - An error object if validation fails, otherwise undefined.
 */
function answerErrorThrower(questionPosition: number, answerIds: answerIds, session: quizSession) {
  // Extract answer array from the provided answerIds object
  const answerArray = answerIds.answerIds;
  // Check if the session is in the QUESTION_OPEN state
  if (session.state !== 'QUESTION_OPEN') {
    return { error: 'Session must be in QUESTION_OPEN state' };
  }
  // Validate question position
  if (session && questionPosition > session.metadata.numQuestions) {
    return { error: 'Invalid questionPosition' };
  }
  // Check if the provided questionPosition matches the current question in the session
  if (session?.atQuestion !== questionPosition) {
    return { error: 'Session is not up at that question position' };
  }
  // Check for duplicate answer IDs
  if (new Set(answerArray).size !== answerArray.length) {
    return { error: 'Duplicate answerIds' };
  }
  // Validate each submitted answer ID
  const questionArray = session.metadata.questions;
  for (const submittedAnswerId of answerArray) {
    let answerExists = false;
    // Check if the submitted answer ID exists in the current question's answers
    for (const answer of questionArray[questionPosition - 1].answers) {
      if (answer.answerId === submittedAnswerId) {
        answerExists = true;
      }
    }
    // Return an error if at least one submitted answer ID is invalid
    if (answerExists === false) {
      return { error: 'At least one invalid answerId' };
    }
  }
  // Check if at least one answer ID has been submitted
  if (answerArray.length <= 0) {
    return { error: 'No answerIds have been submitted' };
  }
}
/**
 * Generates a unique session ID by randomly selecting a number not present in the existing session IDs array.
 *
 * @returns {number} - A unique session ID.
 */
function generateUniqueSessionId(): number {
  // Get the current data object
  const data = getData();
  // Declare a variable to store the generated random number
  let randomNumber: number;
  // Retrieve the existing session IDs array
  const sessionIdArray = data.sessionIds;
  // Generate a random number and ensure its uniqueness
  do {
    randomNumber = Math.floor(Math.random() * 100);
  } while (sessionIdArray.includes(randomNumber));
  // Return the unique session ID
  return randomNumber;
}
