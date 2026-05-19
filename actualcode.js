import { db, ref, onValue, remove, get, set} from './firebase.js';

  let div1 = document.getElementById("myDIV"); 
  let change = document.getElementById("change"); 
  let num = document.getElementById("num"); 
  let something = 0; 
  let old = 0; 

window.onload = async () => {
  const snapshot = await get(ref(db, "past_value"));
  old = snapshot.val() || 0;

  if (old != 0) {
      await remove(ref(db, "numbers/" + old));
      console.log("Cleaned up old number:", old);
    }

  something = await herewego(something);
  console.log('All resources finished loading');

  onValue(ref(db, "numbers/" + something + "/players"), (snapshot) => {
        const players = snapshot.val() || {};
        console.log("Players in room:", Object.keys(players).length);
        
        const playerCount = Object.keys(players).length;
        if (playerCount  > 1) {
          playerscome();
          num.innerText = playerCount;
        }
    });
  }

async function herewego(something) {
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
    remove(ref(db, "numbers/" + something));
    console.log("This also worked! You destroyed:", old);
    something = 0;
}

function playerscome() {
  div1.hidden = false
  div1.innerText = "A new player arrives!";
  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", endAnim, { once: true });
}
function endAnim() { 
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
  }