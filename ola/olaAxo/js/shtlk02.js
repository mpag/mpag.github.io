/////////Global Variables///////////
var camera, scene, renderer, rectangle, div, controls, sliderNum;
var scene2, renderer2, manager;

window.addEventListener( 'resize', onWindowResize, false );
document.getElementById('container').addEventListener('touchstart', function(e){
  e.preventDefault();
}, { passive: false });


///////////Loader Variables////////
var index = 0;
var objindex = 0;
var files = ['models/topo.json', 'models/existingHouse.json', 'models/existingBuilding.json'];
var filesName = ['topo', 'existingHouse', 'existingBuilding']; 
var objectMove = [];


////////////CSS3d////////////////
//NOTE CSS VARIABLES
var noteDivObjects = [];
var noteObjects = [];
var divPositions = [];


/////////INIT VAIRABLES////////
var count = 0;
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

////CAMERA////////////
var frustumSize = 1000;
var slider = document.getElementById("myRange");
var camTarget = new THREE.Vector3(0, 0, 0);
var radius = 90;
var startAngle = 220;

var dirLight, helper;
var TOD = 15;

////////////////////////////////////////////////////////////////////////////


init();
uiReshuffle();


////////////////////////////////////////////////////////////////////////////



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
  camera.position.y = 35;
  camera.position.z = y;
  camera.zoom = 10;
  camera.updateProjectionMatrix();


  //////// GEOMETRY ///////////////////////
  // var planeGeometry = new THREE.PlaneGeometry( 500, 500, 64 );
  // planeGeometry.rotateX( - Math.PI / 2 );
  // planeGeometry.rotateY( - Math.PI / 4 );
  // var planeMaterial = new THREE.ShadowMaterial();
  // planeMaterial.opacity = 0.2;
  // var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  // plane.opacity = 0.1;
  // plane.position.y = -30.5;
  // plane.receiveShadow = true;
  // scene.add( plane );


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
    // console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
  };
  manager.onProgress = function ( item, loaded, total ) {
  };
  manager.onLoad = function ( ) {
    // $("#loadingScreen").delay(1000).fadeOut(500);
    animate();
    //////MODAL////////////
    // AMPHITHEATRE
  //   document.getElementById('Amphitheatre').addEventListener('click', function(){
  //     document.querySelector('#modalImg').src = "img/stair.png";
  //     document.querySelector('.bg-modal').style.display = 'flex';
  //   });
  //   //ATTRIUM
  //   document.getElementById('The Attrium').addEventListener('click', function(){
  //     document.querySelector('.bg-modal').style.display = 'flex';
  //     document.querySelector('.modal-content').style.display = 'none';
  //     document.querySelector('.modal-iframe').style.display = 'flex';
  //   });
  //   //POD
  //   document.getElementById('The Nook').addEventListener('click', function(){
  //     document.querySelector('#modalImg').src = "img/nook.png";
  //     document.querySelector('.bg-modal').style.display = 'flex';
  //   });
  //   //NOOK
  //   document.getElementById('The Pod').addEventListener('click', function(){
  //     document.querySelector('#modalImg').src = "img/pod.png";
  //     document.querySelector('.bg-modal').style.display = 'flex';
  //   });
  //   document.querySelector('.bg-modal').addEventListener('click', function(){
  //     document.querySelector('.bg-modal').style.display = 'none';
  //     document.querySelector('.modal-content').style.display = 'inherit';
  //     document.querySelector('.modal-iframe').style.display = 'none';
  //   });
  };


  function loadNextFile() {
  if (index > files.length - 1) return;
      jsonLoader.load(files[index], function ( object ) {
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh && filesName[index]=='topo') {
            child.castShadow = false;
            child.receiveShadow = true;
          } else if (child instanceof THREE.Mesh && filesName[index]=='existingHouse' && child.userData.Scene.Layer == 'HOUSE::ROOF') {
            child.castShadow = true;
            child.receiveShadow = false;
          } else if (child instanceof THREE.Mesh && filesName[index]=='existingBuilding' && child.userData.Scene.Layer == 'EXISTING::FACADEWALL') {
            child.castShadow = true;
            child.receiveShadow = false;
          } else {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        object.name = filesName[index];
        object.rotation.x = -Math.PI / 2;
        object.scale.x = 0.001;
        object.scale.y = 0.001;
        object.scale.z = 0.001;
        object.position.x = 160;
        object.position.y = -20;
        scene.add(object);
        index++;
        loadNextFile();
    }, onProgress, onError);
  };
  loadNextFile();


  //LIGHT//////////////////////////////////
  var ambientlight = new THREE.AmbientLight( 0x080808, 15 ); 
  dirLight = new THREE.DirectionalLight( 0xFCF8E4, 1.1 );
  dirLight.shadow.camera.right =  200;
  dirLight.shadow.camera.left = -200;
  dirLight.shadow.camera.top =  200;
  dirLight.shadow.camera.bottom = -200;
  dirLight.position.y = (sunData[TOD].sunPosition.Y);
  dirLight.position.x = (sunData[TOD].sunPosition.X);
  dirLight.position.z = -(sunData[TOD].sunPosition.Z);
  dirLight.rotation.y = Math.PI / 18;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0;
  dirLight.shadow.camera.far = 1500;
  dirLight.castShadow = true;

  // helper =  new THREE.DirectionalLightHelper( dirLight, 10 );
  // scene.add( helper );
  scene.add( dirLight.target);
  scene.add( dirLight );
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
  controls.target = camTarget;
  controls.update();



  ///////CSS GEOM////////////////////////////
  // NOTE CSS OBJECTS//
  
  // divPositions = [new THREE.Vector3( -33, -22, 0 ), new THREE.Vector3( -32, 91.25, -4 ), new THREE.Vector3( -33, 142, -6 ), new THREE.Vector3( 50, 6, 3 )]
  // divTitleText = ["Amphitheatre", "The Nook", "The Pod", "The Attrium"];
  // divText1 = ["Amphitheatre", "The Nook", "The Pod", "The Attrium"];

  // for (var i = 0; i < divTitleText.length; i++) {
  //   var parentDiv = document.createElement('div');
  //   parentDiv.className = "noteTag";
  //   parentDiv.style.opacity = 0;
  //   parentDiv.id = divTitleText[i];

  //   var childDiv = document.createElement('div');
  //   parentDiv.appendChild(childDiv);
  //   childDiv.className = "subText";
  //   childDiv.innerHTML = divTitleText[i];
  //   noteDivObjects.push(parentDiv);

  //   var css3DObject = new THREE.CSS3DObject(parentDiv);
  //   css3DObject.position.x = divPositions[i].x;
  //   css3DObject.position.y = divPositions[i].y;
  //   css3DObject.position.z = divPositions[i].z;
  //   css3DObject.rotation.y = Math.PI;
  //   noteObjects.push(css3DObject);
  //   scene2.add(css3DObject);
  // };



//////FUNCTIONS////////////////////////////

function animate(){
  window.requestAnimationFrame( animate );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  var time = Date.now() * 0.0005;
  var time2 = Date.now() * 0.002;

  var explodeThreshold = 0.5;
  var noteThreshold = 0.9;
  var sliderMax = 100;
  var explodeTime = explodeThreshold*sliderMax;
  var noteTime = noteThreshold*sliderMax;

  var rotation = (radius + startAngle + mouseX * 30) * Math.PI / 180;
  var rotationy = mouseY * 5;
  var newx = radius *  Math.cos(rotation);
  var newy = radius *  Math.sin(rotation);
  camera.position.x = newx;
  camera.position.z = newy;
  camera.position.y = 35 + rotationy;
  controls.enabled = true;

  TOD = Math.round(Math.sin(time2 / 20) * 20) + 25;
  dirLight.position.y = (sunData[TOD].sunPosition.Y);
  dirLight.position.x = (sunData[TOD].sunPosition.X);
  dirLight.position.z = -(sunData[TOD].sunPosition.Z);

  scene.getObjectByName('existingHouse').traverse(function(child) {
    if (child instanceof THREE.Mesh ){
    };
  });


  // if (isMobileDevice() == false){
  //   var rotation = (radius + startAngle + mouseX * 30) * Math.PI / 180;
  //   var newx = radius *  Math.cos(rotation);
  //   var newy = radius *  Math.sin(rotation);
  //   camera.position.x = newx;
  //   camera.position.z = newy;
  //   controls.enabled = true;

  //   document.getElementById('container').onmousedown = function( event ){ 
  //     function onMouseMove(event) {
  //       sliderNum = map_range(event.pageY, 0, screenHeight*0.9, 100, 0);
         
  //       ////json object move//////
  //       for (var i = 3; i < (objectMove.length-1); i++) {
  //         if (sliderNum >= explodeTime){
  //           objectMove[i].position.y = (-120 + ((sliderNum - explodeTime) / 4) * Math.pow(i, 1.5));
  //         } else {
  //           objectMove[i].position.y = (-120 + (sliderNum / 4) * Math.pow(0, 1.5));
  //         };
  //       };

  //       ///// CAMERA OBJECTS ZOOM
  //       if (sliderNum >= explodeTime){
  //         camera.zoom = 4 - (sliderNum - explodeTime) / 150;
  //         camTarget = new THREE.Vector3(0, (sliderNum - explodeTime)*1.2, 0);
  //         camera.position.y = 35 + (sliderNum - explodeTime) * 1.2;
  //         controls.target = camTarget; 
  //       } else {
  //         camera.zoom = 4;
  //         camTarget = new THREE.Vector3(0, 0, 0);
  //         controls.target = camTarget;
  //       };

  //       controls.update();
  //       camera.updateProjectionMatrix();

  //       //JSON OBJECTS OPACITY    
  //       facadeObject = objectMove[objectMove.length-1];
  //       facadeObject.traverse(function(child) {
  //         if (child instanceof THREE.Mesh) {
  //           child.castShadow = true;
  //           child.material.transparent = true;
  //           if (child.material.opacity <= 0){
  //             child.material.visible = false;
  //           } else {
  //             child.material.visible = true;
  //           };
  //           if (sliderNum >= 7){
  //             child.material.opacity = 1 - (sliderNum/30);       
  //           } else {
  //             child.material.opacity = 1;
  //           }
  //         };
  //       });

  //       //NOTE DIV OBJECTS OPACITY
  //       if (sliderNum >= noteTime){
  //         for (var i = 0; i < noteDivObjects.length; i++) {
  //           noteDivObjects[i].style.opacity = (sliderNum - noteTime) / 10;
  //         };
  //       } else {
  //         for (var i = 0; i < noteDivObjects.length; i++) {
  //           noteDivObjects[i].style.opacity = 0;
  //         };
  //       };
  //     };
  //     document.addEventListener('mousemove', onMouseMove);

  //     document.body.onmouseleave = function() {
  //       document.removeEventListener('mousemove', onMouseMove);
  //     };
  //     document.body.onmouseup = function() {
  //       document.removeEventListener('mousemove', onMouseMove);
  //     };
  //   };

  // } else {
  //   camera.zoom = 3;
  //   controls.enableRotate = false;
  //   controls.enabled = false;

  //   document.body.addEventListener('touchmove', onTouchMove, { passive: false });
  //   function onTouchMove(e){
  //     var touchobj = e.changedTouches[0]

  //     //CAMERA TOUCH LOCATION
  //     var rotation =+ (radius + startAngle + touchobj.clientX * 0.5) * Math.PI / 180;
  //     var newx = radius *  Math.cos(rotation);
  //     var newy = radius *  Math.sin(rotation);
  //     camera.position.x = newx;
  //     camera.position.z = newy;

  //     //SLIDER TOUCH LOCATION
  //     var sliderTemp = map_range(touchobj.clientY, screenHeight* 0.15, screenHeight*0.8, 100, 0);

  //     if (sliderTemp <= 0){
  //       sliderNum = 0;
  //     } else if (sliderTemp >= 100){
  //       sliderNum = 100;
  //     } else {
  //       sliderNum = sliderTemp;
  //     };
      
  //     ////json object move//////
  //     for (var i = 3; i < (objectMove.length-1); i++) {
  //       if (sliderNum >= explodeTime){
  //         objectMove[i].position.y = (-120 + ((sliderNum - explodeTime) / 4) * Math.pow(i, 1.5));
  //       } else {
  //         objectMove[i].position.y = (-120 + (sliderNum / 4) * Math.pow(0, 1.5));
  //       };
  //     };

  //     ///// CAMERA OBJECTS ZOOM
  //     if (sliderNum >= explodeTime){
  //       camera.zoom = 4 - (sliderNum - explodeTime) / 150;
  //       camTarget = new THREE.Vector3(0, (sliderNum - explodeTime)*1, 0);
  //       camera.position.y = 35 + (sliderNum - explodeTime) * 1;
  //       controls.target = camTarget; 
  //     } else {
  //       camera.zoom = 4;
  //       camTarget = new THREE.Vector3(0, 0, 0);
  //       controls.target = camTarget;
  //       camera.position.y = 35;
  //     };

  //     //JSON OBJECTS OPACITY    
  //     facadeObject = objectMove[objectMove.length-1];
  //     facadeObject.traverse(function(child) {
  //       if (child instanceof THREE.Mesh) {
  //         child.castShadow = true;
  //         child.material.transparent = true;
  //         if (child.material.opacity <= 0){
  //           child.material.visible = false;
  //         } else {
  //           child.material.visible = true;
  //         };
  //         child.material.opacity = 1 - (sliderNum/30);
  //       };
  //     });

  //     e.preventDefault();
  //   };
  //   document.body.ontouchend = function(e){
  //     document.body.removeEventListener('touchmove', onTouchMove);  
  //   }
  // };

  camera.updateProjectionMatrix();
  controls.update();
  renderer2.render( scene2, camera);
  renderer.render( scene, camera);
}}; 


function onDocumentMouseMove(event) {
    mouseX = ( event.clientX - windowHalfX ) * 0.005;
    mouseY = ( event.clientY - windowHalfY ) * 0.005;
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