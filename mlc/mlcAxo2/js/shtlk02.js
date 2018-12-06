/////////Global Variables///////////
var camera, scene, renderer, rectangle, div, controls, sliderNum;
var scene2, renderer2, manager;
window.addEventListener( 'resize', onWindowResize, false );
// document.addEventListener( 'mousemove', onDocumentMouseMove, false );
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

///////////Loader Variables////////
var index = 0;
var objindex = 0;
var files = ["models/Base.json", "models/Void.json", "models/Level_00.json", "models/Level_01.json", "models/Level_02.json", "models/Level_03.json", "models/Facade.json" ];


////////////CSS3d////////////////

//NOTE CSS VARIABLES
var noteDivObjects = []
var noteObjects = []

//LEVEL CSS VARIABLES
var levelDivObjects = [];
var levelObjects = [];
 

/////////INIT VAIRABLES////////
var count = 0;
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var frustumSize = 1000;
var slider = document.getElementById("myRange");
var objectMove = [];
var camTarget = new THREE.Vector3(0, 0, 0);
var radius = 90;
var startAngle = 220;


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
  camera.position.y = 35;
  var x = 45 * Math.cos(radius + startAngle);
  var y = 45 * Math.sin(radius + startAngle);
  camera.position.x = x;
  camera.position.z = y;
  camera.zoom = 4;
  camera.updateProjectionMatrix();


  //////// GEOMETRY ///////////////////////
  var planeGeometry = new THREE.PlaneGeometry( 500, 500, 64 );
  planeGeometry.rotateX( - Math.PI / 2 );
  planeGeometry.rotateY( - Math.PI / 4 );
  var planeMaterial = new THREE.ShadowMaterial();
  planeMaterial.opacity = 0.2;
  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.opacity = 0.1;
  plane.position.y = -30.5;
  plane.receiveShadow = true;
  scene.add( plane );
  var gridHelper = new THREE.GridHelper(200, 10, 0xCBCBCB, 0xCBCBCB);
  gridHelper.position.y = -31;
  gridHelper.scale.z = 0.78;
  scene.add(gridHelper);


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
    // $("#loadingScreen").delay(2000).fadeOut(500);
    // $('#title').delay(3000).fadeIn(1500);
    animate(); 
  };
  function loadNextFile() {
  if (index > files.length - 1) return;
      jsonLoader.load(files[index], function ( object ) {
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh && index == files.length - 1) {
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
        object.position.y = -120;
        object.position.x = 8;
        object.scale.x = 2;
        object.scale.y = 2;
        object.scale.z = 2;
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
  directionalLight.position.z = -100;
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
  // setPixelRatio();
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
  renderer2.domElement.style.pointerEvents = "none";
  document.body.appendChild(renderer2.domElement);
  console.log(renderer2.getSize());


  //CONTROLS////////////////////////////////
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.target = camTarget;
  controls.update();


  ///////CSS GEOM////////////////////////////
  //NOTE CSS OBJECTS//
  divPositions = [new THREE.Vector3( -20, -20, 0 ), new THREE.Vector3( -20, 125, 0 ), new THREE.Vector3( 20, 205, 0 )]
  divText1 = ["Stair", "Nook", "Pod"];
  for (var i = 0; i < divText1.length; i++) {
    var parentDiv = document.createElement('div');
    parentDiv.className = "noteTag";
    parentDiv.style.opacity = 0;
    parentDiv.id = divText1[i];

    var childDiv = document.createElement('div');
    parentDiv.appendChild(childDiv);
    childDiv.className = "subText";
    childDiv.innerHTML = divText1[i];
    noteDivObjects.push(parentDiv);

    var css3DObject = new THREE.CSS3DObject(parentDiv);
    css3DObject.position.x = divPositions[i].x;
    css3DObject.position.y = divPositions[i].y;
    css3DObject.position.z = divPositions[i].z;
    css3DObject.rotation.x = -Math.PI / 2;
    css3DObject.rotation.z =  Math.PI;
    noteObjects.push(css3DObject);
    scene2.add(css3DObject);
  };
  //LEVEL CSS OBJECTS//
  var divText2 = ["Level 00", "Level 01", "Level 02", "Level 03"]
  for (var i = 0; i < divText2.length; i++) {
    var parentDiv = document.createElement('div');
    parentDiv.className = "levelTag";
    parentDiv.style.opacity = 0;

    var childDiv = document.createElement('div');
    parentDiv.appendChild(childDiv);
    childDiv.className = "subText";
    childDiv.innerHTML = divText2[i];
    childDiv.id = divText2[i];
    levelDivObjects.push(parentDiv);

    var css3DObject = new THREE.CSS3DObject(parentDiv);
    css3DObject.position.x = -70;
    css3DObject.position.y =  (i*8) - 30;
    css3DObject.position.z = -25;
    css3DObject.rotation.y = Math.PI;
    levelObjects.push(css3DObject);
    scene2.add(css3DObject);
  };
};



//////FUNCTIONS////////////////////////////

function animate(){
  window.requestAnimationFrame( animate );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  //NOTE DIV OBJECTS LOOK AT
  // for (var i = 0; i < noteObjects.length; i++) {
  //   noteObjects[i].lookAt( new THREE.Vector3( camera.position.x, noteObjects[i].position.y, camera.position.z) );
  // };

  var time = Date.now() * 0.0005;
  var time2 = Date.now() * 0.002;

  var explodeThreshold = 0.5;
  var noteThreshold = 0.9;
  var sliderMax = 100;
  var explodeTime = explodeThreshold*sliderMax;
  var noteTime = noteThreshold*sliderMax;


  if (isMobileDevice() == false){
    var rotation = (radius + startAngle + mouseX * 5) * Math.PI / 180;
    var newx = radius *  Math.cos(rotation);
    var newy = radius *  Math.sin(rotation);
    camera.position.x = newx;
    camera.position.z = newy;
    controls.enabled = true;
   
    document.body.onmousedown = function( event ){ 
      console.log("down");
      function onMouseMove(event) {
        sliderNum = map_range(event.pageY, 0, screenHeight, 100, 0);
        
        ////json object move//////
        for (var i = 3; i < (objectMove.length-1); i++) {
          if (sliderNum >= explodeTime){
            objectMove[i].position.y = (-120 + ((sliderNum - explodeTime) / 4) * Math.pow(i, 1.5));
          } else {
            objectMove[i].position.y = (-120 + (sliderNum / 4) * Math.pow(0, 1.5));
          };
        };

        // // ////Small Void//////
        // if (sliderNum >= explodeTime){
        //     objectMove[1].traverse( function ( object ) { object.visible = false; } );
        // } else {
        //     objectMove[1].traverse( function ( object ) { object.visible = true; } );
        // };

        ///// CAMERA OBJECTS ZOOM
        if (sliderNum >= explodeTime){
          camera.zoom = 4 - (sliderNum - explodeTime) / 150;
          camTarget = new THREE.Vector3(0, (sliderNum - explodeTime)*1, 0);
          camera.position.y = 35 + (sliderNum - explodeTime) * 1;
          controls.target = camTarget; 
        } else {
          camera.zoom = 4;
          camTarget = new THREE.Vector3(0, 0, 0);
          controls.target = camTarget;
        };

        controls.update();
        camera.updateProjectionMatrix();

        //JSON OBJECTS OPACITY    
        facadeObject = objectMove[objectMove.length-1];
        facadeObject.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.material.transparent = true;
            if (child.material.opacity <= 0){
              child.material.visible = false;
            } else {
              child.material.visible = true;
            };
            child.material.opacity = 1 - (sliderNum/30);
          };
        });

        //LEVEL DIV OBJECTS MOVE
        for (i = 0; i < levelObjects.length; i++){
          levelObjects[i].position.y = ((i*8) - 30) + objectMove[i+2].position.y + 120;
          levelObjects[0].position.y = -30;
        };

        //LEVEL DIV OBJECTS OPACITY
        for (i = 0; i < levelDivObjects.length; i++){
          levelDivObjects[i].style.opacity = (sliderNum / 30);  
        };

        //NOTE DIV OBJECTS OPACITY
        if (sliderNum >= noteTime){
          for (var i = 0; i < noteDivObjects.length; i++) {
            noteDivObjects[i].style.opacity = (sliderNum - noteTime) / 10;
          };
        } else {
          for (var i = 0; i < noteDivObjects.length; i++) {
            noteDivObjects[i].style.opacity = 0;
          };
        };
      };

      document.addEventListener('mousemove', onMouseMove);
      document.body.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        console.log("up");
      };
      document.body.onmouseleave = function() {
        document.removeEventListener('mousemove', onMouseMove);
        console.log("up");
      };
    };

  } else {
    camera.zoom = 3;
    controls.enableRotate = false;
    controls.enabled = false;

    document.body.addEventListener('touchstart', function(e){
      e.preventdefault;
    })

    document.body.addEventListener('touchmove', function(e){
      e.preventdefault;
      var touchobj = e.changedTouches[0]
      
      //CAMERA TOUCH LOCATION
      var rotation = (radius + startAngle + touchobj.clientX * 0.5) * Math.PI / 180;
      var newx = radius *  Math.cos(rotation);
      var newy = radius *  Math.sin(rotation);
      camera.position.x = newx;
      camera.position.z = newy;

      //SLIDER TOUCH LOCATION
      sliderNum = map_range(touchobj.clientY, 0, screenHeight, 100, 0);
      
      ////json object move//////
      for (var i = 3; i < (objectMove.length-1); i++) {
        if (sliderNum >= explodeTime){
          objectMove[i].position.y = (-120 + ((sliderNum - explodeTime) / 4) * Math.pow(i, 1.5));
        } else {
          objectMove[i].position.y = (-120 + (sliderNum / 4) * Math.pow(0, 1.5));
        };
      };

      ///// CAMERA OBJECTS ZOOM
      if (sliderNum >= explodeTime){
        camera.zoom = 4 - (sliderNum - explodeTime) / 150;
        camTarget = new THREE.Vector3(0, (sliderNum - explodeTime)*1, 0);
        camera.position.y = 35 + (sliderNum - explodeTime) * 1;
        controls.target = camTarget; 
      } else {
        camera.zoom = 4;
        camTarget = new THREE.Vector3(0, 0, 0);
        controls.target = camTarget;
      };

      controls.update();
      camera.updateProjectionMatrix();

      //JSON OBJECTS OPACITY    
      facadeObject = objectMove[objectMove.length-1];
      facadeObject.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.material.transparent = true;
          if (child.material.opacity <= 0){
            child.material.visible = false;
          } else {
            child.material.visible = true;
          };
          child.material.opacity = 1 - (sliderNum/30);
        };
      });

      //LEVEL DIV OBJECTS MOVE
      for (i = 0; i < levelObjects.length; i++){
        levelObjects[i].position.y = ((i*8) - 30) + objectMove[i+2].position.y + 120;
        levelObjects[0].position.y = -30;
      };

      //LEVEL DIV OBJECTS OPACITY
      for (i = 0; i < levelDivObjects.length; i++){
        levelDivObjects[i].style.opacity = (sliderNum / 30);  
      };

      //NOTE DIV OBJECTS OPACITY
      if (sliderNum >= noteTime){
        for (var i = 0; i < noteDivObjects.length; i++) {
          noteDivObjects[i].style.opacity = (sliderNum - noteTime) / 10;
        };
      } else {
        for (var i = 0; i < noteDivObjects.length; i++) {
          noteDivObjects[i].style.opacity = 0;
        };
      };
    }, false)
  };


  ///VOID FLASHER/////
  var voidObject = objectMove[1];
  voidObject.traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      child.material.opacity = Math.abs(Math.sin(time2))/3;
    };
  });

  // //DIV HOVER FUNCTION
  // var noteDivHover = [];

  // for (var i = 0; i < noteDivObjects.length; i++) {
  //   img = document.getElementById("howImg");
  //   typeTitle = document.getElementById("howTitle");
  //   paragraph = document.getElementById("howText");
    
  //   noteDivObjects[i].onclick = function(){


  //     if (this.id == "Stair"){
  //       img.src = "img/stair.png";
  //       paragraph.innerHTML = "Engaging school community spaces at the heart of the building. Technology enables setting with an emphasis on mobility.";


  //     } else if (this.id == "Nook"){
  //         img.src = "img/nook.png";
  //         paragraph.innerHTML = "Bump spaces maximise interaction and mentorship between staff and different year groups, offering a supportive student experience suited to a range of teaching styles.";


  //     } else if (this.id == "Pod"){
  //         img.src = "img/pod.png";
  //         paragraph.innerHTML = "Pods offer a variety of smaller teaching spaces that enable the learning to be visible to all and maximise engagement.";
  //     }
  //   }
  // };  
  

  camera.updateProjectionMatrix();
  controls.update();
  renderer2.render( scene2, camera);
  renderer.render( scene, camera);
}; 


// var threeScene = document.body;
// console.log(threeScene);

// threeScene.addEventListener('touchmove', function(event) {
//   console.log("fired");
//   var touch = event.targetTouches[0];
//   console.log(touch.pageX);
//   event.preventDefault();
// }, false);


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
    // document.getElementById("title").style.bottom = "20px";
    // document.getElementById("title").style.width = "82%";
    // document.getElementById("title").style.borderTop = "none";
  } else {
    // document.getElementById("title").style.top = "20px";
    // document.getElementById("title").style.width = "250px";
    // document.getElementById("title").style.borderTop = "2px solid lightGrey";
    // document.getElementById("title").style.borderBottom = "2px solid lightGrey";
  }
};
