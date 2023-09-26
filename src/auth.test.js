import { adminUserDetails, adminAuthRegister, adminAuthLogin,} from './auth.js';

describe('adminAuthRegister', () => {
    
  test('Working Entry', () => {
    let authUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
  });

  test('Duplicate Email Error', () => {
    let authUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let authUserId2 = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
      expect(authUserId2).toStrictEqual({error: "Email has already been used"});
  });
  
  test('Invalid Email Error', () => {
    let authUserId1 = adminAuthRegister('will', '1234abcd', 'William', "Lu");
      expect(authUserId1).toStrictEqual({error: "Email is invalid"});
    let authUserId2 = adminAuthRegister('', '1234abcd', 'William', "Lu");
      expect(authUserId1).toStrictEqual({error: "Email is invalid"});
  });

  test.each([
    ['william@unsw.edu.au', '1234abcd', 'William.', "Lu", 
    "error: First Name contains invalid character/s"],
    ['william@unsw.edu.au', '1234abcd', 'William1', "Lu", 
    "error: First Name contains invalid character/s"],
    ['william@unsw.edu.au', '1234abcd', 'William()', "Lu", 
    "error: First Name contains invalid character/s"],
  ])('Invalid Character in First Name Error', (email, pw, firstName, 
    lastName, expected) => {
    expect(adminAuthRegister(email,pw,firstName,lastName)).toEqual(expected) 
  });

  test('First Name too Long Error', () => {
    let authUserId1 = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'WilliamWilliamWilliam', "Lu");
      expect(authUserId1).toStrictEqual({error: "First Name is too long"});
  });

  test('First Name too Short Error', () => {
    let authUserId1 = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'W', "Lu");
      expect(authUserId1).toStrictEqual({error: "First Name is too short"});
  });
  
  test.each([
    ['william@unsw.edu.au', '1234abcd', 'William', "Lu1", 
    "error: First Name contains invalid character/s"],
    ['william@unsw.edu.au', '1234abcd', 'William', "Lu()", 
    "error: First Name contains invalid character/s"]
  ])('Invalid Character in Last Name Error', (email, pw, firstName, 
    lastName, expected) => {
    expect(adminAuthRegister(email,pw,firstName,lastName)).toEqual(expected) 
  });
  
  test('Last Name too Long Error', () => {
    let authUserId1 = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lululululululululululu");
      expect(authUserId1).toStrictEqual({error: "Last Name is too long"});
  });

  test('Last Name too Short Error', () => {
    let authUserId1 = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "L");
      expect(authUserId1).toStrictEqual({error: "Last Name is too short"});
  });

  test('Password too Short Error', () => {
    let authUserId1 = adminAuthRegister('william@unsw.edu.au', '1234567', 
    'William', "Lu");
      expect(authUserId1).toStrictEqual({error: "Password is too short"});
    let authUserId2 = adminAuthRegister('william@unsw.edu.au', '', 
    'William', "Lu");
      expect(authUserId2).toStrictEqual({error: "Password is too short"});
  });

  test("Password Doesn't Contain 1 Number or 1 Letter", () => {
    let authUserId1 = adminAuthRegister('william@unsw.edu.au', 'password', 
    'William', "Lu");
      expect(authUserId1).toStrictEqual({error: 
        "Password must contain a number and a letter"});
    let authUserId2 = adminAuthRegister('william@unsw.edu.au', '12345678', 
    'William', "Lu");
      expect(authUserId2).toStrictEqual({error: 
        "Password must contain a number and a letter"});
  });
});

