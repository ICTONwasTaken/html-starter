import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkWvzrLrzPWShK1a6RhmrRJ6ChxAl2sHI",
    authDomain: "realsomething.firebaseapp.com",
    databaseURL: "https://realsomething-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "realsomething",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);



let something = 0;

function atleast(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


onValue(ref(db, "something"), (snapshot) => {
    something = snapshot.val() || 0;
    console.log("something =", something);
});


window.addEventListener("DOMContentLoaded", () => {

    const div1 = document.getElementById("myDIV");
    const change = document.getElementById("change");

    window.myFunction = function () {

        div1.hidden = false;

        if (something == 0) {
            div1.innerText = "NEED NUMBER";
            return;
        }

        div1.innerText = "Game Start!";
        div1.style.animation = "mymove 0.9s forwards";
    };

    window.mythingy = function () {

        if (something == 0) {
            something = atleast(1111, 9999);
        } else {
            something = 0;
        }

        change.innerText = something;
    };

    div1.addEventListener("animationend", function (e) {
        if (e.animationName === "mymove") {
            this.style.animation = "disappear 0.3s forwards";
        }
    });
});