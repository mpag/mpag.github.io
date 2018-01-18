//////////	
// MAIN //
//////////



var container, scene, camera, renderer, controls, stats;
var clock = new THREE.Clock();
var cube;
var counter;


var options = {id: 'progressBar'};
var nanobar = new Nanobar( options );
nanobar.go( 1 );

////////GUI///////////
var guiControls = new function (){
	this.positionZ = 0;
	this.rotate = false;
};



// initialization
init();

function init() 
{
	// SCENE
	scene = new THREE.Scene();

	//////// CAMERA //////////
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = -100000, FAR = 100000;
	frustumSize = 1000;

	var aspect = window.innerWidth / window.innerHeight;

	camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, NEAR, FAR );
	camera.zoom = 15;
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
	controls.autoRotateSpeed = 0.5;

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
	var files = ["meshRoof_00.obj", "meshRoof_01.obj", "meshRoof_02.obj", "meshRoof_03.obj"];

	//////////CHECKS///////////

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			nanobar.go( Math.round(percentComplete, 2) );
			document.getElementById("percentComplete").innerHTML=(Math.ceil( percentComplete ) + "%" );	
	}};
	var onError = function ( xhr ) {};
	 
	var manager = new THREE.LoadingManager();
	
	manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
		// console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
	};
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
		countLoaded++;
		document.getElementById("fileComplete").innerHTML =(countLoaded + "/" + files.length + " loaded");
	};
	manager.onLoad = function ( ) {
		// console.log( 'Loading complete!');
		nanobar.go(100);
		var gui = new dat.GUI();
		gui.add(guiControls, 'positionZ', 0, 30);
		gui.add(guiControls, 'rotate');
		var elem = document.getElementById("progressContainer");
		elem.style.display = "none";
		
		var obj1 = scene.getObjectByName("obj1");
		var obj2 = scene.getObjectByName("obj2");
		var obj3 = scene.getObjectByName("obj3");
		
		var obj2Material = new THREE.MeshToonMaterial( { color: 0xE8E8E8, side: THREE.DoubleSide, transparent: true, opacity: 0.5});
		var obj3Material = new THREE.MeshToonMaterial( { color: 0x797979, side: THREE.DoubleSide, transparent: false, opacity: 0.7});
	    
	    obj2.traverse( function ( child ) {
	        if ( child instanceof THREE.Mesh ) {
	            child.material = obj2Material ;
        }});
	    obj3.traverse( function ( child ) {
	        if ( child instanceof THREE.Mesh ) {
	            child.material = obj3Material ;
        }});        
		animate();
	};

	var objLoader = new THREE.OBJLoader( manager);
	function loadNextFile() {
	  if (index > files.length - 1) return;
	  objLoader.load(files[index], function(object) {
		object.name = "obj" + index;
		object.receiveShadow = true;
		object.castShadow = true;
	    scene.add(object);
	    index++;
	    loadNextFile();
	  }, onProgress, onError);
	};
	loadNextFile();

	//Materials
	var material = new THREE.MeshPhongMaterial( { color: 0xD6D6D6, side: THREE.FrontSide});

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
	var obj3 = scene.getObjectByName("obj3");
	
	obj1.position.y = (guiControls.positionZ / 2);
	obj2.position.y = (guiControls.positionZ) ;
	obj3.position.y = (guiControls.positionZ) ;
	
	// t: current time, b: begInnIng value, c: change In value, d: duration
	var easeInOutQuad = function (t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	};

	posX = camera.position.x;
	posZ = camera.position.z;
	posY = easeInOutQuad(guiControls.positionZ, 1, 1, 30);
	controls.center.set(0,guiControls.positionZ / 2, 0);
	camera.position.copy(controls.center).add(new THREE.Vector3(posX, posY, posZ));
	controls.autoRotate = guiControls.rotate;
	controls.update();
};


function render() 
{	
	renderer.render( scene, camera );
};