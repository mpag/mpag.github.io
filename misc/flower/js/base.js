/////////Global Variables///////////
var camera, scene, renderer, rectangle, div, controls, sliderNum;
var scene2, renderer2, manager;

window.addEventListener( 'resize', onWindowResize, false );
// Hammer(document.getElementById('container')).on("doubletap", mixerPlay);

var clock = new THREE.Clock();
var mixer;
var clips;
var composer;

/////////INIT VAIRABLES////////
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

////CAMERA////////////
var frustumSize = 1000;
var radius = 90;
var startAngle = 220;
var dirLight, helper;

////////////////////////////////////////////////////////////////////////////

// Configure and create Draco decoder.
THREE.DRACOLoader.setDecoderPath( 'js/' );
THREE.DRACOLoader.setDecoderConfig( { type: 'js' } );
var dracoLoader = new THREE.DRACOLoader();

init();
animate();

function init(){
  //Scenes//////////////////////////////
  scene = new THREE.Scene();
  scene2 = new THREE.Scene();
  
  //CAMERA///////////////////////////////
  near = -100; 
  far = 10000;
  camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 20 );
  camera.position.set( 0, 0, -5 );

  var path = 'texture/';
  var format = '.jpg';
  var envMap = new THREE.CubeTextureLoader().load( [
    path + 'posx' + format, path + 'negx' + format,
    path + 'posy' + format, path + 'negy' + format,
    path + 'posz' + format, path + 'negz' + format
  ] );

  // scene.background = envMap;

  //clippingPlane
  // var globalPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 100);
  // var globalPlane2 = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), -8.5);

  //////////LOADER////////////////////////

  manager = new THREE.LoadingManager();
  var loader = new THREE.DRACOLoader( manager );
  
  // var onProgress = function ( xhr ) {
  //   if ( xhr.lengthComputable ) {
  //     var percentComplete = xhr.loaded / xhr.total * 100;
  //     console.log( Math.round(percentComplete, 2) + '%' );
  //     var percentComplete = xhr.loaded / xhr.total * 100;  
  //     document.getElementById("percentComplete").innerHTML=(Math.ceil( percentComplete ) + "%" );
  //   } else {
  //     document.getElementById("percentComplete").innerHTML="Loading";
  //   };
  // };
  var onError = function ( xhr ) {
  };
  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    // console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
  };
  manager.onProgress = function ( item, loaded, total ) {
  };
  manager.onLoad = function ( ) {
    // $(".bg-modal").css("display", "none");
    // animate();
    // clips.forEach((clip) => {
    //   mixer.clipAction(clip).timeScale = 0;
    // });
  };

  loader.load( 'model/out.drc', function ( geometry ) {

    geometry.computeVertexNormals();

    var material = new THREE.MeshPhongMaterial({color: 0x000000, envMap: envMap, reflectivity: 1});
    var mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.x = -Math.PI/2;

    scene.add( mesh );

    // Release decoder resources.
    THREE.DRACOLoader.releaseDecoderModule();

  } );

  // Load a glTF resource
  // loader.load(
  //   'model/OLA_Plans.drc',
  //   function ( gltf ) {
  //     model = gltf.scene;
  //     clips = gltf.animations;
  //     scene.add( model );
  //     gltf.animations; // Array<THREE.AnimationClip>
  //     gltf.scene; // THREE.Scene
  //     gltf.asset; // Object

  //     gltf.scene.traverse(function(object) {

  //       if (object instanceof THREE.Mesh){
  //         object.material.envMap = envMap;
  //         object.material.envMapIntensity = 0.3;
  //         object.material.clippingPlanes = [ globalPlane, globalPlane2 ];
  //       };

  //     mixer = new THREE.AnimationMixer(model);
  //     gltf.animations.forEach((clip) => {
  //       mixer.clipAction(clip).setLoop( THREE.LoopPingPong)
  //       mixer.clipAction(clip).play();
  //       clips.push(clip);
  //     }
  //     )},

  //   function ( xhr ) {
  //     if ( xhr.lengthComputable ) {
  //       var percentComplete = xhr.loaded / xhr.total * 100;
  //       console.log( Math.round(percentComplete, 2) + '%' );
  //       var percentComplete = xhr.loaded / xhr.total * 100;  
  //       document.getElementById("percentComplete").innerHTML=(Math.ceil( percentComplete ) + "%" );
  //     };
  //   },
  //   function ( error ) {
  //     console.log( 'An error happened' );
  //   }
  // );

  //LIGHT//////////////////////////////////
  var light = new THREE.HemisphereLight( 0xD3CC7B, 0x000000, 1 );
  scene.add( light );

  var light = new THREE.SpotLight();
  light.angle = Math.PI / 8;
  light.power = 100;
  light.penumbra = 0.8;
  light.castShadow = true;
  light.position.set( 5, 5, 5 );
  scene.add( light );

  var light = new THREE.SpotLight();
  light.angle = Math.PI / 8;
  light.power = 10;
  light.penumbra = 0.8;
  light.castShadow = true;
  light.position.set( -5, 0, -5 );
  scene.add( light );


  
  //RENDERERS////////////////////////////////
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.shadowMap.enabled = true;
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
  // renderer.localClippingEnabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize( screenWidth, screenHeight);
  renderer.autoClear = false;
  renderer.setClearColor( 0xffffff, 0);
  renderer.domElement.style.zIndex = 10;
  setPixelRatio();
  document.getElementById('container').appendChild( renderer.domElement );


  //CONTROLS////////////////////////////////
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.update();

  //COMPOSER///////////////////////////////
  composer = new THREE.EffectComposer(renderer);
  var renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
  renderPass.renderToScreen = true;

};


//////FUNCTIONS////////////////////////////

function animate(){

  camera.updateProjectionMatrix();
  controls.update();
  window.requestAnimationFrame( animate );
  renderer.render(scene, camera);
}; 


// function mixerPlay(event){
//   clips.forEach((clip) => {
//     mixer.clipAction(clip).timeScale = 1;
//   });
// };


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
  // renderer2.setSize( window.innerWidth, window.innerHeight );
};

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};