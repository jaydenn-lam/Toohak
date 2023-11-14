import { getData, setData } from './dataStore';
import { error } from './auth';

function generatePlayerId(existingIds: number[]): number {
  let playerId: number;
  do {
    playerId = Math.floor(Math.random() * 9000) + 1000;
  } while (existingIds.includes(playerId));
  return playerId;
}

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
  return data.quizSessions.find(session =>
    session.playerIds.includes(playerId)
  );
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
        if (!existingSession.playerIds) {
          existingSession.playerIds = [];
        }
        playerId = generatePlayerId(existingSession.playerIds);
        existingSession.playerIds.push(playerId);
      }
    }
  }
  setData(data);
  return { playerId: playerId };
}

export function playerStatus(playerId: number): object | error {
  const quizSession = getSessionWithPlayer(playerId);
  if (quizSession) {
    return {
      state: quizSession.state,
      numQuestions: quizSession.metadata.numQuestions,
      atQuestion: quizSession.atQuestion
    };
  } else {
    return { error: 'Player ID does not exist.' };
  }
}
