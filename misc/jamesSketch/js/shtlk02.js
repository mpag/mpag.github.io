

/////////Global Variables///////////
var camera, scene, renderer, rectangle, div, controls;
var scene2, renderer2, manager;
window.addEventListener( 'resize', onWindowResize, false );
document.getElementById('container').addEventListener('touchstart', function(e){
  e.preventDefault();
}, { passive: false });

///////////Loader Variables////////
var index = 0;
var imgFiles = ["img/sketch/02_sketch.png","img/sketch/03_sketch.png","img/sketch/04_sketch.png","img/sketch/05_sketch.png","img/sketch/06_sketch.png","img/sketch/07_sketch.png","img/sketch/08_sketch.png","img/sketch/09_sketch.png","img/sketch/10_sketch.png","img/sketch/11_sketch.png","img/sketch/12_sketch.png","img/sketch/13_sketch.png","img/sketch/14_sketch.png","img/sketch/15_sketch.png","img/sketch/16_sketch.png","img/sketch/17_sketch.png","img/sketch/18_sketch.png"];
// var objectMove = [];

//////////INIT VAIRABLES///////
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var frustumSize = 1000;
var camTarget = new THREE.Vector3(0, 0, 0);

//UX UI///////////////
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
document.addEventListener( 'mousemove', onDocumentMouseMove, false );



init();
animate(); 


function init(){
  //Scenes
  scene = new THREE.Scene();
  
  //CAMERA
  near = -100; 
  far = 10000;
  camera = new THREE.PerspectiveCamera( 70, aspect, 1, 1000 );
  camera.position.z = -500;
  camera.position.y = 0;
  camera.position.x = 0;
  camera.updateProjectionMatrix();


  //////////LOADER///////////

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
  };


  ////////GEOMETRY/////////////
  
  planes = [];

  for (var i =  imgFiles.length - 1; i >= 0; i--) {
    var geometry = new THREE.PlaneGeometry( 20, 20, 32 );
    var texture = new THREE.TextureLoader().load( imgFiles[i] );
    var planeMaterial = new THREE.MeshBasicMaterial({
      map: texture, 
      side: THREE.DoubleSide, 
      transparent: true,
      opacity: map_range(i, 0, imgFiles.length-1, 0.7, 0.3)
    });
    var plane = new THREE.Mesh(geometry, planeMaterial)
    plane.id = "plane" + i ;
    plane.position.z = -((i+1) * 30);
    planes.push(plane);
    scene.add(plane); 
  };

  ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.05);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5 );
  scene.add(directionalLight);
  
  //RENDERERS
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  setPixelRatio();
  renderer.setSize( screenWidth, screenHeight);
  renderer.autoClear = false;
  renderer.setClearColor( 0xffffff, 0);
  renderer.domElement.style.zIndex = 0;
  document.body.appendChild( renderer.domElement );


  //CONTROLS
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  controls.enablePan = false;
  controls.enabled = false;

  controls.update();
};

//////FUNCTIONS////////

function onDocumentMouseMove(event) {
    mouseX = ( -event.clientX + windowHalfX ) * 0.005;
    mouseY = - ( screenHeight - event.clientY ) * 0.5;
};


function animate(){
  window.requestAnimationFrame( animate );

  var time = Date.now() * 0.0005;
  var time2 = Date.now() * 0.002;

  if (isMobileDevice() == false){
    camera.position.x += ( mouseX - camera.position.x ) * .01;
    camera.position.z += ( mouseY - camera.position.z ) * 0.5;
    centerVec = new THREE.Vector3( 0, 0, camera.position.z - 300);
    controls.target = centerVec;
  } else {
    document.body.addEventListener('touchmove', onTouchMove, { passive: false });
    function onTouchMove(e){
      var touchobj = e.changedTouches[0]
      var sliderTemp = map_range(touchobj.clientY, 0, screenHeight, -600, 0);
      camera.position.z += ( sliderTemp - camera.position.z ) * 0.5;
      camTarget = new THREE.Vector3(0, 0, (camera.position.z - 100));
      controls.target = camTarget;
      e.preventDefault();
    }; 
    document.body.ontouchend = function(e){
      document.body.removeEventListener('touchmove', onTouchMove);
    };
  };

  camera.updateProjectionMatrix();
  controls.update();
  renderer.render( scene, camera);
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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
};

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};
