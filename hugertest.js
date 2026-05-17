let div1 = document.getElementById("myDIV"); 

document.addEventListener("DOMContentLoaded", function() {
  div1.innerText = "WELCOME!";
  div1.hidden = false;

  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", myEndFunction); 
})
    
function myEndFunction() { 
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
}