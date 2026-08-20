import { db, ref, onValue, remove, get, set} from './firebase.js';

  let div1 = document.getElementById("myDIV");
  let change = document.getElementById("change");
  let something = 0;
  let old = 0;
  let timer = null;
  let tickInterval = null;
  let latestPlayers = {};


window.onload = async () => {

  const snapshot = await get(ref(db, "past_value"));
  old = snapshot.val() || 0;

  if (old != 0) {
    await remove(ref(db, "numbers/" + old));
    console.log("Cleaned up old number:", old);
  }

  something = await herewego(something);
  console.log('Room created:', something);

  onValue(ref(db, "numbers/" + something), async (snapshot) => {
    const snap = await get(ref(db, "numbers/" + something));
    if (!snap.exists()) {
      window.location.replace("join or create.html");
    }
  });

  onValue(ref(db, "numbers/" + something + "/players"), async (snapshot) => {
    const playerlist = document.getElementById("host-list");
    const players = snapshot.val() || {};
    latestPlayers = players;

    const pointSnap = await get(ref(db, "numbers/" + something + "/points"));
    const points = pointSnap.val() || {};

    playerlist.innerText = "";
    Object.entries(players).forEach(([key, name]) => {
      const pts = points[key] || 0;
      playerlist.innerText += `${name}: ${pts}pts\n`;
    });

    rebuildGunMatrix(players);
  });

  onValue(ref(db, "numbers/" + something + "/points"), async (snapshot) => {
    const playerlist = document.getElementById("host-list");
    const points = snapshot.val() || {};

    const playerSnap = await get(ref(db, "numbers/" + something + "/players"));
    const players = playerSnap.val() || {};

    playerlist.innerText = "";
    Object.entries(players).forEach(([key, name]) => {
      const pts = points[key] || 0;
      playerlist.innerText += `${name}: ${pts}pts\n`;
    });
  });

  onValue(ref(db, "numbers/" + something + "/killed"), (snapshot) => {
    const killed = snapshot.val() || {};
    if (Object.keys(killed).length > 0) {
      document.getElementById("stop-btn").style.display = "none";
      document.getElementById("score-btn").style.display = "block";
    }
    if (killed["player1"]) {
      document.getElementById("role-display").style.textDecoration = "line-through";
      document.getElementById("role-target").style.textDecoration = "line-through";
      openYouDied();
    }
  });

  onValue(ref(db, "numbers/" + something + "/roles/player1"), async (snapshot) => {
    const role = snapshot.val();
    const guy = document.getElementById("guy");
    const roledisplay = document.getElementById("role-display");
    const roleTarget = document.getElementById("role-target");

    if (!role) {
      roledisplay.style.display = "none";
      roleTarget.style.display = "none";
      return;
    }

    document.getElementById("role-text").textContent = "You are... " + role;
    roledisplay.style.textDecoration = "none";
    roleTarget.style.textDecoration = "none";
    guy.src = '';

    switch (role) {
      case "a Monk":
        roleTarget.innerText = "Try to survive!";
        guy.src = 'hehegooguy1.png';
        break;

      case "a Spy":
        roleTarget.innerText = "Deduce who's the Assassin!";
        guy.src = 'hehegooguy5.png';
        break;

      case "an Assassin": {
        const targetKeySnap = await get(ref(db, "numbers/" + something + "/assassinTarget"));
        const targetKey = targetKeySnap.val();
        const playerSnap = await get(ref(db, "numbers/" + something + "/players"));
        const players = playerSnap.val() || {};
        roleTarget.innerText = "Your target is: " + (players[targetKey] || "?");
        guy.src = 'hehebadguy.png';
        break;
      }
    }

    roledisplay.style.display = "block";
    roledisplay.style.animation = "shake 1s linear";
    roleTarget.style.display = "block";
    roleTarget.style.animation = "shake 1s linear";
  });

  onValue(ref(db, "numbers/" + something + "/gunHolder"), (snapshot) => {
    const holderKey = snapshot.val();
    document.querySelectorAll("#gun-matrix button").forEach(btn => {
      btn.classList.toggle("gun-active", btn.dataset.key === holderKey);
    });
    const holderName = holderKey ? (latestPlayers[holderKey] || holderKey) : "No one";
    document.getElementById("gun-holder-display").textContent = "Gun: " + holderName;
  });

  onValue(ref(db, "numbers/" + something + "/lastShot"), (snapshot) => {
    const shot = snapshot.val();
    if (!shot) return;
    openShotPopup(shot.targetName, shot.targetRole);
  });
}

async function herewego(something) {
  something = Math.floor(Math.random() * (9999 - 1000)) + 1000;
  set(ref(db, "numbers/" + something), {
    players: {player1: "Host"},
    timer: {running: false}
  });
  set(ref(db, "past_value"), something);
  change.innerText = something;
  return something;
}

window.backBtn = function backBtn() {
  remove(ref(db, "numbers/" + something));
  something = 0;
}

function timerend() {
  div1.hidden = false;
  div1.innerText = "Pass the gun!";
  div1.style.animation = "mymove 4s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function timerplay() {
  div1.hidden = false;
  div1.innerText = "Timer Start!";
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function endAnim() {
  div1.style.animation = "disappear 0.3s forwards";
  div1.hidden = true;
}

window.mythingy = async function mythingy() {
  const roledisplay = document.getElementById("role-display");
  const roleTarget = document.getElementById("role-target");

  void roledisplay.offsetHeight;
  roledisplay.style.animation = "none";
  roleTarget.style.animation = "none";

  document.getElementById("stop-btn").style.display = "block";
  document.getElementById("score-btn").style.display = "none";

  await Promise.all([
    set(ref(db, "numbers/" + something + "/roles"), null),
    set(ref(db, "numbers/" + something + "/killed"), null),
    set(ref(db, "numbers/" + something + "/lastShot"), null),
    set(ref(db, "numbers/" + something + "/gunHolder"), null),
    set(ref(db, "numbers/" + something + "/gunTouches"), null),
    set(ref(db, "numbers/" + something + "/gunUndo"), null),
    set(ref(db, "numbers/" + something + "/assassinTarget"), null),
  ]);

  const snap = await get(ref(db, "numbers/" + something + "/players"));
  const players = snap.val() || {};
  const keys = Object.keys(players);

  const roles = ["an Assassin", "a Spy"];
  while (roles.length < keys.length) roles.push("a Monk");
  const shuffled = roles.sort(() => Math.random() - 0.5);

  for (let i = 0; i < keys.length; i++) {
    await set(ref(db, "numbers/" + something + "/roles/" + keys[i]), shuffled[i]);
  }

  const assassinIdx = shuffled.indexOf("an Assassin");
  const assassinKey = keys[assassinIdx];
  const nonAssassinKeys = keys.filter(k => k !== assassinKey);
  const targetKey = nonAssassinKeys[Math.floor(Math.random() * nonAssassinKeys.length)];
  await set(ref(db, "numbers/" + something + "/assassinTarget"), targetKey);
  console.log("Roles assigned. Assassin target:", targetKey);
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
    timerDisplay.style.display = "block";
    clearInterval(tickInterval);

    tickInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
      const remaining = data.duration - elapsed;

      if (remaining <= 0) {
        timerend();
        clearInterval(tickInterval);
        set(ref(db, "numbers/" + something + "/timer"), { running: false });
      }
      timerDisplay.textContent = remaining;
    }, 500);
  });
}

window.passGun = async function(playerKey) {
  const [holderSnap, touchSnap] = await Promise.all([
    get(ref(db, "numbers/" + something + "/gunHolder")),
    get(ref(db, "numbers/" + something + "/gunTouches/" + playerKey))
  ]);
  const prevHolder = holderSnap.val();
  const currentTouches = touchSnap.val() || 0;

  await Promise.all([
    set(ref(db, "numbers/" + something + "/gunHolder"), playerKey),
    set(ref(db, "numbers/" + something + "/gunTouches/" + playerKey), currentTouches + 1),
    set(ref(db, "numbers/" + something + "/gunUndo"), {
      prevHolder: prevHolder,
      undoKey: playerKey,
      undoCount: currentTouches
    })
  ]);
}

window.undoGun = async function() {
  const snap = await get(ref(db, "numbers/" + something + "/gunUndo"));
  const undo = snap.val();
  if (!undo) return;

  await Promise.all([
    set(ref(db, "numbers/" + something + "/gunHolder"), undo.prevHolder),
    set(ref(db, "numbers/" + something + "/gunTouches/" + undo.undoKey), undo.undoCount),
    remove(ref(db, "numbers/" + something + "/gunUndo"))
  ]);
}

function rebuildGunMatrix(players) {
  const matrix = document.getElementById("gun-matrix");
  if (!matrix) return;
  const currentHolder = matrix.querySelector(".gun-active")?.dataset?.key || null;
  matrix.innerHTML = "";
  Object.entries(players).forEach(([key, name]) => {
    const btn = document.createElement("button");
    btn.innerText = name;
    btn.dataset.key = key;
    if (key === currentHolder) btn.classList.add("gun-active");
    btn.onclick = () => window.passGun(key);
    matrix.appendChild(btn);
  });
}

function openShotPopup(name, role) {
  const images = { "a Monk": "hehegooguy1.png", "a Spy": "hehegooguy5.png", "an Assassin": "hehebadguy.png" };
  document.getElementById("shot-name").textContent = name + " has been Shot!";
  document.getElementById("shot-role").textContent = "They were " + role;
  document.getElementById("shot-img").src = images[role] || "";
  const popup = document.getElementById("shot-popup");
  popup.style.display = "flex";
  popup.style.animation = "popup 1s forwards";
}

window.closeShotPopup = function() {
  const popup = document.getElementById("shot-popup");
  popup.style.animation = "popout 1s forwards";
  setTimeout(() => { popup.style.display = "none"; }, 250);
}

window.openYouDied = async function() {
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("you-died").style.animation = "popup 1s forwards";
  document.getElementById("you-died").style.display = "flex";
}

window.closeYouDied = async function() {
  document.getElementById("you-died").style.animation = "popout 1s forwards";
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("you-died").style.display = "none";
}

window.renameHost = async function() {
  const input = document.getElementById("rename-input");
  const newName = input.value.trim();
  if (!newName) return;
  await set(ref(db, "numbers/" + something + "/players/player1"), newName);
  input.value = "";
}

window.openKickPopup = async function() {
  const kickList = document.getElementById("kick-list");
  kickList.innerHTML = "";

  const playerSnap = await get(ref(db, "numbers/" + something + "/players"));
  const players = playerSnap.val() || {};

  Object.entries(players).forEach(([key, name]) => {
    if (key === "player1") return;
    const btn = document.createElement("button");
    btn.innerText = name;
    btn.onclick = async () => {
      await remove(ref(db, "numbers/" + something + "/players/" + key));
      window.closeKickPopup();
    };
    kickList.appendChild(btn);
  });

  document.getElementById("kick-popup").style.display = "flex";
  document.getElementById("kick-popup").style.animation = "popup 1s forwards";
}

window.closeKickPopup = async function() {
  document.getElementById("kick-popup").style.animation = "popout 1s forwards";
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("kick-popup").style.display = "none";
}

window.openKillPopup = async function() {
  const killList = document.getElementById("kill-list");
  killList.innerHTML = "";

  const playerSnap = await get(ref(db, "numbers/" + something + "/players"));
  const players = playerSnap.val() || {};

  Object.entries(players).forEach(([key, name]) => {
    if (key === "player1") return;
    const btn = document.createElement("button");
    btn.innerText = name;
    btn.onclick = async () => {
      await set(ref(db, "numbers/" + something + "/killed/" + key), true);
      window.closeKillPopup();
    };
    killList.appendChild(btn);
  });

  document.getElementById("kill-popup").style.display = "flex";
  document.getElementById("kill-popup").style.animation = "popup 1s forwards";
}

window.closeKillPopup = async function() {
  document.getElementById("kill-popup").style.animation = "popout 1s forwards";
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("kill-popup").style.display = "none";
}

window.openScoring = async function() {
  document.getElementById("score-popup").style.display = "flex";
  document.getElementById("score-popup").style.animation = "popup 1s forwards";
}

window.closeScoring = async function() {
  document.getElementById("score-popup").style.animation = "popout 1s forwards";
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("score-popup").style.display = "none";
}

let boolboi = false;

window.score_dropdown = function() {
  const droppy = document.getElementById("dropdown-content");
  const score = document.getElementById("score");
  if (boolboi === false) {
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

  const pointMap = {};
  Object.keys(players).forEach(key => {
    const role = roles[key];
    switch (what) {
      case "AssWin":  pointMap[key] = role === "an Assassin" ? 1 : 0; break;
      case "SpyWin":  pointMap[key] = role === "a Spy" ? 2 : role === "a Monk" ? 1 : 0; break;
      case "AssSpy":  pointMap[key] = role === "an Assassin" ? 3 : 0; break;
      case "AssWrong": pointMap[key] = role === "a Monk" || role === "a Spy" ? 1 : 0; break;
      case "SpyWrong": pointMap[key] = role === "an Assassin" ? 1 : 0; break;
    }
  });

  document.getElementById("score-btn").style.display = "none";

  for (const [key, pts] of Object.entries(pointMap)) {
    const currentSnap = await get(ref(db, "numbers/" + something + "/points/" + key));
    const current = currentSnap.val() || 0;
    await set(ref(db, "numbers/" + something + "/points/" + key), current + pts);
  }

  const labels = {
    AssWin: "Assassin killed target", SpyWin: "Spy killed Assassin",
    AssSpy: "Assassin killed Spy", AssWrong: "Assassin killed wrong person",
    SpyWrong: "Spy killed wrong person"
  };
  label.innerText = labels[what];
}

window.resetScoring = async function() {
  const playerPoint = await get(ref(db, "numbers/" + something + "/points"));
  if (playerPoint.val() != null) {
    await remove(ref(db, "numbers/" + something + "/points"));
  }
}
