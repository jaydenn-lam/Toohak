interface user {
  userId: number;
  email: string;
  password: string;
  First_name: string;
  Last_name: string;
  numFailedPasswordsSinceLastLogin: number;
  numSuccessfulLogins: number;
}

interface quiz {
  quizId: number;
  name: string;
  TimeCreated: number;
  TimeLastEdited: number;
  Description: string;
  userId: number;
}

interface dataStore {
  users: user[];
  quizzes: quiz[];
}

// YOU SHOULD MODIFY THIS OBJECT BELOW
let data: dataStore = {
  users: [],
  quizzes: [],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): dataStore {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataStore) {
  data = newData;
  return {};
}

export { getData, setData };
