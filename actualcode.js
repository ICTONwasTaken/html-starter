import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"; 
import { getDatabase, ref, set, get, update, onValue, remove } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"; 

const firebaseConfig = { 
  apiKey: "AIzaSyDkWvzrLrzPWShK1a6RhmrRJ6ChxAl2sHI", 
  authDomain: "realsomething.firebaseapp.com", 
  databaseURL: "https://realsomething-default-rtdb.asia-southeast1.firebasedatabase.app/", 
  projectId: "realsomething", }; const app = initializeApp(firebaseConfig); 
  
const db = getDatabase(app);

  let change = document.getElementById("change"); 
  let something = 0; 
  let old = 0; 
  
window.onload = async () => {
  const snapshot = await get(ref(db, "past_value"));
  old = snapshot.val() || 0;

  if (old != 0) {
      await remove(ref(db, "numbers/" + old));
      console.log("Cleaned up old number:", old);
    }

  something = herewego(something);
  console.log('All resources finished loading');

  onValue(ref(db, "numbers/" + rum + "/players"), (snapshot) => {
        const players = snapshot.val() || {};
        console.log("Players in room:", Object.keys(players).length);
    });
  }

function herewego(something) {
  something = Math.floor(Math.random() * (9999 - 1000) ) + 1000;

  set(ref(db, "numbers/" + something), {
    players: {
        player1: "Player 1" // host is just the first player
    }
  });
  set(ref(db, "past_value"), something); 
  console.log("This worked! You sent:", something);

  change.innerText = something;
  return something;
}

window.backBtn = function backBtn() {
    let old = something;
    remove(ref(db, "numbers/" + old));
    console.log("This also worked! You destroyed:", old);
    something = 0;
}