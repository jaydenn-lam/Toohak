import { clear } from './other';
import { adminUserDetails, adminAuthRegister } from './auth';
import { adminQuizList, adminQuizCreate } from './quiz';

describe('Clear', () => {
  test('Clear one user', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    clear();
    expect(adminUserDetails(userId)).toEqual({ error: 'Invalid authUserId' });
  });

  test('Clear one quiz and user', () => {
    const userId = adminAuthRegister('william@unsw.edu.au', '1234abcd', 'William', 'Lu');
    adminQuizCreate(userId, 'Animal Quiz', 'Test your knowledge on animals!');
    clear();
    expect(adminQuizList(userId)).toEqual({ error: 'Invalid User Id' });
    expect(adminUserDetails(userId)).toEqual({ error: 'Invalid authUserId' });
  });
});
