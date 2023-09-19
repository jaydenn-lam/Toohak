```javascript
let data = {
    // TODO: insert your data structure that contains 
    // users + quizzes here
    user: [
        {
            userId: 1,
            nameFirst: 'Avik',
            nameLast: 'Lam',
            email: 'comp1531@gmail.com',
            numSuccessfulLogins: 3,
            numFailedPasswordsSinceLastLogin: 1,
            quizzIds: [1, 2, 3],
        },
    ],

    quizzes: [
        {
            quizId: 1,
            quizName: 'Quiz_1',
            userId: 0,
            description: 'Test',
            timeCreated: 10,
            timeLastEdited: 10,
        },
    ],
};
```

[Optional] short description: 
Created an array in the user data to record all quizzes that they have created
Created userId in the quizz data to keep record of the userId of the owner
