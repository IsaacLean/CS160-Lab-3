// Globals.
var canvas;
var gl;
var program;

var colors = [];
var points = [];

var NumTimesToSubdivide = 1;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis;
var theta = [0, 0, 0];

var transX = 0.0;
var transY = 0.1;
var transZ = -1.0;

var scaleFactor = 0.5;

var view = mat4(1.0);

var FOV = 90;

var eyeX = 0;
var eyeY = 0;
var eyeZ = 0;

function initGl() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { 
        alert( "WebGL isn't available" );
    }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
}

window.onload = function init() {
    initGl();
    render();

    document.getElementById("subSlider").onchange = function (event) {
        NumTimesToSubdivide = event.target.value;
        render();
    };

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
        theta[axis] += 0.1;
        render();
    };

    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
        theta[axis] += 0.1;
        render();
    };

    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
        theta[axis] += 0.1;
        render();
    };

    document.getElementById( "fovPlusButton" ).onclick = function () {
        FOV += 1;
        render();
    };

    document.getElementById( "fovMinusButton" ).onclick = function () {
        FOV -= 1;
        render();
    };

    document.getElementById( "eyeXPlusButton" ).onclick = function () {
        eyeX += 0.5;
        render();
    };

    document.getElementById( "eyeXMinusButton" ).onclick = function () {
        eyeX -= 0.5;
        render();
    };

    document.getElementById( "eyeYPlusButton" ).onclick = function () {
        eyeY += 0.5;
        render();
    };

    document.getElementById( "eyeYMinusButton" ).onclick = function () {
        eyeY -= 0.5;
        render();
    };

    document.getElementById( "eyeZPlusButton" ).onclick = function () {
        eyeZ += 0.5;
        render();
    };

    document.getElementById( "eyeZMinusButton" ).onclick = function () {
        eyeZ -= 0.5;
        render();
    };

    window.onmousedown = function ( event ) {
        mouseDown = true;
    }

    window.onmouseup = function ( event ) {
        mouseDown = false;
    }

    var mouseDown = false;
    var prevX = null;
    var prevY = null;

    window.onmousemove = function ( event ) {
        if(mouseDown && (event.target.id === "gl-canvas")) {
            if(prevX || prevY) {
                if(prevX < event.pageX) {
                    eyeX += 0.1;
                } else if(prevX > event.pageX) {
                    eyeX -= 0.1;
                }

                if(prevY < event.pageY) {
                    eyeY += 0.1;
                } else if(prevY> event.pageY) {
                    eyeY -= 0.1;
                }
            }
            prevX = event.pageX;
            prevY = event.pageY;
        }
        render();
    }


    window.onkeydown = function( event ) {
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
          case 'W':
            transZ -= 0.1;
            break;

          case 'S':
            transZ += 0.1;
            break;

          case 'A':
            transX -= 0.1;
            break;

          case 'D':
            transX += 0.1;
            break;
        }
        render();
    };
}

function render() {
    projectionMatrix = perspective(FOV, 1.0, .001, 100.0);
    view = lookAt([eyeX, eyeY, eyeZ], [0, 0, 0], [0, 1, 0]);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    buildAndDrawCheckeredFloor();
    gl.clear(gl.DEPTH_BUFFER_BIT);
    buildAndDrawTetra();
}

function buildAndDrawCheckeredFloor() {
    var colors = [];
    var points = [];

    var i = 0;
    for (var z = 100.0; z > -100.0; z -= 5.0) {
        for (var x = -100.0; x < 100.0; x += 5.0) {
            if (i % 2) {
                colors.push(vec3(0.0, 0.5, 0.5));
                colors.push(vec3(0.0, 0.5, 0.5));
                colors.push(vec3(0.0, 0.5, 0.5));
                colors.push(vec3(0.0, 0.5, 0.5));
                colors.push(vec3(0.0, 0.5, 0.5));
                colors.push(vec3(0.0, 0.5, 0.5));
            }
            else {
                colors.push(vec3(0.0, 0.0, 0.0));
                colors.push(vec3(0.0, 0.0, 0.0));
                colors.push(vec3(0.0, 0.0, 0.0));
                colors.push(vec3(0.0, 0.0, 0.0));
                colors.push(vec3(0.0, 0.0, 0.0));
                colors.push(vec3(0.0, 0.0, 0.0));
            }
            points.push(vec3(x, 0.0, z));
            points.push(vec3(x, 0.0, z - 5.0));
            points.push(vec3(x - 5.0, 0.0, z - 5.0));

            points.push(vec3(x, 0.0, z));
            points.push(vec3(x - 5.0, 0.0, z - 5.0));
            points.push(vec3(x - 5.0, 0.0, z));
            ++i;
        }
        ++i;
    }

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    modelViewMatrix = mat4( 1.0,  0.0,  0.0, 5.0,
                          0.0,  1.0,  0.0, -10.0,
                          0.0,  0.0,  1.0, -30.0,
                          0.0,  0.0,  0.0, 1.0 );

    modelViewMatrix = mult(view, modelViewMatrix);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function buildAndDrawTetra() {
    //projectionMatrix = perspective(FOV, 1.0, .001, 100.0);

    colors = [];
    points = [];

    var vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];

    divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    var scale = mat4( scaleFactor, 0.0,  0.0, 0.0,
                      0.0,  scaleFactor, 0.0, 0.0,
                      0.0,  0.0,  scaleFactor, 0.0,
                      0.0,  0.0,  0.0, 1.0 );

    var translate = mat4( 1.0,  0.0,  0.0, transX,
                          0.0,  1.0,  0.0, transY,
                          0.0,  0.0,  1.0, transZ,
                          0.0,  0.0,  0.0, 1.0 );

    var rotateX = mat4( 1.0,  0.0,  0.0, 0.0,
                        0.0,  Math.cos(theta[xAxis]),  Math.sin(theta[xAxis]), 0.0,
                        0.0,  -Math.sin(theta[xAxis]),  Math.cos(theta[xAxis]), 0.0,
                        0.0,  0.0,  0.0, 1.0 );

    var rotateY = mat4(Math.cos(theta[yAxis]),  0.0,  -Math.sin(theta[yAxis]), 0.0,
                        0.0,  1.0,  0.0, 0.0,
                        Math.sin(theta[yAxis]),  0.0,  Math.cos(theta[yAxis]), 0.0,
                        0.0,  0.0,  0.0, 1.0 );

    var rotateZ = mat4( Math.cos(theta[zAxis]),  -Math.sin(theta[zAxis]),  0.0, 0.0,
                        Math.sin(theta[zAxis]),  Math.cos(theta[zAxis]),  0.0, 0.0,
                        0.0,  0.0,  1.0, 0.0,
                        0.0,  0.0,  0.0, 1.0 );

    scale = mult(rotateX, scale);
    scale = mult(rotateY, scale);
    scale = mult(rotateZ, scale);
    
    scale = mult(translate, scale);

    /*eye = vec3(
            radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(theta)
        );*/

    modelViewMatrix = mult(view, scale);

    //modelViewMatrix = lookAt(eye, at, up);
    //modelViewMatrix = lookAt([eyeX, eyeY, eyeZ], [0, 0, 0], [0, 1, 0]);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function triangle( a, b, c, color ) {
    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0)
    ];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}

function tetra( a, b, c, d ) {
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count ) {
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
    else {
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;
        
        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}