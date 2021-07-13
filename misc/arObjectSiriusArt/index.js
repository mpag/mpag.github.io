document.getElementById('info').addEventListener('click', function(){
      // document.querySelector('#modalImg').src = "img/stair.png";
      document.querySelector('.bg-modal').style.display = 'flex';
});

document.querySelector('.bg-modal').addEventListener('click', function(){
      document.querySelector('.bg-modal').style.display = 'none';
      // document.querySelector('.modal-content').style.display = 'inherit';
});