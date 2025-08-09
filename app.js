document.addEventListener('DOMContentLoaded', () => {
    const wordDisplay = document.getElementById('word-display');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackArea = document.getElementById('feedback-area');

    let words = [];
    let currentWordIndex = 0;

    // Load and parse the CSV file
    // fetch('./words.csv')
    //     .then(response => response.text())
    //     .then(data => {
    //         words = data.trim().split('\n').map(line => {
    //             const parts = line.split(/,(.*)/s); // Split on the first comma only
    //             if (parts.length === 2) {
    //                 const word = parts[0].trim();
    //                 const meaning = parts[1].trim().replace(/^"|"$/g, '').trim(); // Remove surrounding quotes
    //                 return { word, meaning };
    //             }
    //             return null;
    //         }).filter(Boolean); // Filter out any null entries from malformed lines
            
    //         if (words.length > 0) {
    //             displayNextWord();
    //         } else {
    //             wordDisplay.textContent = 'No words found!';
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error loading or parsing CSV file:', error);
    //         wordDisplay.textContent = 'Error loading words.';
    //     });

    const csvData = `for," 위하여, ~를 목적으로, ~의 용도로, ~를 대상으로, ~동안에"
before,   -이전에
with ,"  -와 함께, ~를 이용해서, ~를 갖춘, ~인 상태로"
during,  -동안에
by,"  ~에 의해, ~까지, ~만큼, ~까지"
however,  그러나
when,  -할 때
despite,  그럼에도 불구하고
offer ,"  제공하다,   제안, 행사"
until ,   -까지
because,  -때문에
within,  -이내에
include,  포함하다
since,"   ~이후로,  ~때문에"
increase,"  증가하다, ~을 늘리다,   증가"
from,  -로 부터
whose,  (앞 명사)의 
who ,  (앞 명사)이가
that ,,  "(앞 명사)는, 그 것을, 그 사람을,   저, 대  그러한 것"
which,"  (앞명사)가, 어떤"`;

    try {
        words = csvData.trim().split('\n').map(line => {
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
    } catch (error) {
        console.error('Error parsing CSV data:', error);
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