document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM 요소 및 상태 변수 ---
    
    const SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbypJgJgKY6NLU2jUKfoVDbesDRK7RFbu6Bg7mqtG0pI2DKZ15YRqkSi539GJloviYIT/exec";

    const views = document.querySelectorAll('.view');
    const navButtons = document.querySelectorAll('#bottom-nav button');
    
    // 메인 화면
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const gotoReviewBtn = document.getElementById('goto-review-btn');

    // 퀴즈 화면
    const wordDisplay = document.getElementById('word-display');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedback = document.getElementById('feedback');
    const timerDisplay = document.getElementById('timer');

    // 달력 화면
    const currentMonthYear = document.getElementById('current-month-year');
    const calendarDates = document.getElementById('calendar-dates');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    // 복습 화면
    const incorrectWordsContainer = document.getElementById('incorrect-words-container');
    const startReviewTestBtn = document.getElementById('start-review-test-btn');
    const clearReviewBtn = document.getElementById('clear-review-btn');

    let originalWords = [];
    let quizWords = [];
    let incorrectWords = [];
    let currentWordIndex = -1;
    let timer;
    let timeLeft = 10;
    let calendarDate = new Date();

    // --- 2. 핵심 함수 ---

    function showView(viewId) {
        views.forEach(view => view.classList.remove('active'));
        document.getElementById(viewId)?.classList.add('active');
        navButtons.forEach(button => button.classList.toggle('active', button.dataset.view === viewId));
        if (viewId === 'planner-view') generateCalendar(calendarDate);
        if (viewId === 'review-view') displayIncorrectWords();
    }

    function generateCalendar(date) {
        if (!calendarDates) return;
        calendarDates.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();
        currentMonthYear.textContent = `${year}년 ${month + 1}월`;
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < firstDayOfMonth; i++) calendarDates.insertAdjacentHTML('beforeend', `<div></div>`);
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const today = new Date();
            let classes = 'date-cell';
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) classes += ' today';
            if (localStorage.getItem(`study-log-${year}-${month + 1}-${i}`)) classes += ' studied-day';
            calendarDates.insertAdjacentHTML('beforeend', `<div class="${classes}">${i}</div>`);
        }
    }

    function displayIncorrectWords() {
        incorrectWordsContainer.innerHTML = '';
        if (incorrectWords.length === 0) {
            incorrectWordsContainer.innerHTML = '<p style="text-align:center; color: #999;">오답 노트가 비어있습니다.</p>';
            startReviewTestBtn.disabled = true;
        } else {
            startReviewTestBtn.disabled = false;
            incorrectWords.forEach(word => {
                const item = `<div class="word-item"><span class="english">${word.english}</span><span class="korean">${word.korean}</span></div>`;
                incorrectWordsContainer.insertAdjacentHTML('beforeend', item);
            });
        }
    }

    function loadNextWord() {
        if (quizWords.length === 0) {
            showView('main-view');
            alert('퀴즈가 종료되었습니다.');
            return;
        }
        currentWordIndex = Math.floor(Math.random() * quizWords.length);
        wordDisplay.textContent = quizWords[currentWordIndex].english;
        answerInput.value = '';
        feedback.textContent = '';
        answerInput.focus();
        resetTimer();
        startTimer();
    }

    function sendIncorrectWordToSheet(word) {
        if (!SPREADSHEET_URL.startsWith('https')) {
            console.warn("스프레드시트 URL이 유효하지 않아 데이터를 전송하지 않습니다.");
            return;
        }
        fetch(SPREADSHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(word)
        })
        .then(response => console.log("오답 전송 성공"))
        .catch(error => console.error('오답 전송 실패:', error));
    }

    function checkAnswer() {
        clearInterval(timer);
        if (currentWordIndex < 0) return;
        const userAnswer = answerInput.value.trim();
        const correctAnswer = quizWords[currentWordIndex].korean.trim();
        const currentWord = quizWords[currentWordIndex];
        if (userAnswer === correctAnswer) {
            feedback.textContent = "정답입니다!";
            feedback.style.color = "green";
        } else {
            feedback.textContent = `오답입니다. 정답: ${correctAnswer}`;
            feedback.style.color = "red";
            if (!incorrectWords.some(word => word.english === currentWord.english)) {
                incorrectWords.push(currentWord);
                localStorage.setItem('incorrectWords', JSON.stringify(incorrectWords));
                sendIncorrectWordToSheet(currentWord);
            }
        }
        const today = new Date();
        const key = `study-log-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        localStorage.setItem(key, 'studied');
    }

    function startTimer() {
        timeLeft = 10;
        timerDisplay.textContent = timeLeft;
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                feedback.textContent = "시간 초과!";
                feedback.style.color = 'orange';
                checkAnswer();
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timer);
        timeLeft = 10;
        timerDisplay.textContent = timeLeft;
    }

    // --- 3. 이벤트 리스너 설정 ---
    function setupEventListeners() {
        navButtons.forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
        
        startQuizBtn.addEventListener('click', () => {
            quizWords = [...originalWords];
            showView('quiz-view');
            loadNextWord();
        });
        gotoReviewBtn.addEventListener('click', () => showView('review-view'));

        submitBtn.addEventListener('click', checkAnswer);
        nextBtn.addEventListener('click', loadNextWord);
        answerInput.addEventListener('keypress', (e) => e.key === 'Enter' && checkAnswer());

        prevMonthBtn.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            generateCalendar(calendarDate);
        });
        nextMonthBtn.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            generateCalendar(calendarDate);
        });

        startReviewTestBtn.addEventListener('click', () => {
            if (incorrectWords.length > 0) {
                quizWords = [...incorrectWords];
                showView('quiz-view');
                loadNextWord();
            }
        });
        clearReviewBtn.addEventListener('click', () => {
            if (confirm('오답 노트를 정말로 비우시겠습니까?')) {
                incorrectWords = [];
                localStorage.removeItem('incorrectWords');
                displayIncorrectWords();
            }
        });
    }

    // --- 4. 앱 초기화 ---
    function initializeApp() {
        const savedIncorrectWords = localStorage.getItem('incorrectWords');
        if (savedIncorrectWords) {
            incorrectWords = JSON.parse(savedIncorrectWords);
        }

        // 로컬에 저장된 words.csv 파일을 불러옵니다.
        Papa.parse("words.csv", {
            download: true, // Live Server 또는 웹 서버 환경에서 필요합니다.
            header: false,
            complete: (results) => {
                originalWords = results.data
                    .map(item => ({ english: item[0], korean: item[1] }))
                    .filter(item => item.english && item.korean);
                console.log("단어 로드 완료:", originalWords.length, "개");
                startQuizBtn.disabled = false;
                startQuizBtn.textContent = '단어 암기 시작하기';
            },
            error: (err) => {
                console.error("CSV 파일 로드 실패:", err);
                startQuizBtn.textContent = '단어 로드 실패';
                alert("words.csv 파일을 찾을 수 없습니다. Live Server로 실행했는지 확인해주세요.");
            }
        });
        
        setupEventListeners();
        showView('main-view');
    }

    initializeApp();
});
