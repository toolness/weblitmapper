var timer = document.getElementById('time-till-close');
var timerVal = parseInt(timer.innerHTML, 10);

setInterval(function(){
  timer.innerHTML = timerVal - 1;
  timerVal--;
}, 1000);

setTimeout(function(){
  window.close();
}, timerVal * 1000);

$('a[data-close-window]').on('click', function(){
  window.close();
});
