import { getData, setData, quiz, user } from './dataStore';
import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';
import { findUserId, tokenExists, hashPassword, findUser } from './other';

interface returnToken {
  token: string;
}

export interface error {
  error: string;
}

interface userBody {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  }
}

/*
This function allows for users to be registered, and have their details stored in the data store.
Identical passwords and names are allowed, but not emails. Error messages are returned if names, passwords or email is invalid
@param {string} email - String that contains the email
@param {string} password - String that contains the password
@param {string} nameFirst - String that contains their first name
@param {string} nameLast - String that contains their last name
@returns {number} authUserId - Integer that contains their assigned authUserId
*/
function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): returnToken | error {
  const data = getData();
  const userArray = data.users;
  for (const user in userArray) {
    if (userArray[user].email === email) {
      return { error: 'Email has already been used' };
    }
  }
  if (validator.isEmail(email) === false) {
    return { error: 'Email is invalid' };
  }
  const InvalidErrorMessage = NameIsInvalid(nameFirst, nameLast);
  if (InvalidErrorMessage) {
    return InvalidErrorMessage;
  }
  if (password.length < 8) {
    return { error: 'Password is too short' };
  }
  if (passwordChecker(password) === false) {
    return { error: 'Password must contain a number and a letter' };
  }
  const emptyTrash: quiz[] = [];
  const authUserId = data.currentUserId;
  data.currentUserId = data.currentUserId + 1;
  const hash = hashPassword(password);
  const userData = {
    userId: authUserId,
    email: email,
    password: hash,
    firstName: nameFirst,
    lastName: nameLast,
    numFailedPasswordsSinceLastLogin: 0,
    numSuccessfulLogins: 1,
    pastPasswords: [password],
    trash: emptyTrash
  };
  const uuid = uuidv4();
  const userToken = {
    token: uuid,
    userId: authUserId
  };
  data.users.push(userData);
  data.tokens.push(userToken);
  setData(data);
  return {
    token: uuid,
  };
}

function NameIsInvalid(nameFirst: string, nameLast: string) {
  if (nameFirst.length < 2) {
    return { error: 'First Name is too short' };
  }
  if (nameFirst.length > 20) {
    return { error: 'First Name is too long' };
  }
  if (nameLast.length < 2) {
    return { error: 'Last Name is too short' };
  }
  if (nameLast.length > 20) {
    return { error: 'Last Name is too long' };
  }
  if (nameChecker(nameLast) === false) {
    return { error: 'Last Name contains invalid character/s' };
  }
  if (nameChecker(nameFirst) === false) {
    return { error: 'First Name contains invalid character/s' };
  }
  return null;
}
/*
This function simply checks if all the characters in the name passed to it are valid
@param {string} name - The name passed in
@returns {boolean} - If the name is valid, or not
*/
function nameChecker(name: string): boolean {
  for (const char of name) {
    const uni = char.charCodeAt(0);
    if (!(uni >= 65 && uni <= 90) && !(uni >= 97 && uni <= 122) && char !== "'" &&
    char !== ' ' && char !== '-') {
      return false;
    }
  }
  return true;
}
/*
This function checks if the password contains both letters and numbers. If it doesn't, it is invalid.
@param {string} password - The password passed in
@returns {boolean} - If the password is valid, or not
*/
function passwordChecker(password: string): boolean {
  let containsLetter = false;
  let containsNumber = false;
  if (/\d/.test(password) === true) {
    containsNumber = true;
  }
  for (const char of password) {
    const uni = char.charCodeAt(0);
    if ((uni >= 65 && uni <= 90) || (uni >= 97 && uni <= 122)) {
      containsLetter = true;
    }
  }
  if (containsLetter === false || containsNumber === false) {
    return false;
  }
  return true;
}
/*
<adminUserDetails finds a user with a matching UserId and returns user details which includes their authUserId
first name and last name, email address, number of successful logins and number of failed passwords since last login.
If the user is not found, it returns a error message, error: 'Invalid authUserId'.
@param {number} token - The unique token of the user.
@returns {object} -  An object containing user details.
*/
function adminUserDetails(token: string): userBody | error {
  // grabs the data from the data store
  const data = getData();
  const tokenArray = data.tokens;

  // finds the token with the matching token
  const userToken = tokenArray.find((tokenArray) => tokenArray.token === token);

  if (!userToken) {
    return { error: 'Invalid token' };
  }
  // find the user with the matching userToken
  const userId = findUserId(userToken.token as string);
  const user = findUser(userId) as user;
  // if no user is found return error: 'Invalid authUserId'
  // construct and return user details
  return {
    user: {
      userId: user.userId,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    },
  };
}
/*
<adminAuthLogin finds a user with a matching email address and returns their authUserId, If no user
is found it returns an error. it checks if the provided password matches the stored password and if it
doesn't, it increments numFailedPasswordsSinceLastLogin by 1 and returns an error. If the login is successful it increments
successful login by 1 and resets failed passwords to 0.
@param {string} email - Email address of the user.
@param {string} password - Password of the user
@returns {number} - The unique identifier of the user.
*/
function adminAuthLogin(email: string, password: string): returnToken | error {
  // grabs the data from the data store
  const data = getData();
  const userArray = data.users;
  // finds the user with matching email address
  const user = userArray.find((userArray) => userArray.email === email);
  // if no user is found return error: 'Invalid email address'
  if (!user) {
    return { error: 'Invalid email address' };
  }
  const hash = hashPassword(password);
  // check if the provided password matches the stored password
  if (user.password !== hash) {
    // increment numFailedPasswordsSinceLastLogin by 1 and return an error
    for (const existingUser of data.users) {
      if (existingUser.userId === user.userId) {
        existingUser.numFailedPasswordsSinceLastLogin += 1;
      }
    }
    setData(data);
    return { error: 'Incorrect password' };
  }
  // If password is correct, reset numFailedPasswordsSinceLastLogin to 0
  // increment successfulLogins by 1
  user.numSuccessfulLogins += 1;
  user.numFailedPasswordsSinceLastLogin = 0;
  // update the data store
  const uuid = uuidv4();
  const userToken = {
    token: uuid,
    userId: user.userId
  };
  data.tokens.push(userToken);
  setData(data);
  return {
    token: uuid,
  };
}
/*
<adminAuthLogout function logs out a user by removing their token from the data store.
It checks if the provided token is valid, and if not, it returns an error.
@param {string} token - The unique token of the user to log out.
@returns {object | error} - An empty object if successful, or an error object if the token is invalid.
*/
function adminAuthLogout(token: string): object | error {
  const data = getData();
  const tokenArray = data.tokens;
  // Check if the token is valid or empty
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Initialize the tokenIndex to -1 (indicating not found)
  let tokenIndex = -1;
  // Find the index of the token in the data store
  for (const [index, session] of tokenArray.entries()) {
    if (token === session.token) {
      // Set the tokenIndex to the index where the token was found
      tokenIndex = index;
      break;
    }
  }
  if (tokenIndex !== -1) {
    // Remove the token from the data store
    tokenArray.splice(tokenIndex, 1);
    setData(data);
  }
  return {};
}
/*
<adminPasswordUpdate function allows a user to update their password.
It checks if the provided token is valid and ensures that the new password meets certain criteria.
It also checks if the old password matches the stored password and enforces that the new password is not the same as the old one or any past passwords.
@param {string} token - The unique token of the user.
@param {string} oldPassword - The old password of the user.
@param {string} newPassword - The new password to set.
@returns {object | error} - An empty object if successful, or an error object if the update fails for any reason.
*/
function adminPasswordUpdate(token: string, oldPassword: string, newPassword: string): object | error {
  const data = getData();
  const tokenArray = data.tokens;
  let userId;
  // Check if the token is valid or empty
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Check if the new password meets criteria
  if (newPassword.length < 8) {
    return { error: 'New password is too short' };
  }
  if (!passwordChecker(newPassword)) {
    return { error: 'New password must contain at least 1 number and 1 letter' };
  }
  for (const existingToken of tokenArray) {
    if (existingToken.token === token) {
      userId = existingToken.userId;
    }
  }
  const oldHash = hashPassword(oldPassword);
  const newHash = hashPassword(newPassword);
  for (const existingUser of data.users) {
    if (existingUser.userId === userId) {
      if (oldHash !== existingUser.password) {
        return { error: 'Password is incorrect' };
      }
      if (newHash === oldHash) {
        return { error: 'New password cannot be the same as the old password' };
      }
      for (const oldPasswords of existingUser.pastPasswords) {
        if (newHash === hashPassword(oldPasswords)) {
          return { error: 'New password cannot be the same as a past password' };
        }
      }
      existingUser.pastPasswords.push(newHash);
      existingUser.password = newHash;
    }
  }
  setData(data);
  return {};
}
/*
<adminDetailsUpdate function allows a user to update their email and name.
It checks if the provided token is valid, if the email is not already in use, and if the email and names are valid.
If any of the checks fail, it returns an error. Otherwise, it updates the user's information in the data store.
@param {string} token - The unique token of the user.
@param {string} email - The new email address to set.
@param {string} nameFirst - The new first name to set.
@param {string} nameLast - The new last name to set.
@returns {object | error} - An empty object if successful, or an error object if the update fails for any reason.
*/
function adminDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string): object | error {
  const data = getData();
  // Check if the new email is not already in use
  for (const user in data.users) {
    if (data.users[user].email === email) {
      return { error: 'Email has already been used' };
    }
  }
  // Check if the new email is valid
  if (validator.isEmail(email) === false) {
    return { error: 'Email is invalid' };
  }
  // Check if the new names are valid
  const InvalidErrorMessage = NameIsInvalid(nameFirst, nameLast);
  if (InvalidErrorMessage) {
    return InvalidErrorMessage;
  }
  // Check if the token is valid
  if (!tokenExists(token)) {
    return { error: 'Invalid Token' };
  }
  // Find the user to edit based on the token
  const user = findUserId(token);
  // Update user's information in the data store
  for (const userToEdit of data.users) {
    if (userToEdit.userId === user) {
      userToEdit.email = email;
      userToEdit.firstName = nameFirst;
      userToEdit.lastName = nameLast;
    }
  }
  setData(data);
  return {};
}

export {
  adminUserDetails,
  adminAuthRegister,
  adminAuthLogin,
  adminAuthLogout,
  adminPasswordUpdate,
  adminDetailsUpdate
};
