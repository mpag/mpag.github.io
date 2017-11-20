//////////	
// MAIN //
//////////

// standard global variables
var container, scene, camera, renderer, controls, stats;
// var keyboard = new THREEx.keyboardstate();
var clock = new THREE.Clock();

// custom global variables
var cube;
var counter

// initialization
init();

// animation loop
animate();




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
	camera.zoom = 7;
	camera.position.set(-10,3.5,-10);
	camera.updateProjectionMatrix();
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
	// automatically resize renderer
	// THREEx.WindowResize(renderer, camera);
	window.addEventListener( 'resize', onWindowResize, false );
	
	///////// CONTROLS /////////
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.center.set(0, 40, 0);
	camera.position.copy(controls.center).add(new THREE.Vector3(10, 5, 10));

	////////// LIGHT /////////
	var light = new THREE.SpotLight(0xffffff, 0.7);
	light.position.set(0,1000,0);
	light.castShadow = true;
	scene.add(light);

	var ambientLight = new THREE.AmbientLight(0x111111,1.5);
	scene.add(ambientLight);

	
	//////// GEOMETRY /////////

	//CHECKS//
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) {
	};

	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};


	//LOADER//
	var axo = ["meshRoof.obj", "meshRoof1.obj", "meshRoof2.obj"]

	var loader = new THREE.OBJLoader( manager );
	
	loader.load(axo[0], function ( object ) {	
		object.id = "layer1";
		object.position.y = 20;
		object.position.z = 45;
		object.receiveShadow = true;
		object.castShadow = true;
		scene.add( object );
	}, onProgress, onError );

	loader.load(axo[1], function ( object ) {	
		object.id = "layer2";
		object.position.y = 40;
		object.position.z = 45;
		object.receiveShadow = true;
		object.castShadow = true;
		scene.add( object );
	}, onProgress, onError );

	loader.load(axo[2], function ( object ) {	
		object.id = "layer3";
		object.position.y = 60;
		object.position.z = 45;
		object.receiveShadow = true;
		object.castShadow = true;
		scene.add( object );
	}, onProgress, onError );


	//Materials
	var imgTexture = new THREE.ImageUtils.loadTexture( "UV.jpg" );
	imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
	var imgBumpTexture = new THREE.ImageUtils.loadTexture( "UV.jpg" );
	imgBumpTexture.wrapS = imgBumpTexture.wrapT = THREE.RepeatWrapping;
	var material = new THREE.MeshPhongMaterial( { diffuse: imgTexture, bumpMap: imgBumpTexture, bumpScale: 0.01, side: THREE.FrontSide});

	//Geom Definition
	var geometryTerrain = new THREE.PlaneGeometry( 28000, 28000, 256, 256 );
	terrain = new THREE.Mesh( geometryTerrain, material );
	terrain.rotation.x = Math.PI / -2;
	terrain.receiveShadow = true;
	terrain.castShadow = true;

	var gridHelper = new THREE.GridHelper( 700, 200 );
	scene.add( gridHelper );

	//Addition to Scene
	scene.add(terrain);	


	//////// SKY /////////////

	var skyBoxGeometry = new THREE.CubeGeometry( 20000, 20000, 20000 );
	var skyBoxMaterial = new THREE.MeshStandardMaterial( { diffuse: 0xFFFFFF, side: THREE.BackSide});
	skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
	scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0065 );
}


function animate() 
{
    requestAnimationFrame( animate );	
	render();		
	update();
}



function onWindowResize() {
	var aspect = window.innerWidth / window.innerHeight;
	camera.left   = - frustumSize * aspect / 2;
	camera.right  =   frustumSize * aspect / 2;
	camera.top    =   frustumSize / 2;
	camera.bottom = - frustumSize / 2;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


function update()
{
	// delta = change in time since last call (in seconds)
	var delta = clock.getDelta(); 
	// terrain.rotation.z += 0.005;
	// skyBox.rotation.z += -0.005;
	// skyBox.rotation.x += -0.005;



	// for (var i = 0 ; i < (cubes.length) ; i++){
	// 	var num1 = Math.random()*(0.05-0.001)+0.001;
	// 	var num2 = Math.random()*(0.05-0.001)+0.001;
	// 	var num3 = Math.random()*(0.05-0.001)+0.001;
	// 	// object.rotation.z += num1;
	// 	// object.rotation.x += num2;
	// 	// object.rotation.y += num3;
	// };

	// // functionality provided by THREEx.KeyboardState.js
	// if ( keyboard.pressed("1") )
	// 	document.getElementById('message').innerHTML = ' Have a nice day! - 1';	
	// if ( keyboard.pressed("2") )
	// 	document.getElementById('message').innerHTML = ' Have a nice day! - 2 ';	

	controls.update();
	// stats.update();
}


function render() 
{	
	renderer.render( scene, camera );
}