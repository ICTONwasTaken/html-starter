import { db, ref, onValue, remove } from './firebase.js';

const div1 = document.getElementById("myDIV"); 
let counting = "";
let playerlist = document.getElementById("player-list");

const rum = localStorage.getItem("joinedRoom");        // moved to top
const myPlayerKey = localStorage.getItem("myPlayerKey");
let tickInterval = null;                                // declared here

window.onload = async () => {
  playAnim();
  start();

  onValue(ref(db, "numbers/" + rum + "/players"), (snapshot) => {
    const players = snapshot.val() || {};
    const stuff = Object.values(players);
    counting = stuff.join("\n");
    playerlist.innerText = counting;
  });

  onValue(ref(db, "numbers/" + rum + "/timer"), (snapshot) => {  // use rum, not something
    const data = snapshot.val();
    const timerDisplay = document.getElementById("timer-display");
    const playercount = document.getElementById("player-count");
    const removing = document.getElementById("removing");

    if (!data || !data.running) {
      clearInterval(tickInterval);
      timerDisplay.style.display = "none";
      timerDisplay.style.color = rgb(224, 173, 96);
      removing.style.display = "block"
      playercount.style.display = "block";
      return;
    }

    timerDisplay.style.display = "block";
    removing.style.display = "none"
    playercount.style.display = "none";
    clearInterval(tickInterval);

    tickInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
      const remaining = data.duration - elapsed;
      
      if (remaining == 20) {
      timerDisplay.style.color = rgb(206, 80, 42);
      }

      if (remaining == 10) {
        timerDisplay.style.color = rgb(255, 17, 0);
      }

      if (remaining <= 0) {
        timerend()
        timerDisplay.textContent = "Timer Ended!";
        clearInterval(tickInterval);
        return;
      }
      timerDisplay.textContent = remaining;
    }, 500);
  });
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