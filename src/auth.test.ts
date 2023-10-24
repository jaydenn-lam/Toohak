import request from 'sync-request-curl';
import { port, url } from './config.json';
import { clear } from './other';
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

describe('adminAuthRegister', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Working Case', () => {
    const authUserId = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').userId
    expect(authUserId).toStrictEqual(expect.any(Number));
  });

  test('Multiple Working Entries with Unique Identifiers', () => {
    const authUserId1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').userId
    expect(authUserId1).toStrictEqual(expect.any(Number));

    const authUserId2 = requestAuthRegister('jayden@unsw.edu.au', '1234abcd', 'Jayden', 'Lam').userId
    expect(authUserId2).toStrictEqual(expect.any(Number));

    expect(authUserId1).not.toBe(authUserId2);
  });

  test('Duplicate Email Error', () => {
    requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu').userId
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu')
    expect(error).toStrictEqual({ error: 'Email has already been used' });
  });

  test('Invalid Email Error', () => {
    const error1 = requestAuthRegister('InvalidEmail', '1234abcd', 'William', 'Lu')
    expect(error1).toStrictEqual({ error: 'Email is invalid' });

    const error2 = requestAuthRegister('', '1234abcd', 'William', 'Lu')
    expect(error2).toStrictEqual({ error: 'Email is invalid' });
  });

  test('Invalid character in First Name', () => {
    const error1 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'Invalid!', 'Lu')
    expect(error1).toStrictEqual({ error: 'First Name contains invalid character/s' });

    const error2 = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'Invalid()', 'Lu')
    expect(error2).toStrictEqual({ error: 'First Name contains invalid character/s' });
  });  

  test('First Name too Long Error', () => {
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'FirstNameFirstNameFirstName', 'Lu')
    expect(error).toStrictEqual({ error: 'First Name is too long' });
  });

  test('First Name too Short Error', () => {
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'W', 'Lu')
    expect(error).toStrictEqual({ error: 'First Name is too short' });
  });

  test('Invalid character in Last Name', () => {
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Invalid!')
    expect(error).toStrictEqual({ error: 'Last Name contains invalid character/s' });
  });

  test('Last Name too long error', () => {
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'LastNameLastNameLastNameLastName')
    expect(error).toStrictEqual({ error: 'Last Name is too long' });
  });

  test('Last Name too short error', () => {
    const error = requestAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'L')
    expect(error).toStrictEqual({ error: 'Last Name is too short' });
  });

  test('Password too short error', () => {
    const error = requestAuthRegister('william@unsw.edu.au', 'Short12', 'William', 'Lu')
    expect(error).toStrictEqual({ error: 'Password is too short' });
  });

  test('Password Contains 1 Num + 1 Letter', () => {
    const error1 = requestAuthRegister('william@unsw.edu.au', 'NoNumbers', 'William', 'Lu')
    expect(error1).toStrictEqual({ error: 'Password must contain a number and a letter' });

    const error2 = requestAuthRegister('william@unsw.edu.au', '12345678', 'William', 'Lu')
    expect(error2).toStrictEqual({ error: 'Password must contain a number and a letter' });
  });
});
