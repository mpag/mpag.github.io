

//Global Variables
var camera, scene, renderer, rectangle, div, controls, element1, element2;
var scene2, renderer2, manager;
var line = []; 
var divs = [];
var divText = [];
var divDesc = ["Equitone Natura (PG341) + Solar PV", "Equitone Natura (PG542) + Solar PV", "Equitone Natura (PW841) + Solar PV", "Equitone Natura (PW141) + Solar PV"]
window.addEventListener( 'resize', onWindowResize, false );

//Loader Variables
var index = 0;
var countLoaded = 0;
var files = ["models/baseTopo.json", "models/baseStructure01.json", "models/baseStructure02.json", "models/baseStructure03.json", "models/baseStructure04.json", "models/baseStructure05.json"];

var sunFile = $.getJSON( "ref/sunPosition.json", function( data ) {
  // console.log( data );
});


//Init Variables
var count = 0;
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var frustumSize = 1000;
var slider = document.getElementById("myRange");
var objectMove = [];
var dirLight, helper;


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
  plane.position.y = -24;
  plane.receiveShadow = true;
  // scene.add( plane );


  /////////CSS GEOM//////////
  element0 = document.createElement('div');
  element0.className = "tag";
  element0.style.opacity = 0;
  elText0 = document.createElement('div');
  element0.appendChild( elText0 );
  elText0.className = "titleText";
  elText0.innerHTML = '<b>0. </b>Landscaped Topography';

  titleDiv0 = new THREE.CSS3DObject(element0);
  titleDiv0.position.x = -110;
  titleDiv0.position.y = -65;
  titleDiv0.position.z = -72;
  titleDiv0.rotation.x = -Math.PI / 2;
  titleDiv0.rotation.z =  Math.PI;
  scene2.add(titleDiv0);


  element1 = document.createElement('div');
  element1.className = "tag";
  element1.style.opacity = 0;
  elText1 = document.createElement('div');
  element1.appendChild( elText1 );
  elText1.className = "titleText";
  elText1.innerHTML = '<b>1. </b>Cross-Laminated Timber Structure';

  titleDiv1 = new THREE.CSS3DObject(element1);
  titleDiv1.position.x = -110;
  titleDiv1.position.y = -65;
  titleDiv1.position.z = -45;
  titleDiv1.rotation.x = -Math.PI / 2;
  titleDiv1.rotation.z =  Math.PI;
  scene2.add(titleDiv1);
  for (i = 0; i < 4; i++){
    elementFacade = document.createElement('div');
    elementFacade.className = "tag";
    elementFacade.style.opacity = 0;
    elTextFacade = document.createElement('div');
    elementFacade.appendChild( elTextFacade );
    elTextFacade.className = "subText";
    elTextFacade.id = "model" + i ;
    elTextFacade.innerHTML = "<b>" + (i+2) + ".  </b>" + divDesc[i];
    divText.push( elementFacade );
  };

  for (i = 0; i < divText.length; i++){
    subText = new THREE.CSS3DObject( divText[i] );
    divs.push(subText);
    subText.name = "cssModel" + i;
    subText.position.x = -110;
    subText.position.y = -70;
    subText.position.z = -45;
    subText.rotation.x = -Math.PI / 2;
    subText.rotation.z =  Math.PI;
    scene2.add(subText);
  };


  //////////LOADER///////////

  manager = new THREE.LoadingManager();


  //JSON LOADER
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
        object.position.y = -20;
        scene.add(object);
        objectMove.push(scene.getObjectByName("part" + index));
        index++;
        loadNextFile();
      }, onProgress, onError);
  };

  loadNextFile();


  //LIGHT
  var ambientlight = new THREE.AmbientLight( 0x080808, 20 ); 
  dirLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
  dirLight.shadow.camera.right =  500;
  dirLight.shadow.camera.left = -500;
  dirLight.shadow.camera.top =  500;
  dirLight.shadow.camera.bottom = -500;
  dirLight.position.y = (sunData[0].sunPosition.Y);
  dirLight.position.x = (sunData[0].sunPosition.X);
  dirLight.position.z = -(sunData[0].sunPosition.Z);
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0;
  dirLight.shadow.camera.far = 2500;
  dirLight.castShadow = true;

  helper =  new THREE.DirectionalLightHelper( dirLight, 10 );
  scene.add( helper );
  scene.add( dirLight.target);
  scene.add( dirLight );
  scene.add( ambientlight );
  
  
  //RENDERERS
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
  document.body.appendChild(renderer2.domElement);

  //CONTROLS
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  controls.enablePan = false;
  controls.update();
  
};


//////FUNCTIONS////////

function animate(){
  window.requestAnimationFrame( animate );
  slider.oninput = function() {
    
    var sliderNum = this.value;

    // dirLight.position.x = (sliderNum * 3) - (sliderNum - 2);
    // console.log(sliderNum);

    helper.update();
    dirLight.position.y = (sunData[Math.round(sliderNum)].sunPosition.Y);
    dirLight.position.x = (sunData[Math.round(sliderNum)].sunPosition.X);
    dirLight.position.z = -(sunData[Math.round(sliderNum)].sunPosition.Z);

    document.getElementById("timeDate").innerHTML = sunData[Math.round(sliderNum)].dates;


    // camera.zoom = 4 - sliderNum / 90;

    // scene.remove(line);
    // var geometryLine = new THREE.Geometry();
    // geometryLine.vertices.push(new THREE.Vector3( div.position.x - 17, div.position.y - 15, div.position.z) );
    // geometryLine.vertices.push(new THREE.Vector3( meshKnot.position.x + 20, meshKnot.position.y, meshKnot.position.z) );
    // var lineMaterial = new THREE.LineBasicMaterial( { color: 0x9E9E9E, scale: '0.5' } )
    // line = new THREE.Line( geometryLine, lineMaterial );
    // scene.add(line);

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
  renderer2.setSize( window.innerWidth, window.innerHeight );
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
