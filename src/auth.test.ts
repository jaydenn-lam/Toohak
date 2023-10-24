import request from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;


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

  return JSON.parse(res.body.toString());
}

function requestAuthLogin(email: string, password: string) {

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

  return JSON.parse(res.body.toString());
}

describe('adminAuthRegister', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Working Case', () => {
    const authUserId = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    expect(authUserId).toStrictEqual(expect.any(String));
  });

  test('Multiple Working Entries with Unique Identifiers', () => {
    const authUserId1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    expect(authUserId1).toStrictEqual(expect.any(String));

    const authUserId2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').token;
    expect(authUserId2).toStrictEqual(expect.any(String));

    expect(authUserId1).not.toBe(authUserId2);
  });

  test('Duplicate Email Error', () => {
    requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    expect(error).toStrictEqual({ error: 'Email has already been used' });
  });

  test('Invalid Email Error', () => {
    const error1 = requestAuthRegister('InvalidEmail', '1234abcd', 'William', 'Lu');
    expect(error1).toStrictEqual({ error: 'Email is invalid' });

    const error2 = requestAuthRegister('', '1234abcd', 'William', 'Lu');
    expect(error2).toStrictEqual({ error: 'Email is invalid' });
  });

  test('Invalid character in First Name', () => {
    const error1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'Invalid!', 'Lu');
    expect(error1).toStrictEqual({ error: 'First Name contains invalid character/s' });

    const error2 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'Invalid()', 'Lu');
    expect(error2).toStrictEqual({ error: 'First Name contains invalid character/s' });
  });

  test('First Name too Long Error', () => {
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'FirstNameFirstNameFirstName', 'Lu');
    expect(error).toStrictEqual({ error: 'First Name is too long' });
  });

  test('First Name too Short Error', () => {
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'W', 'Lu');
    expect(error).toStrictEqual({ error: 'First Name is too short' });
  });

  test('Invalid character in Last Name', () => {
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Invalid!');
    expect(error).toStrictEqual({ error: 'Last Name contains invalid character/s' });
  });

  test('Last Name too long error', () => {
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'LastNameLastNameLastNameLastName');
    expect(error).toStrictEqual({ error: 'Last Name is too long' });
  });

  test('Last Name too short error', () => {
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'L');
    expect(error).toStrictEqual({ error: 'Last Name is too short' });
  });

  test('Password too short error', () => {
    const error = requestAuthRegister('william@unsw.edu.au', 'Short12', 'William', 'Lu');
    expect(error).toStrictEqual({ error: 'Password is too short' });
  });

  test('Password Contains 1 Num + 1 Letter', () => {
    const error1 = requestAuthRegister('william@unsw.edu.au', 'NoNumbers', 'William', 'Lu');
    expect(error1).toStrictEqual({ error: 'Password must contain a number and a letter' });

    const error2 = requestAuthRegister('william@unsw.edu.au', '12345678', 'William', 'Lu');
    expect(error2).toStrictEqual({ error: 'Password must contain a number and a letter' });
  });
});
describe('adminAuthLogin', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('should return authUserId on successful login', () => {
    const registrationResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'anita@unsw.edu.au',
          password: 'password123',
          nameFirst: 'Anita',
          nameLast: 'Byun',
        },
      }
    );
    const registrationData = JSON.parse(registrationResponse.body.toString());
    expect(registrationData.userId).toEqual(expect.any(Number));

    const loginResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'anita@unsw.edu.au',
          password: 'password123',
        }),
      }
    );
    const returnedUserId = JSON.parse(loginResponse.body.toString()).authUserId;
    expect(returnedUserId).toEqual(registrationData.authUserId);
  });

  test('Return an error when the email is invalid', () => {
    const registrationResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'anita@unsw.edu.au',
          password: 'password123',
          nameFirst: 'Anita',
          nameLast: 'Byun',
        },
      }
    );
    const registrationData = JSON.parse(registrationResponse.body.toString());
    expect(registrationData.userId).toEqual(expect.any(Number));

    const loginResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid_email',
          password: 'password123',
        }),
      }
    );
    const data = JSON.parse(loginResponse.body.toString());
    expect(data).toStrictEqual({ error: 'Invalid email address' });
  });

  test('Return an error for incorrect password', () => {
    const registrationResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'anita@unsw.edu.au',
          password: 'password123',
          nameFirst: 'Anita',
          nameLast: 'Byun',
        },
      }
    );
    const registrationData = JSON.parse(registrationResponse.body.toString());
    expect(registrationData.userId).toEqual(expect.any(Number));

    const loginResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'anita@unsw.edu.au',
          password: 'incorrectpassword',
        }),
      }
    );

    const data = JSON.parse(loginResponse.body.toString());
    expect(data).toStrictEqual({ error: 'Incorrect password' });
  });
});

describe('adminUserDetail', () => {
  beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear');
  });

  test('Return user details for a valid authUserId', () => {
    const registrationResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'anita@unsw.edu.au',
          password: 'password123',
          nameFirst: 'Anita',
          nameLast: 'Byun',
        },
      }
    );

    const registrationData = JSON.parse(registrationResponse.body.toString());
    const userId = registrationData.userId;
    const res = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',
      {
        qs: { userId: userId },
      }
    );
    const data = JSON.parse(res.body.toString());

    const expectedUserDetails = {
      user: {
        email: 'anita@unsw.edu.au',
        name: 'Anita Byun',
        numFailedPasswordsSinceLastLogin: 0,
        numSuccessfulLogins: 1,
        userId: 0,
      }
    };

    expect(data).toEqual(expectedUserDetails);
  });

  test('Return an error for an invalid authUserId', () => {
    const registrationResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'anita@unsw.edu.au',
          password: 'password123',
          nameFirst: 'Anita',
          nameLast: 'Byun',
        },
      }
    );

    const registrationData = JSON.parse(registrationResponse.body.toString());
    const userId = registrationData.userId;

    const res = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',
      {
        qs: { userId: userId + 1 },
      }
    );
    const data = JSON.parse(res.body.toString());
    expect(data).toEqual({ error: 'Invalid authUserId' });
  });

  test('Test two successful logins', () => {
    const registrationResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'William',
          nameLast: 'Lu',
        },
      }
    );

    const registrationData = JSON.parse(registrationResponse.body.toString());
    const userId = registrationData.userId;
    expect(userId).toEqual(expect.any(Number));

    const loginResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'william@unsw.edu.au',
          password: '1234abcd',
        }),
      }
    );
    const returnedUserId = JSON.parse(loginResponse.body.toString()).userId;
    expect(returnedUserId).toEqual(userId);
    const res = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',
      {
        qs: { userId: userId },
      }
    );
    const data = JSON.parse(res.body.toString());

    const expectedUserDetails = {
      user: {
        email: 'william@unsw.edu.au',
        name: 'William Lu',
        numFailedPasswordsSinceLastLogin: 0,
        numSuccessfulLogins: 2,
        userId: userId,
      }
    };

    expect(data).toEqual(expectedUserDetails);
  });

  test('Test one unsuccessful login', () => {
    const registrationResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'William',
          nameLast: 'Lu',
        },
      }
    );

    const registrationData = JSON.parse(registrationResponse.body.toString());
    const userId = registrationData.userId;
    expect(userId).toEqual(expect.any(Number));

    const loginResponse = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'william@unsw.edu.au',
          password: '1234abcde',
        }),
      }
    );
    const errorResponse = JSON.parse(loginResponse.body.toString());
    expect(errorResponse).toStrictEqual({ error: 'Incorrect password' });
    const res = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',
      {
        qs: { userId: userId },
      }
    );
    const data = JSON.parse(res.body.toString());

    const expectedUserDetails = {
      user: {
        email: 'william@unsw.edu.au',
        name: 'William Lu',
        numFailedPasswordsSinceLastLogin: 1,
        numSuccessfulLogins: 1,
        userId: userId,
      }
    };

    expect(data).toEqual(expectedUserDetails);
  });

  test('Test unsuccessful login reset on success', () => {
    const registrationData = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const userId = registrationData.userId;
    expect(userId).toEqual(expect.any(Number));

    const errorResponse = requestAuthLogin('william@unsw.edu.au', '1234abcde');
    expect(errorResponse).toStrictEqual({ error: 'Incorrect password' });

    const res1 = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',
      {
        qs: { userId: userId },
      }
    );
    const data1 = JSON.parse(res1.body.toString());

    const expectedUserDetails1 = {
      user: {
        email: 'william@unsw.edu.au',
        name: 'William Lu',
        numFailedPasswordsSinceLastLogin: 1,
        numSuccessfulLogins: 1,
        userId: userId,
      }
    };

    expect(data1).toEqual(expectedUserDetails1);

    const returnedUserId = requestAuthLogin('william@unsw.edu.au', '1234abcd').userId;
    expect(returnedUserId).toEqual(userId);

    const res2 = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',
      {
        qs: { userId: userId },
      }
    );
    const data2 = JSON.parse(res2.body.toString());

    const expectedUserDetails2 = {
      user: {
        email: 'william@unsw.edu.au',
        name: 'William Lu',
        numFailedPasswordsSinceLastLogin: 0,
        numSuccessfulLogins: 2,
        userId: userId,
      }
    };

    expect(data2).toEqual(expectedUserDetails2);
  });
});
