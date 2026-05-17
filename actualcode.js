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


window.onload = async () => {
  let saved = localStorage.getItem("myNumber");

  if (!saved) {
    createNewRoom();
  }

  something = Number(saved);

  const snap = await get(ref(db, "numbers/" + something));

  if (snap.exists()) {
    console.log("Room still exists:", something);
    change.innerText = something;
  } else {
    console.log("Room deleted, not recreating automatically");

    localStorage.removeItem("myNumber");

    div1.hidden = false;
    div1.innerText = "Room expired. Create a new one.";
  }
};
  
function createNewRoom() {
  something = Math.floor(Math.random() * 9000) + 1000;

  set(ref(db, "numbers/" + something), {
    players: {}
  });

  localStorage.setItem("myNumber", something);
  change.innerText = something;
}

window.myback = function () { 
      let old = localStorage.getItem("myNumber");

      if (!old) return;

      remove(ref(db, "numbers/" + old)); /* removes anything as numbers/BLANK */

      localStorage.removeItem("myNumber");
      something = 0; 
      console.log("This also worked! You destroyed:", old); 
    }
