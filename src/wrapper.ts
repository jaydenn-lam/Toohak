import request from 'sync-request-curl';
import config from './config.json';

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

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
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

export function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/login',
    {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestAuthDetail(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/user/details',
    {
      qs: {
        token
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestAdminLogout(token: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/logout',
    {
      json: {
        token
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/password',
    {
      json: {
        token,
        oldPassword,
        newPassword
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/details',
    {
      json: {
        token,
        email,
        nameFirst,
        nameLast
      },
      timeout: 100
    });

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestQuizCreate(token: string, name: string, description: string) {
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

export function requestQuizList(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/list',
    {
      qs: {
        token
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestQuizDescriptionUpdate(token: string, description: string, quizId: number) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/quiz/' + quizId + '/description',
    {
      json: {
        token,
        description
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestQuizInfo(token: string, quizId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/' + quizId,
    {
      qs: {
        token,
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestQuizRemove(token: string, quizId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}`,
    {
      qs: {
        token,
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestadminQuizRestore(token: string, quizId: number) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/restore`,
    {
      json: {
        token,
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestQuiznameUpdate(token: string, quizId: number, name: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/quiz/' + quizId + '/name',
    {
      json: {
        token,
        name
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestQuizViewTrash(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/trash',
    {
      qs: {
        token
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestTrashEmpty(token: string, quizzesArray: number[]) {
  const quizIds = JSON.stringify(quizzesArray);
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/admin/quiz/trash/empty',
    {
      qs: {
        token,
        quizIds
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestQuestionCreate(token: string, quizId: number, questionBody: questionBodyType) {
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

export function requestQuestionMove(token: string, quizId: number, questionId: number, newPosition: number) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/quiz/' + quizId + '/question/' + questionId + '/move',
    {
      json: {
        token,
        newPosition,
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestadminQuizTransfer(token: string, quizId: number, userEmail: string) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        userEmail,
      }),
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestQuestionDelete(token: string, quizId: number, questionId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/admin/quiz/' + quizId + '/question/' + questionId,
    {
      qs: {
        token
      },
      timeout: 100
    }
  );

  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestQuestionDuplicate(token: string, quizId: number, questionId: number) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      json: {
        token,
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestQuestionUpdate(token: string, quizId: number, questionBody: questionBodyType, questionId: number) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/quiz/' + quizId + '/question/' + questionId,
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

export function requestSessionStart(token: string, quizId:number, autoStartNum: number) {
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

export function requestSessionsView(token: string, quizId: number) {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/sessions`,
    {
      headers: {
        token,
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestSessionUpdate(token: string, quizId: number, sessionId: number, action: string) {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: {
        token,
      },
      json: {
        action,
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestSessionStatus(token: string, quizId: number, sessionId: number) {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: {
        token,
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestPlayerJoin(sessionId: number, name: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/player/join',
    {
      json: {
        sessionId,
        name
      },
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}

export function requestPlayerStatus(playerId: number) {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}`,
    {
      json: {},
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}
export function requestPlayerQuestionInfo(playerId: number, questionPosition: number) {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}/question/${questionPosition}`,
    {
      json: {},
      timeout: 100
    }
  );
  return { status: res.statusCode, body: JSON.parse(res.body.toString()) };
}
