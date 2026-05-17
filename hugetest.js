import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"; 
import { getDatabase, ref, set, get, update, onValue, remove } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"; 

const firebaseConfig = { 
  apiKey: "AIzaSyDkWvzrLrzPWShK1a6RhmrRJ6ChxAl2sHI", 
  authDomain: "realsomething.firebaseapp.com", 
  databaseURL: "https://realsomething-default-rtdb.asia-southeast1.firebasedatabase.app/", 
  projectId: "realsomething", }; const app = initializeApp(firebaseConfig); 
  
const db = getDatabase(app); window.onload = () => { 
  console.log('All resources finished loading'); 
};

  
  const div1 = document.getElementById("myDIV"); 
  let change = document.getElementById("change"); 
  let nochange = document.getElementById("nochange");
  let something = 0; 
  
onValue(ref(db, "something"), (snapshot) => { 
  something = snapshot.val() || 0; 
}); 

window.onload = () => {
  window.myFunction = function () { 
    div1.hidden = false;

    if (something == 0) {
      div1.innerText = "NEED NUMBER";
      console.log("something =", something);
      console.log("div1 =", div1); 
      console.log("change =", change); 
    } 
    else { 
      div1.innerText = "Game Start!";
      console.log("something =", something); 
    }
    
    div1.style.animation = "mymove 0.9s forwards"; } 
    div1.addEventListener("animationend", myEndFunction); 
    
  function myEndFunction() { 
    this.style.animation = "disappear 0.3s forwards"; 
  }

  function atleast(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
  }

  window.mythingy = function () { 
    if (something == 0) { 
      something = atleast(1111, 9999); 
      set(ref(db, "numbers/" + something), true); /* SETS NUMBER TO DATABASE AS: numbers/BLANK */
      console.log("This worked! You sent:", something); 
    } 
    else { 
      let old = something
      remove(ref(db, "numbers/" + old)); /* removes anything as numbers/BLANK */
      console.log("This also worked! You destroyed:", old); 
      something = 0; 
    }
    change.innerText = something; 
  }
}

/* CHECKS IF DATABASE NUMBER EXISTS */
window.mycheck = async function () {
    const numRef = ref(db, "numbers/" + something);
    const snap = await get(numRef);

    if (snap.exists()) {
      console.log("Number exists!");
    } else {
      console.log("Number does NOT exist");
    }
  }

/* Currently:
Box that makes random number

Needs: /
-make random number
-Send that number to database
-put number into something
-press button, check if number exists
*/