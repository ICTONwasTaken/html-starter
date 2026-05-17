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
  let something = 0; 
  
onValue(ref(db, "something"), (snapshot) => { 
  something = snapshot.val() || 0; 
}); 

window.onload = () => { 
  console.log("something =", something); 
};

window.onload = () => {
  window.myFunction = function () { 
    div1.hidden = false;

    if (something == 0) {
      div1.innerText = "NEED NUMBER";
      console.log("something =", something); 
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

  function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
  }

  window.mythingy = function () { 
    if (something == 0) { something = atleast(1111, 9999); } 
    else { something = 0; } 
    change.innerText = something; 
  }
}