import { getData, setData, playerProfile } from './dataStore';
import { error } from './auth';
import { playerSessionFinder } from './will';
import { findSession } from './other';

/**
 * Generates a random name consisting of 5 random characters from the set of uppercase and lowercase letters,
 * followed by 3 random numbers. The function ensures that each character and number is used only once.
 *
 * @returns {string} - A randomly generated name.
 */
function generateRandomName(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  let randomName = '';
  let characterSet = characters;
  let numberSet = numbers;
  // Generate 5 random characters
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characterSet.length);
    randomName += characterSet[randomIndex];
    // Remove the selected character to ensure uniqueness
    characterSet = characterSet.replace(characterSet[randomIndex], '');
  }
  // Generate 3 random numbers
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * numberSet.length);
    randomName += numberSet[randomIndex];
    // Remove the selected number to ensure uniqueness
    numberSet = numberSet.replace(numberSet[randomIndex], '');
  }
  return randomName;
}
/**
 * Checks if a given name is already used by any player in the quiz sessions data.
 *
 * @param {string} name - The name to check for uniqueness.
 * @returns {boolean} - True if the name is found in any quiz session, false otherwise.
 */
function isNameInQuizSessions(name: string): boolean {
  const data = getData();
  return data.quizSessions.some(session =>
    session.players.includes(name)
  );
}
/**
 * Retrieves the quiz session associated with a given player ID.
 *
 * @param {number} playerId - The ID of the player whose associated quiz session is being queried.
 * @returns {object | undefined} - The quiz session object if the player is found, undefined otherwise.
 */
function getSessionWithPlayer(playerId: number) {
  const data = getData();
  let foundSession;
  // Iterate through quiz sessions and player profiles to find the associated session
  for (const session of data.quizSessions) {
    for (const profile of session.playerProfiles) {
      if (profile.playerId === playerId) {
        foundSession = session;
        break;
      }
    }
    if (foundSession) {
      break;
    }
  }
  return foundSession;
}
/**
 * Adds a player to a quiz session, assigning a unique player ID and handling various scenarios.
 *
 * @param {number} sessionId - The ID of the quiz session the player is joining.
 * @param {string} name - The name of the player joining. If an empty string is provided, a random name is generated.
 *
 * @returns {object} - An object containing the assigned player ID if the player successfully joins.
 * @returns {error} - An error object with a message if joining is unsuccessful due to specific conditions:
 *   - 'Player name is not unique.': If the provided player name is already in use within the quiz session.
 *   - 'Session not in LOBBY state.': If the quiz session is not in the LOBBY state.
 */
export function playerJoin(sessionId: number, name: string): object | error {
  const data = getData();
  let playerId;
  // If the provided name is empty generate a random name
  if (name === '') {
    name = generateRandomName();
  } else {
    // check if the name is already in use within the quiz session
    if (isNameInQuizSessions(name)) {
      return { error: 'Player name is not unique.' };
    }
  }
  // iterate through the quiz sessions to find the matching session
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      if (existingSession.state !== 'LOBBY') {
        // Return an error if the session is not in LOBBY state
        return { error: 'Session not in LOBBY state.' };
      } else {
        // Add the player to the session and assign a unique playerId
        existingSession.players.push(name);
        playerId = data.currentPlayerId;
        data.currentPlayerId++;
        // Create a player profile for the newly added player
        const playerProfile: playerProfile = {
          playerId: playerId,
          score: 0,
        };
        // Add the playerProfile to the session
        existingSession.playerProfiles.push(playerProfile);
      }
    }
  }
  // Update the data with the modified quiz session and return the playerId
  setData(data);
  return { playerId: playerId };
}
/**
 * Retrieves the status of a player in a quiz session, providing information such as the session state,
 * the total number of questions, and the current question number.
 *
 * @param {number} playerId - The ID of the player whose status is being queried.
 *
 * @returns {object} - An object containing the player's status if the player exists.
 *   - state: The state of the quiz session the player is in.
 *   - numQuestions: The total number of questions in the quiz session.
 *   - atQuestion: The current question number the player is at.
 * @returns {error} - An error object with a message if the player does not exist.
 *   - 'Player ID does not exist.': If the provided player ID is not found.
 */
export function playerStatus(playerId: number): object | error {
  // Find the quiz session ID associated with the player ID
  const quizSessionId = playerSessionFinder(playerId);
  // Check if the player ID exists
  if (quizSessionId !== 100000) {
  // Retrieve the quiz session based on the quiz session ID
    const session = findSession(quizSessionId);
    // Return an object containing the player's status within the session
    return {
      state: session.state,
      numQuestions: session.metadata.numQuestions,
      atQuestion: session.atQuestion
    };
  } else {
    // return an error if the player ID does not exist
    return { error: 'Player ID does not exist.' };
  }
}
/**
 * Retrieves information about a specific question for a player in a quiz session.
 *
 * @param {number} playerId - The ID of the player whose question information is being queried.
 * @param {number} questionPosition - The position of the question for which information is requested.
 *
 * @returns {object} - An object containing information about the specified question if the player and question are valid.
 *   - question: The content of the question.
 *   - answers: An array of possible answers for the question.
 *   - correctAnswer: The index of the correct answer in the answers array.
 * @returns {error} - An error object with a message if the player or question is not valid.
 *   - 'Question position is not valid for the session this player is in': If the specified question position is invalid.
 *   - 'Session is not currently on this question': If the session is not on the specified question.
 *   - 'Session is in LOBBY or END state': If the session is in LOBBY or END state.
 *   - 'Player ID does not exist': If the provided player ID is not found.
 */
export function playerQuestionInfo(playerId: number, questionPosition: number) {
  // Retrieve the quiz session associated with the player ID
  const quizSession = getSessionWithPlayer(playerId);
  // Retrieve the quiz session associated with the player ID
  if (quizSession) {
  // Check if the specified question position is valid
    if (quizSession.metadata.numQuestions < questionPosition) {
      return { error: 'Question position is not valid for the session this player is in' };
    } else if (quizSession.atQuestion !== questionPosition) {
      return { error: 'Session is not currently on this question' };
    }
    // Check if the session is in LOBBY or END state
    if (quizSession.state === 'LOBBY' || quizSession.state === 'END') {
      return { error: 'Session is in LOBBY or END state' };
    }
  } else {
    // Return an error if the player ID does not exist
    return { error: 'Player ID does not exist' };
  }
  // Return information about the specified question
  return quizSession.metadata.questions[questionPosition - 1];
}
