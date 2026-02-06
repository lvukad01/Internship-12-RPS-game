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
  const response = await fetch("https://api.restful-api.dev/objects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "kamen-skare-papir",
      data: {
        gameId: gameId,
        roundNumber: roundNumber,
        playerMove: "pending",
        computerMove: getRandomMove(),
        result: "pending",
      },
    }),
  });

  const result = await response.json();
  return result.id;
}
