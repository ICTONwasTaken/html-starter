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
  
onValue(ref(db, "something"), (snapshot) => { 
  something = snapshot.val() || 0; 
}); 

window.onload = () => {
  something = herewego(something);
  console.log('All resources finished loading'); 
  }

function herewego(something) {
  something = Math.floor(Math.random() * (9999 - 1000) ) + 1000;

  set(ref(db, "numbers/" + something), true); /* SETS NUMBER TO DATABASE AS: numbers/BLANK */
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

/* Currently:
Box that makes random number

Needs: /
-make random number
-Send that number to database
-put number into something
-press button, check if number exists
*/