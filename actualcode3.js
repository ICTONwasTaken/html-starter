import { db, ref, onValue, remove } from './firebase.js';


  const div1 = document.getElementById("myDIV"); 
  let change = document.getElementById("change");
  let num = document.getElementById("player-count");
  let something = 0;
  let counting = "";
  let playerlist = document.getElementById("player-list")

  const myPlayerKey = localStorage.getItem("myPlayerKey");

window.onload = async () => {
  playAnim();
  start();

  onValue(ref(db, "numbers/" + rum + "/players"), (snapshot) => {
    const players = snapshot.val() || {};
    const stuff = Object.values(players);

    counting = stuff.join("\n");
    playerlist.innerText = counting;
  });
  const rum = localStorage.getItem("joinedRoom");

onValue(ref(db, "numbers/" + something + "/timer"), (snapshot) => {
  const data = snapshot.val();
  const timerDisplay = document.getElementById("timer-display");
  const playercount = document.getElementById("player-count");
  const stopBtn = document.getElementById("stop-btn");

  // Timer stopped or reset
  if (!data || !data.running) {
    clearInterval(tickInterval);
    timerDisplay.style.display = "none";
    stopBtn.style.display = "none";
    playercount.style.display = "block";
    return;
  }

  // Timer running
  timerDisplay.style.display = "block";
  stopBtn.style.display = "inline-block";
  playercount.style.display = "none";
  clearInterval(tickInterval); // clear any previous interval

  tickInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
    const remaining = data.duration - elapsed;

    if (remaining <= 0) {
      timerDisplay.textContent = "0";
      clearInterval(tickInterval);

      // Auto-restart after 3 seconds
      setTimeout(() => {
        window.mythingy();
      }, 3000);
      return;
    }
    timerDisplay.textContent = remaining;
  }, 500);
});
}

function start() {
  document.getElementById("room-boi").innerText = rum;
}

function playAnim () {
  div1.hidden = false;
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

  console.log("rum:", rum);
  console.log("myPlayerKey:", myPlayerKey);
}