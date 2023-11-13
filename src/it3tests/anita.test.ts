test('Filler', () => {
    expect(1).toBe(1);
  });
   import request from 'sync-request-curl';
  import config from '../config.json';
  import { requestAuthRegister, requestQuizCreate, requestQuestionCreate, requestAdminLogout, requestSessionStart, requestSessionUpdate, requestSessionStatus
    , requestSessionsView, requestQuizInfo, requestPlayerJoin, requestPlayerStatus } from '../wrapper';
   const port = config.port;
  const url = config.url;
  const SERVER_URL = `${url}:${port}`;
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
   beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });
  describe('Post player join', () => {
    test('successful join', () => {
        const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
        const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
        requestQuestionCreate(token, quizId, questionbody);
        const quizInfo = requestQuizInfo(token, quizId);
        const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
        const response1 = requestSessionStatus(token, quizId, sessionId);
        const statusCode1 = response1.status;
        expect(statusCode1).toStrictEqual(200);
        const body1 = response1.body;
        expect(body1).toStrictEqual({
            state: "LOBBY",
            atQuestion: 1,
            players: [],
            metadata: quizInfo,
        });
        const response2 = requestPlayerJoin(sessionId, 'Hayden Smith');
        const statusCode2 = response2.status;
        expect(statusCode2).toStrictEqual(200);
        const body2 = response2.body;
        expect(body2).toStrictEqual({playerId: expect.any(Number)});
    });
    test('Name of user entered is not unique', () => {
        const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
        const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
        requestQuestionCreate(token, quizId, questionbody);
        const quizInfo = requestQuizInfo(token, quizId);
        const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
        const response1 = requestSessionStatus(token, quizId, sessionId);
        const body1 = response1.body;
        expect(body1).toStrictEqual({
            state: "LOBBY",
            atQuestion: 1,
            players: [],
            metadata: quizInfo,
        });
        const statusCode1 = response1.status;
        expect(statusCode1).toStrictEqual(200);
        const response2 = requestPlayerJoin(sessionId, 'Hayden Smith');
        const statusCode2 = response2.status;
        expect(statusCode2).toStrictEqual(200);
        const body2 = response2.body;
        expect(body2).toStrictEqual({playerId: expect.any(Number)});
        const response3 = requestPlayerJoin(sessionId, 'Hayden Smith');
        const statusCode3 = response3.status;
        expect(statusCode3).toStrictEqual(400);
        const body3 = response3.body;
        expect(body3).toStrictEqual({error: "Player with same name has already joined session!"});
        });
 
 
    test('Session is not in LOBBY state', () => {
        const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
        const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
        requestQuestionCreate(token, quizId, questionbody);
        const quizInfo = requestQuizInfo(token, quizId);
        const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
        const response1 = requestSessionStatus(token, quizId, sessionId);
        const body1 = response1.body;
        expect(body1).toStrictEqual({
            state: "LOBBY",
            atQuestion: 1,
            players: [],
            metadata: quizInfo,
        });
        const statusCode1 = response1.status;
        expect(statusCode1).toStrictEqual(200);
        requestSessionUpdate(token, quizId, sessionId, 'END');
        const state = requestSessionStatus(token, quizId, sessionId).body.state;
        expect(state).toStrictEqual('END');
        const response2 = requestPlayerJoin(sessionId, 'Hayden Smith');
        const statusCode2 = response2.status;
        expect(statusCode2).toStrictEqual(400);
        const body2 = response2.body;
        expect(body2).toStrictEqual({
        error: "Session is not in LOBBY state!"});
    });
 });
 
 
 describe('Get player status tests', () => {
    test('Working Case', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
      requestQuestionCreate(token, quizId, questionbody);
      const quizInfo = requestQuizInfo(token, quizId);
      const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
      const response1 = requestSessionStatus(token, quizId, sessionId);
      const body1 = response1.body;
      expect(body1).toStrictEqual({
        state: "LOBBY",
        atQuestion: 1,
        players: [],
        metadata: quizInfo,
      })
      const statusCode1 = response1.status;
      expect(statusCode1).toStrictEqual(200);
      const response2 = requestPlayerJoin(sessionId, 'Hayden Smith');
      const statusCode2 = response2.status;
      expect(statusCode2).toStrictEqual(200);
      const body2 = response2.body;
      expect(body2).toStrictEqual({
        playerId: expect.any(Number)
      });
      const response3 = requestPlayerStatus(body2.playerId)
      const statusCode3 = response3.status;
      expect(statusCode3).toStrictEqual(200);
      const body3 = response3.body;
      expect(body3).toStrictEqual({
          state: "LOBBY",
          numQuestions: expect.any(Number),
          atQuestion: expect.any(Number)
      });
    });
    test('Player ID does not exist case', () => {
        const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
        const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId;
        requestQuestionCreate(token, quizId, questionbody);
        const quizInfo = requestQuizInfo(token, quizId);
        const sessionId = requestSessionStart(token, quizId, 2).body.sessionId;
        const response1 = requestSessionStatus(token, quizId, sessionId);
        const body1 = response1.body;
        expect(body1).toStrictEqual({
            state: "LOBBY",
            atQuestion: 1,
            players: [],
            metadata: quizInfo,
        });
        const statusCode1 = response1.status;
        expect(statusCode1).toStrictEqual(200);
        const response2 = requestPlayerJoin(sessionId, 'Hayden Smith');
        const statusCode2 = response2.status;
        expect(statusCode2).toStrictEqual(200);
        const body2 = response2.body;
        expect(body2).toStrictEqual({
        playerId: expect.any(Number)
    });
      const response3 = requestPlayerStatus(body2.playerId+1)
      const statusCode3 = response3.status;
      expect(statusCode3).toStrictEqual(200);
      const body3 = response3.body;
      expect(body3).toStrictEqual({
          state: "LOBBY",
          numQuestions: expect.any(Number),
          atQuestion: expect.any(Number)
        });
    });
 });
 
 
 