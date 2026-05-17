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

  const rum = localStorage.getItem("joinedRoom");

window.onload = async () => {
  playAnim();
  start();

  onValue(ref(db, "numbers/" + rum + "/players"), (snapshot) => {
        const players = snapshot.val() || {};
        console.log("Players in room:", Object.keys(players).length);
        
        const playerCount = Object.keys(players).length;
        num.innerText = playerCount;
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

window.backBtn3 = function backBtn3() {
  localStorage.removeItem("joinedRoom");
  window.location.href = "joinroom.html";
}