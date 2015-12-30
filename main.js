if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats, permalink, hex, color;

var camera, cameraTarget, scene, renderer;

var composer;
var wagnerComposer;

var group, textMesh1, textMesh2, textGeo, material;

var firstLetter = true;

var time = 0,
	loop = 0;

var text = "0",

	height = 0,
	size = 80,
	hover = 50,

	curveSegments = 50,

	bevelThickness = 0,
	bevelSize = 0,
	bevelSegments = 0,
	bevelEnabled = true,

	font = "Bebas Neue Regular", // helvetiker
	weight = "normal", // normal bold
	style = "normal"; // normal italic

var mirror = false;

var fontMap = {

	"Bebas Neue Regular": 0,
	"helvetiker": 1

};

var weightMap = {

	"normal": 0,
	"bold": 1

};

var textMeshArray = [];

var reverseFontMap = {};
var reverseWeightMap = {};

for ( var i in fontMap ) reverseFontMap[ fontMap[i] ] = i;
for ( var i in weightMap ) reverseWeightMap[ weightMap[i] ] = i;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseY = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var postprocessing = { enabled : false };
var glow = 0.5;

//WAGNER.vertexShadersPath = '../vertex-shaders';
WAGNER.fragmentShadersPath = '../alex_letters/vendor/Wagner/fragment-shaders';
WAGNER.assetsPath = '../assets/';

init();
animate();

document.addEventListener("mousemove", setMousePosition, false);

function setMousePosition(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;

}    

function capitalize( txt ) {

	return txt.substring( 0, 1 ).toUpperCase() + txt.substring( 1 );

}

function decimalToHex( d ) {

	var hex = Number( d ).toString( 16 );
	hex = "000000".substr( 0, 6 - hex.length ) + hex;
	return hex.toUpperCase();

}

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	permalink = document.getElementById( "permalink" );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1500 );
	camera.position.set( 0, 400, 700 );

	cameraTarget = new THREE.Vector3( 0, 150, 0 );

	// SCENE

	scene = new THREE.Scene();
	//scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

	// LIGHTS

	var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
	dirLight.position.set( 0, 0, 1 ).normalize();
	scene.add( dirLight );

	var pointLight = new THREE.PointLight( 0xffffff, 50.5 );
	pointLight.position.set( 0, 100, 90 );
	scene.add( pointLight );

	//text = capitalize( font ) + " " + capitalize( weight );
	//text = "abcdefghijklmnopqrstuvwxyz0123456789";
	//text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	material = new THREE.MeshBasicMaterial( {
		 color: 0xffffff, transparent : true, opacity : 0.05
	} );


	group = new THREE.Group();
	group.position.y = 100;

	scene.add( group );

	var ambLight = new THREE.AmbientLight(0x202020);
	scene.add(ambLight);

	createText();

	var plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 10000, 10000 ),
		new THREE.MeshBasicMaterial( { color: 0xaaaaaa, opacity: 0.3, transparent: true } )
	);
	plane.position.y = 100;
	plane.rotation.x = - Math.PI / 2;
	scene.add( plane );

	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	//renderer.setClearColor( scene.fog.color );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	// STATS

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	// EVENTS

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	document.addEventListener( 'keypress', onDocumentKeyPress, false );
	document.addEventListener( 'keydown', onDocumentKeyDown, false );

	// POSTPROCESSING

	var shaderVignette = THREE.VignetteShader;

	var effectVignette = new THREE.ShaderPass( shaderVignette );

	effectVignette.uniforms[ "offset" ].value = 0.9;
	effectVignette.uniforms[ "darkness" ].value = 2.0;
	effectVignette.renderToScreen = true;

	renderer.autoClear = false;



	var renderModel = new THREE.RenderPass( scene, camera );
	// var effectBloom = new THREE.BloomPass( 0.25 );
	// var effectFilm = new THREE.FilmPass( 0.5, 0.125, 2048, false );


	var width = window.innerWidth || 2;
	var height = window.innerHeight || 2;

	// composer = new THREE.EffectComposer( renderer );

	// composer.addPass( renderModel );
	// composer.addPass( effectVignette );

	//wagner test
	wagnerComposer = new WAGNER.Composer( renderer, { useRGBA: false } );
	zoomBlurPass = new WAGNER.ZoomBlurPass();
	zoomBlurPass.params.strength = .1;
	


	window.addEventListener( 'resize', onWindowResize, false );
	onWindowResize();
}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	//resize Wagner Pass
	wagnerComposer.setSize( renderer.domElement.width, renderer.domElement.height );
	zoomBlurPass.params.center.set( .5 * wagnerComposer.width, .5 * wagnerComposer.height );

	//composer.reset();


}

//

function boolToNum( b ) {

	return b ? 1 : 0;

}

function updatePermalink() {

	var link = hex + fontMap[ font ] + weightMap[ weight ] + boolToNum( postprocessing.enabled ) + boolToNum( bevelEnabled ) + "#" + encodeURI( text );

	permalink.href = "#" + link;
	window.location.hash = link;

}

function onDocumentKeyDown( event ) {

	if ( firstLetter ) {

		firstLetter = false;
		text = "";

	}

	var keyCode = event.keyCode;

	// backspace

	if ( keyCode == 8 ) {

		event.preventDefault();

		text = text.substring( 0, text.length - 1 );
		refreshText();

		return false;

	}

}

function onDocumentKeyPress( event ) {

	var keyCode = event.which;

	// backspace

	if ( keyCode == 8 ) {

		event.preventDefault();

	} else {

		var ch = String.fromCharCode( keyCode );
		text += ch;

		refreshText();

	}

}

function createText() {

	textGeo = new THREE.TextGeometry( text, {

		size: size,
		height: height,
		curveSegments: curveSegments,

		font: font,
		weight: weight,
		style: style,

		bevelThickness: bevelThickness,
		bevelSize: bevelSize,
		bevelEnabled: bevelEnabled,

		material: 0,
		extrudeMaterial: 1

	});

	textGeo.computeBoundingBox();
	textGeo.computeVertexNormals();

	// "fix" side normals by removing z-component of normals for side faces
	// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

	if ( ! bevelEnabled ) {

		var triangleAreaHeuristics = 0.1 * ( height * size );

		for ( var i = 0; i < textGeo.faces.length; i ++ ) {

			var face = textGeo.faces[ i ];

			if ( face.materialIndex == 1 ) {

				for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

					face.vertexNormals[ j ].z = 0;
					face.vertexNormals[ j ].normalize();

				}

				var va = textGeo.vertices[ face.a ];
				var vb = textGeo.vertices[ face.b ];
				var vc = textGeo.vertices[ face.c ];

				var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

				if ( s > triangleAreaHeuristics ) {

					for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

						face.vertexNormals[ j ].copy( face.normal );

					}

				}

			}

		}

	}

	var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

	textMesh1 = new THREE.Mesh( textGeo, material );

	textMesh1.position.x = centerOffset;
	textMesh1.position.y = hover;
	textMesh1.position.z = 0;

	textMesh1.rotation.x = 0;
	textMesh1.rotation.y = Math.PI * 2;
	
	var elements = 50;
	var textMesh1;

	for (var i = 0; i < elements; i++) {

		textMesh1 = new THREE.Mesh( textGeo, material );

		textMesh1.position.x = centerOffset;
		textMesh1.position.y = 20;
		textMesh1.position.z = i*1;

		textMesh1.rotation.y = Math.PI * 2;
		textMesh1.rotation.z =  -0.05 +  Math.random()*0.1;
		
		group.add( textMesh1 );
		textMeshArray.push(textMesh1);
	}

	console.log(textMeshArray);

	if ( mirror ) {

		textMesh2 = new THREE.Mesh( textGeo, material );

		textMesh2.position.x = centerOffset;
		textMesh2.position.y = -hover;
		textMesh2.position.z = height;

		textMesh2.rotation.x = Math.PI;
		textMesh2.rotation.y = Math.PI * 2;

		group.add( textMesh2 );

	}

}

function refreshText() {

	updatePermalink();

	group.remove( textMesh1 );
	if ( mirror ) group.remove( textMesh2 );

	if ( !text ) return;

	createText();

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	mouseXOnMouseDown = event.clientX - windowHalfX;
	targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove( event ) {

	mouseX = event.clientX - windowHalfX;

	targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

}

function onDocumentMouseUp( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentMouseOut( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentTouchStart( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
		targetRotationOnMouseDown = targetRotation;

	}

}

function onDocumentTouchMove( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

	}

}

//
var fpsInterval = 100;
var then = 0;
var now = 0;

console.log(textMeshArray[0]);

function animate() {

	requestAnimationFrame( animate );
	var currentMesh = textMeshArray[loop];

	now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        // Put your drawing code here
        currentMesh.position.x = mouseX - windowHalfX;
        currentMesh.material.opacity =0.05;

        for (var i = 0; i < textMeshArray.length; i++) {
        	textMeshArray[i].material.opacity -= 0.0008;
        }

		loop++;
		if(loop>49) loop = 0;

		time++;

    }
	
	render();

	
	stats.update();

}

function render() {

	group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

	camera.lookAt( cameraTarget );

	//renderer.clear();
	wagnerComposer.reset();
	wagnerComposer.render( scene, camera );
	wagnerComposer.pass( zoomBlurPass );
	wagnerComposer.toScreen();

	//composer.render( 0.05 );
	//renderer.render( scene, camera );

}

