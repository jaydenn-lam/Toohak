import { getData, setData, playerProfile } from './dataStore';
import { error } from './auth';
import { playerSessionFinder } from './will';
import { findSession } from './other';

function generateRandomName(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  let randomName = '';
  let characterSet = characters;
  let numberSet = numbers;

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characterSet.length);
    randomName += characterSet[randomIndex];
    characterSet = characterSet.replace(characterSet[randomIndex], '');
  }
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * numberSet.length);
    randomName += numberSet[randomIndex];
    numberSet = numberSet.replace(numberSet[randomIndex], '');
  }
  return randomName;
}

function isNameInQuizSessions(name: string): boolean {
  const data = getData();
  return data.quizSessions.some(session =>
    session.players.includes(name)
  );
}
function getSessionWithPlayer(playerId: number) {
  const data = getData();
  let foundSession;
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

export function playerJoin(sessionId: number, name: string): object | error {
  const data = getData();
  let playerId;
  if (name === '') {
    name = generateRandomName();
  } else {
    if (isNameInQuizSessions(name)) {
      return { error: 'Player name is not unique.' };
    }
  }
  for (const existingSession of data.quizSessions) {
    if (existingSession.sessionId === sessionId) {
      if (existingSession.state !== 'LOBBY') {
        return { error: 'Session not in LOBBY state.' };
      } else {
        existingSession.players.push(name);
        playerId = data.currentPlayerId;
        console.log(playerId + ' YAYA');
        data.currentPlayerId++;
        const playerProfile: playerProfile = {
          playerId: playerId,
          score: 0,
        };
        existingSession.playerProfiles.push(playerProfile);
      }
    }
  }

  setData(data);
  return { playerId: playerId };
}

export function playerStatus(playerId: number): object | error {
  const quizSessionId = playerSessionFinder(playerId);

  if (quizSessionId !== 100000) {
    const session = findSession(quizSessionId);
    return {
      state: session.state,
      numQuestions: session.metadata.numQuestions,
      atQuestion: session.atQuestion
    };
  } else {
    return { error: 'Player ID does not exist.' };
  }
}
export function playerQuestionInfo(playerId: number, questionPosition: number) {
  const quizSession = getSessionWithPlayer(playerId);
  if (quizSession) {
    if (quizSession.metadata.numQuestions < questionPosition) {
      return { error: 'Question position is not valid for the session this player is in' };
    } else if (quizSession.atQuestion !== questionPosition) {
      return { error: 'Session is not currently on this question' };
    }
    if (quizSession.state === 'LOBBY' || quizSession.state === 'END') {
      return { error: 'Session is in LOBBY or END state' };
    }
  } else {
    return { error: 'Player ID does not exist' };
  }
  return quizSession.metadata.questions[questionPosition - 1];
}
