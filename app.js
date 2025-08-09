document.addEventListener('DOMContentLoaded', () => {
    const wordDisplay = document.getElementById('word-display');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackArea = document.getElementById('feedback-area');
    const timerBar = document.getElementById('timer-bar');

    let words = [];
    let currentWordIndex = 0;
    let timerInterval;
    const TIME_LIMIT = 10; // 10 seconds

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

    function startTimer() {
        clearInterval(timerInterval);
        let timeLeft = TIME_LIMIT;
        timerBar.style.transition = 'none'; // Reset transition for instant change
        timerBar.style.width = '100%';
        
        // Force a reflow to apply the reset instantly before applying the transition again
        void timerBar.offsetWidth;

        timerBar.style.transition = `width ${TIME_LIMIT}s linear`;
        timerBar.style.width = '0%';

        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft < 0) {
                handleTimeout();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function handleTimeout() {
        stopTimer();
        feedbackArea.textContent = `Time's up! The correct answer is: ${words[currentWordIndex].meaning}`;
        feedbackArea.style.color = 'blue';
        answerInput.disabled = true;
        submitBtn.disabled = true;
    }

    function displayNextWord() {
        if (words.length > 0) {
            answerInput.disabled = false;
            submitBtn.disabled = false;
            currentWordIndex = Math.floor(Math.random() * words.length);
            wordDisplay.textContent = words[currentWordIndex].word;
            answerInput.value = '';
            feedbackArea.textContent = '';
            answerInput.focus();
            startTimer();
        }
    }

    function checkAnswer() {
        stopTimer();
        const userAnswer = answerInput.value.trim();
        if (!userAnswer) {
            feedbackArea.textContent = 'Please enter an answer.';
            feedbackArea.style.color = 'orange';
            return;
        }

        const correctAnswer = words[currentWordIndex].meaning;
        answerInput.disabled = true;
        submitBtn.disabled = true;

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