import { db, ref, onValue, remove, get, set } from './firebase.js';

const div1 = document.getElementById("myDIV");
const rum = localStorage.getItem("joinedRoom");
const myPlayerKey = localStorage.getItem("myPlayerKey");
let tickInterval = null;
let wasRunning = false;
let myRole = null;
let currentGunHolder = null;
let prevPlayerCount = 0;

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

  onValue(ref(db, "numbers/" + rum + "/gunHolder"), async (snapshot) => {
    currentGunHolder = snapshot.val();
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
    const role = snapshot.val();
    myRole = role;

    roledisplay.style.textDecoration = "none";
    roleTarget.style.textDecoration = "none";

    if (!role) {
      document.getElementById("player-thing").style.display = "none";
      roledisplay.style.animation = "none";
      if (shootSection) {
        shootSection.style.display = "none";
        shootSection.classList.remove("inactive", "activated");
      }
      return;
    }

    document.getElementById("role-text").textContent = "You are... " + role;
    document.getElementById("player-thing").style.display = "block";
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
        if (shootSection) {
          shootSection.classList.remove("inactive", "activated");
          document.getElementById("shoot-label").textContent = "Choose to shoot:";
          shootSection.style.display = "block";
        }
        const pSnap = await get(ref(db, "numbers/" + rum + "/players"));
        buildShootMatrix(pSnap.val() || {});
        break;
      }

      case "an Assassin": {
        const targetKeySnap = await get(ref(db, "numbers/" + rum + "/assassinTarget"));
        const playerSnap = await get(ref(db, "numbers/" + rum + "/players"));
        const players = playerSnap.val() || {};
        const targetName = players[targetKeySnap.val()];
        roleTarget.innerText = "Your target is: " + (targetName || "?");
        guy.src = 'hehebadguy.png';
        if (shootSection) {
          shootSection.classList.add("inactive");
          shootSection.classList.remove("activated");
          document.getElementById("shoot-label").textContent = "Touch gun 3 times to activate...";
          shootSection.style.display = "block";
        }
        buildShootMatrix(players);
        const touchSnap = await get(ref(db, "numbers/" + rum + "/gunTouches/" + myPlayerKey));
        renderTouchDots(touchSnap.val() || 0);
        break;
      }
    }
  });

  onValue(ref(db, "numbers/" + rum + "/gunTouches/" + myPlayerKey), (snapshot) => {
    const touches = snapshot.val() || 0;
    if (myRole === "an Assassin") {
      renderTouchDots(touches);
    }
    if (myRole !== "an Assassin") return;
    const shootSection = document.getElementById("shoot-section");
    if (!shootSection) return;
    if (touches >= 3) {
      shootSection.classList.remove("inactive");
      shootSection.classList.add("activated");
      document.getElementById("shoot-label").textContent = "Gun Active - Choose to shoot!";
      triggerActivationFlash();
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
      openYouDied();
    }
  });

  onValue(ref(db, "numbers/" + rum + "/lastShot"), (snapshot) => {
    const shot = snapshot.val();
    if (!shot) return;
    openShotPopup(shot.targetName, shot.targetRole, shot.shooterRole);
  });
}

function renderGuestPlayerList(players, points) {
  const playerlist = document.getElementById("player-list");
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
    shooterRole: myRole
  });

  await set(ref(db, "numbers/" + rum + "/killed/" + targetKey), true);

  for (const [key, pts] of Object.entries(pointMap)) {
    if (pts > 0) {
      const currentSnap = await get(ref(db, "numbers/" + rum + "/points/" + key));
      const current = currentSnap.val() || 0;
      await set(ref(db, "numbers/" + rum + "/points/" + key), current + pts);
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
  document.getElementById("room-boi").innerText = rum;
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

function openShotPopup(name, role, shooterRole) {
  const images = {
    "a Monk": "Monk-Killed.png",
    "a Spy": "Spy-Killed.png",
    "an Assassin": "Assassin-Killed.png"
  };
  document.getElementById("shot-name").textContent = name + " has been Shot!";
  document.getElementById("shot-role").textContent = "They were " + role;
  document.getElementById("shot-img").src = images[role] || "";
  const shooterEl = document.getElementById("shot-shooter");
  if (shooterEl) shooterEl.textContent = shooterRole ? "Shot by " + shooterRole : "";
  const popup = document.getElementById("shot-popup");
  popup.style.display = "flex";
  popup.style.animation = "popup 1s forwards";
}

window.closeShotPopup = function() {
  const popup = document.getElementById("shot-popup");
  popup.style.animation = "popout 1s forwards";
  setTimeout(() => { popup.style.display = "none"; }, 250);
}

window.backBtn3 = async function backBtn3() {
  await remove(ref(db, "numbers/" + rum + "/players/" + myPlayerKey));
  localStorage.removeItem("joinedRoom");
  localStorage.removeItem("myPlayerKey");
  window.location.href = "joinroom.html";
}

window.openYouDied = async function() {
  await new Promise(resolve => setTimeout(resolve, 250));
  const killedImages = { "a Monk": "Monk-Killed.png", "a Spy": "Spy-Killed.png", "an Assassin": "Assassin-Killed.png" };
  const img = document.getElementById("you-died-img");
  if (img && myRole) img.src = killedImages[myRole] || "";
  document.getElementById("you-died").style.animation = "popup 1s forwards";
  document.getElementById("you-died").style.display = "flex";
}

window.closeYouDied = async function() {
  document.getElementById("you-died").style.animation = "popout 1s forwards";
  await new Promise(resolve => setTimeout(resolve, 250));
  document.getElementById("you-died").style.display = "none";
}
