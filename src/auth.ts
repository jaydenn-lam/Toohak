import { getData, setData } from './dataStore';
import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';

interface authUserId {
  authUserId: number;
}

interface token {
  token: string;
  userId: number;
}

interface error {
  error: string;
}

interface user {
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
function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): token | error {
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
  const authUserId = userArray.length;
  const userData = {
    userId: authUserId,
    email: email,
    password: password,
    First_name: nameFirst,
    Last_name: nameLast,
    numFailedPasswordsSinceLastLogin: 0,
    numSuccessfulLogins: 1
  };
  data.users.push(userData);
  setData(data);
  return { 
    token: uuidv4(),
    userId: authUserId
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
@param {number} authUserId - The unique identifier of the user.
@returns {object} -  An object containing user details.
*/
function adminUserDetails(authUserId: authUserId): user | error {
  // grabs the data from the data store
  const data = getData();
  const userArray = data.users;
  // finds the user with the matching UserId
  const user = userArray.find((user) => user.userId === authUserId.authUserId);

  // if no user is found return error: 'Invalid authUserId'
  if (!user) {
    return { error: 'Invalid authUserId' };
  }
  // construct and return user details
  return {
    user: {
      userId: authUserId.authUserId,
      name: `${user.First_name} ${user.Last_name}`,
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
function adminAuthLogin(email: string, password: string): token | error {
  // grabs the data from the data store
  const data = getData();
  const userArray = data.users;
  // finds the user with matching email address
  const user = userArray.find((userArray) => userArray.email === email);
  // if no user is found return error: 'Invalid email address'
  if (!user) {
    return { error: 'Invalid email address' };
  }
  // check if the provided password matches the stored password
  if (user.password !== password) {
    // increment numFailedPasswordsSinceLastLogin by 1 and return an error
    user.numFailedPasswordsSinceLastLogin += 1;
    return { error: 'Incorrect password' };
  }
  // If password is correct, reset numFailedPasswordsSinceLastLogin to 0
  // increment successfulLogins by 1
  user.numSuccessfulLogins += 1;
  user.numFailedPasswordsSinceLastLogin = 0;
  // update the data store
  setData(data);
  const authUserId = user.userId;
  return { 
    token: uuidv4(),
    userId: authUserId
  };
}

export {
  adminUserDetails,
  adminAuthRegister,
  adminAuthLogin,
};
