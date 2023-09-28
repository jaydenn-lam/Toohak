import { clear } from './other.js';
import { getData } from './dataStore.js';

describe("Clear Test", () => {
  test("Successful clear", () => {
    clear();
    expect(getData()).toStrictEqual({users: [], quizzes: [],});
  })
});
