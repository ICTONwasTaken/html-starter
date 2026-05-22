
let interval = null;
const gun = document.querySelector(".gun");

function coolbeans() {
  let cool = document.getElementById("cool")

  cool.innerText = "Awesome"
  cool.style.animation = "cooling 3s infinite";
}

function passing() {
  const uno = document.querySelector(".uno");
  const dos = document.querySelector(".dos");
  const tres = document.querySelector(".tres");
  const quart = document.querySelector(".quart");
  const line = document.querySelector(".line");
  
  const order = [uno, tres, quart, dos];

  const positions = [
    "translateY(135px)",
    "translate(140px, 135px)", 
    "translate(140px, 0px)",
    "translateY(0px)", 
       
  ];

  let i = 0;

  gun.style.animation = "gun_pass 6s infinite";
  gun.style.display = "block";

  function jiggleNext() {
    // reset all first
    for (let cube of order) {
      cube.style.animation = "none";
      cube.offsetHeight;
      line.style.animation = "none";
      line.style.display = "none";
    }
    gun.style.transition = "transform 0.4s ease";
    gun.style.transform = positions[i];

    order[i].style.animation = "cube_jiggle 1s forwards";
    line.style.animation = "mymove 1s forwards";
    line.style.display = "flex";
    i = (i + 1) % order.length; // cycle through 0,1,2,3,0,1,2...
  }

  jiggleNext(); // run immediately on hover
  interval = setInterval(jiggleNext, 1500);
}

function nopassing() {
  gun.style.animation = "none";
  gun.style.display = "none";
  clearInterval(interval);
  interval = null;
}

let ii = 0;

function create() {
  const c1 = document.getElementById("c1")
  const c2 = document.getElementById("c2")
  const c3 = document.getElementById("c3")
  const c4 = document.getElementById("c4")

  ii++

  if (ii == 1) {
    c1.style.animation = "cube_come 1s forwards";
    c1.style.display = "flex";
  } else if (ii == 2) {
    c2.style.animation = "cube_come 1s forwards";
    c2.style.display = "flex";
  } else if (ii == 3) {
    c3.style.animation = "cube_come 1s forwards";
    c3.style.display = "flex";
  } else if (ii == 4) {
    c4.style.animation = "cube_come 1s forwards";
    c4.style.display = "flex";
  } else if (ii <= 5) {
    c1.style.animation = "cube_dance 0.8s infinite"
    c2.style.animation = "cube_dance2 0.5s infinite"
    c3.style.animation = "cube_dance3 0.4s infinite"
    c4.style.animation = "cube_dance4 0.5s infinite"
  }
}









let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

function toggleTimer() {
  if (!timerRunning) {
    timerRunning = true;
    document.getElementById("timer-hint").innerText = "Click to stop";
    timerInterval = setInterval(() => {
      timerSeconds++;
      const mins = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
      const secs = String(timerSeconds % 60).padStart(2, "0");
      document.getElementById("timer-display").innerText = `${mins}:${secs}`;
    }, 1000);
  } else {
    clearInterval(timerInterval);
    timerRunning = false;
    timerSeconds = 0;
    document.getElementById("timer-display").innerText = "00:00";
    document.getElementById("timer-hint").innerText = "Click to start";
  }
}





const orbital = document.getElementById("orbital");
const laser = document.getElementById("laser");
const swishytop = document.getElementById("leswishy-top");
const swishybottom = document.getElementById("leswishy-bottom");
const warning = document.getElementById("warning");
const black_back = document.getElementById("black_back");
const damage = document.getElementById("damage");

let health = 2000;

function ouch() {
  let owie = Math.floor(Math.random() * 100);
  damage.innerText = owie + " dmg";
  health = health - owie;
  console.log(health)

  damage.style.animation = "dmg 2s forwards";
  damage.style.display = 'flex';
  damage.addEventListener("animationend", ouch_end, { once: true });
  setTimeout(die, 1000);
}

function die() {
  const body = document.getElementById("this");
    if (health <= 0) {
      body.style.animation = "fadetowhite 1s forwards";
      setTimeout(() => { body.style.display = "none"; }, 1000);
    }
  }

function ouch_end() {
  damage.style.display = 'none';
}


function swing() {
  swing1();
  swing2();
}

function swing1() {
  swishytop.style.animation = "swing-top 0.4s forwards";
  swishytop.style.display = 'flex';
}
function swing2() {
  swishybottom.style.animation = "swing-bottom 0.4s forwards";
  swishybottom.style.display = 'flex';
}

function explode() {
  setTimeout(turnon, 1000);
  setTimeout(turnoff, 19850);
}

function turnon() {
  laser.src = '';
  laser.src = 'ORBITAL SPACE LASER2.gif';
  orbital.style.display = 'flex';
  
  swishytop.style.display = 'none';
  swishybottom.style.display = 'none';
  warning.style.display = 'none';
  black_back.style.display = 'none';
}
function turnoff() {
  laser.src = '';
  orbital.style.animation = "fadetowhite 0.5s forwards";
  setTimeout(() => {orbital.style.display = 'none';}, 1700);
  setTimeout(ouch, 400);
}


function warning_go() {
  black_back.style.animation = "fadetoblack 0.6s forwards";
  black_back.style.display = 'flex';
  setTimeout(warning_anim, 230);
  setTimeout(() => { warning.style.animation = "pulse 1.4s infinite"; }, 1400);
  setTimeout(swing, 7000);
  setTimeout(explode, 8300);
}
function warning_anim() {
  warning.src = '';
  warning.src = 'WARNING.gif';
  warning.style.display = 'flex';
}