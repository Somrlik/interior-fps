/*
 Copyright 2017 Karel 'somrlik' Syrový

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as THREE from 'three';

class SceneRegistry {

  constructor() {
    this.loadedModels = false;

    this.scene = new THREE.Scene();

    this.models = [];

    this.makeLights();
    this.makeGround();
    this.makeModels();
    this.makeSkydome();
  }

  makeLights() {
    let light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
    light.position.set( 200, 200, 200);
    light.position.multiplyScalar( 1.3 );
    light.castShadow = true;
    light.shadow.camera.lookAt(new THREE.Vector3(0,0,0));
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    let d = 10;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;
    light.shadow.camera.far = 1000;
    light.shadow.darkness = 0.8;

    this.scene.add( light );
  }

  makeGround() {
    let material = new THREE.MeshPhongMaterial( { color: 0x3f3f3f} );
    let groundPlane = new THREE.PlaneGeometry(250, 250, 50, 50);
    let groundPlaneMesh = new THREE.Mesh(groundPlane, material);
    groundPlaneMesh.rotation.x = -Math.PI/2;
    groundPlaneMesh.receiveShadow = true;
    this.scene.add(groundPlaneMesh);
  }

  makeModels() {
    let geometry, material;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
        material = new THREE.MeshPhongMaterial( { color: 0x252525 + i*20} );

        let testMesh = new THREE.Mesh( geometry, material );
        testMesh.position.y = 1.8;
        testMesh.position.z = -1 - i;
        testMesh.position.x = i/2 - 0.5 + j;
        testMesh.castShadow = true;
        this.scene.add( testMesh );

        this.models.push(testMesh);
      }
    }
  }

  addCamera(cameraObject) {
    this.scene.add(cameraObject);
  }

  makeSkydome() {
    let textureloader = new THREE.TextureLoader();
    let texture = textureloader.load(require('./assets/textures/skydome.png'));

    let geometry = new THREE.SphereGeometry(400, 60, 40);
    let uniforms = {
      texture: {
        type: 't',
        value: texture
      }
    };

    let material = new THREE.ShaderMaterial( {
      uniforms:       uniforms,
      vertexShader:   document.getElementById('sky-vertex').textContent,
      fragmentShader: document.getElementById('sky-fragment').textContent
    });

    let skyBox = new THREE.Mesh(geometry, material);
    skyBox.scale.set(-1, 1, 1);
    skyBox.rotation.order = 'XZY';
    skyBox.renderDepth = 1000.0;
    this.scene.add(skyBox);
  }
}

export {SceneRegistry}
