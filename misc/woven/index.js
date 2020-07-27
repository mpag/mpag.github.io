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
mobileUI();

init();

//THREE JS initiation function
function init(){
  //camera
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xE8EBED, 1000, 10000);
  camera = new THREE.PerspectiveCamera( 6, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 0, 2500, 3000 );
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
  mobileUI();
  // renderer2.setSize(window.innerWidth, window.innerHeight);
};

function mixerPlay(event){  
  clips.forEach((clip) => {
    mixer.clipAction(clip).timeScale = 1;
    mixer.clipAction(clip).play();
  });
};



// UI Functions

function gridMobile() {
  var infoPanel = document.getElementsByClassName('infoPanel');
  var gridContainerA = document.getElementsByClassName('gridContainerA');
  var gridRightA = document.getElementsByClassName('gridRightA');

  for(i = 0; i < gridContainerA.length; i++) {
    gridContainerA[i].classList.add('gridContainerAMobile');
  };
  for(i = 0; i < gridRightA.length; i++) {
    // gridRightA[i].style.height = '400px';
  };
  for(i = 0; i < infoPanel.length; i++) {
    infoPanel[i].style.width = '100%';
    infoPanel[i].style.transform = 'translateX(0px)';
  };
};

function isMobileDevice() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function isSmallWindow() {
  let check = false;
  if (document.body.clientWidth < 1000) {
    check=true;
  };
  return check;
};

function mobileUI(){
  if (isMobileDevice() == true || isSmallWindow() == true ){
    console.log('mobile/small client');
    gridMobile();
  } else {
    // document.getElementById('right-half').style.display = 'flex';
    // document.getElementById('footer').style.display = 'none';
    console.log('desktop client');
  }
};

function scrollEvent(){
  if (window.pageYOffset >= 1000 ){
    console.log("fired");
  }
};


// Miscellaneous Functions

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