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
    console.log("YOU DON'T GOT SHIZ", rum);
    return;
  }

  const playersRef = ref(db, "numbers/" + rum + "/players");
  const snap = await get(playersRef);
  div1.hidden = false;

  if (snap.exists()) {
    div1.innerText = "Joined Room!";
    console.log("Joined:", rum);
  } else {
    div1.innerText = "Invalid Room Number!";
    console.log("Not found:", rum);
  }

  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", myEndFunction);
};

function myEndFunction() { 
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
  }