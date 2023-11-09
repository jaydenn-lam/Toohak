import request from 'sync-request-curl';
import config from '../config.json';

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

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}


function requestQuizCreate(token: string, name: string, description: string) {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',
      {
        json: {
          token,
          name,
          description
        },
        timeout: 100
      }
    );
  
    return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
  }

  function requestQuestionCreate(token: string, quizId: number, questionBody: questionBodyType) {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz/' + quizId + '/question',
      {
        json: {
          token,
          questionBody,
        },
        timeout: 100
      }
    );
    return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
  }

function requestSessionStart(token: string, quizId:number, autoStartNum: number) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/start`,
    {
      headers: {
        token: token
      },
      json: {
        autoStartNum,
      },
      timeout: 100
    }
  );

    return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
  }

  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  describe('POST Session Start', () => {

    const questionbody: questionBodyType = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true,
        },
        {
          answer: 'Choice one',
          correct: false,
        },
        {
          answer: 'Choice two',
          correct: false,
        }
      ]
    };

    test('Invalid Token ERROR', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId
      requestQuestionCreate(token, quizId, questionbody);
      const invalidToken = token + 1
      const response = requestSessionStart(invalidToken, quizId, 2).body.sessionId
      const error = response.body
      expect(error).toStrictEqual({ error: 'Invalid Token' });

      const statusCode = response.status
      expect(statusCode).toStrictEqual(401)
    })

    test('User is not owner of quiz ERROR', () => {
      const token1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const token2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').body.token;
      const quizId = requestQuizCreate(token2, 'Quiz1', 'description').body.quizId
      requestQuestionCreate(token2, quizId, questionbody);
      const response = requestSessionStart(token1, quizId, 2).body.sessionId;
      const error = response.body
      expect(error).toStrictEqual({ error: 'quizId is not owned by user' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(403)
    })

    test('autoStartNum ERROR', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId
      requestQuestionCreate(token, quizId, questionbody);
      const invalidNum = 51;
      const response = requestSessionStart(token, quizId, invalidNum).body.sessionId
      const error = response.body
      expect(error).toStrictEqual({ error: 'autoStartNum cannot be greater than 50' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400)
    });

    test('Quiz has no questions ERROR', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId
      const response = requestSessionStart(token, quizId, 2).body.sessionId
      const error = response.body
      expect(error).toStrictEqual({ error: 'Quiz has no questions' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400)
    })
    
    test('10 Sessions (Non-END state) exist', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId
      requestSessionStart(token, quizId, 2).body.sessionId
      requestSessionStart(token, quizId, 2).body.sessionId
      requestSessionStart(token, quizId, 2).body.sessionId
      requestSessionStart(token, quizId, 2).body.sessionId
      requestSessionStart(token, quizId, 2).body.sessionId
      requestSessionStart(token, quizId, 2).body.sessionId
      requestSessionStart(token, quizId, 2).body.sessionId
      requestSessionStart(token, quizId, 2).body.sessionId
      requestSessionStart(token, quizId, 2).body.sessionId
      requestSessionStart(token, quizId, 2).body.sessionId

      const response = requestSessionStart(token, quizId, 2).body.sessionId
      const error = response.body;
      expect(error).toStrictEqual({ error: 'There are already a maximum of 10 active sessions' });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(400)
    });

    test('Successful Session Start', () => {
      const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
      const quizId = requestQuizCreate(token, 'Quiz1', 'description').body.quizId
      requestQuestionCreate(token, quizId, questionbody);
      const response = requestSessionStart(token, quizId, 2).body.sessionId
      const body = response.body
      expect(body).toStrictEqual({ sessionId: expect.any(Number) });

      const statusCode = response.status;
      expect(statusCode).toStrictEqual(200)
    })
  })