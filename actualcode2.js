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
    let rum = document.getElementById("dothething").value;
    const numRef = ref(db, "numbers/" + rum);
    const snap = await get(numRef);
    
    if (snap.exists()){
      div1.innerText = "Joined Room!";
      console.log("Did it work?", numRef);
      console.log("Well, did it?", rum); 
    } else {
      div1.innerText = "Invalid Room Number!";
      console.log("NOOOOOO", numRef); 
      console.log("DANG UIT", rum);
    }

    div1.hidden = false;
    div1.style.animation = "mymove 0.9s forwards";
    div1.addEventListener("animationend", myEndFunction); 
  }

  function myEndFunction() { 
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
  }
  

window.myback = function () { 
      let old = localStorage.getItem("myNumber");

      if (!old) return;
      
      remove(ref(db, "numbers/" + old)); /* removes anything as numbers/BLANK */

      localStorage.removeItem("myNumber");
      something = 0; 
      console.log("This also worked! You destroyed:", old); 
    }

/* CHECKS IF DATABASE NUMBER EXISTS */
/* CHECKS IF DATABASE NUMBER EXISTS */