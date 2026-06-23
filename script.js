const passageText =
    "The archaeological expedition unearthed artifacts that complicated prevailing theories about Bronze Age trade networks. Obsidian from Anatolia, lapis lazuli from Afghanistan, and amber from the Baltic-all discovered in a single Mycenaean tomb-suggested commercial connections far more extensive than previously hypothesized. \"We've underestimated ancient peoples' navigational capabilities and their appetite for luxury goods,\" the lead researcher observed. \"Globalization isn't as modern as we assume.\"";



const state = {
  passage: passageText,
  typed: "",
  started: false,
  finished: false,
  duration: 60,
  remaining: 60,
  startedAt: null,
  timer: null
};


const passage = document.getElementById("passage");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const timeElement = document.getElementById("time");
const restartBtn = document.getElementById("restartBtn");
const easy = document.getElementById("easy");
const medium = document.getElementById("medium");
const hard = document.getElementById("hard");
const timed = document.getElementById("timed");
const bestElement = document.getElementById("bestWpm");
const input = document.getElementById("typingInput");
const result = document.getElementById("result");


function loadBest() {
  const savedBest = Number(localStorage.getItem("typingBestWpm")) || 0;
  bestElement.textContent = `${savedBest} WPM`;
}


function displayPassage() {
  const tempContainer = document.createDocumentFragment();
  const chars =[...state.passage];

  chars.forEach((char, index) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = char;

    if (index < state.typed.length) {
      if (state.typed[index] === char) {
        span.classList.add("correct");
      } else {
        span.classList.add("wrong");
      }
    }

    if (!state.finished && index === state.typed.length) {
      span.classList.add("current");
    }
    tempContainer.appendChild(span);
  });
  passage.replaceChildren(tempContainer);
}
  
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function getCorrectCount() {
  let correct = 0;

  for (let i = 0; i < state.typed.length; i++) {
    if (state.typed[i] === state.passage[i]) {
      correct++;
    }
  }

  return correct;
}


function getElapsedMinutes() {
  if (!state.started) {
    return 0;
  }

  const elapsedMs = Date.now() - state.startedAt;

  return Math.max(elapsedMs / 60000, 1 / 60);
}

function calculateStats() {
  const correct = getCorrectCount();

  const accuracy = state.typed.length
    ? Math.round((correct / state.typed.length) * 100)
    : 100;

    const elapsedMinutes = getElapsedMinutes();

  const wpm = elapsedMinutes > 0
  ? Math.round(correct / 5 / elapsedMinutes)
  : 0;

  return {
    wpm: Number.isFinite(wpm) ? wpm : 0,
    accuracy
  };
}

function updateStats() {
  const stats = calculateStats();

  wpmElement.textContent = stats.wpm;
  accuracyElement.textContent = `${stats.accuracy}%`;
  timeElement.textContent = formatTime(state.remaining);
}

function finishTest() {
  clearInterval(state.timer);
  input.blur();

  const stats = calculateStats();
  const savedBest = Number(localStorage.getItem("typingBestWpm")) || 0;

  if (stats.wpm > savedBest) {
    localStorage.setItem("typingBestWpm", String(stats.wpm));
    bestElement.textContent = `${stats.wpm} WPM`;
  }

  state.finished = true;

  result.textContent = `Final score: ${stats.wpm} WPM with ${stats.accuracy}% accuracy.`;

  displayPassage();
  updateStats();
}

function startTimer() {
  if (state.started) {
    return;
  }

  state.started = true;
  state.startedAt = Date.now();

  state.timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);

    state.remaining = Math.max(0, state.duration - elapsed);

    updateStats();

    if (state.remaining === 0) {
      finishTest();
    }
  }, 250);
}

function resetTest() {
  clearInterval(state.timer);

  state.typed = "";
  state.started = false;
  state.finished = false;
  state.remaining = state.duration;
  state.startedAt = null;
  state.timer = null;

  input.value = "";
  result.textContent = "";

  displayPassage();
  updateStats();

  input.focus();
}

input.addEventListener("input", () => {
  if (state.finished) {
    input.value = state.typed;
    return;
  }

  startTimer();

  state.typed = input.value.slice(0, state.passage.length);

  if (input.value.length > state.passage.length) {
    input.value = state.typed;
  }

  displayPassage();
  updateStats();

  if (state.typed.length === state.passage.length) {
    finishTest();
  }
});

passage.addEventListener("click", () => {
  input.focus();
});

document.addEventListener("keydown", () => {
  input.focus();
});

restartBtn.addEventListener("click", resetTest);


loadBest();
resetTest();