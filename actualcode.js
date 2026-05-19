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
  let roledisplay = document.getElementById("role-display")


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

  onValue(ref(db, "numbers/" + something + "/roles/player1"), async (snapshot) => {
  const role = snapshot.val();
  document.getElementById("role-target").style.display = "none";
  document.getElementById("role-target").style.animation = "none";

  if (role) {
    document.getElementById("role-display").textContent = "You are... " + role;

  if (role == "a Monk") {}
  document.getElementById("role-target").innerText = "Try to survive!";
  document.getElementById("role-target").style.display = "block";
  document.getElementById("role-target").style.animation = "shake 1s linear";

  if (role == "a Spy") {}
  document.getElementById("role-target").innerText = "Deduce who's the Assassin!";
  document.getElementById("role-target").style.display = "block";
  document.getElementById("role-target").style.animation = "shake 1s linear";

  if (role == "an Assassin") {
    const playerSnap = await get(ref(db, "numbers/" + something + "/players"));
    const players = playerSnap.val() || {};
    const keys = Object.keys(players).filter(key => players[key] !== "Host");

    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomPlayer = players[randomKey];
    document.getElementById("role-target").innerText = "Your target is: " + randomPlayer;
    document.getElementById("role-target").style.display = "block";
    document.getElementById("role-target").style.animation = "shake 1s linear";
    console.log("This guy's an assasin! His target is:", randomPlayer);

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

function timerplay() {
  div1.hidden = false
  div1.innerText = "Timer Start!";
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function endAnim() { 
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
  }



let tickInterval = null; // track the interval so we can clear it

window.mythingy = async function mythingy() {
  roledisplay.style.animation = "none";

  await set(ref(db, "numbers/" + something + "/roles"), null);


  const snap = await get(ref(db, "numbers/" + something + "/players"));
  const players = snap.val() || {};
  const keys = Object.keys(players);

  const roles = ["a Monk", "a Monk", "an Assassin", "a Spy"];
  const shuffled = roles.sort(() => Math.random() - 0.5);

  for (let i = 0; i < keys.length; i++) {
    await set(ref(db, "numbers/" + something + "/roles/" + keys[i]), shuffled[i]);
    console.log("the roles have been sorted!")
    }

  document.getElementById("role-display").style.display = "block";
  document.getElementById("stop-btn").style.display = "block";
  roledisplay.style.animation = "shake 1s linear";
  }

window.mytimer = function mytimer() {
  const startTime = Date.now();
  set(ref(db, "numbers/" + something + "/timer"), {
    running: true,
    startedAt: startTime,
    duration: 30
  });
  timerstart();
  timerplay();
}

function timerstart() {
  if (timer) timer();
  timer = onValue(ref(db, "numbers/" + something + "/timer"), (snapshot) => {
    const data = snapshot.val();
    if (!data || !data.running) return;

    const timerDisplay = document.getElementById("timer-display");
    timerDisplay.style.display = "block"

  // Timer running
    console.log("the timer starts!")
    clearInterval(tickInterval); // clear any previous interval

    tickInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
      const remaining = data.duration - elapsed;

    if (remaining <= 0) {
      timerend()
      clearInterval(tickInterval);
      set(ref(db, "numbers/" + something + "/timer"), { running: false });
      console.log("the timer ends!")
    }
    timerDisplay.textContent = remaining;
  }, 500);
});
}
