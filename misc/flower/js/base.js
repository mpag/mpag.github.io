/////////Global Variables///////////
var camera, scene, renderer, rectangle, div, controls, sliderNum;
var scene2, renderer2, manager;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

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

function init(){
  //Scenes//////////////////////////////
  scene = new THREE.Scene();
  scene2 = new THREE.Scene();
  
  //CAMERA///////////////////////////////
  near = -100; 
  far = 10000;
  camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 0.1, 20 );
  camera.position.set( 0, 0, -2.5 );

  var path = 'texture/';
  var format = '.jpg';
  var envMap = new THREE.CubeTextureLoader().load( [
    path + 'posx' + format, path + 'negx' + format,
    path + 'posy' + format, path + 'negy' + format,
    path + 'posz' + format, path + 'negz' + format
  ] );

  // var normalMap = new THREE.TextureLoader().load( "img/boneNormal.jpg" );

  // scene.background = envMap;

  //clippingPlane
  // var globalPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 100);
  // var globalPlane2 = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), -8.5);

  //////////LOADER////////////////////////

  manager = new THREE.LoadingManager();
  var loader = new THREE.DRACOLoader( manager );
  
  var onProgress = function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  };

  var onError = function ( xhr ) {
  };

  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
  };

  manager.onProgress = function ( xhr ) {
    // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  };

  manager.onLoad = function ( ) {
    // $(".bg-modal").css("display", "none");
    // console.log("loaded!");
    animate();
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    // clips.forEach((clip) => {
    //   mixer.clipAction(clip).timeScale = 0;
    // });
  };

  loader.load( 'model/out.drc', function ( geometry ) {

    geometry.computeVertexNormals();

    var material = new THREE.MeshPhongMaterial({
      color: 0x000000, 
      envMap: envMap, reflectivity: 0.97,
      // normalMap: normalMap
    });

    var mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.normalsNeedUpdate = true;
    mesh.name = "skull";
    scene.add( mesh );

    // Release decoder resources.
    THREE.DRACOLoader.releaseDecoderModule();

  } );

  //LIGHT//////////////////////////////////
  var light = new THREE.HemisphereLight( 0xD3CC7B, 0x000000, 100 );
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
  controls.enableDamping = "true";
  controls.update();

  //COMPOSER///////////////////////////////
  composer = new THREE.EffectComposer(renderer);
  var renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
  var glitchPass = new THREE.GlitchPass();
  composer.addPass(glitchPass);
  var sepiaPass = new THREE.ShaderPass(THREE.SepiaShader);
  composer.addPass(sepiaPass);

  glitchPass.renderToScreen = true;

};


//////FUNCTIONS////////////////////////////

function animate(){
  var time2 = Date.now() * 0.002;
  try {
    scene.getObjectByName( "skull" ).rotation.x = -Math.PI/2;
    scene.getObjectByName( "skull" ).rotation.z = Math.PI + time2/32;
  } catch (err) {
    console.log("Unzipping...")
  };

  // console.log(isMobileDevice());

  if (isMobileDevice() == false){
    controls.enableRotate = false;
    camera.position.x = mouseX;
    camera.position.y = mouseY;
    console.log(mouseX);
  } else {
    controls.enableRotate = true;
    console.log("true");
  };

  controls.update();
  camera.updateProjectionMatrix();

  composer.render();
  window.requestAnimationFrame( animate );
}; 


function onDocumentMouseMove(event) {
  mouseX = ( event.clientX - windowHalfX ) * 0.0005;
  mouseY = ( event.clientY - windowHalfY ) * 0.0005;

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
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