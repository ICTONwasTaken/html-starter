import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"; 
import { getDatabase, ref, set, get, update, onValue, remove } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"; 

const firebaseConfig = { 
  apiKey: "AIzaSyDkWvzrLrzPWShK1a6RhmrRJ6ChxAl2sHI", 
  authDomain: "realsomething.firebaseapp.com", 
  databaseURL: "https://realsomething-default-rtdb.asia-southeast1.firebasedatabase.app/", 
  projectId: "realsomething", }; const app = initializeApp(firebaseConfig); 
  
const db = getDatabase(app);

  
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

  const snap = await get(ref(db, "numbers/" + rum));

  if (!snap.exists()) {
        div1.innerText = "Invalid Room Number!";
        playAnim()
        console.log("Not found:", rum);
        div1.hidden = true;
        return;
    }

  const players = snap.val().players || {};
  const playerCount = Object.keys(players).length;

    if (playerCount >= 4) {
        div1.innerText = "Room is full!";
        return;
    }

    const newPlayerKey = "player" + (playerCount + 1);
    await set(ref(db, "numbers/" + rum + "/players/" + newPlayerKey), "Player " + (playerCount + 1));

    div1.innerText = "Joined Room!";
    console.log("Joined room:", rum, "as", newPlayerKey);

    onValue(ref(db, "numbers/" + rum + "/players"), (snapshot) => {
      const players = snapshot.val() || {};
      console.log("Players in room:", Object.keys(players).length);
    });
};


function playAnim () {
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}
function endAnim() { 
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
  }
