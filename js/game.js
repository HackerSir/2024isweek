// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.
const CardGame = function (targetId) {
    // private variables

    let cards = []; // 前 8 張是題目卡，後 8 張是答案卡
    let cards_num = 8;
    let is_deal = false;
    let card_value = [];
    const question1 = ["1C", "2C", "3C", "4C", "5C", "6C", "7C", "8C"]
    const answer1 = ["1H", "2H", "3H", "4H", "5H", "6H", "7H", "8H"]
    const question2 = ["9C", "10C", "11C", "12C", "13C", "14C", "15C", "16C"]
    const answer2 = ["9H", "10H", "11H", "12H", "13H", "14H", "15H", "16H"]

    let matches_found = 0;
    let card1 = false,
        card2 = false;
    const clickable = [];
    const question = document.getElementById('question');
    const main = document.querySelector ('main');

    let question_data = [];
    fetch('./data.json').then(response => {
        return response.json();
    }).then(data => {
        question_data = data;
    }).catch(err => {
        console.log(err);
    });

    //隱藏卡片
    const hideCard = function (id) { // turn card face down
        setTimeout(function () {
            clickable.pop(id);
        }, 500);
        if (id < cards_num)
            cards[id].firstChild.src = "./images/cards/back.png";
        else
            cards[id].firstChild.src = "./images/cards/back.png";
        with (cards[id].style) {
            WebkitTransform = MozTransform = OTransform = msTransform = "scale(1.0) rotate(0deg)";
        }
    };

    // move card to pack
    const moveToPack = function (id) {
        cards[id].clicked = true;
        if (id < cards_num) {
            cards[id].classList.remove('animate-in');
            cards[id].classList.add('animate-out');
        } else {
            cards[id].classList.remove('animate-in');
            cards[id].classList.add('animate-out');
        }
    };

    function waitForAnimationEnd(element) {
        return new Promise((resolve) => {
            element.addEventListener('animationend', function handler(event) {
                element.style.visibility = 'hidden';
                resolve();
            });
        });
    }

    async function removeElementsAfterAnimation(id) {
        const container = document.querySelector('main');
        const elements = document.querySelectorAll('.game-card');
        const promises = Array.from(elements).map((element, idx) => {
            return waitForAnimationEnd(element);
        });
        await Promise.all(promises);
        container.innerHTML = '';
        is_deal = false;
        if(card1 !== false) deal_answer();
    }


    const moveToPlace = function (id) { // deal card
        setTimeout(function () {
            clickable.push(id);
        }, 500);
        console.log(cards)
        cards[id].clicked = false;
        cards[id].classList.remove('animate-out');
        cards[id].classList.add('animate-in');
        main.appendChild(cards[id]);
    };

    const flash = function (id) { // flash card
        cards[id].classList.remove('animate-in');
        cards[id].classList.add('animate-flash');
    }

    const shake = function (id) { // shake card
        cards[id].classList.remove('animate-in');
        cards[id].classList.add('animate-shake');
    }

    const moveToOuter = function (id) { // deal card
        setTimeout(function () {
            cards[id].classList.remove('animate-in');
            cards[id].classList.add('animate-out2');
            question.classList.add('animate-in');
            question.innerHTML = question_data.find(q => q.id === parseInt(card_value[id])).question;
        }, 1000);
    }
    //dolist:點擊之後
    const showCard = function (id) { // turn card face up, check for match
        clickable.splice($.inArray(id, clickable), 1);
        if (id === card1) return;
        if (cards[id].clicked) return;
        cards[id].className = "game-card";
        cards[id].firstChild.src = "./images/cards/" + card_value[id] + ".png";
        is_deal = true;

        if (card1 !== false) {
            card2 = id;
            for (let i = 0; i < cards_num; i++) {
                if (i + cards_num == card2) flash(i + cards_num);
                else moveToPack(i + cards_num);
            }
            console.log(parseInt(card_value[card1]));
            console.log(parseInt(card_value[card2]));
            if (parseInt(card_value[card1]) == parseInt(card_value[card2])) { // match found

                if (++matches_found == 2) { // game over, reset
                    matches_found = 0;
                    for (let i = 0; i < cards_num; i++) {
                        if (i + cards_num == card2) flash(i + cards_num);
                        else moveToPack(i + cards_num);
                    }
                    card1 = card2 = false;
                    removeElementsAfterAnimation(id);
                    setTimeout(function () {
                        alertify.confirm('保留這個畫面來兌換獎品吧！').set({
                            title: '恭喜完成闖關',
                            labels: { ok: '重新開始', cancel: '查看解析' },
                            closable: false,
                            onok: function (event) {
                                cards_num = 8;
                                is_deal = false;
                                startCard();
                                deal();
                            },
                            oncancel: function (event) {
                                window.location = './explain.html';
                            }

                        });
                    }, cards_num * 100);
                }
                else {
                    for (let i = 0; i < cards_num; i++) {
                        if (i + cards_num == card2) flash(i + cards_num);
                        else moveToPack(i + cards_num);
                    }
                    card1 = card2 = false;
                    removeElementsAfterAnimation(id);
                    setTimeout(function () {
                        alertify.alert('繼續挑戰下一關吧').set({
                            title: '恭喜！答對了',
                            label: '下一關',
                            closable: false,
                            onok: function (event) {
                                startCard();
                                deal();
                            },
                        });
                    }, 100 * cards_num);
                }
            } else { // no match
                for (let i = 0; i < cards_num; i++) {
                    if (i + cards_num == card2) shake(i + cards_num);
                    else moveToPack(i + cards_num);
                }
                card1 = card2 = false;
                removeElementsAfterAnimation(id);
                setTimeout(function () {
                    alertify.alert('再重新抽一次題目吧').set({
                        title: '哎呀！答錯了',
                        label: '重新開始',
                        closable: false,
                        onok: function (event) {
                            startCard();
                            deal();
                        }
                    });
                }, 100 * cards_num);
            }
        } else { // first card turned over
            card1 = id;
            for (let i = 0; i < cards_num; i++) {
                if (i == card1) moveToOuter(i);
                else moveToPack(i);
            }
            removeElementsAfterAnimation(id);
        }
    };

    //點擊第一張之後亂數決定卡片位置
    const cardClick = function (id) {
        //防止連點或動畫中點擊
        if (is_deal) return;
        if ($.inArray(id, clickable) === -1) return;
        showCard(id);
    };

    //發題目牌
    const deal = function () {
        // shuffle and deal cards
        sort_tmp = []
        if (matches_found == 0) sort_tmp = question1;
        else sort_tmp = question2;
        sort_tmp.sort(function () {
            return Math.round(Math.random()) - 0.5;
        });
        card_value = sort_tmp;
        is_deal = true;
        for (i = 0; i < cards_num; i++) moveToPlace(i);
        is_deal = false;
    };

    //發答案牌
    const deal_answer = function () {
        // shuffle and deal cards
        question.classList.remove('animate-in');
        sort_tmp = []
        if (matches_found == 0)
            sort_tmp = answer1;
        else
            sort_tmp = answer2;
        sort_tmp.sort(function () {
            return Math.round(Math.random()) - 0.5;
        });
        card_value = card_value.concat(sort_tmp);
        is_deal = true;
        for (i = 0; i < cards_num; i++) {
            cards[i + cards_num].firstChild.src = "./images/cards/" + card_value[i + cards_num] + ".png";
            moveToPlace(i + cards_num);
        }
        setTimeout(function () {
            is_deal = false;
        }, i * 100);
    };

    // initialise 初始化
    const startCard = function () {
        cards = [];
        card_value = [];
        $('.card').remove();
        question.innerHTML = '從下面選一張題目卡';

        // template for card
        const card = document.createElement("div");
        card.innerHTML = "<img src=\"./images/cards/back.png\">";
        card.className = "game-card";

        // 題目卡
        for (let i = 0; i < cards_num; i++) {
            const newCard = card.cloneNode(true);
            newCard.className = "game-card";
            (function (idx) {
                newCard.addEventListener("click", function () {
                    cardClick(idx);
                }, false);
            })(i);

            cards.push(newCard);
        }

        // 答案卡
        card.innerHTML = "<img src=\"./images/cards/back.png\">";
        for (let i = 0; i < cards_num; i++) {
            const newCard = card.cloneNode(true);
            newCard.className = "game-card";
            (function (idx) {
                newCard.addEventListener("click", function () {
                    cardClick(idx + cards_num);
                }, false);
            })(i);
            cards.push(newCard);
        }
    };

    alertify.alert('🐱‍💻 駭，你好！', '<div>請根據卡牌上的題目找到相對應的答案！</br>遊玩說明：</br>遊戲共有兩輪，每輪請先抽一張題目卡，再從中找出對應的答案卡</br></br> <img style="height:20vh;" src="images/back.png"> <img style="height:20vh;" src="images/front.png"> </div>').set({
        label: '開始',
        closable: false,
        onok: function (closeEvent) {
            deal();
        }
    });

    startCard();
};