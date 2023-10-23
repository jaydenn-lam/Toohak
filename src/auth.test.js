/*
import { adminUserDetails, adminAuthRegister, adminAuthLogin } from './auth';
import { clear } from './other';

describe('adminAuthRegister', () => {
  beforeEach(() => {
    clear();
  });

  test('Working Entry', () => {
    const authUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu');
    expect(authUserId).toStrictEqual({ authUserId: expect.any(Number) });
  });

  test('Multiple Working Entries', () => {
    const authUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu');
    expect(authUserId).toStrictEqual({ authUserId: expect.any(Number) });
    const authUserId2 = adminAuthRegister('williaam@unsw.edu.au', '1234abcd',
      'William', 'Lu');
    expect(authUserId2).toStrictEqual({ authUserId: expect.any(Number) });
  });

  test('Duplicate Email Error', () => {
    adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu');
    const authUserId2 = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu');
    expect(authUserId2).toStrictEqual({ error: 'Email has already been used' });
  });

  test('Invalid Email Error', () => {
    const authUserId1 = adminAuthRegister('will', '1234abcd', 'William', 'Lu');
    expect(authUserId1).toStrictEqual({ error: 'Email is invalid' });
    const authUserId2 = adminAuthRegister('', '1234abcd', 'William', 'Lu');
    expect(authUserId2).toStrictEqual({ error: 'Email is invalid' });
  });

  test.each([
    ['william@unsw.edu.au', '1234abcd', 'William.', 'Lu',
      { error: 'First Name contains invalid character/s' }],
    ['william@unsw.edu.au', '1234abcd', 'William1', 'Lu',
      { error: 'First Name contains invalid character/s' }],
    ['william@unsw.edu.au', '1234abcd', 'William()', 'Lu',
      { error: 'First Name contains invalid character/s' }],
  ])('Invalid Character in First Name Error', (email, pw, firstName,
    lastName, expected) => {
    expect(adminAuthRegister(email, pw, firstName, lastName)).toEqual(expected);
  });

  test('First Name too Long Error', () => {
    const authUserId1 = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'WilliamWilliamWilliam', 'Lu');
    expect(authUserId1).toStrictEqual({ error: 'First Name is too long' });
  });

  test('First Name too Short Error', () => {
    const authUserId1 = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'W', 'Lu');
    expect(authUserId1).toStrictEqual({ error: 'First Name is too short' });
  });

  test.each([
    ['william@unsw.edu.au', '1234abcd', 'William', 'Lu1',
      { error: 'Last Name contains invalid character/s' }],
    ['william@unsw.edu.au', '1234abcd', 'William', 'Lu()',
      { error: 'Last Name contains invalid character/s' }]
  ])('Invalid Character in Last Name Error', (email, pw, firstName,
    lastName, expected) => {
    expect(adminAuthRegister(email, pw, firstName, lastName)).toEqual(expected);
  });

  test('Last Name too Long Error', () => {
    const authUserId1 = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lululululululululululu');
    expect(authUserId1).toStrictEqual({ error: 'Last Name is too long' });
  });

  test('Last Name too Short Error', () => {
    const authUserId1 = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'L');
    expect(authUserId1).toStrictEqual({ error: 'Last Name is too short' });
  });

  test('Password too Short Error', () => {
    const authUserId1 = adminAuthRegister('william@unsw.edu.au', '1234567',
      'William', 'Lu');
    expect(authUserId1).toStrictEqual({ error: 'Password is too short' });
    const authUserId2 = adminAuthRegister('williaam@unsw.edu.au', '',
      'William', 'Lu');
    expect(authUserId2).toStrictEqual({ error: 'Password is too short' });
  });

  test("Password Doesn't Contain 1 Number or 1 Letter", () => {
    const authUserId1 = adminAuthRegister('william@unsw.edu.au', 'password',
      'William', 'Lu');
    expect(authUserId1).toStrictEqual({
      error:
        'Password must contain a number and a letter'
    });
    const authUserId2 = adminAuthRegister('williaam@unsw.edu.au', '12345678',
      'William', 'Lu');
    expect(authUserId2).toStrictEqual({
      error:
        'Password must contain a number and a letter'
    });
  });
});

describe('adminAuthLogin', () => {
  beforeEach(() => {
    clear();
  });
  test('should return authUserId on successful login', () => {
    const authUserId = adminAuthRegister('anita@unsw.edu.au', 'password123', 'Anita', 'Byun');
    const returnedUserId = adminAuthLogin('anita@unsw.edu.au', 'password123');
    expect(returnedUserId).toEqual(authUserId);
  });

  test('Return an error when the email is invalid', () => {
    const authResult = adminAuthLogin('invalid_email', 'password123');
    expect(authResult).toEqual({ error: 'Invalid email address' });
  });

  test('Return an error for incorrect password', () => {
    adminAuthRegister('anita@unsw.edu.au', 'password123', 'Anita', 'Byun');
    const authResult = adminAuthLogin('anita@unsw.edu.au', 'wrongpassword');
    expect(authResult).toEqual({ error: 'Incorrect password' });
  });
});

describe('adminUserDetails', () => {
  beforeEach(() => {
    clear();
  });

  test('Return user details for a valid authUserId', () => {
    const authUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    const userDetails = adminUserDetails(authUserId);
    expect(userDetails).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'William Lu',
        email: 'william@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('Return an error for an invalid authUserId', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu');
    const userDetails = adminUserDetails(userId + 1);
    expect(userDetails).toEqual({ error: 'Invalid authUserId' });
  });

  test('Test two successful logins', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu');
    adminAuthLogin('william@unsw.edu.au', '1234abcd');
    const userDetails = adminUserDetails(userId);
    expect(userDetails).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'William Lu',
        email: 'william@unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('Test one unsuccessful login', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu');
    adminAuthLogin('william@unsw.edu.au', '123abcd');
    const userDetails = adminUserDetails(userId);
    expect(userDetails).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'William Lu',
        email: 'william@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 1,
      },
    });
  });
  test('Test unsuccessful login reset on success', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd',
      'William', 'Lu');
    adminAuthLogin('william@unsw.edu.au', '123abcd');
    const userDetails = adminUserDetails(userId);
    expect(userDetails).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'William Lu',
        email: 'william@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 1,
      },
    });

    adminAuthLogin('william@unsw.edu.au', '1234abcd');
    const userDetails2 = adminUserDetails(userId);
    expect(userDetails2).toEqual({
      user: {
        userId: expect.any(Number),
        name: 'William Lu',
        email: 'william@unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });
});
*/