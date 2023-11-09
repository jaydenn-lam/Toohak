import { getData, setData, trash, Question, Answer } from './dataStore';
import { quizIdExists, findUserId, findUser, tokenExists } from './other';

function adminSessionStart(token: string, quizId: number, autoStartNum: number) {
  return {};
}

export { adminSessionStart };
