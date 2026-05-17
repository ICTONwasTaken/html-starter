document.addEventListener("DOMContentLoaded", function() {
  let div1 = document.getElementById("myDIV"); 

  div1.hidden = false;

  div1.style.animation = "mymove 0.9s forwards";
  div1.addEventListener("animationend", myEndFunction, { once: true });
  
  function myEndFunction() { 
    this.style.animation = "disappear 0.3s forwards"; 
    div1.hidden = true;
}
})