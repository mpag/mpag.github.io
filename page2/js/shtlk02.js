

var camera, scene, renderer, meshKnot, meshPlane, meshBox;
var count = 0;
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var frustumSize = 1000;
var slider = document.getElementById("myRange");
var objectMove = [];    


window.addEventListener( 'resize', onWindowResize, false );

init();

function init(){
  //CAMERA
  scene = new THREE.Scene();
  near = -100; 
  far = 10000;
  camera = new THREE.OrthographicCamera( frustumSize*aspect/-2, frustumSize*aspect/2, frustumSize/2, frustumSize/-2, near, far );
  camera.position.z = -50;
  camera.position.y = 35;
  camera.position.x = 50;
  camera.zoom = 4;
  camera.updateProjectionMatrix();

  var planeGeometry = new THREE.PlaneGeometry( 500, 500, 64 );
  planeGeometry.rotateX( - Math.PI / 2 );
  planeGeometry.rotateY( - Math.PI / 4 );
  var planeMaterial = new THREE.ShadowMaterial();
  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.position.y = -65;
  plane.receiveShadow = true;
  scene.add( plane );


  //////// GEOMETRY /////////
  var index = 0;
  var countLoaded = 0;
  var files = ["models/baseTopo.json", "models/baseStructure01.json", "models/baseStructure02.json", "models/baseStructure03.json", "models/baseStructure04.json", "models/baseStructure05.json", "models/baseFacade01.json", "models/baseFacade02.json", "models/baseFacade03.json", "models/baseFacade04.json", "models/baseFacade05.json"];

  //////////LOADER///////////

  var manager = new THREE.LoadingManager();

  var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
    }};

  var onError = function ( xhr ) {
  };
  
  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
  };
  
  manager.onProgress = function ( item, loaded, total ) {
    countLoaded++;
  };
  manager.onLoad = function ( ) {
    if (countLoaded == files.length) {
    };
  };

  var jsonLoader = new THREE.ObjectLoader( manager );
  
  function loadNextFile() {
    if (index > files.length - 1) return;
      jsonLoader.load(files[index], function ( object ) {
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          };
        });
        object.name = "part" + index;
        object.rotation.x = -Math.PI / 2;
        object.position.y = -65;
        scene.add(object);
        objectMove.push(scene.getObjectByName("part" + index));
        index++;
        loadNextFile();
    }, onProgress, onError);
  };

  loadNextFile();

  // for (var i = 0; i < (files.length-1); i++) {
  //   var objectMove = scene.getObjectByName("part" + i);
  //   console.log(objectMove);
  // }
  // var part0 = scene.getObjectByName("part0");
  // var part1 = scene.getObjectByName("part1");
  // var part2 = scene.getObjectByName("part2");
  // var part3 = scene.getObjectByName("part3");
  // var part4 = scene.getObjectByName("part4");
  // var part5 = scene.getObjectByName("part5");
  // var part6 = scene.getObjectByName("part6");
  // var part7 = scene.getObjectByName("part7");
  // var part8 = scene.getObjectByName("part8");
  // var part9 = scene.getObjectByName("part9");


  //LIGHT
  var ambientlight = new THREE.AmbientLight( 0x080808, 20 ); 
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
  directionalLight.shadow.camera.right =  1000;
  directionalLight.shadow.camera.left = -1000;
  directionalLight.shadow.camera.top =  1000;
  directionalLight.shadow.camera.bottom = -1000;
  directionalLight.position.y = 300;
  directionalLight.position.z = -100;
  directionalLight.position.x = -100;
  directionalLight.shadow.mapSize.width = 1024;  // default
  directionalLight.shadow.mapSize.height = 1024; // default
  directionalLight.shadow.camera.near = 0;    // default
  directionalLight.shadow.camera.far = 2500;     // default
  directionalLight.castShadow = true;
  scene.add( directionalLight );
  scene.add( ambientlight );
  
  
  //RENDERERS
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize( screenWidth, screenHeight);
  renderer.autoClear = false;
  renderer.setClearColor( 0xffffff, 0);

  function setPixelRatio(){
    if (isMobileDevice() == true){
      renderer.setPixelRatio( 1 );
    } else {
      renderer.setPixelRatio( 2.0 );
    }
  };
  setPixelRatio();

  document.getElementById("example1").appendChild( renderer.domElement );
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
	controls.dampingFactor = 0.8;
  controls.autoRotate = true;
  controls.update();

  

  //ANIMATION/EVERY FRAME LOOP
  function animation(){
    window.requestAnimationFrame( animation );
    // stats.begin();
    slider.oninput = function() {
      var sliderNum = this.value / 1.5;
      for (var i = 6; i < (objectMove.length - 1); i++) {
        objectMove[i].position.y = -65 + (sliderNum / 10) * Math.pow(i, 1.5);
      };
      camera.zoom = 4 - sliderNum / 60;
    };
    camera.updateProjectionMatrix();
    controls.update();
    renderer.render( scene, camera);
    // stats.end();
  };


  animation();  
};


//////FUNCTIONS////////
function onWindowResize() {
  var aspect = window.innerWidth / window.innerHeight;
  camera.left   = - frustumSize * aspect / 2;
  camera.right  =   frustumSize * aspect / 2;
  camera.top    =   frustumSize / 2;
  camera.bottom = - frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
};


function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

function uiReshuffle(){
  if (isMobileDevice() == true){
    document.getElementById("paragraph").style.display = "none";
    document.getElementById("title").style.bottom = "20px";
    document.getElementById("title").style.width = "82%";
    document.getElementById("title").style.borderTop = "none";
  } else {
    document.getElementById("title").style.top = "20px";
    document.getElementById("title").style.width = "400px";
    document.getElementById("title").style.borderTop = "2px solid white";
    document.getElementById("title").style.borderBottom = "2px solid white";
  }
};

uiReshuffle();
