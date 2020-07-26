////////////////////////WOVEN THREE SCENE///////////////////////
//Standard Variables  
var camera, scene, renderer, controls, element, mixer, composer, manager;
var ambientlight, spotlight, directionallight;
var scene2, renderer2;
var mixer2;
var clock = new THREE.Clock();
var clips = [];
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var globalMatrixState = [];
var globalFlowerState = [];
var container = document.getElementById( 'woven' );

//Event Listeners
window.addEventListener( 'resize', onWindowResize, false );
// Hammer(document.getElementById('woven')).on("doubletap", mixerPlay); 

init();

//THREE JS initiation function
function init(){
  //camera
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xE8EBED, 1000, 10000);
  camera = new THREE.PerspectiveCamera( 6, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 0, 500, 3000 );
  camera.zoom = 0.4;
  camera.rotation.order = 'YXZ';
  var vector1 = new THREE.Vector3(0, 90, 0);
  camera.lookAt(new THREE.Vector3(0, 600, 0));
  controls = new THREE.OrbitControls(camera, container);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.2;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  var groundMaterial = new THREE.ShadowMaterial();
  groundMaterial.opacity = 0.5;
  
  //Primary Geometry
  htmlStateSelectors();

  manager = new THREE.LoadingManager();
  var loader = new THREE.GLTFLoader( manager );
  
  manager.onLoad = function ( ) {
    clips.forEach((clip) => {
      mixer.clipAction(clip).timeScale = 0;
    });
    animate();
    mixerPlay();
    globalMatrixSet();
    // $( '#logo' ).delay( 2000 ).fadeOut( 1000 );
    // $( '#loadingPage' ).delay( 3000 ).fadeOut( 2000 );
  };


  ///// Vase Pieces /////////
  loader.load('models/wovenPeices.glb',
    function ( gltf ) {
      model = gltf.scene;
      scene.add( model );
      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Scene
      gltf.scene.name = "vase";
      console.log(gltf.asset); // Object
      var castShadowToggle = 0;

      gltf.scene.traverse(function(object) {
        if (object instanceof THREE.Mesh){
          castShadowToggle += 1;
          if (castShadowToggle % 5 == 0){
            object.castShadow = true;
          };
          object.receiveShadow = false;
          var aoObj = object.geometry;
          aoObj.setAttribute( 'uv2', new THREE.BufferAttribute( aoObj.attributes.uv.array, 2 ) );
          // console.log(object.material.aoMap);
          // object.material = new THREE.MeshBasicMaterial({color: 0xE95FD1});
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

  ///// Flower Model /////////
  loader.load('models/babysBreath2.glb',
    function ( gltf ) {
      model = gltf.scene;
      scene.add( model );
      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Scene
      gltf.scene.name = "flower";
      gltf.scene.scale.set( 0.01, 0.01, 0.01 );
      gltf.scene.translateY(20);
      gltf.asset; // Object
      // console.log(gltf.animations);

      gltf.scene.traverse(function(object) {
        if (object instanceof THREE.Mesh){
          object.castShadow = false;
          object.receiveShadow = false;
          // object.material.transparent = true;
          // object.material.opacity = 0.7;
        };

        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
          clips.push(clip);
        });
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

  //geometry
  var geometryPlane = new THREE.PlaneGeometry(1000,1000);
  var groundMaterial = new THREE.ShadowMaterial();
  groundMaterial.opacity = 0.5;
  var ground = new THREE.Mesh(geometryPlane, groundMaterial);
  ground.rotateX( - Math.PI / 2 );
  ground.receiveShadow = true;
  scene.add( ground );

  var cylGeom = new THREE.CylinderBufferGeometry( 7, 7, 0.5, 32 );
  var cylMat = new THREE.MeshBasicMaterial( {color: 0x000000} );
  var cylinder = new THREE.Mesh( cylGeom, cylMat );
  scene.add( cylinder );
  
  //lights
  ambientlight = new THREE.AmbientLight( 0xFFFFFF, 1.2);
  scene.add( ambientlight);

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  const d = 500;
  directionalLight.position.y = 300;
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = - d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.bottom = - d;
  scene.add( directionalLight );
  
  //renderer
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
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
  mixer.update(delta);
  renderer.render( scene, camera);
};

// creates a div for each possible state with event listener
function htmlStateSelectors(){
  for (i = 0; i < Object.keys(pieces[0].matrixStates).length; i++) {
    var stateDiv = document.createElement("SPAN");
    stateDiv.name = "state"+(i);
    stateDiv.id = i;
    stateDiv.className = "dot";
    var element = document.getElementById("footer");
    element.appendChild(stateDiv);
    $('#'+(i)).click( objectAnimator );
    if (i == 0){
      $('#'+(i)).click( flowerAnimate );
    }   
  }
};


function globalMatrixSet(){
  var ax, mat1, mat2;
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
        tweens.push(TweenMax.to(ax, 8, bx))
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

function flowerAnimate(object){

  var flwrScene = scene.getObjectByName( "flower" );
  // console.log("fired");

  var axFlwr, bxFlwr;
  axFlwr = [ 0.01, 0 ];
  bxFlwr = [ 1.0, Math.PI*5 ];
  bxFlwr.paused = "true"; 
  bxFlwr.ease = Power3.easeInOut;
  bxFlwr.onUpdate = function(){
    flwrScene.scale.set( axFlwr[0], axFlwr[0], axFlwr[0]);
    flwrScene.rotation.y = axFlwr[1];
  };
  if (globalFlowerState % 1 == 0){
    TweenMax.to(axFlwr, 8, bxFlwr).play();
  } else {
    TweenMax.to(axFlwr, 8, bxFlwr).reverse(0);
  };
  globalFlowerState++;
  document.documentElement.style.animationPlayState = "running";
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
    mixer.clipAction(clip).play();
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
};