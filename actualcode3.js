import { db, ref, onValue, remove, get, set } from './firebase.js';

["Monk-Killed.png","Spy-Killed.png","Assassin-Killed.png",
 "hehegooguy1.png","hehegooguy5.png","hehebadguy.png"].forEach(src => {
  const img = new Image(); img.src = src;
});

const div1 = document.getElementById("myDIV");
const rum = localStorage.getItem("joinedRoom");
const myPlayerKey = localStorage.getItem("myPlayerKey");
let tickInterval = null;
let wasRunning = false;
let myRole = null;
let currentGunHolder = null;
let prevPlayerCount = 0;
let latestPlayers = {};
let latestRoles = {};
let latestSuspicions = {};
let hasGun = false;
let assassinActivated = false;
let consensusTarget = null;

window.onload = async () => {
  playAnim();
  start();

  onValue(ref(db, "numbers/" + rum), async (snapshot) => {
    const snap = await get(ref(db, "numbers/" + rum));
    if (!snap.exists()) {
      localStorage.removeItem("joinedRoom");
      localStorage.removeItem("myPlayerKey");
      window.location.replace("joinroom.html");
    }
  });

  onValue(ref(db, "numbers/" + rum + "/players"), async (snapshot) => {
    const players = snapshot.val() || {};
    latestPlayers = players;
    const count = Object.keys(players).length;

    const pointSnap = await get(ref(db, "numbers/" + rum + "/points"));
    const points = pointSnap.val() || {};
    renderGuestPlayerList(players, points);

    if (count > prevPlayerCount && prevPlayerCount > 0) {
      playerscome();
    }
    prevPlayerCount = count;

    if (myRole === "a Spy" || myRole === "an Assassin") {
      buildShootMatrix(players);
    }
  });

  onValue(ref(db, "numbers/" + rum + "/points"), async (snapshot) => {
    const points = snapshot.val() || {};
    const playerSnap = await get(ref(db, "numbers/" + rum + "/players"));
    const players = playerSnap.val() || {};
    renderGuestPlayerList(players, points);
  });

  onValue(ref(db, "numbers/" + rum + "/roles"), (snapshot) => {
    latestRoles = snapshot.val() || {};
    checkConsensus();
  });

  onValue(ref(db, "numbers/" + rum + "/gunHolder"), async (snapshot) => {
    currentGunHolder = snapshot.val();
    hasGun = currentGunHolder === myPlayerKey;
    updateShootSectionState();
    checkConsensus();
    const [playerSnap, pointSnap] = await Promise.all([
      get(ref(db, "numbers/" + rum + "/players")),
      get(ref(db, "numbers/" + rum + "/points"))
    ]);
    renderGuestPlayerList(playerSnap.val() || {}, pointSnap.val() || {});
  });

  onValue(ref(db, "numbers/" + rum + "/round"), (snapshot) => {
    const round = snapshot.val() || 0;
    const el = document.getElementById("round-display");
    if (el) el.textContent = round > 0 ? "Round " + round : "";
  });

  onValue(ref(db, "numbers/" + rum + "/roles/" + myPlayerKey), async (snapshot) => {
    const guy = document.getElementById("guy");
    const roledisplay = document.getElementById("role-display");
    const roleTarget = document.getElementById("role-target");
    const shootSection = document.getElementById("shoot-section");
    const suspicionSection = document.getElementById("suspicion-section");
    const role = snapshot.val();
    myRole = role;

    roledisplay.style.textDecoration = "none";
    roleTarget.style.textDecoration = "none";

    if (!role) {
      assassinActivated = false;
      roledisplay.classList.remove("role-monk", "role-spy", "role-assassin");
      document.getElementById("player-thing").style.display = "none";
      roledisplay.style.animation = "none";
      if (shootSection) {
        shootSection.style.display = "none";
        shootSection.classList.remove("inactive", "activated");
      }
      if (suspicionSection) suspicionSection.style.display = "none";
      return;
    }

    document.getElementById("role-text").textContent = "You are... " + role;
    document.getElementById("player-thing").style.display = "block";
    roledisplay.classList.remove("role-monk", "role-spy", "role-assassin");
    const roleClassMap = { "a Monk": "role-monk", "a Spy": "role-spy", "an Assassin": "role-assassin" };
    if (roleClassMap[role]) roledisplay.classList.add(roleClassMap[role]);
    roledisplay.style.animation = "shake 1s linear";
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
        if (shootSection) shootSection.style.display = "block";
        const pSnap = await get(ref(db, "numbers/" + rum + "/players"));
        buildShootMatrix(pSnap.val() || {});
        updateShootSectionState();
        break;
      }

      case "an Assassin": {
        assassinActivated = false;
        const targetKeySnap = await get(ref(db, "numbers/" + rum + "/assassinTarget"));
        const playerSnap = await get(ref(db, "numbers/" + rum + "/players"));
        const players = playerSnap.val() || {};
        const targetName = players[targetKeySnap.val()];
        roleTarget.innerText = "Your target is: " + (targetName || "?");
        guy.src = 'hehebadguy.png';
        if (shootSection) {
          shootSection.classList.remove("activated");
          shootSection.style.display = "block";
        }
        buildShootMatrix(players);
        const touchSnap = await get(ref(db, "numbers/" + rum + "/gunTouches/" + myPlayerKey));
        renderTouchDots(touchSnap.val() || 0);
        updateShootSectionState();
        break;
      }
    }
    if (suspicionSection) suspicionSection.style.display = "block";
  });

  onValue(ref(db, "numbers/" + rum + "/gunTouches/" + myPlayerKey), (snapshot) => {
    const touches = snapshot.val() || 0;
    if (myRole === "an Assassin") {
      renderTouchDots(touches);
    }
    if (myRole !== "an Assassin") return;
    if (touches >= 3 && !assassinActivated) {
      assassinActivated = true;
      document.getElementById("shoot-section")?.classList.add("activated");
      triggerActivationFlash();
    }
    updateShootSectionState();
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
    timerDisplay.style.display = "block";

    tickInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
      const remaining = data.duration - elapsed;

      if (remaining <= 0) {
        timerend();
        timerDisplay.style.display = "none";
        clearInterval(tickInterval);
        return;
      }
      timerDisplay.textContent = remaining;
    }, 500);
  });

  onValue(ref(db, "numbers/" + rum + "/killed"), (snapshot) => {
    const killed = snapshot.val() || {};
    if (killed[myPlayerKey]) {
      document.getElementById("role-display").style.textDecoration = "line-through";
      document.getElementById("role-target").style.textDecoration = "line-through";
      const shootSection = document.getElementById("shoot-section");
      if (shootSection) shootSection.style.display = "none";
    }
  });

  onValue(ref(db, "numbers/" + rum + "/lastShot"), (snapshot) => {
    const shot = snapshot.val();
    if (!shot) {
      closeShotPopup();
      return;
    }
    const isVictim = shot.targetKey === myPlayerKey;
    openShotPopup(shot.targetName, shot.targetRole, shot.shooterRole, shot.wasTarget, isVictim, shot.shooterName);
  });

  onValue(ref(db, "numbers/" + rum + "/suspicions"), (snapshot) => {
    const suspicions = snapshot.val() || {};
    latestSuspicions = suspicions;
    const count = Object.values(suspicions).filter(v => v === myPlayerKey).length;
    const countLabel = document.getElementById("suspect-count-label");
    if (countLabel) {
      countLabel.textContent = count > 0
        ? count + (count === 1 ? " Monk suspects you" : " Monks suspect you")
        : "";
    }
    const mySuspicion = suspicions[myPlayerKey];
    const myLabel = document.getElementById("my-suspicion-label");
    if (myLabel) {
      myLabel.textContent = mySuspicion
        ? "You suspect: " + (latestPlayers[mySuspicion] || "?")
        : "No suspicion";
    }
    checkConsensus();
  });
}

function updateShootSectionState() {
  const shootSection = document.getElementById("shoot-section");
  if (!shootSection || shootSection.style.display === "none") return;
  const label = document.getElementById("shoot-label");
  if (myRole === "a Spy") {
    if (hasGun) {
      shootSection.classList.remove("inactive");
      label.textContent = "Choose to shoot:";
    } else {
      shootSection.classList.add("inactive");
      label.textContent = "Get the gun to shoot!";
    }
  } else if (myRole === "an Assassin") {
    if (!assassinActivated) {
      shootSection.classList.add("inactive");
      label.textContent = "Touch gun 3 times to activate...";
    } else if (hasGun) {
      shootSection.classList.remove("inactive");
      label.textContent = "Gun Active - Choose to shoot!";
    } else {
      shootSection.classList.add("inactive");
      label.textContent = "Get the gun to shoot!";
    }
  }
}

function checkConsensus() {
  const section = document.getElementById("consensus-section");
  const label = document.getElementById("consensus-label");
  const btn = document.getElementById("consensus-shoot-btn");
  if (!section) return;

  const monkKeys = Object.keys(latestRoles).filter(k => latestRoles[k] === "a Monk");
  if (monkKeys.length === 0) {
    section.style.display = "none";
    consensusTarget = null;
    return;
  }

  const votes = monkKeys.map(k => latestSuspicions[k]).filter(v => v != null);
  const allVoted = votes.length === monkKeys.length;
  const allAgree = allVoted && new Set(votes).size === 1;

  if (!allAgree) {
    section.style.display = "none";
    consensusTarget = null;
    return;
  }

  consensusTarget = votes[0];
  const targetName = latestPlayers[consensusTarget] || "?";
  section.style.display = "block";
  if (label) label.textContent = "All Monks agree: " + targetName;
  if (btn) btn.style.display = (myRole === "a Monk" && hasGun) ? "block" : "none";
}

window.monkShoot = async function() {
  if (!consensusTarget || myRole !== "a Monk" || !hasGun) return;

  const targetKey = consensusTarget;
  const targetName = latestPlayers[targetKey] || "?";

  const [rolesSnap, assassinTargetSnap] = await Promise.all([
    get(ref(db, "numbers/" + rum + "/roles")),
    get(ref(db, "numbers/" + rum + "/assassinTarget"))
  ]);

  const roles = rolesSnap.val() || {};
  const assassinTarget = assassinTargetSnap.val();
  const targetRole = roles[targetKey];
  const playerKeys = Object.keys(roles);
  const pointMap = {};

  if (targetRole === "an Assassin") {
    playerKeys.forEach(k => { pointMap[k] = roles[k] === "a Spy" ? 1 : roles[k] === "a Monk" ? 2 : 0; });
  } else {
    playerKeys.forEach(k => { pointMap[k] = roles[k] === "an Assassin" ? 1 : 0; });
  }

  await set(ref(db, "numbers/" + rum + "/lastShot"), {
    targetKey,
    targetName,
    targetRole,
    shooterKey: myPlayerKey,
    shooterRole: myRole,
    shooterName: latestPlayers[myPlayerKey] || "?",
    wasTarget: targetKey === assassinTarget
  });

  await set(ref(db, "numbers/" + rum + "/killed/" + targetKey), true);

  for (const [key, pts] of Object.entries(pointMap)) {
    if (pts > 0) {
      const currentSnap = await get(ref(db, "numbers/" + rum + "/points/" + key));
      const current = currentSnap.val() || 0;
      await set(ref(db, "numbers/" + rum + "/points/" + key), current + pts);
    }
  }

  const consensusSection = document.getElementById("consensus-section");
  if (consensusSection) consensusSection.style.display = "none";
}

function renderGuestPlayerList(players, points) {
  const playerlist = document.getElementById("player-list");
  if (!playerlist) return;
  playerlist.innerHTML = "";
  Object.entries(players).forEach(([key, name]) => {
    const pts = points[key] || 0;
    const isHolder = key === currentGunHolder;
    const chip = document.createElement("div");
    chip.className = "player-chip" + (isHolder ? " gun-holder-chip" : "");
    const nameSpan = document.createElement("span");
    nameSpan.textContent = (isHolder ? "🔫 " : "") + name;
    const ptsSpan = document.createElement("span");
    ptsSpan.className = "player-pts";
    ptsSpan.textContent = pts + " pts";
    chip.appendChild(nameSpan);
    chip.appendChild(ptsSpan);
    playerlist.appendChild(chip);
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

function buildShootMatrix(players) {
  const matrix = document.getElementById("shoot-matrix");
  if (!matrix) return;
  matrix.innerHTML = "";
  Object.entries(players).forEach(([key, name]) => {
    if (key === myPlayerKey) return;
    const btn = document.createElement("button");
    btn.innerText = name;
    btn.dataset.key = key;
    btn.onclick = () => shoot(key, name);
    matrix.appendChild(btn);
  });
}

async function shoot(targetKey, targetName) {
  const [rolesSnap, assassinTargetSnap] = await Promise.all([
    get(ref(db, "numbers/" + rum + "/roles")),
    get(ref(db, "numbers/" + rum + "/assassinTarget"))
  ]);

  const roles = rolesSnap.val() || {};
  const assassinTarget = assassinTargetSnap.val();
  const targetRole = roles[targetKey];
  const playerKeys = Object.keys(roles);
  const pointMap = {};

  if (myRole === "an Assassin") {
    if (targetRole === "a Spy") {
      playerKeys.forEach(k => { pointMap[k] = roles[k] === "an Assassin" ? 2 : 0; });
    } else if (targetKey === assassinTarget) {
      playerKeys.forEach(k => { pointMap[k] = roles[k] === "an Assassin" ? 1 : 0; });
    } else {
      playerKeys.forEach(k => { pointMap[k] = roles[k] !== "an Assassin" ? 1 : 0; });
    }
  } else if (myRole === "a Spy") {
    if (targetRole === "an Assassin") {
      playerKeys.forEach(k => { pointMap[k] = roles[k] === "a Spy" ? 2 : roles[k] === "a Monk" ? 1 : 0; });
    } else {
      playerKeys.forEach(k => { pointMap[k] = roles[k] === "an Assassin" ? 1 : 0; });
    }
  }

  await set(ref(db, "numbers/" + rum + "/lastShot"), {
    targetKey,
    targetName,
    targetRole,
    shooterKey: myPlayerKey,
    shooterRole: myRole,
    shooterName: latestPlayers[myPlayerKey] || "?",
    wasTarget: targetKey === assassinTarget
  });

  await set(ref(db, "numbers/" + rum + "/killed/" + targetKey), true);

  for (const [key, pts] of Object.entries(pointMap)) {
    if (pts > 0) {
      const currentSnap = await get(ref(db, "numbers/" + rum + "/points/" + key));
      const current = currentSnap.val() || 0;
      await set(ref(db, "numbers/" + rum + "/points/" + key), current + pts);
    }
  }

  if (myRole === "an Assassin" && targetKey === assassinTarget && targetRole === "a Monk") {
    const [suspicionSnap, killedSnap] = await Promise.all([
      get(ref(db, "numbers/" + rum + "/suspicions")),
      get(ref(db, "numbers/" + rum + "/killed"))
    ]);
    const suspicions = suspicionSnap.val() || {};
    const killed = killedSnap.val() || {};
    const spyKey = playerKeys.find(k => roles[k] === "a Spy");
    if (!spyKey || !killed[spyKey]) {
      for (const [pKey, suspectedKey] of Object.entries(suspicions)) {
        if (suspectedKey === myPlayerKey && roles[pKey] === "a Monk") {
          const currentSnap = await get(ref(db, "numbers/" + rum + "/points/" + pKey));
          const current = currentSnap.val() || 0;
          await set(ref(db, "numbers/" + rum + "/points/" + pKey), current + 1);
        }
      }
    }
  }

  const shootSection = document.getElementById("shoot-section");
  if (shootSection) shootSection.style.display = "none";
}

function timerplay() {
  div1.hidden = false;
  div1.innerText = "Timer Start!";
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function timerend() {
  div1.hidden = false;
  div1.innerText = "Pass the gun!";
  div1.style.animation = "mymove 4s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}

function start() {
  document.getElementById("change").innerText = rum;
}

window.openSuspicionPopup = async function() {
  const playerSnap = await get(ref(db, "numbers/" + rum + "/players"));
  const players = playerSnap.val() || {};
  const list = document.getElementById("suspicion-list");
  list.innerHTML = "";
  Object.entries(players).forEach(([key, name]) => {
    if (key === myPlayerKey) return;
    const btn = document.createElement("button");
    btn.innerText = name;
    btn.onclick = () => submitSuspicion(key, name);
    list.appendChild(btn);
  });
  const popup = document.getElementById("suspicion-popup");
  popup.style.display = "flex";
  popup.style.animation = "popup 0.5s forwards";
}

window.closeSuspicionPopup = function() {
  const popup = document.getElementById("suspicion-popup");
  popup.style.animation = "popout 0.5s forwards";
  setTimeout(() => { popup.style.display = "none"; }, 250);
}

async function submitSuspicion(key, name) {
  await set(ref(db, "numbers/" + rum + "/suspicions/" + myPlayerKey), key);
  closeSuspicionPopup();
}

window.openQRPopup = function() {
  const url = new URL('joinroom.html?room=' + rum, window.location.href).href;
  const container = document.getElementById("qr-code");
  container.innerHTML = "";
  new QRCode(container, {
    text: url,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  document.getElementById("qr-room-label").textContent = "Room " + rum;
  const popup = document.getElementById("qr-popup");
  popup.style.display = "flex";
  popup.style.animation = "popup 0.5s forwards";
}

window.closeQRPopup = function() {
  const popup = document.getElementById("qr-popup");
  popup.style.animation = "popout 0.5s forwards";
  setTimeout(() => { popup.style.display = "none"; }, 250);
}

function playAnim() {
  div1.hidden = false;
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
  const box = document.getElementById("box");
  if (box) {
    box.classList.remove("screen-shake");
    void box.offsetHeight;
    box.classList.add("screen-shake");
    box.addEventListener("animationend", () => box.classList.remove("screen-shake"), { once: true });
  }
  const popup = document.getElementById("shot-popup");
  popup.style.display = "flex";
  popup.style.animation = "popup 1s forwards";
}

window.closeShotPopup = function() {
  const popup = document.getElementById("shot-popup");
  if (popup.style.display === "none") return;
  popup.style.animation = "popout 1s forwards";
  setTimeout(() => { popup.style.display = "none"; }, 250);
}

window.backBtn3 = async function backBtn3() {
  await remove(ref(db, "numbers/" + rum + "/players/" + myPlayerKey));
  localStorage.removeItem("joinedRoom");
  localStorage.removeItem("myPlayerKey");
  window.location.href = "joinroom.html";
}

