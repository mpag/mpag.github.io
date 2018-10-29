

//Global Variables
var camera, scene, renderer, rectangle, div, controls, element1, element2;
// var scene2, renderer2, manager;
var mixers = [];
var clock = new THREE.Clock();
// var line = []; 
// var divs = [];
// var divText = [];
// var divDesc = ["Equitone Natura (PG341) + Solar PV", "Equitone Natura (PG542) + Solar PV", "Equitone Natura (PW841) + Solar PV", "Equitone Natura (PW141) + Solar PV"]
window.addEventListener( 'resize', onWindowResize, false );

//Loader Variables
// var index = 0;
// var countLoaded = 0;
// var files = ["models/baseTopo.json", "models/baseStructure01.json", "models/baseStructure02.json", "models/baseStructure03.json", "models/baseStructure04.json", "models/baseStructure05.json", "models/baseFacade01.json", "models/baseFacade02.json", "models/baseFacade03.json", "models/baseFacade04.json", "models/baseFacade05.json"];


//Init Variables
var count = 0;
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var frustumSize = 500;
// var slider = document.getElementById("myRange");
// var objectMove = [];


init(); 
// uiReshuffle();


function init(){
  //Scenes
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.2);
  // scene2 = new THREE.Scene();
  

  //CAMERA
  near = -100; 
  far = 10000;
  // camera = new THREE.OrthographicCamera( frustumSize*aspect/-2, frustumSize*aspect/2, frustumSize/2, frustumSize/-2, near, far );
  camera = new THREE.PerspectiveCamera( 90, aspect, 0.1, 100 );
  camera.position.z = 2;
  camera.position.y = 0.2;
  camera.position.x = 0;
  // camera.zoom = 10;
  camera.updateProjectionMatrix();
  camera.target = new THREE.Vector3(0,5,5);


  //////// GEOMETRY /////////

  var planeGeometry = new THREE.PlaneGeometry( 15, 15, 64 );
  planeGeometry.rotateX( - Math.PI / 2 );
  planeGeometry.rotateY( - Math.PI / 4 );
  var planeMaterial = new THREE.ShadowMaterial();
  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.opacity = 1.0;
  plane.position.y = -2;
  plane.receiveShadow = true;
  scene.add( plane );

  // var radius = 1.5;
  // var radials = 16;
  // var circles = 2;
  // var divisions = 32;

  var gridHelper1 = new THREE.GridHelper(40, 80);
  var gridHelper2 = new THREE.GridHelper(40, 80);
  gridHelper1.position.y = -1.5;
  gridHelper2.position.y = 1.5;
  scene.add(gridHelper1, gridHelper2);


  // /////////CSS GEOM//////////
  // element0 = document.createElement('div');
  // element0.className = "tag";
  // element0.style.opacity = 0;
  // elText0 = document.createElement('div');
  // element0.appendChild( elText0 );
  // elText0.className = "titleText";
  // elText0.innerHTML = '<b>0. </b>Landscaped Topography';

  // titleDiv0 = new THREE.CSS3DObject(element0);
  // titleDiv0.position.x = -110;
  // titleDiv0.position.y = -65;
  // titleDiv0.position.z = -72;
  // titleDiv0.rotation.x = -Math.PI / 2;
  // titleDiv0.rotation.z =  Math.PI;
  // scene2.add(titleDiv0);


  // element1 = document.createElement('div');
  // element1.className = "tag";
  // element1.style.opacity = 0;
  // elText1 = document.createElement('div');
  // element1.appendChild( elText1 );
  // elText1.className = "titleText";
  // elText1.innerHTML = '<b>1. </b>Cross-Laminated Timber Structure';

  // titleDiv1 = new THREE.CSS3DObject(element1);
  // titleDiv1.position.x = -110;
  // titleDiv1.position.y = -65;
  // titleDiv1.position.z = -45;
  // titleDiv1.rotation.x = -Math.PI / 2;
  // titleDiv1.rotation.z =  Math.PI;
  // scene2.add(titleDiv1);


  // for (i = 0; i < 4; i++){
  //   elementFacade = document.createElement('div');
  //   elementFacade.className = "tag";
  //   elementFacade.style.opacity = 0;
  //   elTextFacade = document.createElement('div');
  //   elementFacade.appendChild( elTextFacade );
  //   elTextFacade.className = "subText";
  //   elTextFacade.id = "model" + i ;
  //   elTextFacade.innerHTML = "<b>" + (i+2) + ".  </b>" + divDesc[i];
  //   divText.push( elementFacade );
  // };

  // for (i = 0; i < divText.length; i++){
  //   subText = new THREE.CSS3DObject( divText[i] );
  //   divs.push(subText);
  //   subText.name = "cssModel" + i;
  //   subText.position.x = -110;
  //   subText.position.y = -70;
  //   subText.position.z = -45;
  //   subText.rotation.x = -Math.PI / 2;
  //   subText.rotation.z =  Math.PI;
  //   scene2.add(subText);
  // };



  //////////LOADER///////////

  // manager = new THREE.LoadingManager();
  // var jsonLoader = new THREE.ObjectLoader( manager );


  // var onProgress = function ( xhr ) {
  //   if ( xhr.lengthComputable ) {
  //     var percentComplete = xhr.loaded / xhr.total * 100;
  //   }};
  // var onError = function ( xhr ) {
  // };
  // manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
  // };
  // manager.onProgress = function ( item, loaded, total ) {
  //   countLoaded++;
  // };
  // manager.onLoad = function ( ) {
  //   if (countLoaded == files.length) {
  //   };
  // };

  
  // function loadNextFile() {
  //   if (index > files.length - 1) return;
  //     jsonLoader.load(files[index], function ( object ) {
  //       object.traverse(function(child) {
  //         if (child instanceof THREE.Mesh) {
  //           object.castShadow = true;
  //           object.receiveShadow = true;
  //         };
  //       });
  //       object.name = "part" + index;
  //       object.rotation.x = -Math.PI / 2;
  //       object.position.y = -65;
  //       scene.add(object);
  //       objectMove.push(scene.getObjectByName("part" + index));
  //       index++;
  //       loadNextFile();
  //   }, onProgress, onError);
  // };

  // loadNextFile();

  // model




  var manager = new THREE.LoadingManager();

  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    $("#loadingScreen").delay(3000).fadeOut(500);
    console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
  };


  // var onProgress = function ( xhr ) {
  //     if ( xhr.lengthComputable ) {
  //       var percentComplete = xhr.loaded / xhr.total * 100;
  //       console.log(percentComplete);
  //     }
  // };
  // var onError = function ( xhr ) {
  // };
  // manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
  // };
  // manager.onProgress = function ( item, loaded, total ) {
  // };
  manager.onLoad = function ( ) {
    animate();
  };





  var loader = new THREE.FBXLoader( manager );

  loader.load( 'model/tempSceneRobot.fbx', function ( object ) {

    objectMat = new THREE.MeshNormalMaterial();

    object.traverse( function ( child ) {

      if ( child.isMesh ) {

        // child.material = objectMat;
        child.castShadow = true;
        child.receiveShadow = true;

      }
    });
      
    
    object.mixer = new THREE.AnimationMixer( object );
    mixers.push( object.mixer );

    var action = object.mixer.clipAction( object.animations[0] );
    action.play();

    object.position.y = -1.5;
    object.scale.x = 0.01;
    object.scale.y = 0.01;
    object.scale.z = 0.01;

    scene.add( object );

  } );




  //LIGHT
  var ambientlight = new THREE.AmbientLight( 0x080808, 10); 
  var spotLight = new THREE.SpotLight( 0xffffff, 2, 0, Math.PI/6, 0.5 );
  spotLight.position.set( 0, 3, 0 );
  // spotLight.penumbra = 0;
  // spotlight.angle = Math.PI / 6;
  // spotlight.intensity = 2;

  spotLight.castShadow = true;

  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 4000;
  spotLight.shadow.camera.fov = 30;

  scene.add( spotLight );
  spotLight.castShadow = true;
  scene.add( ambientlight );
  scene.add( spotLight );
  
  
  //RENDERERS
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize( screenWidth, screenHeight);
  renderer.autoClear = false;
  // renderer.setClearColor( 0xffffff, 0);
  renderer.domElement.style.zIndex = 0;
  document.body.appendChild( renderer.domElement );

  // renderer2 = new THREE.CSS3DRenderer();
  // renderer2.setSize(window.innerWidth, window.innerHeight);
  // renderer2.domElement.style.position = 'absolute';
  // renderer2.domElement.style.top = 0;
  // renderer2.domElement.style.pointerEvents= 'none';
  // renderer2.domElement.style.zIndex = 1;
  // document.body.appendChild(renderer2.domElement);

  //CONTROLS
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.update();
  
};


//////FUNCTIONS////////

function animate(){
  window.requestAnimationFrame( animate );
  // stats.begin();
  // slider.oninput = function() {
  //   var sliderNum = this.value;

  //   for (var i = 6; i < (objectMove.length - 1); i++) {
  //     objectMove[i].position.y = -65 + (sliderNum / 15) * Math.pow(i, 1.5);
  //   };

  //   for (i = 0; i < divs.length; i++){
  //     divs[i].position.y = objectMove[i+6].position.y + (sliderNum / 15) * Math.pow(i, 0.8);
  //   };

  //   for (i = 0; i < divText.length; i++){
  //     divText[i].style.opacity = (sliderNum / 30);  
  //   };

  //   element0.style.opacity = (sliderNum / 30);
  //   element1.style.opacity = (sliderNum / 30);

  //   camera.zoom = 4 - sliderNum / 90;

    // scene.remove(line);
    // var geometryLine = new THREE.Geometry();
    // geometryLine.vertices.push(new THREE.Vector3( div.position.x - 17, div.position.y - 15, div.position.z) );
    // geometryLine.vertices.push(new THREE.Vector3( meshKnot.position.x + 20, meshKnot.position.y, meshKnot.position.z) );
    // var lineMaterial = new THREE.LineBasicMaterial( { color: 0x9E9E9E, scale: '0.5' } )
    // line = new THREE.Line( geometryLine, lineMaterial );
    // scene.add(line);

  // };

  // renderer2.render( scene2, camera);

  if ( mixers.length > 0 ) {
    for ( var i = 0; i < mixers.length; i ++ ) {
      mixers[ i ].update( clock.getDelta() );
    }
  };

  renderer.render( scene, camera);
  camera.updateProjectionMatrix();
  controls.update();

}; 


// function setPixelRatio(){
//   if (isMobileDevice() == true){
//     renderer.setPixelRatio( 1 );
//   } else {
//     renderer.setPixelRatio( 2.0 );
//   }
// };
// setPixelRatio();


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

// function isMobileDevice() {
//     return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
// };

// function uiReshuffle(){
//   if (isMobileDevice() == true){
//     document.getElementById("paragraph").style.display = "none";
//     document.getElementById("title").style.bottom = "20px";
//     document.getElementById("title").style.width = "82%";
//     document.getElementById("title").style.borderTop = "none";
//   } else {
//     document.getElementById("title").style.top = "20px";
//     document.getElementById("title").style.width = "200px";
//     document.getElementById("title").style.borderTop = "2px solid white";
//     document.getElementById("title").style.borderBottom = "2px solid white";
//   }
// };
