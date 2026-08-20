import { db, ref, onValue, remove, get, set} from './firebase.js';

["Monk-Killed.png","Spy-Killed.png","Assassin-Killed.png",
 "hehegooguy1.png","hehegooguy5.png","hehebadguy.png"].forEach(src => {
  const img = new Image(); img.src = src;
});

let div1 = document.getElementById("myDIV");
let change = document.getElementById("change");
let something = 0;
let old = 0;
let timer = null;
let tickInterval = null;
let latestPlayers = {};
let hostRole = null;
let currentGunHolder = null;
let prevPlayerCount = 0;

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
    const players = snapshot.val() || {};
    latestPlayers = players;
    const count = Object.keys(players).length;

    const pointSnap = await get(ref(db, "numbers/" + something + "/points"));
    const points = pointSnap.val() || {};
    renderHostPlayerList(players, points);

    if (count > prevPlayerCount && prevPlayerCount > 0) {
      playerscome();
    }
    prevPlayerCount = count;

    rebuildGunMatrix(players);
    if (hostRole === "a Spy" || hostRole === "an Assassin") {
      buildHostShootMatrix(players);
    }
  });

  onValue(ref(db, "numbers/" + something + "/points"), async (snapshot) => {
    const points = snapshot.val() || {};
    const playerSnap = await get(ref(db, "numbers/" + something + "/players"));
    const players = playerSnap.val() || {};
    renderHostPlayerList(players, points);
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
    }
  });

  onValue(ref(db, "numbers/" + something + "/roles/player1"), async (snapshot) => {
    const role = snapshot.val();
    const guy = document.getElementById("guy");
    const roledisplay = document.getElementById("role-display");
    const roleTarget = document.getElementById("role-target");
    const shootSection = document.getElementById("shoot-section");

    if (!role) {
      hostRole = null;
      roledisplay.style.display = "none";
      roleTarget.style.display = "none";
      if (shootSection) {
        shootSection.style.display = "none";
        shootSection.classList.remove("inactive", "activated");
      }
      return;
    }

    hostRole = role;
    document.getElementById("role-text").textContent = "You are... " + role;
    roledisplay.style.textDecoration = "none";
    roleTarget.style.textDecoration = "none";
    guy.src = '';

    switch (role) {
      case "a Monk":
        roleTarget.innerText = "Try to survive!";
        guy.src = 'hehegooguy1.png';
        if (shootSection) shootSection.style.display = "none";
        break;

      case "a Spy": {
        roleTarget.innerText = "Deduce who's the Assassin!";
        guy.src = 'hehegooguy5.png';
        if (shootSection) {
          shootSection.classList.remove("inactive", "activated");
          document.getElementById("shoot-label").textContent = "Choose to shoot:";
          shootSection.style.display = "block";
        }
        const pSnap = await get(ref(db, "numbers/" + something + "/players"));
        buildHostShootMatrix(pSnap.val() || {});
        break;
      }

      case "an Assassin": {
        const targetKeySnap = await get(ref(db, "numbers/" + something + "/assassinTarget"));
        const playerSnap = await get(ref(db, "numbers/" + something + "/players"));
        const players = playerSnap.val() || {};
        roleTarget.innerText = "Your target is: " + (players[targetKeySnap.val()] || "?");
        guy.src = 'hehebadguy.png';
        if (shootSection) {
          shootSection.classList.add("inactive");
          shootSection.classList.remove("activated");
          document.getElementById("shoot-label").textContent = "Touch gun 3 times to activate...";
          shootSection.style.display = "block";
        }
        buildHostShootMatrix(players);
        const touchSnap = await get(ref(db, "numbers/" + something + "/gunTouches/player1"));
        renderTouchDots(touchSnap.val() || 0);
        break;
      }
    }

    roledisplay.style.display = "block";
    roledisplay.style.animation = "shake 1s linear";
    roleTarget.style.display = "block";
    roleTarget.style.animation = "shake 1s linear";
  });

  onValue(ref(db, "numbers/" + something + "/gunTouches/player1"), (snapshot) => {
    const touches = snapshot.val() || 0;
    if (hostRole === "an Assassin") {
      renderTouchDots(touches);
    }
    if (hostRole !== "an Assassin") return;
    const shootSection = document.getElementById("shoot-section");
    if (!shootSection) return;
    if (touches >= 3) {
      shootSection.classList.remove("inactive");
      shootSection.classList.add("activated");
      document.getElementById("shoot-label").textContent = "Gun Active - Choose to shoot!";
      triggerActivationFlash();
    }
  });

  onValue(ref(db, "numbers/" + something + "/gunHolder"), async (snapshot) => {
    currentGunHolder = snapshot.val();
    document.querySelectorAll("#gun-matrix button").forEach(btn => {
      btn.classList.toggle("gun-active", btn.dataset.key === currentGunHolder);
    });
    const holderName = currentGunHolder ? (latestPlayers[currentGunHolder] || currentGunHolder) : "No one";
    document.getElementById("gun-holder-display").textContent = "Gun: " + holderName;

    const [playerSnap, pointSnap] = await Promise.all([
      get(ref(db, "numbers/" + something + "/players")),
      get(ref(db, "numbers/" + something + "/points"))
    ]);
    renderHostPlayerList(playerSnap.val() || {}, pointSnap.val() || {});
  });

  onValue(ref(db, "numbers/" + something + "/round"), (snapshot) => {
    const round = snapshot.val() || 0;
    const el = document.getElementById("round-display");
    if (el) el.textContent = round > 0 ? "Round " + round : "";
  });

  onValue(ref(db, "numbers/" + something + "/lastShot"), (snapshot) => {
    const shot = snapshot.val();
    if (!shot) return;
    const isVictim = shot.targetKey === "player1";
    openShotPopup(shot.targetName, shot.targetRole, shot.shooterRole, shot.wasTarget, isVictim, shot.shooterName);
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

function playerscome() {
  div1.hidden = false;
  div1.innerText = "Player joined!";
  div1.style.animation = "mymove 1.5s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function renderHostPlayerList(players, points) {
  const playerlist = document.getElementById("host-list");
  if (!playerlist) return;
  playerlist.innerHTML = "";
  Object.entries(players).forEach(([key, name]) => {
    const pts = points[key] || 0;
    const line = document.createElement("div");
    line.textContent = (key === currentGunHolder ? "🔫 " : "") + `${name}: ${pts}pts`;
    if (key === currentGunHolder) line.classList.add("gun-holder-row");
    playerlist.appendChild(line);
  });
}

function renderTouchDots(touches) {
  const counter = document.getElementById("touch-counter");
  if (!counter) return;
  counter.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.className = "touch-dot" + (i < touches ? " filled" : "");
    counter.appendChild(dot);
  }
}

function triggerActivationFlash() {
  const flash = document.getElementById("activation-flash");
  if (!flash) return;
  flash.style.display = "block";
  flash.classList.remove("flash");
  void flash.offsetHeight;
  flash.classList.add("flash");
  flash.addEventListener("animationend", () => {
    flash.classList.remove("flash");
    flash.style.display = "none";
  }, { once: true });
}

window.mythingy = async function mythingy() {
  const roledisplay = document.getElementById("role-display");
  const roleTarget = document.getElementById("role-target");

  void roledisplay.offsetHeight;
  roledisplay.style.animation = "none";
  roleTarget.style.animation = "none";

  document.getElementById("stop-btn").style.display = "block";
  document.getElementById("score-btn").style.display = "none";

  const roundSnap = await get(ref(db, "numbers/" + something + "/round"));
  const nextRound = (roundSnap.val() || 0) + 1;

  await Promise.all([
    set(ref(db, "numbers/" + something + "/roles"), null),
    set(ref(db, "numbers/" + something + "/killed"), null),
    set(ref(db, "numbers/" + something + "/lastShot"), null),
    set(ref(db, "numbers/" + something + "/gunHolder"), null),
    set(ref(db, "numbers/" + something + "/gunTouches"), null),
    set(ref(db, "numbers/" + something + "/gunUndo"), null),
    set(ref(db, "numbers/" + something + "/assassinTarget"), null),
    set(ref(db, "numbers/" + something + "/round"), nextRound),
  ]);

  const snap = await get(ref(db, "numbers/" + something + "/players"));
  const players = snap.val() || {};
  const keys = Object.keys(players);

  const roles = ["an Assassin", "a Spy"];
  while (roles.length < keys.length) roles.push("a Monk");
  const shuffled = roles.sort(() => Math.random() - 0.5);

  const assassinIdx = shuffled.indexOf("an Assassin");
  const assassinKey = keys[assassinIdx];
  const nonAssassinKeys = keys.filter(k => k !== assassinKey);
  const targetKey = nonAssassinKeys[Math.floor(Math.random() * nonAssassinKeys.length)];
  await set(ref(db, "numbers/" + something + "/assassinTarget"), targetKey);
  console.log("Assassin target set:", targetKey);

  for (let i = 0; i < keys.length; i++) {
    await set(ref(db, "numbers/" + something + "/roles/" + keys[i]), shuffled[i]);
  }
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

function buildHostShootMatrix(players) {
  const matrix = document.getElementById("shoot-matrix");
  if (!matrix) return;
  matrix.innerHTML = "";
  Object.entries(players).forEach(([key, name]) => {
    if (key === "player1") return;
    const btn = document.createElement("button");
    btn.innerText = name;
    btn.dataset.key = key;
    btn.onclick = () => hostShoot(key, name);
    matrix.appendChild(btn);
  });
}

async function hostShoot(targetKey, targetName) {
  const [rolesSnap, assassinTargetSnap] = await Promise.all([
    get(ref(db, "numbers/" + something + "/roles")),
    get(ref(db, "numbers/" + something + "/assassinTarget"))
  ]);

  const roles = rolesSnap.val() || {};
  const assassinTarget = assassinTargetSnap.val();
  const targetRole = roles[targetKey];
  const playerKeys = Object.keys(roles);
  const pointMap = {};

  if (hostRole === "an Assassin") {
    if (targetRole === "a Spy") {
      playerKeys.forEach(k => { pointMap[k] = roles[k] === "an Assassin" ? 2 : 0; });
    } else if (targetKey === assassinTarget) {
      playerKeys.forEach(k => { pointMap[k] = roles[k] === "an Assassin" ? 1 : 0; });
    } else {
      playerKeys.forEach(k => { pointMap[k] = roles[k] !== "an Assassin" ? 1 : 0; });
    }
  } else if (hostRole === "a Spy") {
    if (targetRole === "an Assassin") {
      playerKeys.forEach(k => { pointMap[k] = roles[k] === "a Spy" ? 2 : roles[k] === "a Monk" ? 1 : 0; });
    } else {
      playerKeys.forEach(k => { pointMap[k] = roles[k] === "an Assassin" ? 1 : 0; });
    }
  }

  await set(ref(db, "numbers/" + something + "/lastShot"), {
    targetKey,
    targetName,
    targetRole,
    shooterKey: "player1",
    shooterRole: hostRole,
    shooterName: latestPlayers["player1"] || "Host",
    wasTarget: targetKey === assassinTarget
  });

  await set(ref(db, "numbers/" + something + "/killed/" + targetKey), true);

  for (const [key, pts] of Object.entries(pointMap)) {
    if (pts > 0) {
      const currentSnap = await get(ref(db, "numbers/" + something + "/points/" + key));
      const current = currentSnap.val() || 0;
      await set(ref(db, "numbers/" + something + "/points/" + key), current + pts);
    }
  }

  const shootSection = document.getElementById("shoot-section");
  if (shootSection) shootSection.style.display = "none";
}

function openShotPopup(name, role, shooterRole, wasTarget, isVictim, shooterName) {
  const images = {
    "a Monk": "Monk-Killed.png",
    "a Spy": "Spy-Killed.png",
    "an Assassin": "Assassin-Killed.png"
  };
  document.getElementById("shot-name").textContent = isVictim ? "You have been Shot!" : name + " has been Shot!";
  document.getElementById("shot-role").textContent = "They were " + role;
  document.getElementById("shot-img").src = images[role] || "";
  const shooterEl = document.getElementById("shot-shooter");
  if (shooterEl) shooterEl.textContent = shooterName ? "Shot by " + shooterName : (shooterRole ? "Shot by " + shooterRole : "");
  const targetEl = document.getElementById("shot-target-label");
  if (targetEl) targetEl.textContent = wasTarget ? "The target was Killed!" : "";
  const popup = document.getElementById("shot-popup");
  popup.style.display = "flex";
  popup.style.animation = "popup 1s forwards";
}

window.closeShotPopup = function() {
  const popup = document.getElementById("shot-popup");
  popup.style.animation = "popout 1s forwards";
  setTimeout(() => { popup.style.display = "none"; }, 250);
}


window.renameHost = async function() {
  const input = document.getElementById("rename-input");
  const newName = input.value.trim();
  if (!newName) return;
  await set(ref(db, "numbers/" + something + "/players/player1"), newName);
  input.value = "";
}

window.openSettings = function() {
  document.getElementById("settings-popup").style.display = "flex";
  document.getElementById("settings-popup").style.animation = "popup 1s forwards";
}

window.closeSettings = async function() {
  document.getElementById("settings-popup").style.animation = "popout 1s forwards";
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("settings-popup").style.display = "none";
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
      case "AssWin":   pointMap[key] = role === "an Assassin" ? 1 : 0; break;
      case "SpyWin":   pointMap[key] = role === "a Spy" ? 2 : role === "a Monk" ? 1 : 0; break;
      case "AssSpy":   pointMap[key] = role === "an Assassin" ? 2 : 0; break;
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
