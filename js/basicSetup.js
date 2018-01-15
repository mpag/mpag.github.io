//////////	
// MAIN //
//////////


// $.LoadingOverlay("show");

// standard global variables
var container, scene, camera, renderer, controls, stats;
var projector, mouse = { x: 0, y: 0 }, INTERSECTED;
// var keyboard = new THREEx.keyboardstate();
var clock = new THREE.Clock();

// custom global variables
var cube;
var counter

////////GUI///////////
var guiControls = new function (){
	this.positionZ = 0;
};

// var gui = new dat.GUI({ autoPlace: false });
var gui = new dat.GUI();

var textBox = document.getElementById('controls');
console.log(textBox);
// textBox.appendChild(gui.domElement);

gui.add(guiControls, 'positionZ', 0, 30);		

// initialization
init();

///////////////
// FUNCTIONS //
///////////////
			
function init() 
{
	// SCENE
	scene = new THREE.Scene();

	//////// CAMERA //////////
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	// camera attributes
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = -100000, FAR = 100000;
	// camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	frustumSize = 1000;

	var aspect = window.innerWidth / window.innerHeight;

	camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, NEAR, FAR );
	camera.zoom = 11;
	camera.updateProjectionMatrix();
	camera.position.set(0,2.5,-5);
	scene.add(camera);

	///////// RENDERER /////////
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer();
	
	renderer.shadowMapEnabled = true;
	// renderer.shadowMapType = THREE.PCFSoftShadowMap;
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	
	////////// EVENTS //////////
	window.addEventListener( 'resize', onWindowResize, false );
	
	///////// CONTROLS /////////
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.center.set(0, 20, 0);
	controls.enablePan = false;
	controls.enableDamping = true;
	controls.dampingFactor = 0.2;
	controls.maxPolarAngle = Math.PI / 2;

	camera.position.copy(controls.center).add(new THREE.Vector3(2,0.8,-4));

	////////// LIGHT /////////
	var light = new THREE.SpotLight(0xffffff, 0.7);
	light.position.set(0,1000,0);
	light.castShadow = true;
	scene.add(light);
	var ambientLight = new THREE.AmbientLight(0x111111,1.5);
	scene.add(ambientLight);

	
	//////// GEOMETRY /////////

	var index = 0;
	var countLoaded = 0
	var files = ["meshRoof.obj", "meshRoof1.obj", "meshRoof2.obj"];

	//////////CHECKS///////////

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );	
	}};
	var onError = function ( xhr ) {};
	
	// var progressBar = document.getElementById("loadingBar"); 
	var manager = new THREE.LoadingManager();
	
	manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
		console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
	};
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
		// progressBar.style.width = (loaded / total * 100) + '%';
	};
	manager.onLoad = function ( ) {
		animate();
		console.log( 'Loading complete!');
	};

	var objLoader = new THREE.OBJLoader( manager);
	function loadNextFile() {
	  if (index > files.length - 1) return;
	  objLoader.load(files[index], function(object) {
		object.name = "obj" + index;
		object.position.y = 4;
		object.position.z = 45;
		object.position.x = 10;
		object.receiveShadow = true;
		object.castShadow = true;
		var objMaterial = new THREE.MeshToonMaterial( { color: 0xFF0000, side: THREE.DoubleSide, transparent: true, opacity: 0.7});
	    object.traverse( function ( child ) {
	        if ( child instanceof THREE.Mesh ) {
	            child.material = objMaterial ;
	        }
	    });
	    scene.add(object);
	    index++;
	    loadNextFile();
	  }, onProgress, onError);
	};
	loadNextFile();

	//Materials
	var imgTexture = new THREE.ImageUtils.loadTexture( "UV.jpg" );
	imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
	var imgBumpTexture = new THREE.ImageUtils.loadTexture( "UV.jpg" );
	imgBumpTexture.wrapS = imgBumpTexture.wrapT = THREE.RepeatWrapping;
	var material = new THREE.MeshPhongMaterial( { color: imgTexture, bumpMap: imgBumpTexture, bumpScale: 0.01, side: THREE.FrontSide});

	//Geom Definition
	var geometryTerrain = new THREE.PlaneGeometry( 28000, 28000, 256, 256 );
	terrain = new THREE.Mesh( geometryTerrain, material );
	terrain.rotation.x = Math.PI / -2;
	terrain.receiveShadow = true;
	terrain.castShadow = true;
	var gridHelper = new THREE.GridHelper( 700, 200 );
	scene.add( gridHelper );
	scene.add(terrain);	


	//////// SKY /////////////

	var skyBoxGeometry = new THREE.CubeGeometry( 20000, 20000, 20000 );
	var skyBoxMaterial = new THREE.MeshStandardMaterial( { diffuse: 0xFFFFFF, side: THREE.BackSide});
	skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
	scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0065 );

};


function animate() 
{
    requestAnimationFrame( animate );	
	render();		
	update();
};

function onWindowResize() {
	var aspect = window.innerWidth / window.innerHeight;
	camera.left   = - frustumSize * aspect / 2;
	camera.right  =   frustumSize * aspect / 2;
	camera.top    =   frustumSize / 2;
	camera.bottom = - frustumSize / 2;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
};


function update()
{
	// delta = change in time since last call (in seconds)
	var delta = clock.getDelta(); 

	var obj1 = scene.getObjectByName("obj1");
	var obj2 = scene.getObjectByName("obj2");
	
	// if (document.getElementById("axo").checked == true){
	// 	obj2.position.y = 0.2;
	// 	obj3.position.y = 0.1;
	// } else {
	// 	obj2.position.y = 5;
	// 	obj3.position.y = 5;
	// }

	obj1.position.y = (guiControls.positionZ / 2) + 5;
	obj2.position.y = guiControls.positionZ + 5;
	
	controls.center.set(0, ((guiControls.positionZ / 2)+1), 0);
	camera.position.copy(controls.center).add(new THREE.Vector3(2,(Math.log(guiControls.positionZ + 1)/2)+0.5,-4));

	/////// find intersections///////

	// // create a Ray with origin at the mouse position
	// //   and direction into the scene (camera direction)
	// var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	// projector.unprojectVector( vector, camera );
	// var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	// // create an array containing all objects in the scene with which the ray intersects
	// var intersects = ray.intersectObjects( scene.children );
	// console.log(intersects);

	// INTERSECTED = the object in the scene currently closest to the camera 
	//		and intersected by the Ray projected from the mouse position 	
	
	// if there is one (or more) intersections
	// if ( intersects.length > 0 )
	// {

	// }

	controls.update();
	// // stats.update();
};


function render() 
{	
	renderer.render( scene, camera );
};