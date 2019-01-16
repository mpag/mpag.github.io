/////////Global Variables///////////
var camera, scene, renderer, rectangle, div, controls, sliderNum;
var scene2, renderer2, manager;

window.addEventListener( 'resize', onWindowResize, false );
// document.getElementById('container').addEventListener('touchstart', function(e){
//   e.preventDefault();
// }, { passive: false });


///////////Loader Variables////////
var index = 0;
var objindex = 0;
var files = 'models/OLA_Test1.glb';
var filesName = 'test'; 
var objectMove = [];
var clock = new THREE.Clock();
var mixer;
var mesh = [];
var anim = [];


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
  // var x = 45 * Math.cos(radius + startAngle);
  // var y = 45 * Math.sin(radius + startAngle);
  camera.position.x = 20;
  camera.position.y = 30;
  camera.position.z = 20;
  camera.zoom = 8;
  camera.updateProjectionMatrix();
  var camTarget = new THREE.Vector3(0, 20, 0);


  var path = 'texture/';
  var format = '.jpg';
  var envMap = new THREE.CubeTextureLoader().load( [
    path + 'posx' + format, path + 'negx' + format,
    path + 'posy' + format, path + 'negy' + format,
    path + 'posz' + format, path + 'negz' + format
  ] );


  var geom = new THREE.PlaneGeometry(500, 500, 10);
  var planeMat = new THREE.MeshBasicMaterial(0xffffff);
  var plane = new THREE.Mesh(geom, planeMat);
  plane.rotation.x = -Math.PI/2;
  plane.position.y  = 8;
  scene.add(plane);


  //////////LOADER////////////////////////

  manager = new THREE.LoadingManager();
  var loader = new THREE.GLTFLoader( manager );
  
  var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round(percentComplete, 2) + '% downloaded' );
    };
  };
  var onError = function ( xhr ) {
  };
  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    // console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
  };
  manager.onProgress = function ( item, loaded, total ) {
    // console.log( loaded, total );
  };
  manager.onLoad = function ( ) {
    
    // console.log(anim);
    // console.log(mesh);

    // mixer1 = new THREE.AnimationMixer(mesh[0]);
    // mixer1.clipAction( anim[0] ).setLoop( THREE.LoopPingPong );
    // mixer1.clipAction( anim[0] ).play();

    // mixer2 = new THREE.AnimationMixer(mesh[1]);
    // mixer2.clipAction( anim[1] ).setLoop( THREE.LoopPingPong );
    // mixer2.clipAction( anim[1] ).play();

    // mixer3 = new THREE.AnimationMixer(mesh[2]);
    // mixer3.clipAction( anim[2] ).setLoop( THREE.LoopPingPong );
    // mixer3.clipAction( anim[2] ).play();

    // mixer4 = new THREE.AnimationMixer(mesh[3]);
    // mixer4.clipAction( anim[3] ).setLoop( THREE.LoopPingPong );
    // mixer4.clipAction( anim[3] ).play();

    animate();
  };

  // Load a glTF resource
  loader.load(
    'models/OLA_Test1.glb',
    function ( gltf ) {
      model = gltf.scene;
      scene.add( model );
      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Scene
      gltf.asset; // Object

      gltf.scene.traverse(function(object) {

        if (object instanceof THREE.Mesh && object.name !='OLD_TOPO_CLOUDS') {
          object.castShadow = "true";
          object.receiveShadow = "true"
        };
      });

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).setLoop( THREE.LoopPingPong)
        mixer.clipAction(clip).play();
      });
    },

    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },

    function ( error ) {
      console.log( 'An error happened' );
    }
  );


  //LIGHT//////////////////////////////////
  var ambientlight = new THREE.AmbientLight( 0x080808, 10 ); 
  dirLight = new THREE.DirectionalLight( 0xFCF8E4, 1.0 );
  dirLight.shadow.camera.right =  200;
  dirLight.shadow.camera.left = -200;
  dirLight.shadow.camera.top =  200;
  dirLight.shadow.camera.bottom = -200;
  dirLight.position.y = (sunData[TOD].sunPosition.Y);
  dirLight.position.x = (sunData[TOD].sunPosition.X);
  dirLight.position.z = -(sunData[TOD].sunPosition.Z);
  dirLight.rotation.y = Math.PI / 18;
  dirLight.shadow.mapSize.width = 2048 * 2;
  dirLight.shadow.mapSize.height = 2048 * 2;
  dirLight.shadow.camera.near = 0;
  dirLight.shadow.camera.far = 1500;
  dirLight.bias = 0.0001;
  dirLight.castShadow = true;
  scene.add( dirLight.target);
  scene.add( dirLight );
  scene.add( ambientlight );
  
  //RENDERERS////////////////////////////////
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.shadowMap.enabled = true;
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize( screenWidth, screenHeight);
  renderer.autoClear = false;
  renderer.setClearColor( 0xffffff, 0);
  renderer.domElement.style.zIndex = 0;
  setPixelRatio();
  document.getElementById('container').appendChild( renderer.domElement );

  renderer2 = new THREE.CSS3DRenderer();
  renderer2.setSize(window.innerWidth, window.innerHeight);
  // document.getElementById('css3dScene').appendChild(renderer2.domElement);

  //CONTROLS////////////////////////////////
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.enablePan = true;
  controls.enableRotate = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.1;
  controls.target = camTarget;
  controls.update();



//////FUNCTIONS////////////////////////////

function animate(){
  window.requestAnimationFrame( animate );
  // document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  // var time = Date.now() * 0.0005;
  var time2 = Date.now() * 0.002;


  scene.getObjectByName( "OLD_TOPO_CLOUDS" ).position.y = (Math.sin(time2*2))/4;
  scene.getObjectByName( "OLD_TOPO_BIRDS" ).position.y = (Math.sin(time2*7))/4;
  // var explodeThreshold = 0.5;
  // var noteThreshold = 0.9;
  // var sliderMax = 100;
  // var explodeTime = explodeThreshold*sliderMax;
  // var noteTime = noteThreshold*sliderMax;

  // var rotation = (radius + startAngle + mouseX * 30) * Math.PI / 180;
  // var rotationy = mouseY * 5;
  // var newx = radius *  Math.cos(rotation);
  // var newy = radius *  Math.sin(rotation);
  // camera.position.x = newx;
  // camera.position.z = newy;
  // camera.position.y = 35 + rotationy;
  // controls.enabled = true;

  // TOD = Math.round(Math.sin(time2 / 10) * 20) + 25;
  dirLight.position.y = (sunData[20].sunPosition.Y);
  dirLight.position.x = (sunData[20].sunPosition.X);
  dirLight.position.z = -(sunData[20].sunPosition.Z);

  camera.updateProjectionMatrix();
  controls.update();
  // renderer2.render( scene2, camera);


  var delta = 0.5 * clock.getDelta();
  mixer.update(delta);

  // mixer1.update(delta);
  // mixer2.update(delta);
  // mixer3.update(delta);
  // mixer4.update(delta);
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