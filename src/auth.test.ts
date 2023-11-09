import request from 'sync-request-curl';
import { port, url } from './config.json';
import { requestAuthRegister, requestAuthLogin, requestAdminLogout, requestAuthDetail, requestDetailsUpdate, requestPasswordUpdate } from './wrapper';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
});

afterEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
});

describe('adminAuthRegister', () => {
  test('Working Case', () => {
    const response = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const authUserId = response.body.token;
    expect(authUserId).toStrictEqual(expect.any(String));

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });

  test('Multiple Working Entries with Unique Identifiers', () => {
    const response = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const authUserId1 = response.body.token;
    expect(authUserId1).toStrictEqual(expect.any(String));

    const response2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam');
    const authUserId2 = response2.body.token;
    expect(authUserId2).toStrictEqual(expect.any(String));

    expect(authUserId1).not.toBe(authUserId2);

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });

  test('Duplicate Email Error', () => {
    requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const response = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Email has already been used' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Invalid Email Error', () => {
    const response = requestAuthRegister('InvalidEmail', '1234abcd', 'William', 'Lu');
    const error1 = response.body;
    expect(error1).toStrictEqual({ error: 'Email is invalid' });

    const statusCode1 = response.status;
    expect(statusCode1).toStrictEqual(400);

    const response2 = requestAuthRegister('', '1234abcd', 'William', 'Lu');
    const error2 = response2.body;
    expect(error2).toStrictEqual({ error: 'Email is invalid' });

    const statusCode2 = response2.status;
    expect(statusCode2).toStrictEqual(400);
  });

  test('Invalid character in First Name', () => {
    const response1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'Invalid!', 'Lu');
    const error1 = response1.body;
    expect(error1).toStrictEqual({ error: 'First Name contains invalid character/s' });

    const statusCode1 = response1.status;
    expect(statusCode1).toStrictEqual(400);

    const response2 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'Invalid()', 'Lu');
    const error2 = response2.body;
    expect(error2).toStrictEqual({ error: 'First Name contains invalid character/s' });

    const statusCode2 = response2.status;
    expect(statusCode2).toStrictEqual(400);
  });

  test('First Name too Long Error', () => {
    const response = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'FirstNameFirstNameFirstName', 'Lu');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'First Name is too long' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('First Name too Short Error', () => {
    const response = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'W', 'Lu');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'First Name is too short' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Invalid character in Last Name', () => {
    const response = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Invalid!');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Last Name contains invalid character/s' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Last Name too long error', () => {
    const response = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'LastNameLastNameLastNameLastName');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Last Name is too long' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Last Name too short error', () => {
    const response = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'L');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Last Name is too short' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Password too short error', () => {
    const response = requestAuthRegister('william@unsw.edu.au', 'Short12', 'William', 'Lu');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Password is too short' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Password Contains 1 Num + 1 Letter', () => {
    const response1 = requestAuthRegister('william@unsw.edu.au', 'NoNumbers', 'William', 'Lu');
    const error1 = response1.body;
    expect(error1).toStrictEqual({ error: 'Password must contain a number and a letter' });

    const statusCode1 = response1.status;
    expect(statusCode1).toStrictEqual(400);

    const response2 = requestAuthRegister('william@unsw.edu.au', '12345678', 'William', 'Lu');
    const error2 = response2.body;
    expect(error2).toStrictEqual({ error: 'Password must contain a number and a letter' });

    const statusCode2 = response2.status;
    expect(statusCode2).toStrictEqual(400);
  });
});

describe('adminAuthLogin', () => {
  test('Returns a new token on successful login', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestAuthLogin('william@unsw.edu.au', '1234abcd');
    const loginToken = response.body.token;
    expect(loginToken).toEqual(expect.any(String));
    expect(loginToken).not.toEqual(token);

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });

  test('Invalid Email ERROR', () => {
    requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const response = requestAuthLogin('invalid_email', '1234abcd');
    const error = response.body;
    expect(error).toEqual({ error: 'Invalid email address' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Return an error for incorrect password', () => {
    requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const response = requestAuthLogin('william@unsw.edu.au', 'incorrectpassword');
    const error = response.body;
    expect(error).toEqual({ error: 'Incorrect password' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });
});

describe('adminUserDetail', () => {
  beforeEach(() => {
    request('DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Return user details for a valid authUserId', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestAuthDetail(token);
    const userDetail = response.body;
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

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });

  test('Return an error for an invalid token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const invalidToken = token + 'Invalid';
    const response = requestAuthDetail(invalidToken);
    const error = response.body;
    expect(error).toEqual({ error: 'Invalid token' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(401);
  });

  test('Test two successful logins', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const loginToken = requestAuthLogin('william@unsw.edu.au', '1234abcd').body.token;
    const response1 = requestAuthDetail(token);
    const userDetails1 = response1.body;
    const response2 = requestAuthDetail(loginToken);
    const userDetails2 = response2.body;
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

    const statusCode1 = response1.status;
    expect(statusCode1).toStrictEqual(200);

    const statusCode2 = response2.status;
    expect(statusCode2).toStrictEqual(200);
  });

  test('Test one unsuccessful login', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestAuthLogin('william@unsw.edu.au', 'IncorrectPassword');
    const response = requestAuthDetail(token);
    const userDetail = response.body;
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

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);
  });

  test('Test unsuccessful login reset on success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestAuthLogin('william@unsw.edu.au', 'IncorrectPassword');
    const loginToken = requestAuthLogin('william@unsw.edu.au', '1234abcd').body.token;
    const response1 = requestAuthDetail(token);
    const userDetails1 = response1.body;
    const response2 = requestAuthDetail(loginToken);
    const userDetails2 = response2.body;
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

    const statusCode1 = response1.status;
    expect(statusCode1).toStrictEqual(200);

    const statusCode2 = response2.status;
    expect(statusCode2).toStrictEqual(200);
  });
});

describe('adminAuthLogout', () => {
  test('Working Case', () => {
    const registerToken = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const loginToken = requestAuthLogin('william@unsw.edu.au', '1234abcd').body.token;
    const registerResponse = requestAdminLogout(registerToken);
    const registerLogout = registerResponse.body;

    const loginResponse = requestAdminLogout(loginToken);
    const loginLogout = loginResponse.body;

    expect(registerLogout).toEqual({});
    expect(loginLogout).toEqual({});

    const statusCode1 = registerResponse.status;
    const statusCode2 = loginResponse.status;
    expect(statusCode1).toStrictEqual(200);
    expect(statusCode2).toStrictEqual(200);
  });

  test('Token is empty', () => {
    const emptyToken = '';
    const response = requestAdminLogout(emptyToken);
    const adminLogout1 = response.body;
    expect(adminLogout1).toStrictEqual({ error: 'Invalid Token' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(401);
  });

  test('Token is invalid', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const invalidToken = token + 'Invalid';
    const registerResponse = requestAdminLogout(invalidToken);
    const registerLogout = registerResponse.body;
    expect(registerLogout).toEqual({ error: 'Invalid Token' });

    const loginToken = requestAuthLogin('william@unsw.edu.au', '1234abcd').body.token;
    const invalidToken2 = loginToken + 'Invalid';
    const loginResponse = requestAdminLogout(invalidToken2);
    const loginLogout = loginResponse.body;
    expect(loginLogout).toEqual({ error: 'Invalid Token' });

    const statusCode1 = registerResponse.status;
    expect(statusCode1).toStrictEqual(401);

    const statusCode2 = loginResponse.status;
    expect(statusCode2).toStrictEqual(401);
  });
});

describe('adminPasswordUpdate', () => {
  test('Invalid Token ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const invalidToken = token + 'Invalid';
    const response = requestPasswordUpdate(invalidToken, '1234abcd', 'NewPassword123');
    const invalidError = response.body;
    const response2 = requestPasswordUpdate('', '1234abcd', 'NewPassword123');
    const blankError = response2.body;

    expect(invalidError).toStrictEqual({ error: 'Invalid Token' });
    expect(blankError).toStrictEqual({ error: 'Invalid Token' });

    const statusCode1 = response.status;
    expect(statusCode1).toStrictEqual(401);
    const statusCode2 = response2.status;
    expect(statusCode2).toStrictEqual(401);
  });

  test('Incorrect Old Password ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestPasswordUpdate(token, 'IncorrectPassword123', 'NewPassword123');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Password is incorrect' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Old Password = New Password ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestPasswordUpdate(token, '1234abcd', '1234abcd');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'New password cannot be the same as the old password' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('New Password Previously Used ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestPasswordUpdate(token, '1234abcd', 'NewPassword123');
    const response = requestPasswordUpdate(token, 'NewPassword123', '1234abcd');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'New password cannot be the same as a past password' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('New Password is too short ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestPasswordUpdate(token, '1234abcd', 'Short12');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'New password is too short' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Invalid new password ERROR', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const numberResponse = requestPasswordUpdate(token, '1234abcd', 'NoNumbers');
    const numberError = numberResponse.body;
    const letterResponse = requestPasswordUpdate(token, '1234abcd', '12345678');
    const letterError = letterResponse.body;

    expect(numberError).toStrictEqual({ error: 'New password must contain at least 1 number and 1 letter' });
    expect(letterError).toStrictEqual({ error: 'New password must contain at least 1 number and 1 letter' });

    const statusCode1 = numberResponse.status;
    expect(statusCode1).toStrictEqual(400);

    const statusCode2 = letterResponse.status;
    expect(statusCode2).toStrictEqual(400);
  });
});

describe('PUT /v1/admin/user/details', () => {
  test('Success', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestDetailsUpdate(token, 'jayden@unsw.edu.au', 'Jayden', 'Lam');
    const body = response.body;
    expect(body).toStrictEqual({});

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(200);

    const details = requestAuthDetail(token).body;
    expect(details).toStrictEqual({
      user: {
        email: 'jayden@unsw.edu.au',
        name: 'Jayden Lam',
        numFailedPasswordsSinceLastLogin: 0,
        numSuccessfulLogins: 1,
        userId: 0,
      }
    });
  });

  test('Invalid Email', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestDetailsUpdate(token, 'INVALIDEMAIL', 'Jayden', 'Lam');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Email is invalid' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Invalid Token', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const invalidToken = token + 'Invalid';
    const response = requestDetailsUpdate(invalidToken, 'jayden@unsw.edu.au', 'Jayden', 'Lam');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Invalid Token' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(401);
  });

  test('Email already being used', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    requestAuthRegister('alreadyused@unsw.edu.au', '1234abcd', 'John', 'Smith');
    const response = requestDetailsUpdate(token, 'alreadyused@unsw.edu.au', 'Jayden', 'Lam');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Email has already been used' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('First name too short', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestDetailsUpdate(token, 'jayden@unsw.edu.au', 'J', 'Lam');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'First Name is too short' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('First name too long', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestDetailsUpdate(token, 'jayden@unsw.edu.au', 'Namethatisveryveryveryveryverylong', 'Lam');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'First Name is too long' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Last name too short', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestDetailsUpdate(token, 'jayden@unsw.edu.au', 'Jayden', 'L');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Last Name is too short' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Last name too long', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestDetailsUpdate(token, 'jayden@unsw.edu.au', 'Jayden', 'Namethatisveryveryveryveryverylong');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Last Name is too long' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('Last name invalid character(s)', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestDetailsUpdate(token, 'jayden@unsw.edu.au', 'Jayden', 'Lam?)(9');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'Last Name contains invalid character/s' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });

  test('First name invalid character(s)', () => {
    const token = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').body.token;
    const response = requestDetailsUpdate(token, 'jayden@unsw.edu.au', 'Jayden?)(9', 'Lam');
    const error = response.body;
    expect(error).toStrictEqual({ error: 'First Name contains invalid character/s' });

    const statusCode = response.status;
    expect(statusCode).toStrictEqual(400);
  });
});

request(
  'DELETE',
  SERVER_URL + '/v1/clear'
);
