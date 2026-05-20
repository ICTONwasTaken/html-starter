import { db, ref, onValue, remove, get } from './firebase.js';

const div1 = document.getElementById("myDIV"); 
let counting = "";
let playerlist = document.getElementById("player-list");

const rum = localStorage.getItem("joinedRoom");
const myPlayerKey = localStorage.getItem("myPlayerKey");
let tickInterval = null;

let roledisplay = document.getElementById("role-display");
let wasRunning = false;

window.onload = async () => {
  playAnim();
  start();

  onValue(ref(db, "numbers/" + rum + "/players"), (snapshot) => {
    const players = snapshot.val() || {};
    const stuff = Object.values(players);
    counting = stuff.join("\n");
    playerlist.innerText = counting;
  });

  onValue(ref(db, "numbers/" + rum + "/roles/" + myPlayerKey), async (snapshot) => {
  roledisplay.style.animation = "none";
  void document.getElementById("role-display").offsetHeight;
  document.getElementById("role-target").style.display = "none";
  document.getElementById("role-target").style.animation = "none";

  const role = snapshot.val();
  if (role) {
    document.getElementById("role-display").textContent = "You are... " + role;
    document.getElementById("role-display").style.display = "block";
    roledisplay.style.animation = "shake 1s linear";
    }
    switch (role) {
      case "a Monk":
        document.getElementById("role-target").innerText = "Try to survive!";
        document.getElementById("role-target").style.display = "block";
        document.getElementById("role-target").style.animation = "shake 1s linear";
        break;
      case "a Spy":
        document.getElementById("role-target").innerText = "Deduce who's the Assassin!";
        document.getElementById("role-target").style.display = "block";
        document.getElementById("role-target").style.animation = "shake 1s linear";
        break;
      case "an Assassin":
         const playerSnap = await get(ref(db, "numbers/" + something + "/players"));
        const players = playerSnap.val() || {};
        const keys = Object.keys(players).filter(key => players[key] !== "Host");
    
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const randomPlayer = players[randomKey];
        document.getElementById("role-target").innerText = "Your target is: " + randomPlayer;
        document.getElementById("role-target").style.display = "block";
        document.getElementById("role-target").style.animation = "shake 1s linear";
        console.log("This guy's an assasin! His target is:", randomPlayer);
        break;
      }
  });

  onValue(ref(db, "numbers/" + rum + "/timer"), (snapshot) => {
    const data = snapshot.val();
    const timerDisplay = document.getElementById("timer-display");

    if (!data || !data.running) {
      clearInterval(tickInterval);
      wasRunning = false;
      return;
    }

    if (!wasRunning) {
      timerplay();
      wasRunning = true;
    }

    clearInterval(tickInterval);
    console.log("the timer starts")
    document.getElementById("timer-display").style.display = "block";

    tickInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
      const remaining = data.duration - elapsed;
    
      if (remaining <= 0) {
        timerend()
        console.log("the timer ends!")
        document.getElementById("timer-display").style.display = "none";
        clearInterval(tickInterval);
        return;
      }
      timerDisplay.textContent = remaining;
    }, 500);
  });
}

function timerplay() {
  div1.hidden = false
  div1.innerText = "Timer Start!";
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
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