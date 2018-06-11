

var camera, scene, renderer, meshKnot, meshPlane, meshBox;
var count = 0;
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var frustumSize = 1000;
var slider = document.getElementById("myRange");


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

  var planeGeometry = new THREE.PlaneGeometry( 500, 500, 32 );
  planeGeometry.rotateX( - Math.PI / 2 );
  planeGeometry.rotateY( - Math.PI / 4 );
  var planeMaterial = new THREE.ShadowMaterial();
  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.receiveShadow = true;
  scene.add( plane );


  //////// GEOMETRY /////////
  var index = 0;
  var countLoaded = 0;
  var files = ["models/inquiry0.json", "models/inquiry1.json", "models/inquiry2.json"];

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
        scene.add(object);
        index++;
        loadNextFile();
    }, onProgress, onError);
  };

  loadNextFile();


  //LIGHT
  var ambientlight = new THREE.AmbientLight( 0x080808, 5 ); 
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
  directionalLight.shadow.camera.right =  500;
  directionalLight.shadow.camera.left = -500;
  directionalLight.shadow.camera.top =  500;
  directionalLight.shadow.camera.bottom = -500;
  directionalLight.position.y = 150;
  directionalLight.position.z = -50;
  directionalLight.position.x = -50;
  directionalLight.shadow.mapSize.width = 1024;  // default
  directionalLight.shadow.mapSize.height = 1024; // default
  directionalLight.shadow.camera.near = -100;    // default
  directionalLight.shadow.camera.far = 1500;     // default
  directionalLight.castShadow = true;
  scene.add( directionalLight );
  scene.add( ambientlight );
  
  
  //RENDERERS
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio( 1.5 );
  renderer.setSize( screenWidth, screenHeight);
  renderer.autoClear = false;
  renderer.setClearColor( 0xffffff, 0);
  document.getElementById("example1").appendChild( renderer.domElement );
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
	controls.dampingFactor = 0.8;
  controls.update();

  //ANIMATION/EVERY FRAME LOOP
  function animation(){
    window.requestAnimationFrame( animation );
    // stats.begin();
    
    //VARIABLES
    var part0 = scene.getObjectByName("part0");
    var part1 = scene.getObjectByName("part1");
    var part2 = scene.getObjectByName("part2");

    slider.oninput = function() {
      var sliderNum = this.value / 5;
      plane.position.y = sliderNum* -5
      part0.position.y = sliderNum* -5;
      part1.position.y = sliderNum* 1;
      part2.position.y = sliderNum* 6;
      camera.zoom = 4 - sliderNum/ 12;
    };

    // directionalLight.position.x = guiControls.sunAngle*300 - 100;
    
    // var axoFactorScale = guiControls.axoFactor*5 + 35
 
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
