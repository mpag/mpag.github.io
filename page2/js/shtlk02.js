

var camera, scene, renderer, meshKnot, meshPlane, meshBox;
var count = 0;
var screenWidth = window.innerWidth; 
var screenHeight = window.innerHeight;
var aspect = screenWidth / screenHeight;
var frustumSize = 1000;

////////GUI///////////
var guiControls = new function (){
  this.sunAngle = 0;
  this.axoFactor = 0;
  this.rotate = false;
};

///////STATS/////////
// var stats = new Stats();
// stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );
window.addEventListener( 'resize', onWindowResize, false );

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

if (window.mobilecheck == true){
  $("#title").hide();
};


init();

function init(){
  //CAMERA
  scene = new THREE.Scene();
  near = -100; 
  far = 10000;
  camera = new THREE.OrthographicCamera( frustumSize*aspect/-2, frustumSize*aspect/2, frustumSize/2, frustumSize/-2, near, far );
  camera.position.z = -50;
  camera.position.y = 35;
  camera.position.x = 50;
  camera.zoom = 4;
  camera.updateProjectionMatrix();

  var planeGeometry = new THREE.PlaneGeometry( 500, 500, 32 );
  planeGeometry.rotateX( - Math.PI / 2 );
  planeGeometry.rotateY( - Math.PI / 4 );
  var planeMaterial = new THREE.ShadowMaterial();
  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.receiveShadow = true;
  scene.add( plane );


  //////// GEOMETRY /////////
  var index = 0;
  var countLoaded = 0;
  var files = ["models/inquiry0.json", "models/inquiry1.json", "models/inquiry2.json"];

  //////////LOADER///////////

  var manager = new THREE.LoadingManager();

  var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log(percentComplete);
      // var $circle = $('#svg #bar');
      // var r = $circle.attr('r');
      // var c = Math.PI*(r*2);
      // var percentTotal = ((percentComplete/files.length)+((100/files.length)*(countLoaded)));
      // var pct = ((100-percentTotal)/100)*c;
      // $circle.css({ strokeDashoffset: pct});
      // document.getElementById("percentComplete").innerHTML=(Math.ceil( percentComplete ) + "%" ); }
    }};

  var onError = function ( xhr ) {
    console.log("ERROR");
  };
  
  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    console.log("STARTED")
  };
  
  manager.onProgress = function ( item, loaded, total ) {
    console.log("onProgress Fired");
    countLoaded++;
    // document.getElementById("fileComplete").innerHTML =(countLoaded + "/" + files.length + " loaded");
  };
  manager.onLoad = function ( ) {
    if (countLoaded == files.length) {
      console.log(files.length);
    //   // $("#progressContainer").delay(3000).css("display", "none");
    };



    console.log("complete");

  var gui = new dat.GUI();
    gui.add(guiControls, 'sunAngle', 0, 1);
    gui.add(guiControls, 'axoFactor', 0.0, 15.0);
    gui.add(guiControls, 'rotate');


  };


  var jsonLoader = new THREE.ObjectLoader( manager );
  
  function loadNextFile() {
    if (index > files.length - 1) return;
      jsonLoader.load(files[index], function ( object ) {
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          };
        });
        object.name = "part" + index;
        object.rotation.x = -Math.PI / 2;
        console.log(object.name);
        scene.add(object);
        index++;
        loadNextFile();
    }, onProgress, onError);
  };

  loadNextFile();


  //LIGHT
  var ambientlight = new THREE.AmbientLight( 0x080808, 5 ); 
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
  directionalLight.shadow.camera.right =  500;
  directionalLight.shadow.camera.left = -500;
  directionalLight.shadow.camera.top =  500;
  directionalLight.shadow.camera.bottom = -500;
  directionalLight.position.y = 150;
  directionalLight.position.z = -100;
  directionalLight.shadow.mapSize.width = 1024;  // default
  directionalLight.shadow.mapSize.height = 1024; // default
  directionalLight.shadow.camera.near = -100;    // default
  directionalLight.shadow.camera.far = 1500;     // default

  directionalLight.castShadow = true;
  scene.add( directionalLight );
  scene.add( ambientlight );
  
  
  //RENDERERS
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio( 1.5 );
  console.log(window.devicePixelRatio);
  renderer.setSize( screenWidth, screenHeight);
  renderer.autoClear = false;
  renderer.setClearColor( 0xffffff, 0);
  
  document.getElementById("example1").appendChild( renderer.domElement );
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
	controls.dampingFactor = 0.8;


  
  //ANIMATION/EVERY FRAME LOOP
  function animation(){
    window.requestAnimationFrame( animation );
    // stats.begin();
    
    //VARIABLES
    var part0 = scene.getObjectByName("part0");
    var part1 = scene.getObjectByName("part1");
    var part2 = scene.getObjectByName("part2");

    plane.position.y = guiControls.axoFactor* -5
    part0.position.y = guiControls.axoFactor* -5;
    part1.position.y = guiControls.axoFactor* 1;
    part2.position.y = guiControls.axoFactor* 6;
    camera.zoom = 4 - guiControls.axoFactor / 12;

    directionalLight.position.x = guiControls.sunAngle*300 - 100;
    
    var axoFactorScale = guiControls.axoFactor*5 + 35

    // camera.position.y =  axoFactorScale;
    camera.lookAt.set = (0, axoFactorScale, 0);

    camera.updateProjectionMatrix();
    
    controls.autoRotate = guiControls.rotate;
    controls.update();
    
    renderer.render( scene, camera);
    // stats.end();
    };  


  animation();  

};



//////FUNCTIONS////////
function onWindowResize() {
  camera.left   = - frustumSize * aspect / 2;
  camera.right  =   frustumSize * aspect / 2;
  camera.top    =   frustumSize / 2;
  camera.bottom = - frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize( screenWidth, screenHeight );
};
