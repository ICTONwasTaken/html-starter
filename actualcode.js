import { db, ref, onValue, remove, get, set} from './firebase.js';

  let div1 = document.getElementById("myDIV"); 
  let change = document.getElementById("change"); 
  let num = document.getElementById("num"); 
  let something = 0;
  let counting = "";
  let old = 0;
  let playerlist = document.getElementById("host-list")


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
      const stuff = Object.values(players);
  
      counting = stuff.join("\n");
      playerlist.innerText = counting;
    });

  
  // Add this inside window.onload, after the players onValue listener
  onValue(ref(db, "numbers/" + something + "/timer"), (snapshot) => {
  const data = snapshot.val();
  const timerDisplay = document.getElementById("timer-display");
  const playercount = document.getElementById("player-count");
  const stopBtn = document.getElementById("stop-btn");
  const beginBtn = document.getElementById("begin-btn");

  // Timer stopped or reset
  if (!data || !data.running) {
    clearInterval(tickInterval);
    timerDisplay.style.display = "none";
    stopBtn.style.display = "none";
    playercount.style.display = "block";
    beginBtn.style.display = "block";
    return;
  }

  // Timer running
  timerDisplay.style.display = "block";
  stopBtn.style.display = "inline-block";
  playercount.style.display = "none";
  beginBtn.style.display = "none";
  clearInterval(tickInterval); // clear any previous interval

  tickInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
    const remaining = data.duration - elapsed;

    if (remaining <= 0) {
      timerend()
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

async function herewego(something) {
  something = Math.floor(Math.random() * (9999 - 1000) ) + 1000;

  set(ref(db, "numbers/" + something), {
    players: {
        player1: "Host" // host is just the first player
    }
  });
  set(ref(db, "past_value"), something); 
  console.log("This worked! You sent:", something);

  change.innerText = something;
  return something;
}

window.backBtn = function backBtn() {
    remove(ref(db, "numbers/" + something));
    console.log("This also worked! You destroyed:", something);
    something = 0;
}

function playerscome() {
  div1.hidden = false
  div1.innerText = "A new player arrives!";
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function timerend() {
  div1.hidden = false
  div1.innerText = "The timer ended!";
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function endAnim() { 
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
  }

let tickInterval = null; // track the interval so we can clear it

window.mythingy = function mythingy() {
  const startTime = Date.now();
  set(ref(db, "numbers/" + something + "/timer"), {
    running: true,
    startedAt: startTime,
    duration: 30
  });
}

window.stopTimer = function stopTimer() {
  set(ref(db, "numbers/" + something + "/timer"), { running: false });
}
