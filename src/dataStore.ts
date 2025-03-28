import fs from 'fs';

export enum state {
  'LOBBY',
  'QUESTION_COUNTDOWN',
  'QUESTION_OPEN',
  'QUESTION_CLOSE',
  'ANSWER_SHOW',
  'FINAL_RESULTS',
  'END'
}

export enum action {
  'NEXT_QUESTION',
  'SKIP_COUNTDOWN',
  'GO_TO_ANSWER',
  'GO_TO_FINAL_RESULTS',
  'END'
}

interface Answer {
  answerId: number;
  answer: string;
  correct: boolean;
  colour: string;
}

export interface Question {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
  correctPlayers?: playerProfile[];
  incorrectPlayers?: playerProfile[];
  nonSubmissionPlayers?: playerProfile[];
  timeQuestionOpened?: number;
  answerOrder?: number[]
}

export interface quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  userId: number;
  numQuestions: number;
  questions: Question[];
  duration: number;
  thumbnail: string;
}

interface message {
  messageBody: string,
  playerId: number,
  playerName: string,
  timeSent: number
}

interface questionResult {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface playerProfile {
  name: string;
  playerId: number;
  score: number;
  lastSubmittedAnswer: number[];
  submissionTime: number;
  rank: number;
}

export interface quizSession {
  sessionId: number;
  state: string;
  atQuestion: number;
  players: string[];
  playerProfiles: playerProfile[];
  ownerId: number,
  metadata: quiz;
  messages: message[];
  totalUpdates: number;
  autoStartNum: number;
  questionResults: questionResult[];
}

interface user {
  userId: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  numFailedPasswordsSinceLastLogin: number;
  numSuccessfulLogins: number;
  pastPasswords: string[];
  trash: quiz[];
}

interface token {
  token: string;
  userId: number;
}

interface trashQuiz {
  quizId: number;
  name: string;
}

interface trash {
  quizzes: trashQuiz[];
}

interface dataStore {
  users: user[];
  quizzes: quiz[];
  tokens: token[];
  quizSessions: quizSession[];
  currentUserId: number;
  currentQuizId: number;
  currentQuestionId: number;
  currentAnswerId: number;
  sessionIds: number[];
  currentPlayerId: number;
}

// YOU SHOULD MODIFY THIS OBJECT BELOW
let data: dataStore = {
  users: [],
  quizzes: [],
  tokens: [],
  quizSessions: [],
  currentUserId: 0,
  currentQuizId: 0,
  currentQuestionId: 0,
  currentAnswerId: 0,
  sessionIds: [],
  currentPlayerId: 0,
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): dataStore {
  const json = fs.readFileSync('./data.json');
  const newData = JSON.parse(String(json));
  return newData;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataStore) {
  data = newData;
  const savedData = JSON.stringify(data);
  fs.writeFileSync('./data.json', savedData);
  return {};
}

export { getData, setData, token, trash, trashQuiz, Answer, user, questionResult };
