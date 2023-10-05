import {getData, setData} from './dataStore.js';
import isEmail from 'validator/lib/isEmail';


// Stub function for adminAuthRegister
function adminAuthRegister(email, password, nameFirst, nameLast) {
  let error = false;
  const validator = require('validator');
  const data = getData();
  const user_array = data.users;
  for (const user in user_array) {
    if (user_array[user].Email === email) {
      return {error: "Email has already been used"};
    }
  }
  
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
  
  const userId = user_array.length;
  const user_data = {
    UserId: userId,
    Email: email,
    Password: password,
    First_name: nameFirst,
    Last_name: nameLast,
  };
  data.users.push(user_data);
  setData(data);
  return (userId)
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
function adminUserDetails(authUserId) {
  const data = getData();
  const userArray = data.users;
  const user = userArray.find((user) => user.UserId === authUserId);

  if (!user) {
    return { error: 'Invalid authUserId' };
  }
  const numSuccessfulLogins = calculateNumSuccessfulLogins(user);
  const numFailedPasswords = calculateNumFailedPasswords(user);


  return {
    user: {
      userId: authUserId,
      name: `${user.First_name} ${user.Last_name}`,
      email: user.Email,
      numSuccessfulLogins: numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: numFailedPasswords,
    },
  };
}
function calculateNumSuccessfulLogins(user) {
  if (user && user.Email && user.Password) {
    const loginResult = adminAuthLogin(user.Email, user.Password);
    return user.successfulLogins || 0;
}
}

function calculateNumFailedPasswords(user, email, password) {
  if (user && email && password) {
    const loginResult = adminAuthLogin(email, password);
    if (loginResult.error) {
      user.failedPasswords = (user.failedPasswords || 0) + 1;
    }
  }
  return user.failedPasswords || 0;
}

// Stub function for adminAuthLogin
function adminAuthLogin(email, password) {
  const data = getData();
  const userArray = data.users;
  const user = userArray.find((userArray) => userArray.Email === email);

  if (!user) {
    return { error: 'Invalid email address' };
  }
  if (user.Password !== password) {
    user.failedPasswords = (user.failedPasswords || 0) + 1;
    return { error: 'Incorrect password' };
  }

  user.successfulLogins = (user.successfulLogins || 0) + 1;
  const userId = userArray.length;
  return(userId); 
}

export {
  adminUserDetails,
  adminAuthRegister,
  adminAuthLogin,
};