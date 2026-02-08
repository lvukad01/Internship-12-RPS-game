let gameId = null;
let currentRoundIndex = 0;
let gameFinished = false;
let reviewVisible = false;
let endEffectPlayed = false;

const emojis = {
  win: "✅",
  lose: "❌",
  draw: "➖"
};

function getRandomMove() {
  const moves = ["kamen", "škare", "papir"];
  return moves[Math.floor(Math.random() * moves.length)];
}

function getResult(player, computer) {
  if (player === computer) return "draw";

  if (
    (player === "kamen" && computer === "škare") ||
    (player === "škare" && computer === "papir") ||
    (player === "papir" && computer === "kamen")
  ) {
    return "win";
  }
  return "lose";
}


async function createNewGame() {
  endEffectPlayed = false;
  videoArea.style.display = "none";
  loseVideo.pause();
  loseVideo.currentTime = 0;
  reviewVisible = false;
  document.getElementById("reviewArea").innerHTML = "";

  const response = await fetch("https://api.restful-api.dev/objects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "kamen-skare-papir",
      data: {
        rounds: Array.from({ length: 5 }, (_, i) => ({
          roundNumber: i + 1,
          playerMove: "pending",
          computerMove: getRandomMove(),
          result: "pending",
        })),
      },
    }),
  });

  const game = await response.json();
  gameId = game.id;
  currentRoundIndex = 0;

  console.log("Nova igra:", game);
  alert("Nova igra kreirana!");
  gameFinished = false;
  document.getElementById("startGameBtn").disabled = false;

}

async function getGame() {
  const response = await fetch(
    `https://api.restful-api.dev/objects/${gameId}`
  );
  return await response.json();
}

async function updateGame(gameData) {
  await fetch(`https://api.restful-api.dev/objects/${gameId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: gameData }),
  });
}


async function startGame() {
  if (!gameId) {
    alert("Prvo kreiraj igru!");
    return;
  }
    if (gameFinished) {
    alert("Ova igra je već završena. Kreiraj novu igru.");
    return;
  }
  currentRoundIndex = 0;
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("reviewArea").innerHTML = "";
  showRound();
}

async function showRound() {
  const game = await getGame();
  const round = game.data.rounds[currentRoundIndex];

  document.getElementById("roundTitle").innerText =
    `Runda ${round.roundNumber} / 5`;
  document.getElementById("resultText").innerText = "";
  document.getElementById("nextRoundBtn").style.display = "none";
  setMoveButtonsDisabled(false);

}

document.querySelectorAll("#gameArea button").forEach((btn) => {

  btn.addEventListener("click", async () => {
    setMoveButtonsDisabled(true);
    const playerMove = btn.dataset.move;
    const game = await getGame();
    const round = game.data.rounds[currentRoundIndex];

    const result = getResult(playerMove, round.computerMove);
    round.playerMove = playerMove;
    round.result = result;

    await updateGame(game.data);

    const resultText = document.getElementById("resultText");
    resultText.className = result;

    resultText.innerText =
    `Ti: ${playerMove} | Komp: ${round.computerMove} → ${emojis[result]} ${result}`;
    if(result === "win"){
      document.getElementById("correctSound").play();
    }
    else if(result === "lose"){
      document.getElementById("incorrectSound").play();
    }

    document.getElementById("nextRoundBtn").style.display = "inline-block";
     if (reviewVisible) {
    const game = await getGame();
    renderReview(game.data.rounds);
  } 
  });
});

document.getElementById("nextRoundBtn").addEventListener("click", async () => {
    currentRoundIndex++;

  
  if (currentRoundIndex >= 5) {
    gameFinished = true;
    document.getElementById("gameArea").style.display = "none";
    document.getElementById("nextRoundBtn").style.display = "none";
    document.getElementById("resultText").innerText =
      "Igra završena! Klikni Review game.";
    document.getElementById("startGameBtn").disabled = true; 
    return;
  }

  showRound();
});

function renderReview(rounds) {
  const reviewArea = document.getElementById("reviewArea");

  let wins = 0;
  const playedRounds = rounds.filter(r => r.playerMove !== "pending");

  const html = playedRounds
    .map((r) => {
      if (r.result === "win") wins++;
      return `
        <p>
          Runda ${r.roundNumber}: 
          Ti: ${r.playerMove}, 
          Komp: ${r.computerMove} → 
          ${emojis[r.result]} ${r.result}
        </p>
      `;
    })
    .join("");

  if (playedRounds.length === 5 && !endEffectPlayed) {
    endEffectPlayed = true;

    if (wins >= 3) {
      winSound.currentTime = 0;
      winSound.play();
      videoArea.style.display = "none";
    } else {
      videoArea.style.display = "block";
      loseVideo.muted = false;
      loseVideo.currentTime = 0;
      loseVideo.play();
    }
  }

  if (html === "") {
    reviewArea.innerHTML = "<p>Još nema odigranih rundi.</p>";
    return;
  }

  reviewArea.innerHTML = `
    <h2>Pregled igre</h2>
    ${html}
    <strong>Rezultat: ${wins}/5</strong>
  `;
}

async function reviewGame() {
  const reviewArea = document.getElementById("reviewArea");

  if (!reviewVisible) {
    if (!gameId) return;

    const game = await getGame();
    renderReview(game.data.rounds);
    reviewVisible = true;
  } else {
    reviewArea.innerHTML = "";
    reviewVisible = false;
  }
}


document
  .getElementById("createGameBtn")
  .addEventListener("click", createNewGame);

document
  .getElementById("startGameBtn")
  .addEventListener("click", async () => {
    await startGame();
    document.getElementById("startGameBtn").disabled = true;
  });

document
  .getElementById("reviewGameBtn")
  .addEventListener("click", reviewGame);
function setMoveButtonsDisabled(disabled) {
  document.querySelectorAll("#gameArea button").forEach((btn) => {
    btn.disabled = disabled;
  });
}
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

setInterval(() => {
  const gameTitle = document.getElementById('gameTitle');
  if (gameTitle) {
    gameTitle.style.color = getRandomColor();
  }
}, 2000);
