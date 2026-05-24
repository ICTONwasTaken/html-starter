import { db, ref, onValue, remove, get, set} from './firebase.js';

  let div1 = document.getElementById("myDIV"); 
  let change = document.getElementById("change");
  let nochange = document.getElementById("nochange");  
  let num = document.getElementById("num"); 
  let something = 0;
  let counting = "";
  let old = 0;
  let timer = null;
  


window.onload = async () => {

  const snapshot = await get(ref(db, "past_value"));
  old = snapshot.val() || 0;

  if (old != 0) {
      await remove(ref(db, "numbers/" + old));
      console.log("Cleaned up old number:", old);
    }

  something = await herewego(something);
  console.log('All resources finished loading');

  onValue(ref(db, "numbers/" + something), async (snapshot) => {
      const snap = await get(ref(db, "numbers/" + something));
        if (!snap.exists()) {
              window.location.replace("join or create.html");
          }
        });

  onValue(ref(db, "numbers/" + something + "/players"), async (snapshot) => {
  const playerlist = document.getElementById("host-list");
  const players = snapshot.val() || {};

  const [pointSnap] = await Promise.all([
    get(ref(db, "numbers/" + something + "/points"))
  ]);

  const points = pointSnap.val() || {};

  playerlist.innerText = ""; // clear it
  Object.entries(players).forEach(([key, name]) => {
    const pts = points[key] || 0;
    playerlist.innerText += `${name} — ${pts}pts\n`;
  });
  });

  onValue(ref(db, "numbers/" + something + "/points"), async (snapshot) => {
  const playerlist = document.getElementById("host-list");
  const points = snapshot.val() || {};  // ✅ snapshot IS points here

  const playerSnap = await get(ref(db, "numbers/" + something + "/players")); // ✅ fetch players separately
  const players = playerSnap.val() || {};

  playerlist.innerText = "";
  Object.entries(players).forEach(([key, name]) => {
    const pts = points[key] || 0;
    playerlist.innerText += `${name} — ${pts}pts\n`;
  });
  });
  
  onValue(ref(db, "numbers/" + something + "/killed"), async (snapshot) => {
        const killed = snapshot.val() || {};
        console.log("Ya ded yet?")
        console.log("Killed:", killed);
        if (Object.keys(killed).length > 0) {
          document.getElementById("stop-btn").style.display = "none";
          document.getElementById("score-btn").style.display = "flex";
        }

        if (killed["player1"]) {
          document.getElementById("role-display").style.textDecoration = "line-through";
          document.getElementById("role-target").style.textDecoration = "line-through";
          openYouDied();
          console.log("You just died boiiiii!")

        } else {
          div1.hidden = false
          const killedKeys = Object.keys(killed);

            if (killedKeys.length > 0) {
              const lastKilledKey = killedKeys[killedKeys.length - 1];
              get(ref(db, "numbers/" + something + "/players/" + lastKilledKey))
                .then((snap) => {
                  const playerName = snap.val();
                  div1.hidden = false;
                  div1.innerText = playerName + " just died!";
                  div1.style.animation = "mymove 5s forwards";       // moved INSIDE the if block
                  div1.addEventListener("animationend", endAnim, { once: true });
                });
            }
        }
      });

  onValue(ref(db, "numbers/" + something + "/roles/player1"), async (snapshot) => {
  const role = snapshot.val();

  if (role) {
    document.getElementById("role-display").textContent = "You are... " + role;
  }

  switch (role) {
  case "a Monk":
    document.getElementById("role-target").innerText = "Try to survive!";
    document.getElementById("stop-btn").style.display = "none";
    break;

  case "a Spy":
    document.getElementById("role-target").innerText = "Deduce who's the Assassin!";
    document.getElementById("stop-btn").style.display = "block";
    break;

  case "an Assassin":
    const playerSnap = await get(ref(db, "numbers/" + something + "/players"));
    const players = playerSnap.val() || {};
    const keys = Object.keys(players).filter(key => players[key] !== "Host");

    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomPlayer = players[randomKey];
    document.getElementById("role-target").innerText = "Your target is: " + randomPlayer;
    console.log("This guy's an assasin! His target is:", randomPlayer);
    document.getElementById("stop-btn").style.display = "block";
    break;
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
  div1.style.animation = "mymove 4s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function timerplay() {
  div1.hidden = false
  div1.innerText = "Timer Start!";
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function endAnim() { 
    div1.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
  }



let tickInterval = null; // track the interval so we can clear it

window.mythingy = async function mythingy() {
  const roledisplay = document.getElementById("role-display");  // re-query here
  const roleTarget = document.getElementById("role-target");

  void roledisplay.offsetHeight;
  roledisplay.style.textDecoration = "none";
  roleTarget.style.textDecoration = "none";
  roledisplay.style.animation = "none";
  roleTarget.style.animation = "none";
  

  await set(ref(db, "numbers/" + something + "/roles"), null);


  const snap = await get(ref(db, "numbers/" + something + "/players"));
  const players = snap.val() || {};
  const keys = Object.keys(players);

  const roles = ["an Assassin", "a Spy"];
  while (roles.length < keys.length) {
    roles.push("a Monk");
  }

  const shuffled = roles.sort(() => Math.random() - 0.5);

  for (let i = 0; i < keys.length; i++) {
    await set(ref(db, "numbers/" + something + "/roles/" + keys[i]), shuffled[i]);
    console.log("the roles have been sorted!")
    }

  roledisplay.style.display = "block";
  roledisplay.style.animation = "shake 1s linear";
  roleTarget.style.display = "block";
  roleTarget.style.animation = "shake 1s linear";
  await set(ref(db, "numbers/" + something + "/killed"), null);
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

window.openKillPopup = async function() {
  const killList = document.getElementById("kill-list");
  killList.innerHTML = "";

  const [playerSnap, killedSnap] = await Promise.all([
    get(ref(db, "numbers/" + something + "/players")),
    get(ref(db, "numbers/" + something + "/killed"))
  ]);

  const players = playerSnap.val() || {};
  const killed = killedSnap.val() || {};

  Object.entries(players).forEach(([key, name]) => {
    if (key === "player1") return;  // skip host (yourself)

    const btn = document.createElement("button");
    btn.innerText = name;
    btn.onclick = async () => {
      await set(ref(db, "numbers/" + something + "/killed/" + key), true);
      closeKillPopup();
    };
    killList.appendChild(btn);
  });

  document.getElementById("kill-popup").style.display = "flex";
  document.getElementById("kill-popup").style.animation = "popup 1s forwards"
}

window.closeKillPopup = async function() {
  document.getElementById("kill-popup").style.animation = "popout 1s forwards"
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("kill-popup").style.display = "none";
}


window.openYouDied = async function() {
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("you-died").style.animation = "popup 1s forwards";
  document.getElementById("you-died").style.display = "flex";
}

window.closeYouDied = async function() {
  document.getElementById("you-died").style.animation = "popout 1s forwards"
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("you-died").style.display = "none";
}


window.openScoring = async function() {
  document.getElementById("score-popup").style.display = "flex";
  document.getElementById("score-popup").style.animation = "popup 1s forwards"
}

let boolboi = false;

window.score_dropdown = function() {
              const droppy = document.getElementById("dropdown-content");
              const score = document.getElementById("score");

              if (boolboi == false) {
                droppy.style.display = "block";
                score.style.userSelect = "none";
                score.style.backgroundColor = 'rgb(224, 173, 96)';
                score.style.color = 'rgb(27, 12, 36)';
                boolboi = true;
              } else {
                score.style.backgroundColor = "";
                score.style.color = 'rgb(224, 173, 96)';
                droppy.style.display = "none";
                boolboi = false;
              }
              
            }

window.score_click = async function(what, event) {
  event.stopPropagation();
  const dropdown = document.getElementById("dropdown-content");
  const score = document.getElementById("score");
  const label = document.getElementById("score-label");

  // grab both at the same time, no cap
  const [playerSnap, roleSnap] = await Promise.all([
    get(ref(db, "numbers/" + something + "/players")),
    get(ref(db, "numbers/" + something + "/roles"))
  ]);

  const players = playerSnap.val() || {};
  const roles = roleSnap.val() || {};

  score.style.backgroundColor = "";
  score.style.color = 'rgb(224, 173, 96)';
  dropdown.style.display = "none";
  boolboi = false;

  // figure out who gets points based on what happened
  let pointMap = {}; // { playerKey: points }

  Object.keys(players).forEach(key => {
    const role = roles[key];
    switch (what) {
      case "AssWin": // assassin killed target, assassin gets points
        pointMap[key] = role === "an Assassin" ? 3 : 0;
        break;
      case "SpyWin": // spy killed assassin, spy gets points
        pointMap[key] = role === "a Monk" || role === "a Spy" ? 1 : 0;
        break;
      case "AssSpy": // assassin killed spy, assassin gets points
        pointMap[key] = role === "an Assassin" ? 1 : 0;
        break;
      case "AssWrong": // assassin killed wrong person, monks/spy get points
        pointMap[key] = role === "a Monk" || role === "a Spy" ? 1 : 0;
        break;
      case "SpyWrong": // spy killed wrong person, assassin gets points
        pointMap[key] = role === "an Assassin" ? 1 : 0;
        break;
    }
  });

  // save points to firebase bro
  for (const [key, pts] of Object.entries(pointMap)) {
    const currentSnap = await get(ref(db, "numbers/" + something + "/points/" + key));
    const current = currentSnap.val() || 0;
    await set(ref(db, "numbers/" + something + "/points/" + key), current + pts);
  }

  // update the label
  const labels = {
    AssWin: "Assassin killed target",
    SpyWin: "Spy killed Assassin",
    AssSpy: "Assassin killed Spy",
    AssWrong: "Assassin killed wrong person",
    SpyWrong: "Spy killed wrong person"
  };
  label.innerText = labels[what];
}

window.closeScoring = async function() {
            document.getElementById("score-popup").style.animation = "popout 1s forwards"
            await new Promise(resolve => setTimeout(resolve, 250));
            document.getElementById("score-popup").style.display = "none";
            document.getElementById("score-btn").style.display = "none";
          }