import { db } from './firebase.js'

  
  const div1 = document.getElementById("myDIV"); 
  let change = document.getElementById("change");
  let something = 0;

window.mycheck = async function () {
  let rum = document.getElementById("dothething").value.trim();

  if (!rum) {
    div1.innerText = "Please enter a room number!";
    div1.hidden = false;
    playAnim();
    console.log("YOU DON'T GOT SHIZ", rum);
    return;
  }

  const playersRef = ref(db, "numbers/" + rum + "/players");

  const result = await runTransaction(playersRef, (players) => {
    if (!players) return; // room doesn't exist, abort
    const count = Object.keys(players).length;
    if (count >= 4) return; // full, abort

    const newKey = "player" + (count + 1);
    players[newKey] = "Player " + (count + 1);
    return players; // commit
  });

  if (!result.committed) {
    div1.innerText = result.snapshot.exists() ? "Room is full!" : "Invalid Room Number!";
    playAnim();
    return;
  }

  const newPlayerKey = "player" + Object.keys(result.snapshot.val()).length;
  localStorage.setItem("joinedRoom", rum);
  localStorage.setItem("myPlayerKey", newPlayerKey);
  window.location.href = "joinedroom.html";
};


function playAnim () {
  div1.hidden = false;
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}
function endAnim() { 
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
  }

window.backBtn2 = function backBtn2() {
  localStorage.removeItem("joinedRoom");
  window.location.href = "joinroom.html";
}
