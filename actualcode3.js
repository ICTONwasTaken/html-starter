import { db, ref, onValue, remove, get, set } from './firebase.js';

const div1 = document.getElementById("myDIV"); 
let playerlist = document.getElementById("player-list");

const rum = localStorage.getItem("joinedRoom");
const myPlayerKey = localStorage.getItem("myPlayerKey");
let tickInterval = null;

let roledisplay = document.getElementById("role-display");
let wasRunning = false;

window.onload = async () => {
  playAnim();
  start();

  onValue(ref(db, "numbers/" + rum), async (snapshot) => {
  const snap = await get(ref(db, "numbers/" + rum));
    if (!snap.exists()) {
          window.location.replace("joinroom.html");
          localStorage.removeItem("joinedRoom");
          localStorage.removeItem("myPlayerKey");
      }
    });

  onValue(ref(db, "numbers/" + rum + "/players"), (snapshot) => {
    let counting = "";
    const players = snapshot.val() || {};
    const stuff = Object.values(players);

    counting = stuff.join("\n");
    playerlist.innerText = counting;
  });

  onValue(ref(db, "numbers/" + rum + "/roles/" + myPlayerKey), async (snapshot) => {
  roledisplay.style.animation = "none";
  void document.getElementById("player-thing").offsetHeight;
  document.getElementById("player-thing").style.display = "none";

  const role = snapshot.val();
  if (role) {
    document.getElementById("role-display").textContent = "You are... " + role;
    document.getElementById("player-thing").style.display = "block";
    roledisplay.style.animation = "shake 1s linear";
    }

    switch (role) {
      case "a Monk":
        document.getElementById("role-target").innerText = "Try to survive!";
        document.getElementById("stop-btn").style.display = "none";
        break;
      case "a Spy":
        document.getElementById("role-target").innerText = "Deduce who's the Assassin!";
        document.getElementById("stop-btn").style.display = "flex";
        break;
      case "an Assassin":
        const playerSnap = await get(ref(db, "numbers/" + rum + "/players"));
        const players = playerSnap.val() || {};
        const keys = Object.keys(players).filter(key => key !== myPlayerKey);
    
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const randomPlayer = players[randomKey];
        document.getElementById("role-target").innerText = "Your target is: " + randomPlayer;
        console.log("This guy's an assasin! His target is:", randomPlayer);
         document.getElementById("stop-btn").style.display = "flex";
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

  onValue(ref(db, "numbers/" + rum + "/killed"), async (snapshot) => {
    const killed = snapshot.val() || {};
    console.log("Ya ded yet?")
    console.log("Killed:", killed);

    if (killed[myPlayerKey]) {
      openYouDied();
      console.log("You just died boiiiii!")
    } else if (killed["player1"])  {
        div1.hidden = false;
        div1.innerText = "Host just died!";
        div1.style.animation = "mymove 5s forwards";
        div1.addEventListener("animationend", endAnim, { once: true });
    } else {
      div1.hidden = false
       const killedKeys = Object.keys(killed);
      if (killedKeys.length > 0) {
          const lastKilledKey = killedKeys[killedKeys.length - 1];

        get(ref(db, "numbers/" + rum + "/players/" + lastKilledKey))
          .then((snap) => {
              const playerName = snap.val();
              console.log("Last Killed Key:", lastKilledKey);
              div1.hidden = false;
              div1.innerText = playerName + " just died!";
              div1.style.animation = "mymove 0.9s forwards";
              div1.addEventListener("animationend", endAnim, { once: true });
          });
        }
    }
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
  div1.style.animation = "disappear 0.3s forwards"; 
  div1.hidden = true;
}

window.backBtn3 = async function backBtn3() {
  await remove(ref(db, "numbers/" + rum + "/players/" + myPlayerKey));
  localStorage.removeItem("joinedRoom");
  localStorage.removeItem("myPlayerKey");
  window.location.href = "joinroom.html";
}


window.openKillPopup = async function() {
  const killList = document.getElementById("kill-list");
  killList.innerHTML = "";

  const [playerSnap, killedSnap] = await Promise.all([
    get(ref(db, "numbers/" + rum + "/players")),
    get(ref(db, "numbers/" + rum + "/killed"))
  ]);

  const players = playerSnap.val() || {};
  const killed = killedSnap.val() || {};

  Object.entries(players).forEach(([key, name]) => {
    if (key === myPlayerKey) return;  // skip host (yourself)
    if (killed[key]) return;        // skip already killed

    const btn = document.createElement("button");
    btn.innerText = name;
    btn.onclick = async () => {
      await set(ref(db, "numbers/" + rum + "/killed/" + key), true);
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
  document.getElementById("you-died").style.animation = "popup 1s forwards"
  document.getElementById("you-died").style.display = "flex";
}

window.closeYouDied = async function() {
  document.getElementById("you-died").style.animation = "popout 1s forwards"
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("you-died").style.display = "none";
}