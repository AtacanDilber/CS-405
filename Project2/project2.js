
// ATACAN DILBER
// 03.12.2024

function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


function SetSpecularLight(slider) {
    if (meshDrawer) {  // Assuming meshDrawer is your global instance
        meshDrawer.SetSpecularLight(slider.value / 50);
    }
}
class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
		//this.colorLoc = gl.getUniformLocation(this.prog, 'color');
		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
		this.texCoordLoc2 = gl.getAttribLocation(this.prog, 'texCoord2');

		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();
		this.lightPos = [0, 0, 2];

		this.numTriangles = 0;
        this.texture1 = null;
        this.texture2 = null;
		/**
		 * @Task2 : You should initialize the required variables for lighting here
		 */
		
		// Similar to the above code, initialize the remaining variables
		// to access and adjust variables in the main function of the
		// fragment shader program. Kind of a pointer logic applies here:
		this.normalLoc = gl.getAttribLocation(this.prog, 'normal');
		this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
		this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
    	this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
		this.normalbuffer = gl.createBuffer();

		this.specularLoc = gl.getUniformLocation(this.prog, 'specular');
		this.viewDirLoc = gl.getUniformLocation(this.prog, 'viewDir');
		this.textureCountLoc = gl.getUniformLocation(this.prog, 'textureCount');
		
	}

	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// update texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;

		/**
		 * @Task2 : You should update the rest of this function to handle the lighting
		 */

		// Similar to the above code, we need to bind normal buffer:
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);
	}


	draw(trans) {
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.mvpLoc, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
		gl.uniform1i(this.textureCountLoc, textureCount);
        if (this.texture1) {
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(gl.getUniformLocation(this.prog, 'tex'), 0);
        }
        if (this.texture2) {
            gl.activeTexture(gl.TEXTURE1);
            gl.uniform1i(gl.getUniformLocation(this.prog, 'tex2'), 1);
        }


		/**
		 * @Task2 : You should update this function to handle the lighting
		 */

		///////////////////////////////

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.enableVertexAttribArray(this.normalLoc);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);

		updateLightPos();
		
		gl.uniform3fv(this.lightPosLoc, normalize([lightX, lightY, 2]));
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
		this.SetSpecularLight(document.getElementById('specular-light-setter').value / 50);
		gl.uniform3fv(this.viewDirLoc, normalize([0, 0, -1])); // Fixed view direction
        const slider = document.getElementById('specular-light-setter');
        if (slider) {
            this.SetSpecularLight(slider.value / 50);
        };
		

	}

	setTexture(img) {
		const texture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);  
		gl.bindTexture(gl.TEXTURE_2D, texture);
	
	
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA, 
			gl.RGBA,  
			gl.UNSIGNED_BYTE,
			img);
	
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
	
		gl.useProgram(this.prog);
		const sampler = gl.getUniformLocation(this.prog, 'tex');
		gl.uniform1i(sampler, 0);
		this.texture1 = texture;  
	}
	
	setTexture2(img2) {
		const texture2 = gl.createTexture();
		gl.activeTexture(gl.TEXTURE1);  
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			img2
		);
	
		if (isPowerOf2(img2.width) && isPowerOf2(img2.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
	
		gl.useProgram(this.prog);
		const sampler2 = gl.getUniformLocation(this.prog, 'tex2');
		gl.uniform1i(sampler2, 1);
		this.texture2 = texture2;  // Store reference to texture
	}
	

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	enableLighting(show) {
		console.error("Task 2: You should implement the lighting and implement this function ");
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */
		gl.useProgram(this.prog);
        gl.uniform1i(this.enableLightingLoc, show ? 1 : 0);
	}
	
	setAmbientLight(ambient) {
		console.error("Task 2: You should implement the lighting and implement this function ");
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */
		gl.useProgram(this.prog);
        gl.uniform1f(this.ambientLoc, ambient);
		
	}

	SetSpecularLight(intensity)
	{
		gl.useProgram(this.prog);
		gl.uniform1f(this.specularLoc, intensity);
	}
}



function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader source code
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec2 texCoord2;
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 

			void main()
			{
				v_texCoord = texCoord;
				v_normal = mat3(mvp) * normal;

				gl_Position = mvp * vec4(pos,1);
			}`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
			precision mediump float;

			uniform bool showTex;
			uniform bool enableLighting;
			uniform sampler2D tex;
			uniform sampler2D tex2;
			uniform vec3 color; 
			uniform vec3 lightPos;
			uniform float ambient;

			varying vec2 v_texCoord;
			varying vec3 v_normal;

			uniform int textureCount;
			uniform float specular; // Specular intensity
			uniform vec3 viewDir;   // View direction
			float shininess = 10.0;
			void main()
			{
				vec4 texColor = texture2D(tex, v_texCoord);
				vec4 texColor2 = texture2D(tex2, v_texCoord);
				vec3 normal = normalize(v_normal);
				vec3 lightDir = normalize(lightPos); // Direction to the light source
				
				
				if (showTex && enableLighting) 
				{
					if(textureCount > 1)
					{
						vec3 ambientLight = ambient * texColor.rgb * texColor2.rgb;
				
						// Diffuse lighting
						float diff = max(dot(normal, -lightDir), 0.0);
						vec3 diffuseLight = diff * texColor.rgb * texColor2.rgb;

						// Specular lighting (Phong reflection model)
						vec3 reflectDir = reflect(lightDir, normal); // Reflected light direction
						float spec = diff > 0.0 ? pow(max(dot(viewDir, reflectDir), 0.0), 5.0) : 0.0; // Specular only if facing light
						float specularFactor = pow(spec, shininess);
						vec3 specularLight = specular * specularFactor * spec * vec3(1.0, 1.0, 1.0); // Adjust by specular intensity

						vec3 finalColor = (ambientLight + diffuseLight + specularLight);
						vec4 textureColor1 = texture2D(tex, v_texCoord);
						vec4 textureColor2 = texture2D(tex2, v_texCoord);
						vec4 blendedTexture = mix(textureColor1, textureColor2, 0.5);
						finalColor = (finalColor * blendedTexture.rgb);
						gl_FragColor = vec4(finalColor, blendedTexture.a);				
					}
					else
					{
						// Ambient lighting
						vec3 ambientLight = ambient * texColor.rgb;
						
						// Diffuse lighting
						float diff = max(dot(normal, -lightDir), 0.0);
						vec3 diffuseLight = diff * texColor.rgb;

						// Specular lighting (Phong reflection model)
						vec3 reflectDir = reflect(lightDir, normal); // Reflected light direction
						float spec = diff > 0.0 ? pow(max(dot(viewDir, reflectDir), 0.0), 5.0) : 0.0; // Specular only if facing light
						float specularFactor = pow(spec, shininess);
						vec3 specularLight = specular * specularFactor * spec * vec3(1.0, 1.0, 1.0); // Adjust by specular intensity

						vec3 finalColor = (ambientLight + diffuseLight + specularLight);
						finalColor = (clamp(finalColor, 0.0, 1.0));
						gl_FragColor = vec4(finalColor, v_texCoord);
					}
				} else if (showTex) 
				 {
					if(textureCount > 1)
					{
						vec3 ambientLight = ambient * texColor.rgb * texColor2.rgb;
				
						// Diffuse lighting
						float diff = max(dot(normal, -lightDir), 0.0);
						vec3 diffuseLight = diff * texColor.rgb * texColor2.rgb;

						vec3 finalColor = (ambientLight + diffuseLight);
						vec4 textureColor1 = texture2D(tex, v_texCoord);
						vec4 textureColor2 = texture2D(tex2, v_texCoord);
						vec4 blendedTexture = mix(textureColor1, textureColor2, 0.5);
						finalColor = (finalColor * blendedTexture.rgb);
						gl_FragColor = vec4(finalColor, blendedTexture.a);	

						gl_FragColor = mix(textureColor1, textureColor2, 0.5);				
					}
					else
					{
						vec3 ambientLight = ambient * texColor.rgb;
				
						// Diffuse lighting
						float diff = max(dot(normal, -lightDir), 0.0);
						vec3 diffuseLight = diff * texColor.rgb;

						vec3 finalColor = (ambientLight + diffuseLight);
						vec4 textureColor1 = texture2D(tex, v_texCoord);
						vec4 textureColor2 = texture2D(tex2, v_texCoord);
						vec4 blendedTexture = mix(textureColor1, textureColor2, 0.5);
						finalColor = (finalColor * blendedTexture.rgb);
						gl_FragColor = vec4(finalColor, blendedTexture.a);	

						gl_FragColor = mix(textureColor1, textureColor2, 0.5);	
					}				
				} else {
					gl_FragColor = vec4(1.0, 0, 0, 1.0);
				}
			}`;

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
	const translationSpeed = 1;
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;
}
///////////////////////////////////////////////////////////////////////////////////