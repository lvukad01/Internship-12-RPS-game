let gameId = null;
let roundIds = [];

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
async function createRound(roundNumber) {
const response = await fetch(
  "https://api.restful-api.dev/objects/",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "kamen-skare-papir",
      data: {
        gameId,
        roundNumber,
        playerMove: "pending",
        computerMove: getRandomMove(),
        result: "pending",
      },
    }),
  }
);



  if (!response.ok) {
    console.error("POST fail:", response.status);
    return null;
  }

  const json = await response.json();
  return json.id;
}

async function createNewGame() {
  gameId = crypto.randomUUID();
  roundIds = [];

  for (let i = 1; i <= 5; i++) {
    const roundId = await createRound(i);
    roundIds.push(roundId);
  }

  console.log("Nova igra kreirana!");
  console.log("Game ID:", gameId);
  console.log("Round IDs:", roundIds);
}
document
  .getElementById("createGameBtn")
  .addEventListener("click", createNewGame);

let currentRoundIndex = 0;
async function getRound(roundId) {
  const response = await fetch(
    `https://api.restful-api.dev/objects/${roundId}`
  );
  return await response.json();
}
async function startGame() {
  currentRoundIndex = 0;

  const round = await getRound(roundIds[currentRoundIndex]);
  console.log("Trenutna runda:", round);
  document.getElementById("gameArea").style.display = "block";

}
document
  .getElementById("startGameBtn")
  .addEventListener("click", startGame);
async function updateRound(roundId, playerMove, computerMove) {
  const result = getResult(playerMove, computerMove);

  const response = await fetch(
    `https://api.restful-api.dev/objects/${roundId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          playerMove: playerMove,
          computerMove: computerMove,
          result: result,
        },
      }),
    }
  );

  return await response.json();
}
document.querySelectorAll("#gameArea button").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const playerMove = btn.dataset.move;

    const roundId = roundIds[currentRoundIndex];
    const round = await getRound(roundId);

    const updatedRound = await updateRound(
      roundId,
      playerMove,
      round.data.computerMove
    );

    document.getElementById("resultText").innerText =
      `Ti: ${playerMove} | Komp: ${round.data.computerMove} → ${updatedRound.data.result}`;

    document.getElementById("nextRoundBtn").style.display = "block";
  });
});
document.getElementById("nextRoundBtn").addEventListener("click", async () => {
  currentRoundIndex++;

  if (currentRoundIndex >= roundIds.length) {
    document.getElementById("resultText").innerText =
      "Igra završena! Klikni Review game.";
    document.getElementById("gameArea").style.display = "none";
    return;
  }

  const nextRound = await getRound(roundIds[currentRoundIndex]);
  console.log("Sljedeća runda:", nextRound);

  document.getElementById("nextRoundBtn").style.display = "none";
});
