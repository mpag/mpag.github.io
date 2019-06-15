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
  camera = new THREE.PerspectiveCamera( 14, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 250;
  camera.position.y = 250;
  camera.position.x = 250;
  // vector1 = new THREE.Vector3(23.7, 57.4, 16.4);
  // camera.lookAt(new THREE.Vector3(23.7, 57.4, 16.4));
  controls = new THREE.OrbitControls(camera, container);
  controls.enablePan = false;

  var path = 'texture/';
  var format = '.jpg';
  var envMap = new THREE.CubeTextureLoader().load( [
    path + 'posx' + format, path + 'negx' + format,
    path + 'posy' + format, path + 'negy' + format,
    path + 'posz' + format, path + 'negz' + format
  ] );
  
  //Primary Geometry
  htmlStateSelectors(); 
  boxAdder();
  // gltfImporter();


  manager = new THREE.LoadingManager();
  var loader = new THREE.GLTFLoader( manager );
  manager.onLoad = function ( ) {
    console.log("fired");
    // $(".loader").css('visibility', 'hidden');
    clips.forEach((clip) => {
      mixer.clipAction(clip).timeScale = 0;
    });
    mixerPlay();
    animate();
  };

  loader.load('models/OLA_Test1.glb',
    function ( gltf ) {
      model = gltf.scene;
      clips = gltf.animations;
      scene.add( model );
      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Scene
      gltf.asset; // Object

      gltf.scene.traverse(function(object) {
        if (object instanceof THREE.Mesh && object.name != 'Object_1'){
          object.castShadow = "true";
          object.receiveShadow = "true";
        };


        if (object instanceof THREE.Mesh && object.name == 'Object_1') {
          object.castShadow = "false";
          object.receiveShadow = "false";
        };

        if (object instanceof THREE.Mesh){
          object.material.envMap = envMap;
          object.material.envMapIntensity = 0.5;
        };

        if (object instanceof THREE.Mesh && object.material.name =='ELEVATION') {
          object.material.transparent = "true";
          object.material.opacity = 0.5;
          object.material.doubleSide = true;
        };
      });

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).setLoop( THREE.LoopPingPong );
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


  //Extra Geometry
  var geometryPlane = new THREE.PlaneGeometry(3000,3000);
  var groundMaterial = new THREE.ShadowMaterial();
  groundMaterial.opacity = 0.2;
  var groundMirror = new THREE.Mesh(geometryPlane, groundMaterial);
  groundMirror.rotateX( - Math.PI / 2 );
  groundMirror.position.y = -100;
  groundMirror.receiveShadow = true;
  // scene.add( groundMirror );
  var ambientlight = new THREE.AmbientLight( 0x080808, 5);  
  var spotlight = new THREE.SpotLight( 0xffffff );
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.y = 300;
  directionalLight.position.z = 200;
  directionalLight.castShadow = true;
  spotlight.position.y = 300;
  spotlight.position.z = 200;
  spotlight.castShadow = true;
  spotlight.shadow.mapSize.width = 1024;  // default
  spotlight.shadow.mapSize.height = 1024; // default
  
  // scene.add( spotlight );
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
  
 //css3d
	// scene2 = new THREE.Scene();
 //  element = document.createElement('div');
 //  element.className = "tag";
 //  elText = document.createElement('div');
 //  element.appendChild( elText );
 //  elText.className = "text";
 //  elText.innerHTML = 'Hi all!' + '<br>' + 'This is an example of how you can load JSON text into 3D css elements!';
 //  //css object
 //  div = new THREE.CSS3DObject(element);
 //  div.position.x = 40;
 //  div.position.y = 20;
 //  div.position.z = 0;
 //  scene2.add(div);
	// //css3d renderer
 //  renderer2 = new THREE.CSS3DRenderer();
 //  renderer2.setSize(window.innerWidth, window.innerHeight);
 //  renderer2.domElement.style.position = 'absolute';
 //  renderer2.domElement.style.top = 0;
 //  document.body.appendChild(renderer2.domElement);
};

//Animation Loop
function animate(){
  window.requestAnimationFrame( animate );
  // renderer2.render( scene2, camera );
    // controls.update();
  camera.lookAt(new THREE.Vector3(23.7, 57.4, 16.4));
  camera.updateProjectionMatrix();
  var delta = 0.65 * clock.getDelta();
  mixer.update(delta);
  renderer.render( scene, camera);
};

//creates a div for each possible state with event listener
function htmlStateSelectors(){
  for (i = 0; i < Object.keys(mats[0].matrixStates).length; i++) {
    var stateDiv = document.createElement("h2");
    stateDiv.name = "state"+(i);
    stateDiv.id = i;
    var stateDivText = document.createTextNode("Layout " + (i));
    stateDiv.appendChild(stateDivText);
    var element = document.getElementById("options");
    element.appendChild(stateDiv);
    $('#'+(i)).click( objectAnimator );    
  }
};

//Adds a box for each JSON object
function boxAdder(){
  for (var i = 0; i < mats.length; i++){
    var box = new THREE.BoxGeometry( 10,10,10 );
    var material =  new THREE.MeshPhongMaterial({color: "teal"});
    var cube = new THREE.Mesh(box, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.visible = false;
    cube.name = mats[i].name;
    cube.matrixAutoUpdate = false;
    var matArray = arrayToMatrix(mats[i].matrixStates.state0);
    var mat = translateRotateToMatrix(matArray);
    cube.matrix = mat;
    scene.add(cube);
  }
}

//Imports GLTF file
function gltfImporter(){
  manager = new THREE.LoadingManager();
  var loader = new THREE.GLTFLoader( manager );
  manager.onLoad = function ( ) {
    // $(".loader").css('visibility', 'hidden');
    loader.load('models/OLA_Test1.glb',
      function ( gltf ) {
        model = gltf.scene;
        clips = gltf.animations;
        scene.add( model );
        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Scene
        gltf.asset; // Object

        gltf.scene.traverse(function(object) {
          if (object instanceof THREE.Mesh && object.name == 'Object__1') {
            object.castShadow = "false";
            object.receiveShadow = "false";

            console.log('transparent fired');
            // object.material.clippingPlanes = [ globalPlane, globalPlane2, globalPlane3 ];
            // object.material.clipShadows = true; 
          };

        //   if (object instanceof THREE.Mesh && object.material.name =='Facade') {
        //     object.castShadow = "false";
        //     object.receiveShadow = "false"
        //     object.material.transparent = "true";
        //   };

          // if (object instanceof THREE.Mesh && object.material.name =='ELEVATION') {
          //   object.material.transparent = "true";
          //   object.material.opacity = 0.5;
          //   console.log('transparent fired');
          // };
        });

        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).setLoop( THREE.LoopOnce );
          mixer.clipAction(clip).play();
          clips.push(clip);
        });
      },
      function ( xhr ) {
        if ( xhr.lengthComputable ) {
          var percentComplete = xhr.loaded / xhr.total * 100;
          console.log( Math.round(percentComplete, 2) + '%' );
          var percentComplete = xhr.loaded / xhr.total * 100;  
          document.getElementById("percentComplete").innerHTML=(Math.ceil( percentComplete ) + "%" );
        };
      },
      function ( error ) {
        console.log( 'An error happened'+ error );
      }
    )
  }
};

//creates tween functions for each state, for each cube.
function objectAnimator(){
  var tweens = [];
  var self = this.id;
  
  for (var i = 0; i < mats.length; i++) {
    
    var priorMatrixState = [];
    
    scene.traverse( function(child) {
      
      if (child.name == mats[i].name){
        //Local variables for each JSON object variables
        var ax, bx, mat1, mat2;
        //Retrieves the select state matrix from the JSON.
        var matrixArrayKey = Object.keys(mats[i].matrixStates)[self];
        var matrixArray = mats[i].matrixStates[matrixArrayKey];
        bx = arrayToMatrix(matrixArray);
        //Sets the initial tween state to the first state in the JSON
        if (globalMatrixState.length == 0){
          ax = arrayToMatrix(mats[i].matrixStates.state0);  
        } else {
          ax = globalMatrixState[i];
        };        
        bx.onStart = function(){
          console.log("tweenStarted")
        };
        bx.onComplete = function(){
          priorMatrixState.push(arrayToMatrix(matrixArray));  
          globalMatrixState = priorMatrixState;
          console.log("tweenComplete");
        };
        bx.onUpdate = function() {
          mat1 = new THREE.Matrix4();
          mat2 = new THREE.Matrix4();
          mat1.makeTranslation(ax[0], ax[1], ax[2]);
          mat2.makeRotationY(ax[3]);
          mat1.multiply(mat2);
          child.matrix = mat1;
          child.matrixAutoUpdate = false;
        };
        bx.ease = Power3.easeInOut;
        bx.paused = "true";
        tweens.push(TweenMax.to(ax, 1, bx))
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
  
  return [pos.x, pos.z, pos.y, quaternion.x, quaternion.y, quaternion.z];
};

//Inverse of arrayToMatrix
function translateRotateToMatrix(array){
  mat1 = new THREE.Matrix4();
  mat2 = new THREE.Matrix4();
  mat1.makeTranslation(array[0], array[1], array[2]);
  // mat2.makeRotationY(array[4]);
  // mat1.multiply(mat2);
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