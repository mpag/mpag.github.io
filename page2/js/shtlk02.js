

//Global Variables
var camera, scene, renderer, rectangle, div, controls, element;
var scene2, renderer2, manager;
var line = []; 
var divs = [];
var divText = [];
window.addEventListener( 'resize', onWindowResize, false );

//Loader Variables
var index = 0;
var countLoaded = 0;
var files = ["models/baseTopo.json", "models/baseStructure01.json", "models/baseStructure02.json", "models/baseStructure03.json", "models/baseStructure04.json", "models/baseStructure05.json", "models/baseFacade01.json", "models/baseFacade02.json", "models/baseFacade03.json", "models/baseFacade04.json", "models/baseFacade05.json"];


//Init Variables
var count = 0;
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var frustumSize = 1000;
var slider = document.getElementById("myRange");
var objectMove = [];


init();
animate(); 
uiReshuffle();


function init(){
  //Scenes
  scene = new THREE.Scene();
  scene2 = new THREE.Scene();
  

  //CAMERA
  near = -100; 
  far = 10000;
  camera = new THREE.OrthographicCamera( frustumSize*aspect/-2, frustumSize*aspect/2, frustumSize/2, frustumSize/-2, near, far );
  camera.position.z = -50;
  camera.position.y = 35;
  camera.position.x = 50;
  camera.zoom = 4;
  camera.updateProjectionMatrix();


  //////// GEOMETRY /////////

  var planeGeometry = new THREE.PlaneGeometry( 500, 500, 64 );
  planeGeometry.rotateX( - Math.PI / 2 );
  planeGeometry.rotateY( - Math.PI / 4 );
  var planeMaterial = new THREE.ShadowMaterial();
  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.opacity = 0.5;
  plane.position.y = -70;
  plane.receiveShadow = true;
  scene.add( plane );


  /////////CSS GEOM//////////
  element = document.createElement('div');
  element.className = "tag";
  elText = document.createElement('div');
  element.appendChild( elText );
  elText.className = "titleText";
  elText.innerHTML = 'STEM SCHOOL';

  titleDiv = new THREE.CSS3DObject(element);
  titleDiv.position.x = -105;
  titleDiv.position.y = -70;
  titleDiv.position.z = -66;
  titleDiv.rotation.x = -Math.PI / 2;
  titleDiv.rotation.z =  Math.PI;
  scene2.add(titleDiv);


  for (i = 0; i < 4; i++){
    elementFacade = document.createElement('div');
    elementFacade.className = "tag";
    elTextFacade = document.createElement('div');
    elementFacade.appendChild( elTextFacade );
    elTextFacade.className = "subText";
    elTextFacade.id = "model" + i ;
    elTextFacade.innerHTML = "COLOUR TYPE " + i;
    divText.push( elementFacade );
  };

  for (i = 0; i < divText.length; i++){
    subText = new THREE.CSS3DObject( divText[i] );
    divs.push(subText);
    subText.name = "cssModel" + i;
    subText.position.x = -105;
    subText.position.y = -70;
    subText.position.z = -66;
    subText.rotation.x = -Math.PI / 2;
    subText.rotation.z =  Math.PI;
    console.log(subText);
    scene2.add(subText);
  };


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
  };
  manager.onProgress = function ( item, loaded, total ) {
    countLoaded++;
  };
  manager.onLoad = function ( ) {
    if (countLoaded == files.length) {
    };
  };

  
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


  //LIGHT
  var ambientlight = new THREE.AmbientLight( 0x080808, 20 ); 
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
  directionalLight.shadow.camera.right =  1000;
  directionalLight.shadow.camera.left = -1000;
  directionalLight.shadow.camera.top =  1000;
  directionalLight.shadow.camera.bottom = -1000;
  directionalLight.position.y = 200;
  directionalLight.position.z = -100;
  directionalLight.position.x = -100;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0;
  directionalLight.shadow.camera.far = 2500;
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
  renderer.domElement.style.zIndex = 1;
  // renderer.domElement.style.pointerEvents= 'none';
  document.body.appendChild( renderer.domElement );

  renderer2 = new THREE.CSS3DRenderer();
  renderer2.setSize(window.innerWidth, window.innerHeight);
  renderer2.domElement.style.position = 'absolute';
  renderer2.domElement.style.top = 0;
  renderer2.domElement.style.zIndex = -1;
  document.body.appendChild(renderer2.domElement);

  //CONTROLS
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.8;
  controls.update();
  
};


//////FUNCTIONS////////

function animate(){
  window.requestAnimationFrame( animate );
  // stats.begin();
  slider.oninput = function() {
    var sliderNum = this.value / 1.5;

    for (var i = 6; i < (objectMove.length - 1); i++) {
      objectMove[i].position.y = -65 + (sliderNum / 10) * Math.pow(i, 1.5);
    };

    for (i = 0; i < divs.length; i++){
      divs[i].position.y = objectMove[i+6].position.y + (sliderNum / 10) * Math.pow(i, 1.5);
    }

    camera.zoom = 4 - sliderNum / 60;

    //Create Line Element between Dynamically Moving Objects
    scene.remove(line);
    var geometryLine = new THREE.Geometry();
    geometryLine.vertices.push(new THREE.Vector3( div.position.x - 17, div.position.y - 15, div.position.z) );
    geometryLine.vertices.push(new THREE.Vector3( meshKnot.position.x + 20, meshKnot.position.y, meshKnot.position.z) );
    var lineMaterial = new THREE.LineBasicMaterial( { color: 0x9E9E9E, scale: '0.5' } )
    line = new THREE.Line( geometryLine, lineMaterial );
    scene.add(line);

  };

  renderer2.render( scene2, camera);
  renderer.render( scene, camera);
  camera.updateProjectionMatrix();
  controls.update();

}; 


function setPixelRatio(){
  if (isMobileDevice() == true){
    renderer.setPixelRatio( 1 );
  } else {
    renderer.setPixelRatio( 2.0 );
  }
};
setPixelRatio();


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
