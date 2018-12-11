var img = ["img/equirectangular.jpg", 'img/equirectangular2.jpg'];
var count = 0;
animate();

function animate(){
  window.requestAnimationFrame( animate );
  var time = new Date();
  var timeInt = Math.floor(time.getSeconds()*0.1);

  if (timeInt % 2 == 0){
    count = 0;
  } else {
    count = 1
  };

  var rotVal = "0 " + Date.now()*0.001 + " 0"; 

  document.querySelector('#sky').setAttribute('src', img[count]);
  document.querySelector('#sky').setAttribute('rotation', rotVal);
};

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};