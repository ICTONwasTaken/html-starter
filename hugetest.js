window.onload = () => {
    console.log('All resources finished loading');
};

const div1 = document.getElementById("myDIV");

function myFunction() {
  div1.hidden = false;
  div1.style.animation = "mymove 0.9s forwards";
}
div1.addEventListener("animationend", myEndFunction);

function myEndFunction() {
  this.style.animation = "disappear 0.3s forwards";
}
