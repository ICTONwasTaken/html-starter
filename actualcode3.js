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
  let num = document.getElementById("num");
  let something = 0;
  let counting = "";
  let playerlist = document.getElementById("player-list")

  const rum = localStorage.getItem("joinedRoom");
  const myPlayerKey = localStorage.getItem("myPlayerKey");

window.onload = async () => {
  playAnim();
  start();

  onValue(ref(db, "numbers/" + rum + "/players"), (snapshot) => {
    const players = snapshot.val() || {};
    const stuff = Object.values(players);

    num.innerText = stuff.length;
    counting = stuff.join("\n");

    playerlist.innerText = counting;

    playerlist.style.animation = "none";
    playerlist.offsetHeight;
    playerlist.style.animation = "player-come 0.3s forwards";
  });
  }

function start() {
  document.getElementById("room-boi").innerText = rum;
}

function playAnim () {
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}
function endAnim() {
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
  }

window.backBtn3 = async function backBtn3() {
  await remove(ref(db, "numbers/" + rum + "/players/" + myPlayerKey));
  console.log("rum:", rum);
  console.log("myPlayerKey:", myPlayerKey);
  localStorage.removeItem("joinedRoom");
  localStorage.removeItem("myPlayerKey");
  window.location.href = "joinroom.html";
}