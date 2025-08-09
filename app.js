document.addEventListener('DOMContentLoaded', () => {
    const wordDisplay = document.getElementById('word-display');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackArea = document.getElementById('feedback-area');

    let words = [];
    let currentWordIndex = 0;

    // Hard-coded data for debugging
    try {
        words = [
            { word: 'apple', meaning: '사과' },
            { word: 'book', meaning: '책' },
            { word: 'car', meaning: '자동차' },
            { word: 'house', meaning: '집' }
        ];
        
        if (words.length > 0) {
            displayNextWord();
        } else {
            wordDisplay.textContent = 'No words found!';
        }
    } catch (error) {
        console.error('Error processing words:', error);
        wordDisplay.textContent = 'Error processing words.';
    }

    function displayNextWord() {
        if (words.length > 0) {
            currentWordIndex = Math.floor(Math.random() * words.length);
            wordDisplay.textContent = words[currentWordIndex].word;
            answerInput.value = '';
            feedbackArea.textContent = '';
            answerInput.focus();
        }
    }

    function checkAnswer() {
        const userAnswer = answerInput.value.trim();
        if (!userAnswer) {
            feedbackArea.textContent = 'Please enter an answer.';
            feedbackArea.style.color = 'orange';
            return;
        }

        const correctAnswer = words[currentWordIndex].meaning;
        // A simple check if the user's answer is one of the possible meanings
        if (correctAnswer.toLowerCase().includes(userAnswer.toLowerCase())) {
            feedbackArea.textContent = 'Correct!';
            feedbackArea.style.color = 'green';
        } else {
            feedbackArea.textContent = `Incorrect. The correct answer is: ${correctAnswer}`;
            feedbackArea.style.color = 'red';
        }
    }

    submitBtn.addEventListener('click', checkAnswer);
    nextBtn.addEventListener('click', displayNextWord);

    answerInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });
});