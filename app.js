document.addEventListener('DOMContentLoaded', () => {
    const wordDisplay = document.getElementById('word-display');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackArea = document.getElementById('feedback-area');

    let words = [];
    let currentWordIndex = 0;

    // Load and parse the CSV file
    fetch('/english-quiz-app/words.csv')
        .then(response => response.text())
        .then(data => {
            words = data.trim().split('\n').map(line => {
                const parts = line.split(/,(.*)/s); // Split on the first comma only
                if (parts.length === 2) {
                    const word = parts[0].trim();
                    const meaning = parts[1].trim().replace(/^"|"$/g, '').trim(); // Remove surrounding quotes
                    return { word, meaning };
                }
                return null;
            }).filter(Boolean); // Filter out any null entries from malformed lines
            
            if (words.length > 0) {
                displayNextWord();
            } else {
                wordDisplay.textContent = 'No words found!';
            }
        })
        .catch(error => {
            console.error('Error loading or parsing CSV file:', error);
            wordDisplay.textContent = 'Error loading words.';
        });

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