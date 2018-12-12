var img = ["img/equirectangular0.jpg", 'img/equirectangular3.jpg', 'img/equirectangular1.jpg', 'img/equirectangular2.jpg'];
var imgDesc = ["Ground Floor of Attrium", "First Floor of Attrium", "First Floor Balcony", "Third Floor of Attrium"];
var count = 0;


//CALLS
document.getElementById('previous').addEventListener('click', prevImage, false);
document.getElementById('next').addEventListener('click', nextImage, false);
document.getElementById('imageRef').innerHTML = "<h1>" + imgDesc[count] + "</h1>";
animate();

//ANIMATE
function animate(){
  window.requestAnimationFrame( animate );
  var rotVal = "0 " + Date.now()*0.0005 + " 0"; 
  document.querySelector('#sky').setAttribute('rotation', rotVal);
};


//MODAL
document.querySelector('.close').addEventListener('click', function(){
  document.querySelector('.bg-modal').style.display = 'none';
});

document.querySelector('.imageRef').addEventListener('click', function(){
  document.querySelector('.bg-modal').style.display = 'flex';
});


//IMAGE CYCLING
function prevImage(){
  count--;
  document.querySelector('#sky').setAttribute('src', img[count%img.length]);
  document.getElementById('imageRef').innerHTML = "<h1>" + imgDesc[count%img.length] + "</h1>";
};

function nextImage(){
  count++;
  document.querySelector('#sky').setAttribute('src', img[count%img.length]);
  document.getElementById('imageRef').innerHTML = "<h1>" + imgDesc[count%img.length] + "</h1>";
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};


//LOADING
document.querySelector('a-scene').addEventListener('loaded', function () {
  $("#loadingScreen").delay(1000).fadeOut(500);
})