import fs from 'fs';

export enum state {
  LOBBY = 'lobby',
  QUESTION_COUNTDOWN = 'question_countdown',
  QUESTION_OPEN = 'question_open',
  QUESTION_CLOSE = 'question_close',
  ANSWER_SHOW = 'answer_show',
  FINAL_RESULTS = 'final_results',
  END = 'end'
}

interface Answer {
  answerId: number;
  answer: string;
  correct: boolean;
  colour: string;
}

interface Question {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
}

interface quiz {
  quizId: number;
  name: string;
  TimeCreated: number;
  TimeLastEdited: number;
  Description: string;
  userId: number;
  numQuestions: number;
  questions: Question[];
  duration: number;
}

export interface quizSession {
  sessionId: number;
  state: state;
  players: string[];
  metadata: quiz;
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
  currentSessionId: number;
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
  currentSessionId: 0,
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

export { getData, setData, token, trash, trashQuiz, Question, Answer, quiz, user };
