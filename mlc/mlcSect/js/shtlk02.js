/////////Global Variables///////////
var camera, scene, renderer, rectangle, div, controls;
var scene2, renderer2, manager;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();


window.addEventListener( 'resize', onWindowResize, false );
// document.getElementById('container').addEventListener('touchstart', function(e){
//   e.preventDefault();
// }, { passive: false });

var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

///////////Loader Variables////////
var index = 0;
var files = ["models/Base.json", "models/Birds.json", "models/backScreen.json", "models/backGlass.json", "models/backFacade.json"];
var sketchFiles = ["img/back.png","img/front.png", "img/middle.png"];
var annoFiles = ["img/bubble.png","img/wind1.png", "img/bubble.png"];

////Audio Pause/////////

var audio1 = document.getElementById("garden");
var audio2 = document.getElementById("people");
var audio3 = document.getElementById("class"); 

function playAudio( audio ) { 
    audio.play(); 
};

function pauseAudio( audio ) { 
    audio.pause(); 
};

pauseAudio( audio1 );
pauseAudio( audio2 );
pauseAudio( audio3 );

////////////CSS3d////////////////

//NOTE CSS VARIABLES
// var noteDivObjects = [];
// var noteObjects = [];
// var divPositions = [];

// //LEVEL CSS VARIABLES
// var levelDivObjects = [];
// var levelObjects = [];
 

/////////INIT VAIRABLES////////
var count = 0;
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var frustumSize = 1000;
var objectMove = [];
var camTarget;
var radius = 90;
var startAngle = 270;


init();
uiReshuffle();


function init(){
  //Scenes//////////////////////////////
  scene = new THREE.Scene();
  scene2 = new THREE.Scene();
  
  //CAMERA///////////////////////////////
  near = -100; 
  far = 10000;
  camera = new THREE.OrthographicCamera( frustumSize*aspect/-2, frustumSize*aspect/2, frustumSize/2, frustumSize/-2, near, far );
  var x = 45 * Math.cos(radius + startAngle);
  var y = 45 * Math.sin(radius + startAngle);
  camera.position.x = x;
  camera.position.y = 15;
  camera.position.z = y;
  camera.zoom = 12;
  camera.fog = true;
  camera.updateProjectionMatrix();

  //SKETCH PLANES
  planes = [];
  planePos = [[-60,12,-6], [0,20,31], [-33,17,26]];
  planeRot = [Math.PI / 2, Math.PI / 2, Math.PI];
  planeOp = [0.15, 0.5, 0.5];
  planeSc = [1,1,0.5];
  planeScX = [1,1,1.8];

  for (var i =  sketchFiles.length - 1; i >= 0; i--) {
    var geometry = new THREE.PlaneGeometry( 75*planeSc[i], 75*planeSc[i], 32 );
    var texture = new THREE.TextureLoader().load( sketchFiles[i] );
    var planeMaterial = new THREE.MeshBasicMaterial({
      map: texture, 
      side: THREE.DoubleSide, 
      transparent: true,
      opacity: planeOp[i]
    });
    var plane = new THREE.Mesh(geometry, planeMaterial);
    plane.name = "plane" + i ;
    plane.position.x = planePos[i][0];
    plane.position.y = planePos[i][1];
    plane.position.z = planePos[i][2];
    plane.rotation.y = planeRot[i];
    plane.scale.x = planeScX[i];
    planes.push(plane);
    scene.add(plane); 
  };

  //ANNOTATION PLANES
  annoPlanes = [];
  annoPlanePos = [[0,5,-43], [-1,6.5,0], [0,21,-43]];
  annoPlaneRot = [Math.PI / 2, Math.PI / 2, Math.PI / 2];
  annoPlaneSize = [3 ,8, 3];

  for (var i =  annoFiles.length - 1; i >= 0; i--) {
    var geometry = new THREE.PlaneGeometry( annoPlaneSize[i], annoPlaneSize[i], 32 );
    var texture = new THREE.TextureLoader().load( annoFiles[i] );
    var planeMaterial = new THREE.MeshBasicMaterial({
      map: texture, 
      side: THREE.DoubleSide, 
      transparent: true,
      opacity: 1
    });
    var plane = new THREE.Mesh(geometry, planeMaterial);
    plane.name = "annoPlane" + i ;
    plane.position.x = annoPlanePos[i][0];
    plane.position.y = annoPlanePos[i][1];
    plane.position.z = annoPlanePos[i][2];
    plane.rotation.y = annoPlaneRot[i];
    annoPlanes.push(plane);
    scene.add(plane); 
  };

  //////////LOADER////////////////////////

  manager = new THREE.LoadingManager();
  var jsonLoader = new THREE.ObjectLoader( manager );
  var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
    }};
  var onError = function ( xhr ) {
  };
  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
  };
  manager.onProgress = function ( item, loaded, total ) {
  };
  manager.onLoad = function ( ) {
    // $("#loadingScreen").delay(1000).fadeOut(500);
    if (index == files.length){
      document.addEventListener( 'mousemove', onDocumentMouseMove, false );
      animate();
    }; 
  };

  function loadNextFile() {
  if (index > files.length - 1) return;
      jsonLoader.load(files[index], function ( object ) {
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = false;
            child.fog = false;
          } else {
            child.castShadow = true;
            child.receiveShadow = false;
            child.fog = false;
          }
        });
        object.name = "part" + index;
        object.rotation.x = -Math.PI / 2;
        object.scale.x = 2;
        object.scale.y = 2;
        object.scale.z = 2;
        object.position.z = -15;
        scene.add(object);
        objectMove.push(scene.getObjectByName("part" + index));
        index++;
        loadNextFile();
    }, onProgress, onError);
  };
  loadNextFile();

  //LIGHT//////////////////////////////////
  var ambientlight = new THREE.AmbientLight( 0x080808, 20 ); 
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
  directionalLight.shadow.camera.right =  500;
  directionalLight.shadow.camera.left = -500;
  directionalLight.shadow.camera.top =  500;
  directionalLight.shadow.camera.bottom = -500;
  directionalLight.position.y = 200;
  directionalLight.position.z = 100;
  directionalLight.position.x = -100;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0;
  directionalLight.shadow.camera.far = 2500;
  directionalLight.castShadow = true;
  scene.add( directionalLight );
  scene.add( ambientlight );
  
  //RENDERERS////////////////////////////////
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize( screenWidth, screenHeight);
  renderer.autoClear = false;
  renderer.setClearColor( 0xffffff, 0);
  renderer.domElement.style.zIndex = 0;
  document.getElementById('container').appendChild( renderer.domElement );

  renderer2 = new THREE.CSS3DRenderer();
  renderer2.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('css3dScene').appendChild(renderer2.domElement);

  //CONTROLS////////////////////////////////
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.enableRotate = false;
  camTarget = new THREE.Vector3(0, camera.position.y, 0);
  controls.target = camTarget;
  controls.update();

};


//////FUNCTIONS////////////////////////////

function animate(){
  window.requestAnimationFrame( animate );

  var time = Date.now() * 0.0005;
  var time2 = Date.now() * 0.002;

  var explodeThreshold = 0.5;
  var noteThreshold = 0.9;
  var sliderMax = 100;
  var explodeTime = explodeThreshold*sliderMax;
  var noteTime = noteThreshold*sliderMax;

  if (isMobileDevice() == false){
    var rotation = (radius + startAngle + mouseX * 3) * Math.PI / 180;
    var newx = radius *  Math.cos(rotation);
    console.log(mouseX);
    var newy = radius *  Math.sin(rotation);
    camera.position.x = newx;
    camera.position.z = newy;
    camera.position.y =+ mouseY/10 + 15;
    controls.enabled = true;
    console.log("true!!!!!");
  } else {
    if (screenWidth > screenHeight){
      camera.zoom = 12;
    } else {
      camera.zoom = 4;
    };
    controls.enableRotate = false;
    controls.enabled = false;

    document.body.addEventListener('touchmove', onTouchMove, { passive: false });
    function onTouchMove(e){
      var touchobj = e.changedTouches[0]

      //CAMERA TOUCH LOCATION
      var rotation =+ (radius + startAngle + touchobj.clientX * 0.03) * Math.PI / 180;
      var newx = radius *  Math.cos(rotation);
      var newy = radius *  Math.sin(rotation);
      camera.position.x = newx;
      camera.position.z = newy;

      e.preventDefault();
    };
    document.body.ontouchend = function(e){
      document.body.removeEventListener('touchmove', onTouchMove);  
    }
  };

  ///BIRD MOVER///// 
  var birdIndex = 0;
  scene.getObjectByName( "part1" ).traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      birdIndex++;
      if (birdIndex == 1){
        child.position.z = Math.sin(1 - time2*2)/10;
      } else {
        child.position.z = Math.sin(time2*2)/10;
      }
    }
  });

  // ANNO PLANES FLOAT
  for (var i =  annoFiles.length - 1; i >= 0; i--) {
    scene.getObjectByName( 'annoPlane' + i).position.y += Math.sin(time2*2)/120;
  };

  //FACADE OPACITIES
  scene.getObjectByName( 'part4' ).traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      child.material.opacity = 0.5;
      child.material.transparent = true;
      child.receiveShadow = false;
      child.castShadow = false;
    };
  });

  scene.getObjectByName( 'part2' ).traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      child.material.opacity = 0.05;
      child.material.transparent = true;
      child.receiveShadow = false;
      child.castShadow = false;
    };
  });

    scene.getObjectByName( 'part3' ).traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      child.material.opacity = 0.1;
      child.material.transparent = true;
      child.receiveShadow = false;
      child.castShadow = false;
    };
  });

  // Raycaster
  raycaster.setFromCamera( mouse, camera );

  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects( scene.children );
  for ( var i = 0; i < intersects.length; i++ ) {
    if (intersects[intersects.length - 1].object.name == "annoPlane0"){
      scene.getObjectByName("annoPlane0").scale.x = 1.5;
      scene.getObjectByName("annoPlane0").scale.y = 1.5;
      audio2.play();
    } else if (intersects[intersects.length - 1].object.name == "annoPlane2"){
      scene.getObjectByName("annoPlane2").scale.x = 1.5;
      scene.getObjectByName("annoPlane2").scale.y = 1.5;
      audio3.play();
    } else {
      scene.getObjectByName("annoPlane0").scale.x = 1;
      scene.getObjectByName("annoPlane0").scale.y = 1;
      scene.getObjectByName("annoPlane2").scale.x = 1;
      scene.getObjectByName("annoPlane2").scale.y = 1;
      audio2.pause();
      audio3.pause();
    }
  };


  // var intersectJSON = raycaster.intersectObjects( scene.children, true );
  // for ( var i = 0; i < intersectJSON.length; i++ ) {
  //   intersectJSON[intersectJSON.length - 1].object.material.color.set( 0xff0000 );
  // };


  camera.updateProjectionMatrix();
  controls.update();
  renderer2.render( scene2, camera);
  renderer.render( scene, camera);
}; 



function onDocumentMouseMove(event) {
  mouseX = ( event.clientX - windowHalfX ) * 0.005;
  mouseY = ( event.clientY - windowHalfY ) * 0.005;

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
};

function map_range(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);

};

function setPixelRatio(){
  if (window.devicePixelRatio > 2){
    renderer.setPixelRatio( window.devicePixelRatio / 2 );
  } else {
    renderer.setPixelRatio( window.devicePixelRatio );
  }
};

function onWindowResize() {
  var aspect = window.innerWidth / window.innerHeight;
  camera.left   = - frustumSize * aspect / 2;
  camera.right  =   frustumSize * aspect / 2;
  camera.top    =   frustumSize / 2;
  camera.bottom = - frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer2.setSize( window.innerWidth, window.innerHeight );
};

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

function uiReshuffle(){
  if (isMobileDevice() == true){
    document.getElementById("paragraph").style.display = "none";
  } else {
  }
};


