////////////////////////WOVEN THREE SCENE///////////////////////
//Standard Variables  
var camera, scene, renderer, controls, element, mixer, composer, manager, tween;
var scene3, renderer3;
var ambientlight, spotlight, directionallight;
var clock = new THREE.Clock();
var clips = [];
var callouts = [];
var calloutObj;

var container = document.getElementById( 'container' );

var camTarget = new THREE.Vector3(0, 300, 0);
var camPos = new THREE.Vector3(0, 500, 5000);
var globalMatrixState = [];
var globalFlowerState = [];
var animCounter = 0;
var sceneShift = 1.3;


//Event Listeners
window.addEventListener( 'resize', onWindowResize, false );
mobileUI();

init();

//THREE JS initiation function
function init(){
  
  ///_____Scene
  scene = new THREE.Scene();
  scene.name = "scene1";
  scene.fog = new THREE.Fog(0xE8EBED, 5000, 10000);

  scene3 = new THREE.Scene();
  scene3.name = "scene3";


  ///_____Camera
  camera = new THREE.PerspectiveCamera( 12, window.innerWidth*sceneShift / window.innerHeight, 1, 10000 );
  camera.position.x = camPos.x;
  camera.position.y = camPos.y;
  camera.position.z = camPos.z;

  camera.zoom = 0.7;
  camera.rotation.order = 'YXZ';

  controls = new THREE.OrbitControls(camera, container);
  controls.enableDamping = true;
  controls.dampingFactor = 0.5;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.7;
  controls.rotateSpeed = 0.5;
  controls.enablePan = false;
  controls.maxZoom = 20;
  controls.minZoom = 1;
  controls.enableRotate = true;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI/2; 
  controls.target = new THREE.Vector3(0, camTarget.y, 0);
  controls.update();


  
  ///_____Primary Geometry
  manager = new THREE.LoadingManager();
  var loader = new THREE.GLTFLoader( manager );
  
  manager.onLoad = function ( ) {
    clips.forEach((clip) => {
      mixer.clipAction(clip).timeScale = 0;
    });
    animate();
    mixerPlay();
    globalMatrixSet();
    $( '#logo' ).delay( 1000 ).fadeIn(1000).delay(1000).fadeOut( 1000 );
    $( '#loadingPage' ).delay( 4500 ).fadeOut( 2000 );
    htmlStateSelectors();
  };


  ///// Vase Pieces /////////
  loader.load('models/wovenPeicesTest.glb',
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
          if (castShadowToggle % 2 == 0){
            object.castShadow = true;
          };
          object.receiveShadow = false;
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
      gltf.scene.translateY(100);
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

  ///_____Geometry
  var geometryPlane = new THREE.PlaneGeometry(5000,5000);
  var groundMaterial = new THREE.ShadowMaterial();
  groundMaterial.opacity = 0.5;
  var ground = new THREE.Mesh(geometryPlane, groundMaterial);
  ground.rotateX( - Math.PI / 2 );
  ground.receiveShadow = true;
  // scene.add( ground );
  var cylGeom = new THREE.CylinderBufferGeometry( 12, 12, 1, 32 );
  var cylMat = new THREE.MeshBasicMaterial( {color: 0x000000} );
  var cylinder = new THREE.Mesh( cylGeom, cylMat );
  scene.add( cylinder );
  
  //____Lights
  ambientlight = new THREE.AmbientLight( 0xFFFFFF, 0.8);
  scene.add( ambientlight);
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  const d = 5000;
  directionalLight.position.y = 500;
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = - d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.bottom = - d;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.bias = 0.0001;
  scene.add( directionalLight );
  
  ///_____Renderer
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xffffffF0EFE9, 0);
  renderer.gammaFactor = 2.2;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth*sceneShift, window.innerHeight);
  renderer.domElement.style.zIndex = -10;
  container.appendChild( renderer.domElement );

  //_____CSS3D Renderers //
  //callouts
  for (i = 0; i < calloutText.length; i++){
    element = document.createElement('div');
    element.className = "calloutTag";
    element.id = calloutText[i].state;
    if (i == 1){
      element.style.opacity = 1;  
    } else {
      element.style.opacity = 0;
    };
    elText = document.createElement('h5');
    element.appendChild( elText );
    elText.className = "elText";
    elText.innerHTML = calloutText[i].textContent;
    elImg = document.createElement('IMG');
    elImg.id = "clickHelper";
    elImg.src = "img/click.gif";
    element.appendChild( elImg );
    calloutObj = new THREE.CSS2DObject(element);
    calloutObj.rotation.x = -Math.PI;
    calloutObj.rotation.z = Math.PI;
    calloutObj.position.x = calloutText[i].pos[0];
    calloutObj.position.y = calloutText[i].pos[1];
    calloutObj.position.z = calloutText[i].pos[2];
    var calloutOrient = new THREE.Vector3(camPos.x*10000, calloutObj.position.y, camPos.z*10000);
    calloutObj.lookAt(calloutOrient);
    callouts.push(calloutObj);
    scene3.add(calloutObj);
  };
  renderer3 = new THREE.CSS2DRenderer();
  containerCSS2 = document.getElementById('containerCSS2');
  renderer3.setSize($(containerCSS2).width(), $(containerCSS2).height());
  // renderer3.domElement.style.pointerEvents= 'none';
  containerCSS2.appendChild(renderer3.domElement);

};

//Animation Loop
function animate(){
  camera.lookAt(camTarget);
  camera.updateProjectionMatrix();
  controls.update();
  TWEEN.update();
  var delta = 0.65 * clock.getDelta();
  mixer.update(delta);
  
  for (i = 0; i < callouts.length; i++){
    var calloutOrient = new THREE.Vector3(camera.position.x*1000, camera.position.y*1000, camera.position.z*1000);
    callouts[i].lookAt(calloutOrient);
  };

  renderer.render( scene, camera);
  renderer3.render( scene3, camera);
  window.requestAnimationFrame( animate );
};

// creates a div for each possible state with event listener
function htmlStateSelectors(){
  for (i = 0; i < Object.keys(pieces[0].matrixStates).length; i++) {
    // console.log(i);
    // var stateDiv = document.createElement("h2");
    // stateDiv.name = "state"+(i);
    // stateDiv.innerHTML = "State " + i;
    // var element = document.getElementById("stateModule");
    // element.appendChild(stateDiv);
    $('#'+(i)).click( objectAnimator );
    $('#'+(i)).click( buttonDisplayer );
    $('#'+(i)).click( cameraChanger );
    $('#'+(i)).click( copyChanger );
    if (i == 4){
      $('#'+(i)).click( flowerAnimate );
    }   
  }
};


function globalMatrixSet(){
  var ax, mat1, mat2;
  for (var i = 0; i < pieces.length; i++) {
    scene.traverse( function(child) {
      if (child.name == pieces[i].name){
        var matrixArrayKey = Object.keys(pieces[i].matrixStates)[0];
        var matrixArray = pieces[i].matrixStates[matrixArrayKey];

        mat1 = new THREE.Matrix4();
        mat2 = new THREE.Matrix4();
        quat = new THREE.Quaternion();

        //SETS INITIAL STATE
        ax = arrayToMatrix(matrixArray);

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
          ax = arrayToMatrix(pieces[i].matrixStates.state0);  
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
  bxFlwr = [ 1.5, Math.PI*5 ];
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
  camera.aspect = window.innerWidth*sceneShift / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth*sceneShift, window.innerHeight );
  mobileUI();
  renderer3.setSize(window.innerWidth, window.innerHeight);
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
    sceneShift = 1;
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

$(document).ready(function() {
    $(window).scroll( function(){
        $('.infoPanel').each( function(i){
            console.log($(window).scrollTop());
            var bottom_of_object = $(this).position().top + $(this).outerHeight() - 200;
            var bottom_of_window = $(window).scrollTop() + $(window).height();
            if( bottom_of_window > bottom_of_object ){
                $(this).animate({'opacity':'1'},400);
            }
            if ( $(window).scrollTop() >= 500) {
              $('#stateModule').animate({'opacity':'1'},1000);
            }
        }); 
    }); 
});

function toggleFullScreen() {
  if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen(); 
    }
  }
};



// 05____Position Selector //

var scenePos = [];
var scenePosNames = [];
var scenePosText = [];
var scenePosZoom = [];
var scenePosCol = [];
var count = 0;

// console.log(els);

for (i = 0; i < camControls.length; i++){
  scenePos.push(new THREE.Vector3(camControls[i].pos[0],camControls[i].pos[1],camControls[i].pos[2]))
  scenePosNames.push(camControls[i].name);
  scenePosText.push(camControls[i].text);
  scenePosZoom.push(camControls[i].zoom);
  scenePosCol.push(camControls[i].col);
};


function cameraChanger(){
  var self = parseFloat(this.id);

  // var vals = { y: scenePos[this.id].z, x: scenePos[this.id].x, z: camera.zoom }; // Start at (0, 0)
  var vals = { y: camera.position.z, x: camera.position.x, z: camera.zoom }; // Start at (0, 0)
  
  var tweenMoveScene = new TWEEN.Tween(vals) // Create a new tween that modifies 'vals'.
  tweenMoveScene.to({ y: scenePos[this.id].z, x: scenePos[this.id].x, z: scenePosZoom[this.id] }, 1000) // Move to (300, 200) in 1 second.
  tweenMoveScene.easing(TWEEN.Easing.Quadratic.InOut);
  tweenMoveScene.delay(0);
  tweenMoveScene.start(); // Start the tween immediately.
  tweenMoveScene.onUpdate(function(object) {   
  camera.zoom = vals.z;
  });

  controls.update();
};


function buttonDisplayer(){
  var self = parseFloat(this.id);
  // animCounter += 1;
  if (this.className == "calloutTag"){
    $('#'+ self).css({"text-decoration": "underline"});
    $('#'+ self).css({"display": "auto"});
    $('#'+ self).fadeTo( "slow" , 1);
    $('#'+ (self + 1)).fadeTo( "slow" , 1);
    $('#'+ (self - 1)).fadeTo( "slow" , 0.35);
    $('#'+ (self)).css({"text-decoration": "none"});
    $('#'+ self).children("img").css({"display": "none"});
  }
};


function copyChanger(){
  if (this.className == "calloutTag"){
    $('#'+ "infoTitle").html(calloutText[this.id].textContent);
    $('#'+ "bodyText").html(calloutText[this.id].bodyContent);
  };

  console.log(calloutText[this.id].state);
  console.log(calloutText[this.id].textContent);
  console.log(calloutText[this.id].bodyContent);
};