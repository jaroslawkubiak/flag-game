"use strict";

import { getCountries, errorMessage } from "./model.js";

// selecting from DOM
const svgMap = document.getElementById("svgMap");
const header = document.getElementById("header");

const questionWrapper = document.querySelector(".questionWrapper");
const questionNumber = document.querySelector(".questionNumber");
const loader = document.querySelector(".loader-container");
const flagContainer = document.querySelector(".flag-img");
const answerWrapper = document.querySelector(".answerWrapper");
const scoreTableWrapper = document.querySelector(".scoreTableWrapper");
const imgFlag = document.getElementById("flag");
const question = document.getElementById("question");

//answers buttons array
const answerBtnA = document.getElementById("A");
const answerBtnB = document.getElementById("B");
const answerBtnC = document.getElementById("C");
const answerBtnD = document.getElementById("D");
const answersBtns = [answerBtnA, answerBtnB, answerBtnC, answerBtnD];

//other buttons
const btnStartGame = document.querySelector(".divStartGame");
const btnResetGame = document.querySelector(".btnResetGame");

const init = function () {
  //hide: map and btn
  hideComponents([svgMap, btnStartGame]);

  //show loader till fetch ends
  showComponents([questionWrapper, loader]);

  //getting info about all continents from API
  getCountries(game.selectedContinent);
};

// game - main object of quiz
// selectedContinent - array of selected continents from world map
// countryList - array of country and flags of player selected continent, if country is drawn to question - delete this country from this array
// countryToAnswers - array of ALL country names selected continent to generate answers.always all country.
// questions - array of object questions: answers Array, correctAnswer, flag, playerAnswer.
let game = {
  selectedContinent: [],
  countryList: [],
  countryToAnswers: [],
  questions: [],
};
const QUESTION_QUANTITY = 10;
const DELAY_BETWEEN_QUESTIONS_SEC = 1;
let currQuestion = 0;

// inserting country from fetch to array with country names and flags
export const insertCountryObject = function (name, flag) {
  game.countryList.push({
    name: name,
    flag: flag,
  });
  game.countryToAnswers.push(name);
};

// after continents are selected, start game: hide map, show form, fetch data, generate question,
export const startGame = async function () {
  //initial conditions for starting game
  generateQuestions();
  showQuestion();
};

// generate question from fetch API
const generateQuestions = function () {
  for (let i = 0; i < QUESTION_QUANTITY; i++) {
    if (!game.countryList.length) return;
    const randomCountryIndex = generateCountryRandomIndex(
      game.countryList.length
    );

    //draw three random country to answers
    let answers = [];
    if (!game.countryList) errorMessage("Failed to fetch data.");
    answers.push(game.countryList[randomCountryIndex].name);

    // copy list all countries and delete country that is correct answer to random generate three other answers
    // prettier-ignore
    const copyCountries = game.countryToAnswers.filter(
      (country) => country !== answers[0]
    );

    const randomSet = generateThreeRandomIndex(copyCountries.length);
    randomSet.forEach(ans => {
      return answers.push(copyCountries[ans]);
    });

    // shuffle answers array
    answers = shuffleArray(answers);
    // push question to array
    game.questions.push({
      flag: game.countryList[randomCountryIndex].flag,
      answers: answers,
      correctAnswer: game.countryList[randomCountryIndex].name,
    });

    //remove draw counrty from list
    game.countryList.splice(randomCountryIndex, 1);
  }
};

// start showing form with questions
const showQuestion = function () {
  // get answer buttons from DOM
  // prettier-ignore
  questionNumber.textContent = `Question ${currQuestion + 1} of ${QUESTION_QUANTITY}\n`;

  // adding flag to DOM
  imgFlag.src = game.questions[currQuestion].flag;

  imgFlag.addEventListener("load", function () {
    hideComponents([loader]);
    // displaing answers to all buttons
    answersBtns.forEach((ans, index) => {
      ans.innerHTML = game.questions[currQuestion].answers[index];
    });
    showComponents([
      flagContainer,
      answerWrapper,
      question,
      questionNumber,
      btnResetGame,
    ]);
  });
};

// checking player answer
const checkAnswer = function (playerAnswer, playerAnswerId) {
  const correctAnswer = game.questions[currQuestion].correctAnswer;

  //give all buttons disabled atribute
  answersBtns.map(btn => {
    btn.className = "";
    btn.classList.add("btnQuestionDisabled");
    btn.disabled = true;
  });

  // player answer is correct
  if (playerAnswer === correctAnswer) {
    //adding correct (true) answer to question array
    game.questions[currQuestion].playerAnswer = true;

    // indication correct answer to player
    const goodAnswerBtn = document.getElementById(playerAnswerId);
    goodAnswerBtn.className = "";
    goodAnswerBtn.classList.add("btnQuestionCorrect");
  } else {
    //player answer is wrong
    //adding wrong (false) answer to question array
    game.questions[currQuestion].playerAnswer = false;

    // indication wrong answer to player
    const wrongAnswerBtn = document.getElementById(playerAnswerId);
    wrongAnswerBtn.className = "";
    wrongAnswerBtn.classList.add("btnQuestionWrong");

    // searching and indication correct answer to player
    answersBtns.map(ansBtn => {
      if (ansBtn.innerHTML === correctAnswer) {
        ansBtn.className = "";
        ansBtn.classList.add("btnQuestionCorrect");
      }
    });
  }
  timeout(DELAY_BETWEEN_QUESTIONS_SEC);
};

// player answer to all question - display summary table
const gameOver = function () {
  showComponents([scoreTableWrapper]);
  hideComponents([btnResetGame]);

  //calculating player score
  const countCorrectAnswer = game.questions.filter(
    ques => ques.playerAnswer
  ).length;
  const countWrongAnswer = QUESTION_QUANTITY - countCorrectAnswer;

  const percent = +(Math.floor(
    (countCorrectAnswer * 100) / QUESTION_QUANTITY
  ).toFixed(0));

  //saving data to local storage
  let bestScore = +(localStorage.getItem("bestScore"));

  if (!bestScore) {
    localStorage.setItem("bestScore", percent);
    bestScore = percent;
  } else if (percent > bestScore) {
    localStorage.setItem("bestScore", percent);
    bestScore = percent;
  }
  let wow = percent >= 100 ? `🏆` : ``;

  let html = `
    <div class="gameOver">Game over</div>
    <div>Your score : <span>${percent}% ${wow}</span></div>
    <div>Your best score : <span>${bestScore}%</span></div>
    <div class="questionQuantity">Number of questions : <span>${QUESTION_QUANTITY}</span></div>
    <div class="good">Good answers : ${countCorrectAnswer}</div>
    <div class="wrong">Wrong answers : ${countWrongAnswer}</div>
  `;

  html += `
    <div class="divPlayAgain">
    <button class="btnStartGame">Play again
      <div class="icon">
        <svg id="svgStartGame"         
        viewBox="0 0 24 24" stroke-width="1.5" ><defs><style>.cls-637b8a2bf95e86b59c57a23b-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs><path class="cls-637b8a2bf95e86b59c57a23b-1" d="M18.34,4.21A4.86,4.86,0,0,0,14,6.14H10A4.86,4.86,0,0,0,5.66,4.21,5,5,0,0,0,1.25,9.28v7A3.5,3.5,0,0,0,8,17.61c.42-1.05.94-2.37,1.42-3.66h5.16c.48,1.29,1,2.61,1.42,3.66a3.5,3.5,0,0,0,6.75-1.29v-7A5,5,0,0,0,18.34,4.21Z"></path><path class="cls-637b8a2bf95e86b59c57a23b-1" d="M18.84,12h0Z"></path><path class="cls-637b8a2bf95e86b59c57a23b-1" d="M18.84,8.09h0Z"></path><path class="cls-637b8a2bf95e86b59c57a23b-1" d="M20.79,10.05h0Z"></path><path class="cls-637b8a2bf95e86b59c57a23b-1" d="M16.89,10.05h0Z"></path><path class="cls-637b8a2bf95e86b59c57a23b-1" d="M7.11,12h0Z"></path><path class="cls-637b8a2bf95e86b59c57a23b-1" d="M7.11,8.09h0Z"></path><path class="cls-637b8a2bf95e86b59c57a23b-1" d="M9.07,10.05h0Z"></path><path class="cls-637b8a2bf95e86b59c57a23b-1" d="M5.16,10.05h0Z"></path></svg>
      </div>
    </button>
  </div>
`;

  scoreTableWrapper.innerHTML = html;

  // after select continents - start game
  document.querySelector(".divPlayAgain").addEventListener("click", resetGame);
};

//reset game :)
const resetGame = function () {
  imgFlag.src = "";

  // show world map
  showComponents([svgMap, header]);

  // loop selected continent for deselect from svg map
  game.selectedContinent.map(con => {
    const querySelAll = document.querySelectorAll(`.${con}`);
    let continent = `${con}-selected`;
    querySelAll.forEach(child => {
      child.classList.remove(continent);
    });
  });

  //hiddin page componets
  hideComponents([
    answerWrapper,
    question,
    questionWrapper,
    questionNumber,
    btnResetGame,
    scoreTableWrapper,
  ]);

  //reseting answer button classes
  resetBtnClass();

  // setting initial conditions for game object
  game = {
    selectedContinent: [],
    countryList: [],
    countryToAnswers: [],
    questions: [],
  };
  currQuestion = 0;
};

//selecting continent on world map
const selectContinent = function (clickContinent) {
  // select class of clicked continent

  const querySelAll = document.querySelectorAll(`.${clickContinent}`);
  querySelAll.forEach(child => {
    let continentSelected = `${clickContinent}-selected`;
    // child.classList.toggle("selected");
    child.classList.toggle(continentSelected);

    //add or remove from selectedContinent array
    if (child.classList.contains(continentSelected)) {
      game.selectedContinent.indexOf(clickContinent) === -1 &&
        game.selectedContinent.push(clickContinent);
    } else {
      game.selectedContinent.indexOf(clickContinent) > -1 &&
        game.selectedContinent.splice(
          game.selectedContinent.indexOf(clickContinent),
          1
        );
    }
  });
};

// shuffle array of answers to display
const shuffleArray = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

// according to length of given array generate random number
const generateCountryRandomIndex = function (arrLength) {
  return Math.trunc(Math.random() * arrLength);
};

//generate three other answer - others country to question
const generateThreeRandomIndex = function (length) {
  const randomSet = new Set();
  do {
    let ran = Math.trunc(Math.random() * length);
    randomSet.add(ran);
  } while (randomSet.size < 3);
  return randomSet;
};

// reset all answer button class to normal
const resetBtnClass = function () {
  answersBtns.map(btn => {
    btn.className = "";
    btn.classList.add("btnQuestion");
    btn.disabled = false;
  });
};

// timeout between giving answer and switch to next question
const timeout = function (s) {
  setTimeout(function () {
    if (currQuestion + 1 < QUESTION_QUANTITY) {
      currQuestion++;
      showQuestion();
      resetBtnClass();
    } else gameOver();
  }, s * 1000);
};

// remove class hidden from given components
const showComponents = function (components) {
  components.forEach(comp => {
    comp.classList.remove("hidden");
  });
};

// add class hidden from given components
const hideComponents = function (components) {
  components.forEach(comp => {
    comp.classList.add("hidden");
  });
};

/////////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS
/////////////////////////////////////////////////////////////////////////////////////
// world map - select continents
svgMap.addEventListener("click", function (e) {
  e.preventDefault();

  //if not click on continent
  if (e.target.id === "svgMap") return;

  // get id (Africa, Europe etc) of selected continent
  const clickContinent = e.target.closest(".continent").id;

  //search all nodes
  selectContinent(clickContinent);

  // show or hide start game btn

  if (game.selectedContinent.length > 0) {
    showComponents([btnStartGame]);
    hideComponents([header]);
  }
  if (game.selectedContinent.length === 0) {
    hideComponents([btnStartGame]);
    showComponents([header]);
  }
});

// after select continents - start game
btnStartGame.addEventListener("click", init);

btnResetGame.addEventListener("click", resetGame);

// player choose answer - check answer
answerWrapper.addEventListener("click", function (e) {
  const answer = e.target.innerHTML;
  const answerId = e.target.id;
  if (!answer || !answerId) return;
  checkAnswer(answer, answerId);
});
