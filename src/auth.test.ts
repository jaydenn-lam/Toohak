import request from 'sync-request-curl';
import { port, url } from './config.json';
import { clear } from './other';
const SERVER_URL = `${url}:${port}`;

describe('adminAuthRegister', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
  });

  test('Working Case', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'William',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data = JSON.parse(res.body.toString());
    expect(data.userId).toStrictEqual(expect.any(Number));
  });

  test('Multiple Working Entries with Unique Identifiers', () => {
    clear();
    const res1 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'williaa@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'William',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data1 = JSON.parse(res1.body.toString());
    expect(data1.userId).toStrictEqual(expect.any(Number));
    const res2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'jayden@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'Jayden',
          nameLast: 'Lam',
        },
        timeout: 100
      }
    );
    const data2 = JSON.parse(res2.body.toString());
    expect(data2.userId).toStrictEqual(expect.any(Number));
    expect(data1.userId).not.toBe(data2.userId);
    expect(data1.token).not.toBe(data2.token);
  });

  test('Duplicate Email Error', () => {
    request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'William',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'William',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: 'Email has already been used' });
  });

  test('Invalid Email Error', () => {
    const res1 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'invalidEmail',
          password: '1234abcd',
          nameFirst: 'William',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data1 = JSON.parse(res1.body.toString());
    expect(data1).toStrictEqual({ error: 'Email is invalid' });
    const res2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: '',
          password: '1234abcd',
          nameFirst: 'William',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data2 = JSON.parse(res2.body.toString());
    expect(data2).toStrictEqual({ error: 'Email is invalid' });
  });

  test('Invalid character in First Name', () => {
    const res1 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'Invalid.',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data1 = JSON.parse(res1.body.toString());
    expect(data1).toStrictEqual({ error: 'First Name contains invalid character/s' });
    const res2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'Invalid()',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data2 = JSON.parse(res2.body.toString());
    expect(data2).toStrictEqual({ error: 'First Name contains invalid character/s' });
  });

  test('First Name too Long Error', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'FirstNameFirstNameFirstNameFirstName',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: 'First Name is too long' });
  });

  test('First Name too Short Error', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'W',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: 'First Name is too short' });
  });

  test('Invalid character in Last Name', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'William Lu',
          nameLast: 'Lu()',
        },
        timeout: 100
      }
    );
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: 'Last Name contains invalid character/s' });
  });

  test('Last Name too long error', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'William Lu',
          nameLast: 'LastNameLastNameLastNameLastName',
        },
        timeout: 100
      }
    );
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: 'Last Name is too long' });
  });

  test('Last Name too short error', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '1234abcd',
          nameFirst: 'William Lu',
          nameLast: 'L',
        },
        timeout: 100
      }
    );
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: 'Last Name is too short' });
  });

  test('Password too short error', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: 'Short12',
          nameFirst: 'William Lu',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: 'Password is too short' });
  });

  test('Password Contains 1 Num + 1 Letter', () => {
    const res1 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: 'NoNumbers',
          nameFirst: 'William Lu',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data1 = JSON.parse(res1.body.toString());
    expect(data1).toStrictEqual({ error: 'Password must contain a number and a letter' });
    const res2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',
      {
        json: {
          email: 'william@unsw.edu.au',
          password: '12345678',
          nameFirst: 'William Lu',
          nameLast: 'Lu',
        },
        timeout: 100
      }
    );
    const data2 = JSON.parse(res2.body.toString());
    expect(data2).toStrictEqual({ error: 'Password must contain a number and a letter' });
  });
});
