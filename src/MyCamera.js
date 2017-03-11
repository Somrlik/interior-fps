/*
 Copyright 2017 Karel 'somrlik' Syrový

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as THREE from 'three';
import {HUD} from './HUD';
import {Logger} from './Logger';

const DEFAULT_CAMERA_FOV = 75;
const DEFAULT_CAMERA_ASPECT = 4/3;
const CAMERA_NEAR_PLANE = 0.01;
const CAMERA_FAR_PLANE = 1000;
// Default position is 1.8 meters from the ground?
const CAMERA_DEFAULT_POSITION = new THREE.Vector3(0, 1.8, 0);

const CAMERA_MOVEMENT_MULTIPLIER = 0.002;

class MyCamera {
  constructor(parent) {
    this.parent = parent;

    this.HUD = new HUD();

    this.aspectRatio = parent.viewportW / parent.viewportH;
    this.fov = DEFAULT_CAMERA_FOV;
    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, CAMERA_NEAR_PLANE, CAMERA_FAR_PLANE);

    this.camera.rotation.set(0,0,0);

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(this.camera);

    this.pitchObject.add(this.HUD.hudPlane);

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.copy(CAMERA_DEFAULT_POSITION);
    this.yawObject.add(this.pitchObject);

    // Position HUD in front of camera, so that it fills the whole screen according to fov
    let side = (0.1/Math.sin((this.fov / 2) * Math.PI / 180)) * Math.sin((90 - (this.fov / 2)) * Math.PI / 180);
    let vector = new THREE.Vector3(0,0,-side);
    vector.add(this.camera.position);

    vector.applyQuaternion(this.camera.quaternion);
    this.HUD.hudPlane.position.copy(vector);

    this.mouseEventListener = (event) => {
      this.onMouseMove(event, this);
    };

    document.addEventListener('mousemove', this.mouseEventListener, false);

  }

  onMouseMove(event, myCamera) {

    if (! myCamera.parent.playerController.mouseEnabled) {
      myCamera.parent.playerInput.mousePositionIn2D.x = event.clientX;
      myCamera.parent.playerInput.mousePositionIn2D.y = event.clientY;
      return;
    }

    let PI_2 = Math.PI / 2;

    let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    myCamera.yawObject.rotation.y -= movementX * CAMERA_MOVEMENT_MULTIPLIER;
    myCamera.pitchObject.rotation.x -= movementY * CAMERA_MOVEMENT_MULTIPLIER;

    myCamera.pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, myCamera.pitchObject.rotation.x ) );

    myCamera.camera.matrixWorldNeedsUpdate = true;
  }

  /**
   * Gets parent object of camera
   * @returns {THREE.Object3D|Object3D}
   */
  getObject() {
    return this.yawObject;
  }

  getDirection() {
    let direction = new THREE.Vector3(0,0,-1);
    let rotation = new THREE.Euler(0,0,0,'YXZ');

    return (v) => {
      rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0);

      v.copy(direction).applyEuler(rotation);

      return v;
    };
  }

  render(context) {
    this.HUD.render(context);
  }

  update(context) {

  }
}

export {MyCamera};
