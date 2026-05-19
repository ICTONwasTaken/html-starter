import { db, ref, onValue, remove, get, set} from './firebase.js';


  
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

const snap = await get(ref(db, "numbers/" + rum + "/players"));

  if (!snap.exists()) {
        div1.innerText = "Invalid Room Number!";
        playAnim()
        console.log("Not found:", rum);
        div1.hidden = true;
        return;
    }

  const players = snap.val() || {};
  const playerCount = Object.keys(players).length;

    if (playerCount >= 4) {
        div1.innerText = "Room is full!";
        playAnim();
        return;
    }

    const playerName = document.getElementById("getname").value.trim() || "Player " + (playerCount + 1);
    const newPlayerKey = "player" + (playerCount + 1);
    await set(ref(db, "numbers/" + rum + "/players/" + newPlayerKey), playerName);

    div1.innerText = "Joined Room!";
    console.log("Joined room:", rum, "as", newPlayerKey);

    localStorage.setItem("joinedRoom", rum); 
    localStorage.setItem("myPlayerKey", newPlayerKey);
    window.location.href = "joinedroom.html"; //puts in the joinedroom file
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
