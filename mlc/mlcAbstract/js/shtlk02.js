

/////////Global Variables///////////
var camera, scene, renderer, rectangle, div, controls;
var scene2, renderer2, manager;
window.addEventListener( 'resize', onWindowResize, false );

///////////Loader Variables////////
var index = 0;
var files = ["models/Facade_Test.json"];

//////////INIT VAIRABLES////////
var count = 0;
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var frustumSize = 1000;
var slider = document.getElementById("myRange");
var objectMove = [];
var camTarget = new THREE.Vector3(0, 0, 0);

var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
window.addEventListener( 'resize', onWindowResize, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );




init();
animate(); 


function init(){
  //Scenes
  scene = new THREE.Scene();
  scene2 = new THREE.Scene();
  
  //CAMERA
  near = -100; 
  far = 10000;
  camera = new THREE.OrthographicCamera( frustumSize*aspect/-2, frustumSize*aspect/2, frustumSize/2, frustumSize/-2, near, far );
  camera.position.z = -50;
  camera.position.y = 30;
  camera.position.x = 00;
  camera.zoom = 70;
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
    // $("#loadingScreen").delay(2000).fadeOut(500);
    // $('#title').delay(3000).fadeIn(1500);  
  };

  function loadNextFile() {
    if (index > files.length - 1) return;
      jsonLoader.load(files[index], function ( object ) {
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            child.material.transparent = true;
            child.material.opacity = 1;
          };
        });
        object.name = "part" + index;
        object.position.y = -55;
        object.rotation.z = -Math.PI / 8;
        scene.add(object);
        objectMove.push(scene.getObjectByName("part" + index));
        index++;
        loadNextFile();
    }, onProgress, onError);
    };
  loadNextFile();

  
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

  renderer2 = new THREE.CSS3DRenderer();
  renderer2.setSize(window.innerWidth, window.innerHeight);
  renderer2.domElement.style.position = 'absolute';
  renderer2.domElement.style.top = 0;
  renderer2.domElement.style.pointerEvents= 'none';
  renderer2.domElement.style.zIndex = 1;
  // document.body.appendChild(renderer2.domElement);

  //CONTROLS
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.05;
  controls.update();
};

//////FUNCTIONS////////

function onDocumentMouseMove(event) {
    mouseX = ( event.clientX - windowHalfX ) * 0.01;
    mouseY = ( event.clientY - windowHalfY ) * 0.01;
};


function animate(){
  window.requestAnimationFrame( animate );

  var time = Date.now() * 0.0005;

  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;

  renderer.render( scene, camera);
  camera.updateProjectionMatrix();
  controls.update();

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
