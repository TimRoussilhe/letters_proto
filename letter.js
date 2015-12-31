"use strict";

var Letter = function(options){

    this.text = options.text;
    
    this.position = {
        x : options.x,
        y : options.y
    }

    this.height = 0;
    this.size = 80;
    this.hover = 50;

    this.curveSegments = 50;

    this.bevelThickness = 0;
    this.bevelSize = 0;
    this.bevelSegments = 0;
    this.bevelEnabled = true;

    this.font = "Bebas Neue Regular", // helvetiker
    this.weight = "normal", // normal bold
    this.style = "normal"; // normal italic
	
    this.textMeshArray = [];

    this.material = new THREE.MeshBasicMaterial( {
         color: 0xffffff, transparent : true, opacity : 0.3 , fog : false
    } );

	Letter.prototype.constructor = Letter;

	Letter.prototype.render = function(){

	}

    Letter.prototype.createText = function(){

        textGeo = new THREE.TextGeometry( this.text, {

            size: this.size,
            height: this.height,
            curveSegments: this.curveSegments,

            font: this.font,
            weight: this.weight,
            style: this.style,

            bevelThickness: this.bevelThickness,
            bevelSize: this.bevelSize,
            bevelEnabled: this.bevelEnabled,

            material: 0,
            extrudeMaterial: 1

        });

        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();

        // "fix" side normals by removing z-component of normals for side faces
        // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

        if ( ! this.bevelEnabled ) {

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


        
        var elements = 50;
        //var textMesh1;
        for (var i = 0; i < elements; i++) {

            textMesh1 = new THREE.Mesh( textGeo, material );

            textMesh1.position.x = this.position.x;
            textMesh1.position.y = this.position.y;
            textMesh1.position.z = i*1;

            textMesh1.rotation.y = Math.PI * 2;
            textMesh1.rotation.z =  -0.05 +  Math.random()*0.1;
            
            group.add( textMesh1 );
            this.textMeshArray.push(textMesh1);
        }

    }

    Letter.prototype.refreshText = function() {

        updatePermalink();

        group.remove( textMesh1 );

        if ( !text ) return;

        this.createText();


    }
}
