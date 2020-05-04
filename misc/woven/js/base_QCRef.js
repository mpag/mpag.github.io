//Standard Variables  
var camera, scene, renderer, controls, element, mixer, composer, manager;
var scene2, renderer2;
var clock = new THREE.Clock();
var clips = [];
var meshKnot, div, line;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var globalMatrixState = [];
var container = document.getElementById( 'ThreeJS' );

//Event Listeners
window.addEventListener( 'resize', onWindowResize, false );

init();

//THREE JS initiation function
function init(){
  //camera
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x9BABB3, 1000, 5000);
  camera = new THREE.PerspectiveCamera( 6, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 0, 500, 3000 );
  camera.rotation.order = 'YXZ';
  var vector1 = new THREE.Vector3(0, 90, 0);
  camera.lookAt(new THREE.Vector3(0, 90, 0));
  controls = new THREE.OrbitControls(camera, container);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  

  var pieceMaterial =  new THREE.MeshPhongMaterial({color: "silver", opacity: 1});
  var groundMaterial = new THREE.ShadowMaterial();
  groundMaterial.opacity = 0.2;
  
  //Primary Geometry
  htmlStateSelectors();

  manager = new THREE.LoadingManager();
  var loader = new THREE.GLTFLoader( manager );
  
  manager.onLoad = function ( ) {
    clips.forEach((clip) => {
      mixer.clipAction(clip).timeScale = 0;
    });
    mixerPlay();
    animate();
    globalMatrixSet();
  };


  // //load Fitout model.
  loader.load('models/vasePieces_Compressed.glb',
    function ( gltf ) {
      model = gltf.scene;
      // console.log(model);
      scene.add( model );
      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Scene
      gltf.asset; // Object

      gltf.scene.traverse(function(object) {
        if (object instanceof THREE.Mesh){
          object.castShadow = "true";
          object.receiveShadow = "true";
          object.material = pieceMaterial;
        };
    },
    function ( xhr ) {
      if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round(percentComplete, 2) + '%' );
        var percentComplete = xhr.loaded / xhr.total * 100;  
        // document.getElementById("percentComplete").innerHTML=(Math.ceil( percentComplete ) + "%" );
      };
    },
    function ( error ) {
      console.log( 'An error happened'+ error );
    }
    );
  });


  //Extra Geometry
  var geometryPlane = new THREE.PlaneGeometry(10000,10000);
  var groundMaterial = new THREE.ShadowMaterial();
  groundMaterial.opacity = 0.5;
  var groundMirror = new THREE.Mesh(geometryPlane, groundMaterial);
  groundMirror.rotateX( - Math.PI / 2 );
  groundMirror.receiveShadow = true;
  scene.add( groundMirror );
  var ambientlight = new THREE.AmbientLight( 0x080808, 10);  
  var spotlight = new THREE.SpotLight( 0xffffff );
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.z = 200;
  directionalLight.position.y = 200;
  spotlight.position.y = 400;
  spotlight.position.x = 100;
  spotlight.castShadow = true;
  spotlight.shadow.mapSize.width = 1024;  // default
  spotlight.shadow.mapSize.height = 1024; // default
  
  scene.add( spotlight );
  scene.add( directionalLight );
  scene.add( ambientlight );
  
  //renderer
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  // renderer.setPixelRatio( window.devicePixelRatio );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xffffff, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.zIndex = 5;
  container.appendChild( renderer.domElement );

};

//Animation Loop
function animate(){
  window.requestAnimationFrame( animate );
  // renderer2.render( scene2, camera );
  controls.update();
  camera.lookAt(new THREE.Vector3(0,90,0));
  camera.updateProjectionMatrix();

  var delta = 0.65 * clock.getDelta();
  // mixer.update(delta);
  renderer.render( scene, camera);
};

// creates a div for each possible state with event listener
function htmlStateSelectors(){
  for (i = 0; i < Object.keys(pieces[0].matrixStates).length; i++) {
    var stateDiv = document.createElement("h1");
    stateDiv.name = "state"+(i);
    stateDiv.id = i;
    var stateDivText = document.createTextNode("STATE " + (i));
    stateDiv.appendChild(stateDivText);
    var element = document.getElementById("title");
    element.appendChild(stateDiv);
    $('#'+(i)).click( objectAnimator );    
  }
};


function globalMatrixSet(){
  var self = this.id;
  var ax, bx, mat1, mat2;
  for (var i = 0; i < pieces.length; i++) {
    scene.traverse( function(child) {
      if (child.name == pieces[i].name){
        var matrixArrayKey = Object.keys(pieces[i].matrixStates)[1];
        var matrixArray = pieces[i].matrixStates[matrixArrayKey];
        
        mat1 = new THREE.Matrix4();
        mat2 = new THREE.Matrix4();
        quat = new THREE.Quaternion();

        ax = arrayToMatrix(pieces[i].matrixStates.state1);

        quat.set(ax[3], ax[5], ax[4], ax[6]);
        mat2.makeRotationFromQuaternion(quat);
        mat1.makeTranslation(ax[0], ax[1], ax[2]);          
        mat1.multiply(mat2);
        child.matrix = mat1;
        child.matrixAutoUpdate = false;
      }});
}};

//creates tween functions for each state, for each cube.
function objectAnimator(){
  var tweens = [];
  var self = this.id;
  
  for (var i = 0; i < pieces.length; i++) {
    
    var priorMatrixState = [];
    
    scene.traverse( function(child) {
      
      if (child.name == pieces[i].name){
        //Local variables for each JSON object variables
        var ax, bx, mat1, mat2;
        //Retrieves the select state matrix from the JSON.
        var matrixArrayKey = Object.keys(pieces[i].matrixStates)[self];
        var matrixArray = pieces[i].matrixStates[matrixArrayKey];
        
        bx = arrayToMatrix(matrixArray);
        //Sets the initial tween state to the first state in the JSON
        if (globalMatrixState.length == 0){
          ax = arrayToMatrix(pieces[i].matrixStates.state1);  
        } else {
          ax = globalMatrixState[i];
        };        
        bx.onStart = function(){
          // console.log("tweenStarted")
        };
        bx.onComplete = function(){
          priorMatrixState.push(arrayToMatrix(matrixArray));  
          globalMatrixState = priorMatrixState;
          // console.log("tweenComplete");
        };
        bx.onUpdate = function() {
          mat1 = new THREE.Matrix4();
          mat2 = new THREE.Matrix4();
          quat = new THREE.Quaternion();

          quat.set(ax[3], ax[5], ax[4], ax[6]);
          mat2.makeRotationFromQuaternion(quat);
          mat1.makeTranslation(ax[0], ax[1], ax[2]);          
          mat1.multiply(mat2);
          child.matrix = mat1;
          child.matrixAutoUpdate = false;
        };
        bx.ease = Power3.easeInOut;
        bx.paused = "true";
        tweens.push(TweenMax.to(ax, 4, bx))
      }
    })
  };
  for (var i = 0; i < tweens.length; i++){
    tweens[i].play();
  };
};

//takes a THREE.matrix4 and turn's it into a translation x,y,z and a z angle 
function arrayToMatrix(array){
  //empty variables to populate
  pos = new THREE.Vector3(0,0,0);
  quaternion = new THREE.Quaternion();
  scale = new THREE.Vector3(0,0,0);
  
  //empty matrix
  emptyMatrix = new THREE.Matrix4();
  emptyMatrix.set(array[0], array[1], array[2], array[3], array[4], array[5], array[6], array[7], array[8], array[9], array[10], array[11], array[12], array[13], array[14], array[15]);
  emptyMatrix.decompose(pos, quaternion, scale);

  var quaternionArray = quaternion.toArray();
  // console.log(quaternionArray);
  
  return [pos.x, pos.z, -pos.y, quaternionArray[0], quaternionArray[1], quaternionArray[2], quaternionArray[3]];
};

//Inverse of arrayToMatrix
function translateRotateToMatrix(array){
  mat1 = new THREE.Matrix4();
  mat2 = new THREE.Matrix4();
  mat1.makeTranslation(array[0], array[1], array[2]);
  mat2.makeRotationY(array[4]);
  mat1.multiply(mat2);
  return (mat1);
};

// on resizing of the window, resizes the scene/renderer
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  // renderer2.setSize(window.innerWidth, window.innerHeight);
};

function mixerPlay(event){  
  clips.forEach((clip) => {
    mixer.clipAction(clip).timeScale = 1;
  });
};

document.addEventListener("keypress", function(e) {
  if (e.keyCode === 13) {
    toggleFullScreen();
    console.log("triggered");
  }
}, false);

function toggleFullScreen() {
  if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen(); 
    }
  }
}