(function () {
    var endBanner = document.getElementById('end-banner');
    var questionArea = document.getElementById('question-area');
    var answersArea = document.getElementById('answers-area');
    var statsNode = document.getElementById('stats');
    var reviewBlock = document.getElementById('review');
    var reviewList = document.getElementById('review-list');

    const questions = [
        {
            text: 'А когда с человеком может произойти дрожемент?',
            answers: [
                { text: 'Когда он влюбляется', correct: false },
                { text: 'Когда он идет шопиться', correct: false },
                { text: 'Когда он слышит смешную шутку', correct: false },
                { text: 'Когда он боится, пугается', correct: true },
            ],
            explanation: 'Лексема «дрожемент» имплицирует состояние крайнего напряжения и страха: «У меня всегда дрожемент в ногах, когда копы подходят».',
        },
        {
            text: 'Говорят, Антон заовнил всех. Это еще как понимать?',
            answers: [
                { text: 'Как так, заовнил? Ну и хамло. Кто с ним теперь дружить-то будет?', correct: false },
                { text: 'Антон очень надоедливый и въедливый человек, всех задолбал', correct: false },
                { text: 'Молодец, Антон, всех победил!', correct: true },
                { text: 'Нет ничего плохого в том, что Антон тщательно выбирает себе друзей', correct: false },
            ],
            explanation: 'Термин «заовнить» заимствован из английского языка, он происходит от слова own и переводится как «победить», «завладеть», «получить».',
        },
        {
            text: 'А фразу «заскамить мамонта» как понимать?',
            answers: [
                { text: 'Разозлить кого-то из родителей', correct: false },
                { text: 'Увлекаться археологией', correct: false },
                { text: 'Развести недотепу на деньги', correct: true },
                { text: 'Оскорбить пожилого человека', correct: false },
            ],
            explanation: 'Заскамить мамонта — значит обмануть или развести на деньги. Почему мамонта? Потому что мошенники часто выбирают в жертвы пожилых людей, которых легко обвести вокруг пальца.',
        },
        {
            text: 'Кто такие бефефе?',
            answers: [
                { text: 'Вши?', correct: false },
                { text: 'Милые котики, такие милые, что бефефе', correct: false },
                { text: 'Лучшие друзья', correct: true },
                { text: 'Люди, которые не держат слово', correct: false },
            ],
            explanation: 'Бефефе — это лучшие друзья. Аббревиатура от английского best friends forever.',
        },
    ];

    function shuffle(list) {
        var arr = list.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    var shuffled = shuffle(questions);
    var order = [];
    for (var shuffledIndex = 0; shuffledIndex < shuffled.length; shuffledIndex++) {
        order.push({
            text: shuffled[shuffledIndex].text,
            answers: shuffle(shuffled[shuffledIndex].answers),
            explanation: shuffled[shuffledIndex].explanation,
        });
    }
    var currentIndex = 0;
    var correctCount = 0;
    var locked = false;
    var finished = false;

    function renderQuestion() {
        if (currentIndex >= order.length) {
            finished = true;
            showEnd();
            return;
        }

        var dynamicArea = document.querySelector('.dynamic-area');
        if (dynamicArea) dynamicArea.classList.remove('hidden');
        locked = false;
        var currentQuestion = order[currentIndex];
        endBanner.textContent = '';
        questionArea.innerHTML = `
            <div class="question-area">
                <div class="question-text">${currentIndex + 1}. ${currentQuestion.text}</div>
                <div class="question-meta">
                    <span class="badge">Вопрос ${currentIndex + 1} из ${order.length}</span>
                    <span class="marker" aria-hidden="true"></span>
                </div>
            </div>`;
        answersArea.innerHTML = currentQuestion.answers.map(function (answer) {
            return `
            <button type="button" class="answer" data-correct="${answer.correct ? 1 : 0}"><div>${answer.text}</div></button>
        `;
        }).join('');
    }

    function handleAnswer(card) {
        locked = true;
        var answerButtons = document.querySelectorAll('.answer');
        for (var answerIndex = 0; answerIndex < answerButtons.length; answerIndex++) { answerButtons[answerIndex].classList.add('disabled'); }
        var isCorrect = card.getAttribute('data-correct') === '1';
        var markerNode = questionArea.querySelector('.marker');
        var currentQuestion = order[currentIndex];
        if (isCorrect) {
            correctCount++;
            card.classList.add('correct');
            markerNode.classList.add('good');
            markerNode.textContent = '✔';
            card.insertAdjacentHTML('beforeend', `<div class="explanation">${currentQuestion.explanation}</div>`);

            for (var buttonIndex = 0; buttonIndex < answerButtons.length; buttonIndex++) {
                var otherButton = answerButtons[buttonIndex];
                if (otherButton !== card) {
                    (function (el) { setTimeout(function () { el.classList.add('fly-out'); }, 700); })(otherButton);
                }
            }
        } else {
            card.classList.add('wrong');
            markerNode.classList.add('bad');
            markerNode.textContent = '✖';
            setTimeout(function () {
                for (var flyIndex = 0; flyIndex < answerButtons.length; flyIndex++) {
                    answerButtons[flyIndex].classList.add('fly-out');
                }
            }, 700);
        }
        setTimeout(function () { if (isCorrect) { card.classList.add('fly-out'); } }, 1300);
        setTimeout(function () { currentIndex++; renderQuestion(); updateStats(); }, 2000);
    }

    function showEnd() {
        endBanner.textContent = 'Вопросы закончились';
        questionArea.innerHTML = '';
        answersArea.innerHTML = '';

        var dynamicArea = document.querySelector('.dynamic-area');
        if (dynamicArea) dynamicArea.classList.add('hidden');
        updateStats();
        buildReview();
    }

    function updateStats() {
        statsNode.textContent = finished
            ? ('Правильных ответов: ' + correctCount + ' из ' + order.length)
            : ('Счёт: ' + correctCount + ' / ' + order.length);
    }

    function buildReview() {
        reviewBlock.classList.remove('hidden');
        reviewList.innerHTML = order.map(function (questionItem, index) {
            const correct = questionItem.answers.find((answer) => answer.correct)?.text || '';
            return `
                <div class="review-item">
                    <div class="review-header"><div>${index + 1}. ${questionItem.text}</div><div class="badge">Показать ответ</div></div>
                    <div class="review-content hidden">
                        <div>Правильный ответ: <b>${correct}</b></div>
                        <div class="explanation">${questionItem.explanation}</div>
                    </div>
                </div>`;
        }).join('');
    }

    // Инициализация
    renderQuestion();
    updateStats();
    answersArea.addEventListener('click', function (event) {
        const card = event.target.closest('.answer');
        if (!card || locked || finished) return;
        handleAnswer(card);
    });
    reviewList.addEventListener('click', function (event) {
        const header = event.target.closest('.review-header');
        if (!header) return;
        var detailsContent = header.nextElementSibling;
        var allReviewContents = reviewList.querySelectorAll('.review-content');
        for (var listIndex = 0; listIndex < allReviewContents.length; listIndex++) {
            if (allReviewContents[listIndex] !== detailsContent) allReviewContents[listIndex].classList.add('hidden');
        }
        detailsContent.classList.toggle('hidden');
    });
})();


