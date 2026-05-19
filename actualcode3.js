import { db, ref, onValue, remove } from './firebase.js';

const div1 = document.getElementById("myDIV"); 
let counting = "";
let playerlist = document.getElementById("player-list");

const rum = localStorage.getItem("joinedRoom");
const myPlayerKey = localStorage.getItem("myPlayerKey");
let tickInterval = null;

window.onload = async () => {
  playAnim();
  start();

  onValue(ref(db, "numbers/" + rum + "/players"), (snapshot) => {
    const players = snapshot.val() || {};
    const stuff = Object.values(players);
    counting = stuff.join("\n");
    playerlist.innerText = counting;
  });

  onValue(ref(db, "numbers/" + rum + "/roles/" + myPlayerKey), (snapshot) => {
  const role = snapshot.val();
  if (role) {
    document.getElementById("role-display").textContent = "You are... " + role;

  if (role == "an Assassin") {
    console.log("This guy's an assasin!");
  };
  }
  });

  onValue(ref(db, "numbers/" + rum + "/timer"), (snapshot) => {
    const data = snapshot.val();
    const timerDisplay = document.getElementById("timer-display");

    if (!data || !data.running) {
      clearInterval(tickInterval);
      game_time()
      return;
    }

    game_end()
    clearInterval(tickInterval);
    console.log("the timer reset!")

    tickInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
      const remaining = data.duration - elapsed;
    
      if (remaining <= 0) {
        timerend()
        timerDisplay.textContent = "Timer Ended!";
        console.log("the timer ends!")
        clearInterval(tickInterval);
        return;
      }
      timerDisplay.textContent = remaining;
    }, 500);
  });
}


function game_time() {
  const timerDisplay = document.getElementById("timer-display");
  const playercount = document.getElementById("player-count");
  const removing = document.getElementById("removing");
  const role = document.getElementById("role-display"); 

  timerDisplay.style.display = "none";
  removing.style.display = "block";
  playercount.style.display = "block";
  role.style.display = "none";
}

function game_end() {
  const timerDisplay = document.getElementById("timer-display");
  const playercount = document.getElementById("player-count");
  const removing = document.getElementById("removing");
  const role = document.getElementById("role-display"); 

  timerDisplay.style.display = "block";
  removing.style.display = "none";
  playercount.style.display = "none";
  role.style.display = "block";
}

function start() {
  document.getElementById("room-boi").innerText = rum;
}

function playAnim() {
  div1.hidden = false;
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function timerend() {
  div1.hidden = false
  div1.innerText = "Pass the gun!";
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function endAnim() { 
  this.style.animation = "disappear 0.3s forwards"; 
  div1.hidden = true;
}

window.backBtn3 = async function backBtn3() {
  await remove(ref(db, "numbers/" + rum + "/players/" + myPlayerKey));
  localStorage.removeItem("joinedRoom");
  localStorage.removeItem("myPlayerKey");
  window.location.href = "joinroom.html";
}