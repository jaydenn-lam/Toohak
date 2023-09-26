import {getData, setData} from './dataStore.js';
import isEmail from 'validator/lib/isEmail';


// Stub function for adminAuthRegister
function adminAuthRegister(email, password, nameFirst, nameLast) {
  let error = false;
  const validator = require('validator');
  const data = getData();
  const user_array = data.users;
  const user_data = {
    Email: email,
    Password: password,
    First_name: nameFirst,
    Last_name: nameLast,
  };
  for (const user in user_array) {
    if (user_array[user].Email === email) {
      return {error: "Email has already been used"};
    }
  }
  user_array.push(user_data);
  const valid_email = validator.isEmail(email);
  if (valid_email === false) {
    return {error: "Email is invalid"};
  }
  if (nameFirst.length < 2) {
    return {error: "First Name is too short"};
  }
  if (nameFirst.length > 20) {
    return {error: "First Name is too long"}
  }
  if (nameLast.length < 2) {
    return {error: "Last Name is too short"};
  }
  if (nameLast.length > 20) {
    return {error: "Last Name is too long"}
  }
  if (password.length < 8) {
    return {error: "Password is too short"}
  }
  if (nameChecker(nameLast) === false) {
    return {error: "Last Name contains invalid character/s"}
  }
  if (nameChecker(nameFirst) === false) {
    return {error: "First Name contains invalid character/s"}
  }
  if (passwordChecker(password) === false) {
    return {error: "Password must contain a number and a letter"}
  }
  let value = user_array.length;
  return (value)
}

function nameChecker(name) {
  for (const char of name) {
    const uni = char.charCodeAt(0);
    if (!(uni >= 65 && uni <= 90) && !(uni >= 97 && uni <= 122) && char != "'" 
    && char != ' ' && char != "-") {
      return false;
    }
  }
  return true;
}

function passwordChecker(password) {
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

//Stub function for adminUserDetails
function adminUserDetails (authUserId) {
  return { user:
    {
      userId: 1,
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
    }
  };
}

// Stub function for adminAuthLogin
function adminAuthLogin(email, password) {
  return {
    authUserId: 1,
  }
}

export {
  adminUserDetails,
  adminAuthRegister,
  adminAuthLogin,
};