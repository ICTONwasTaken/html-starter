import { db, ref, onValue, remove, get, set} from './firebase.js';

  let div1 = document.getElementById("myDIV"); 
  let change = document.getElementById("change");
  let nochange = document.getElementById("nochange");  
  let num = document.getElementById("num"); 
  let something = 0;
  let counting = "";
  let old = 0;
  let timer = null;
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

  onValue(ref(db, "numbers/" + something + "/players"), async (snapshot) => {
      const players = snapshot.val() || {};
      const stuff = Object.values(players);
  
      counting = stuff.join("\n");
      playerlist.innerText = counting;
    });

  onValue(ref(db, "numbers/" + something + "/roles/player1"), (snapshot) => {
  const role = snapshot.val();
  if (role) {
    document.getElementById("role-display").textContent = "You are... " + role;

  if (role == "an Assassin") {
    const playerSnap = get(ref(db, "numbers/" + something + "/players"));
    const players = playerSnap.val() || {};
    const keys = Object.keys(players);

    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomPlayer = players[randomKey];
    console.log("This guy's an assasin! His target is:", randomplayer);

  };
  }
});
}

async function herewego(something) {
  something = Math.floor(Math.random() * (9999 - 1000) ) + 1000;

  set(ref(db, "numbers/" + something), {
    players: {player1: "Host"},
    timer: {running: false}
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

function game_time() {
  const timerDisplay = document.getElementById("timer-display");
  const playercount = document.getElementById("player-count");
  const stopBtn = document.getElementById("stop-btn");
  const beginBtn = document.getElementById("begin-btn");
  const nochange = document.getElementById("nochange");
  const role = document.getElementById("role-display");  

  // No game running — show lobby
  change.style.display = "block"       // show room ID
  nochange.style.display = "block"     // show "Room ID:" label
  timerDisplay.style.display = "none"  // hide timer
  stopBtn.style.display = "none"       // hide stop
  beginBtn.style.display = "block"     // show begin
  playercount.style.display = "block"  // show players
  role.style.display = "none"          // hide role'
  document.getElementById("timer-btn").style.display = "block";
}

function game_end() {
  const timerDisplay = document.getElementById("timer-display");
  const playercount = document.getElementById("player-count");
  const stopBtn = document.getElementById("stop-btn");
  const beginBtn = document.getElementById("begin-btn");
  const nochange = document.getElementById("nochange");
  const role = document.getElementById("role-display"); 

  // Game running — show timer
  change.style.display = "none"
  nochange.style.display = "none"
  timerDisplay.style.display = "block"
  stopBtn.style.display = "inline-block"
  beginBtn.style.display = "none"
  playercount.style.display = "none"
  role.style.display = "block"
  document.getElementById("timer-btn").style.display = "none";
}

function playerscome() {
  div1.hidden = false
  div1.innerText = "A new player arrives!";
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

let tickInterval = null; // track the interval so we can clear it

window.mythingy = async function mythingy() {
  const snap = await get(ref(db, "numbers/" + something + "/players"));
  const players = snap.val() || {};
  const keys = Object.keys(players);

  const roles = ["a Monk", "a Monk", "an Assassin", "a Spy"];
  const shuffled = roles.sort(() => Math.random() - 0.5);

  game_end()

  for (let i = 0; i < keys.length; i++) {
    await set(ref(db, "numbers/" + something + "/roles/" + keys[i]), shuffled[i]);
    console.log("the roles have been sorted!")
    }
  }

window.mytimer = function mytimer() {
  const startTime = Date.now();
  set(ref(db, "numbers/" + something + "/timer"), {
    running: true,
    startedAt: startTime,
    duration: 30
  });
  timerstart()
}

function timerstart() {
  if (timer) timer();
  timer = onValue(ref(db, "numbers/" + something + "/timer"), (snapshot) => {
    const data = snapshot.val();
    if (!data || !data.running) return;

    const timerDisplay = document.getElementById("timer-display");
    timerDisplay.style.display = "none"

  // Timer running
    console.log("the timer starts!")
    clearInterval(tickInterval); // clear any previous interval

    tickInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
      const remaining = data.duration - elapsed;

    if (remaining <= 0) {
      timerend()
      clearInterval(tickInterval);
      timerDisplay.style.display = "block"
      set(ref(db, "numbers/" + something + "/timer"), { running: false });
      console.log("the timer ends!")
    }
    timerDisplay.textContent = remaining;
  }, 500);
});
}
