document.addEventListener('DOMContentLoaded', () => {
    const wordDisplay = document.getElementById('word-display');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackArea = document.getElementById('feedback-area');

    let words = [];
    let currentWordIndex = 0;

    // Load and parse the CSV file
    fetch('./words.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(csvData => {
            words = csvData.trim().split('\n').map(line => {
                line = line.trim();
                if (!line) return null;

                const firstCommaIndex = line.indexOf(',');
                if (firstCommaIndex === -1) return null;

                const word = line.substring(0, firstCommaIndex).trim();
                let meaning = line.substring(firstCommaIndex + 1).trim();

                if (meaning.startsWith('"') && meaning.endsWith('"')) {
                    meaning = meaning.substring(1, meaning.length - 1);
                }

                if (meaning.startsWith(',')) {
                    meaning = meaning.substring(1);
                }
                
                meaning = meaning.trim();

                if (word && meaning) {
                    return { word, meaning };
                }
                return null;
            }).filter(Boolean);

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