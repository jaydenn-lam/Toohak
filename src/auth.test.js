import { adminUserDetails, adminAuthRegister, adminAuthLogin,} from 'auth.js';

describe('adminAuthRegister', () => {
  test('Working Entry', () => {
    let authUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
  });

  test('Duplicate email error', () => {
    let authUserId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    let authUserId2 = adminAuthRegister('william@unsw.edu.au', '1234abcd', 
    'William', "Lu");
    expect(authUserId2.toStrictEqual({error: "Email has already been used"}));
  })
});

