var timer = document.getElementById('timeTillClose');
var timerVal = 5;

setInterval(function(){
  timer.innerHTML = timerVal - 1;
  timerVal--;
}, 1000);

setTimeout(function(){
  window.close();
}, 5000);
