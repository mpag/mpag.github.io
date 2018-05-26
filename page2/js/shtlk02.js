

var camera, scene, renderer;
var meshKnot, meshPlane, meshBox;
var count = 0;
var width = window.innerWidth;
var height = window.innerHeight;

window.addEventListener( 'resize', onWindowResize, false );

init();

function init(){
  //CAMERA
  scene = new THREE.Scene();
  // scene.fog = new THREE.FogExp2(0x00000, 0.010);
  var screenWidth = window.innerWidth; 
  screenHeight = window.innerHeight;
  var aspect = screenWidth / screenHeight;
  frustumSize = 1000;
  near = -100000; 
  far = 100000;
  camera = new THREE.OrthographicCamera( frustumSize*aspect/-2, frustumSize*aspect/2, frustumSize/2, frustumSize/-2, near, far );
  // camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = -50;
  camera.position.y = 35;
  camera.zoom = 4;
  camera.updateProjectionMatrix();

  var planeGeometry = new THREE.PlaneGeometry( 500, 500, 32 );
  planeGeometry.rotateX( - Math.PI / 2 );
  planeGeometry.rotateY( - Math.PI / 4 );

  var planeMaterial = new THREE.ShadowMaterial();
  // planeMaterial.opacity = 0.2;

  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.position.y = -16;
  plane.receiveShadow = true;
  scene.add( plane );


  //////// GEOMETRY /////////
  var index = 0;
  var countLoaded = 0;
  var files = ["models/inquiry.json"];

  //////////LOADER///////////

  var manager = new THREE.LoadingManager();
  var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
      
      var percentComplete = xhr.loaded / xhr.total * 100;
      // var $circle = $('#svg #bar');
      // var r = $circle.attr('r');
      // var c = Math.PI*(r*2);
      // var percentTotal = ((percentComplete/files.length)+((100/files.length)*(countLoaded)));
      // var pct = ((100-percentTotal)/100)*c;
      // $circle.css({ strokeDashoffset: pct});
      // document.getElementById("percentComplete").innerHTML=(Math.ceil( percentComplete ) + "%" ); }
    }};
  var onError = function ( xhr ) {};
  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {};
  manager.onProgress = function ( item, loaded, total ) {
    countLoaded++;
    // document.getElementById("fileComplete").innerHTML =(countLoaded + "/" + files.length + " loaded");
  };
  manager.onLoad = function ( ) {
    if (countLoaded == files.length) {
      // $("#progressContainer").delay(3000).css("display", "none");
    };
    // var geometry = scene.getObjectByName("geometry"); 
    // console.log(geometry);
    // geometry.traverse( function ( child ) {
    //     if ( child instanceof THREE.Mesh ) {
    //       console.log(child);
    //       // geometry.castShadow = true;
    //       // geometry.receiveShadow = true;
    //   }});
    animation();
  };


  var jsonLoader = new THREE.ObjectLoader( manager );
  function loadNextFile() {
  if (index > files.length - 1) return;
    jsonLoader.load(files[0], function( geometry ) {
      inquiryMesh = geometry;
      inquiryMesh.scale.set(1,1,1);
      inquiryMesh.position.y = -15;
      inquiryMesh.rotation.x = -Math.PI / 2;
      inquiryMesh.rotation.z = Math.PI / 4;
      geometry.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
      }});
      scene.add(inquiryMesh);
      index++;
      loadNextFile();
    }, onProgress, onError);
  };

  loadNextFile();


  //LIGHT
  var ambientlight = new THREE.AmbientLight( 0x080808, 6 ); 
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
  directionalLight.shadow.camera.right =  200;
  directionalLight.shadow.camera.left = -200;
  directionalLight.shadow.camera.top =  200;
  directionalLight.shadow.camera.bottom = -200;
  directionalLight.position.y = 100;
  directionalLight.position.x = -100;
  directionalLight.shadow.mapSize.width = 1024;  // default
  directionalLight.shadow.mapSize.height = 1024; // default
  directionalLight.shadow.camera.near = 1;    // default
  directionalLight.shadow.camera.far = 1000;     // default

  directionalLight.castShadow = true;
  scene.add( directionalLight );
  scene.add( ambientlight );
  
  
  //RENDERERS
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  renderer.setClearColor( 0xffffff, 0);
  
  document.getElementById("example1").appendChild( renderer.domElement );
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
	controls.dampingFactor = 0.8;
  
  
  //ANIMATION/EVERY FRAME LOOP
  function animation(){
    window.requestAnimationFrame( animation );
    
    function check(){
      if (document.getElementById("sliderBox").checked == true){
        count++;
        inquiryMesh.position.y = inquiryMesh.position.y/2 - 5 + Math.sin(count *0.20)*0.5;
        // group.rotation.z = group.rotation.y + Math.sin(count *0.05)/1;
        // group.rotation.x = group.rotation.y + Math.sin(count *0.05)/1;
      }
    };
    check();
    renderer.render( scene, camera);
  };
  
};



// FUNCTIONS
function onWindowResize() {
    renderer.setSize( window.innerWidth, window.innerHeight );
	  camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
}