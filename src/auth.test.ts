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

function requestAuthDetail(token: string) {
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

  return JSON.parse(res.body.toString());
}

function requestAdminLogout(token: string) {
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
  return JSON.parse(res.body.toString());
}

function requestPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  const res = request (
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

  test('should return new token on successful login', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const loginToken = requestAuthLogin('william@unsw.edu.au', '1234abcd').token;
    expect(loginToken).toEqual(expect.any(String));
    expect(loginToken).not.toEqual(token);
  });

  test('Return an error when the email is invalid', () => {
    requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const error = requestAuthLogin('invalid_email', '1234abcd');
    expect(error).toEqual({ error: 'Invalid email address' });
  });

  test('Return an error for incorrect password', () => {
    requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const error = requestAuthLogin('william@unsw.edu.au', 'incorrectpassword');
    expect(error).toEqual({ error: 'Incorrect password' });
  });
});

describe('adminUserDetail', () => {
  beforeEach(() => {
    request('DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Return user details for a valid authUserId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const userDetail = requestAuthDetail(token);
    const expectedUserDetails = {
      user: {
        email: 'william@unsw.edu.au',
        name: 'William Lu',
        numFailedPasswordsSinceLastLogin: 0,
        numSuccessfulLogins: 1,
        userId: 0,
      }
    };
    expect(userDetail).toEqual(expectedUserDetails);
  });

  test('Return an error for an invalid token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const invalidToken = token + 'Invalid';
    const error = requestAuthDetail(invalidToken);
    expect(error).toEqual({ error: 'Invalid token' });
  });

  test('Test two successful logins', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const loginToken = requestAuthLogin('william@unsw.edu.au', '1234abcd').token;
    const userDetails1 = requestAuthDetail(token);
    const userDetails2 = requestAuthDetail(loginToken);
    const expectedUserDetails = {
      user: {
        userId: 0,
        email: 'william@unsw.edu.au',
        name: 'William Lu',
        numFailedPasswordsSinceLastLogin: 0,
        numSuccessfulLogins: 2
      }
    };
    expect(userDetails1).toEqual(expectedUserDetails);
    expect(userDetails2).toEqual(expectedUserDetails);
  });

  test('Test one unsuccessful login', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    requestAuthLogin('william@unsw.edu.au', 'IncorrectPassword');
    const userDetail = requestAuthDetail(token);
    const expectedUserDetails = {
      user: {
        email: 'william@unsw.edu.au',
        name: 'William Lu',
        numFailedPasswordsSinceLastLogin: 1,
        numSuccessfulLogins: 1,
        userId: 0,
      }
    };
    expect(userDetail).toEqual(expectedUserDetails);
  });

  test('Test unsuccessful login reset on success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    requestAuthLogin('william@unsw.edu.au', 'IncorrectPassword');
    const loginToken = requestAuthLogin('william@unsw.edu.au', '1234abcd').token;
    const userDetails1 = requestAuthDetail(token);
    const userDetails2 = requestAuthDetail(loginToken);
    const expectedUserDetails = {
      user: {
        email: 'william@unsw.edu.au',
        name: 'William Lu',
        numFailedPasswordsSinceLastLogin: 0,
        numSuccessfulLogins: 2,
        userId: 0,
      }
    };
    expect(userDetails1).toEqual(expectedUserDetails);
    expect(userDetails2).toEqual(expectedUserDetails);
  });
});

describe('adminAuthLogout', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Working Case', () => {
    const registerToken = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const loginToken = requestAuthLogin('william@unsw.edu.au', '1234abcd').token;
    const adminLogout1 = requestAdminLogout(registerToken);
    const adminLogout2 = requestAdminLogout(loginToken);
    expect(adminLogout1).toEqual({});
    expect(adminLogout2).toEqual({});
  });

  test('Token is empty', () => {
    const emptyToken = '';
    const adminLogout1 = requestAdminLogout(emptyToken);
    expect(adminLogout1).toEqual({ error: 'invalid token' });
  });

  test('Token is invalid', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const invalidToken = token + 'Invalid';
    const loginToken = requestAuthLogin('william@unsw.edu.au', '1234abcd').token;
    const invalidToken2 = loginToken + 'Invalid';
    const adminLogout1 = requestAdminLogout(invalidToken);
    const adminLogout2 = requestAdminLogout(invalidToken2);
    expect(adminLogout1).toEqual({ error: 'invalid token' });
    expect(adminLogout2).toEqual({ error: 'invalid token' });
  });
});

describe('userPasswordUpdate', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Invalid Token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const invalidToken = token + 'Invalid';
    const invalidError = requestPasswordUpdate(invalidToken, '1234abcd', 'NewPassword123');
    const blankError = requestPasswordUpdate('', '1234abcd', 'NewPassword123');

    expect(invalidError).toStrictEqual({ error: 'Invalid Token' });
    expect(blankError).toStrictEqual({ error: 'Invalid Token' });
  });

  test('Incorrect Old Password ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const error = requestPasswordUpdate(token, 'IncorrectPassword123', 'NewPassword123');
    expect(error).toStrictEqual({ error: 'Password is incorrect' });
  });

  test('Old Password = New Password ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const error = requestPasswordUpdate(token, '1234abcd', '1234abcd');
    expect(error).toStrictEqual({ error: 'New password cannot be the same as the old password' });
  });

  test('New Password Previously Used ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    requestPasswordUpdate(token, '1234abcd', 'NewPassword123');
    const error = requestPasswordUpdate(token, 'NewPassword123', '1234abcd');
    expect(error).toStrictEqual({ error: 'New password cannot be the same as a past password' });
  });

  test('New Password is too short ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const error = requestPasswordUpdate(token, '1234abcd', 'Short12');
    expect(error).toStrictEqual({ error: 'New password is too short' });
  });

  test('Invalid new password ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').token;
    const numberError = requestPasswordUpdate(token, '1234abcd', 'NoNumbers');
    const letterError = requestPasswordUpdate(token, '1234abcd', '12345678');

    expect(numberError).toStrictEqual({ error: 'New password must contain at least 1 number and 1 letter' });
    expect(letterError).toStrictEqual({ error: 'New password must contain at least 1 number and 1 letter' });
  });
});
