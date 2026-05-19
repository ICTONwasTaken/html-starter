import { db, ref, onValue, remove, get, set} from './firebase.js';

  let div1 = document.getElementById("myDIV"); 
  let change = document.getElementById("change");
  let playercount = document.getElementById("player-count"); 
  let something = 0; 
  let old = 0; 

window.onload = async () => {
  const snapshot = await get(ref(db, "past_value"));
  old = snapshot.val() || 0;

  if (old != 0) {
      await remove(ref(db, "numbers/" + old));
      console.log("Cleaned up old number:", old);
    }

  something = await herewego(something);
  console.log('All resources finished loading');

  onValue(ref(db, "numbers/" + something + "/players"), (snapshot) => {
        const players = snapshot.val() || {};
        console.log("Players in room:", Object.keys(players).length);

        playercount.innerText = "Players: " + playerCount;

        const playercount = document.getElementById("player-list");
        playerListEl.innerHTML = "";
        Object.values(players).forEach((name) => {
          const entry = document.createElement("div");
          entry.className = "player-entry";
          entry.innerText = name;
          playerListEl.appendChild(entry);
        });

        if (playerCount >= 4) {
        div1.innerText = "Room is full!";
        playersfull();
        return;
        } else {
          playerscome();
          playerlist.innerText = playerCount;
        }
        
        const newPlayerKey = "player" + (playerCount + 1);

    });
  }

async function herewego(something) {
  something = Math.floor(Math.random() * (9999 - 1000) ) + 1000;

  set(ref(db, "numbers/" + something), {
    players: {
        player1: "Player 1" // host is just the first player
    }
  });
  set(ref(db, "past_value"), something); 
  console.log("This worked! You sent:", something);

  change.innerText = something;
  return something;
}

// Fix #6: actually writes new players to Firebase
window.joinRoom = async function joinRoom() {
  const snapshot = await get(ref(db, "numbers/" + something + "/players"));
  const players = snapshot.val() || {};
  const playerCount = Object.keys(players).length;

  if (playerCount >= 4) {
    alert("Room is full!");
    return;
  }

  // Fix #2: get player name from the input field that now exists in HTML
  const nameInput = document.getElementById("getname");
  const playerName = nameInput.value.trim() || "Player " + (playerCount + 1);
  const newPlayerKey = "player" + (playerCount + 1);

  await set(ref(db, "numbers/" + something + "/players/" + newPlayerKey), playerName);
  console.log("Added player:", playerName);
};

window.backBtn = function backBtn() {
    remove(ref(db, "numbers/" + something));
    console.log("This also worked! You destroyed:", something);
    something = 0;
}

window.mythingy = function mythingy() {
  const snapshot_check = get(ref(db, "numbers/" + something + "/players"));
  snapshot_check.then((snap) => {
    const players = snap.val() || {};
    const playerCount = Object.keys(players).length;
    if (playerCount < 2) {
      alert("Need at least 2 players to begin!");
      return;
    }
    // TODO: redirect to game page or start game logic here
    console.log("Game starting with", playerCount, "players!");
    // e.g. window.location.href = "game.html?room=" + something;
  });
};

function playerscome() {
  div1.hidden = false
  div1.innerText = "A new player arrives!";
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function playersfull() {
  div1.hidden = false
  div1.innerText = "Room full!";
  div1.style.animation = "mymove 0.9s forwards";
}

function endAnim() { 
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
  }