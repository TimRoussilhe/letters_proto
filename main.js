if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats, permalink, hex, color;

var camera, cameraTarget, scene, renderer;

var composer;
var wagnerComposer;

var group, textMesh1, textMesh2, textGeo, material;

var firstLetter = true;

var mainLetter;

var time = 0,
	loop = 0;

// var text = "A",

// 	height = 0,
// 	size = 80,
// 	hover = 50,

// 	curveSegments = 50,

// 	bevelThickness = 0,
// 	bevelSize = 0,
// 	bevelSegments = 0,
// 	bevelEnabled = true,

// 	font = "Bebas Neue Regular", // helvetiker
// 	weight = "normal", // normal bold
// 	style = "normal"; // normal italic

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

WAGNER.vertexShadersPath = '../vendor/Wagner/vertex-shaders';
WAGNER.fragmentShadersPath = '../vendor/Wagner/fragment-shaders';
WAGNER.assetsPath = '../assets/';

init();
animate();

document.addEventListener("mousemove", setMousePosition, false);

function setMousePosition(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;

}    



function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	permalink = document.getElementById( "permalink" );

	// CAMERA
	//camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight );
	camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 500 );

	camera.position.set( 0, 100, 100 );

	cameraTarget = new THREE.Vector3( 0, 100, 0 );

	// SCENE

	scene = new THREE.Scene();
	//scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

	// LIGHTS

	// var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
	// dirLight.position.set( 0, 0, 1 ).normalize();
	// scene.add( dirLight );

	// var pointLight = new THREE.PointLight( 0xffffff, 50.5 );
	// pointLight.position.set( 0, 100, 90 );
	// scene.add( pointLight );

	// var ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
	// scene.add( ambientLight );

	// var hemisphereLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
	// scene.add( hemisphereLight );

	//text = capitalize( font ) + " " + capitalize( weight );
	//text = "abcdefghijklmnopqrstuvwxyz0123456789";
	//text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	material = new THREE.MeshBasicMaterial( {
		 color: 0xffffff, transparent : true, opacity : 0.05 , fog : false
	} );


	group = new THREE.Group();
	group.position.y = 100;

	scene.add( group );

	var ambLight = new THREE.AmbientLight(0x202020);
	scene.add(ambLight);

	//createText();
	var letter = new Letter({text:'A',x:-200,y:100});
	letter.createText();

	var letter = new Letter({text:'L',x:-150,y:100});
	letter.createText();

	var letter = new Letter({text:'E',x:-100,y:100});
	letter.createText();

	var letter = new Letter({text:'X',x:-50,y:100});
	letter.createText();
	
	var letter = new Letter({text:'A',x:0,y:100});
	letter.createText();

	var letter = new Letter({text:'N',x:50,y:100});
	letter.createText();

	var letter = new Letter({text:'D',x:100,y:100});
	letter.createText();
	
	var letter = new Letter({text:'R',x:150,y:100});
	letter.createText();

	var letter = new Letter({text:'E',x:200,y:100});
	letter.createText();

	var letter = new Letter({text:'R',x:-100,y:-100});
	letter.createText();

	var letter = new Letter({text:'O',x:-60,y:-100});
	letter.createText();

	var letter = new Letter({text:'C',x:0,y:-100});
	letter.createText();

	var letter = new Letter({text:'H',x:50,y:-100});
	letter.createText();

	var letter = new Letter({text:'E',x:100,y:-100});
	letter.createText();

	mainLetter = new Letter({text:'T',x:150,y:-100});
	mainLetter.createText();

	var plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 10000, 10000 ),
		new THREE.MeshBasicMaterial( { color: 0xaaaaaa, opacity: 0.1, transparent: true } )
	);
	plane.position.y = 0;
	plane.position.z = -50;
	//plane.rotation.x = - Math.PI / 2;
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

	// var shaderVignette = THREE.VignetteShader;

	// var effectVignette = new THREE.ShaderPass( shaderVignette );

	// effectVignette.uniforms[ "offset" ].value = 0.9;
	// effectVignette.uniforms[ "darkness" ].value = 2.0;
	// effectVignette.renderToScreen = true;

	// renderer.autoClear = false;

	// var renderModel = new THREE.RenderPass( scene, camera );

	// var width = window.innerWidth || 2;
	// var height = window.innerHeight || 2;

	// // composer = new THREE.EffectComposer( renderer );

	// // composer.addPass( renderModel );
	// // composer.addPass( effectVignette );

	//WAGNER post 

	wagnerComposer = new WAGNER.Composer( renderer, { useRGBA: false } );
	zoomBlurPass = new WAGNER.ZoomBlurPass();
	zoomBlurPass.params.strength = .1;

	vignettePass = new WAGNER.VignettePass();
	vignettePass.params.amount = 0.7;
	vignettePass.params.falloff = 0.1;

	noisePass = new WAGNER.NoisePass();
	noisePass.params.amount = 0.015;
	noisePass.params.speed = 0.01;

	directionalBlurPass = new WAGNER.DirectionalBlurPass();
	directionalBlurPass.params.delta = 0.001;

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

// function createText() {

// 	textGeo = new THREE.TextGeometry( text, {

// 		size: size,
// 		height: height,
// 		curveSegments: curveSegments,

// 		font: font,
// 		weight: weight,
// 		style: style,

// 		bevelThickness: bevelThickness,
// 		bevelSize: bevelSize,
// 		bevelEnabled: bevelEnabled,

// 		material: 0,
// 		extrudeMaterial: 1

// 	});

// 	textGeo.computeBoundingBox();
// 	textGeo.computeVertexNormals();

// 	// "fix" side normals by removing z-component of normals for side faces
// 	// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

// 	if ( ! bevelEnabled ) {

// 		var triangleAreaHeuristics = 0.1 * ( height * size );

// 		for ( var i = 0; i < textGeo.faces.length; i ++ ) {

// 			var face = textGeo.faces[ i ];

// 			if ( face.materialIndex == 1 ) {

// 				for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

// 					face.vertexNormals[ j ].z = 0;
// 					face.vertexNormals[ j ].normalize();

// 				}

// 				var va = textGeo.vertices[ face.a ];
// 				var vb = textGeo.vertices[ face.b ];
// 				var vc = textGeo.vertices[ face.c ];

// 				var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

// 				if ( s > triangleAreaHeuristics ) {

// 					for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

// 						face.vertexNormals[ j ].copy( face.normal );

// 					}

// 				}

// 			}

// 		}

// 	}

// 	var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );


	
// 	var elements = 50;
// 	//var textMesh1;
// 	for (var i = 0; i < elements; i++) {

// 		textMesh1 = new THREE.Mesh( textGeo, material );

// 		textMesh1.position.x = centerOffset;
// 		textMesh1.position.y = 20;
// 		textMesh1.position.z = i*1;

// 		textMesh1.rotation.y = Math.PI * 2;
// 		textMesh1.rotation.z =  -0.05 +  Math.random()*0.1;
		
// 		group.add( textMesh1 );
// 		textMeshArray.push(textMesh1);
// 	}

// 	var elements = 100;
// 	var textMesh1
// 	var textMesh1;
// 	for (var i = 0; i < elements; i++) {

// 		textMesh1 = new THREE.Mesh( textGeo, material );

// 		textMesh1.position.x = 100;
// 		textMesh1.position.y = 100;
// 		textMesh1.position.z = i*1;

// 		textMesh1.rotation.y = Math.PI * 2;
// 		textMesh1.rotation.z =  -0.05 +  Math.random()*0.1;
		
// 		group.add( textMesh1 );
// 		//textMeshArray.push(textMesh1);
// 	}

// 	var elements = 150;
// 	var textMesh1
// 	var textMesh1;
// 	for (var i = 0; i < elements; i++) {

// 		textMesh1 = new THREE.Mesh( textGeo, material );

// 		textMesh1.position.x = -300;
// 		textMesh1.position.y = 100;
// 		textMesh1.position.z = i*1;

// 		textMesh1.rotation.y = Math.PI * 2;
// 		textMesh1.rotation.z =  -0.05 +  Math.random()*0.1;
		
// 		group.add( textMesh1 );
// 		//textMeshArray.push(textMesh1);
// 	}

// }

// function refreshText() {

// 	updatePermalink();

// 	group.remove( textMesh1 );

// 	if ( !text ) return;

// 	createText();

//}

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

function animate() {

	requestAnimationFrame( animate );
	var currentMesh = mainLetter.textMeshArray[loop];

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
        	mainLetter.textMeshArray[i].material.opacity -= 0.0005;
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

	wagnerComposer.reset();
	wagnerComposer.render( scene, camera );
	wagnerComposer.pass( directionalBlurPass );
	wagnerComposer.pass( vignettePass );
	wagnerComposer.pass( noisePass );
	wagnerComposer.toScreen();

	//composer.render( 0.05 );
	//renderer.render( scene, camera );

}

