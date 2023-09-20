// Stub for the adminQuizList function
function adminQuizList(authUserId) {
    return {
        quizzes: [
            {
                quizId: 1,
                name: 'My Quiz',
            }
        ]
    }
}

// Stub for the adminQuizCreate function
function adminQuizCreate(authUserId, name, description) {
    return {
        quizId: 2
    }
}