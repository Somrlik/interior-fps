/*
 Copyright 2017 Karel 'somrlik' Syrový

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as THREE from 'three';

const DEFAULT_CAMERA_MOVEMENT_VELOCITY = 1.0;

class PlayerController {

  constructor(myCamera, playerInput) {
    this.camera = myCamera.camera;
    this.frontVelocity = 0;
    this.sideVelocity = 0;
    this.verticalVelocity = 0;
    this.playerInput = playerInput;

    this.mouseEnabled = false;

    this.objectUnderCursor = undefined;

    this.raycaster = new THREE.Raycaster();
  }

  update(context) {

    if (this.playerInput.movingForwards) {
      this.frontVelocity = DEFAULT_CAMERA_MOVEMENT_VELOCITY;
    }
    else if (this.playerInput.movingBackwards ) {
      this.frontVelocity = -DEFAULT_CAMERA_MOVEMENT_VELOCITY;
    } else {
      this.frontVelocity = 0;
    }

    if (this.playerInput.movingLeftwards) {
      this.sideVelocity = -DEFAULT_CAMERA_MOVEMENT_VELOCITY;
    }
    else if (this.playerInput.movingRightwards) {
      this.sideVelocity = DEFAULT_CAMERA_MOVEMENT_VELOCITY;
    }
    else {
      this.sideVelocity = 0;
    }

    if (this.playerInput.movingUp) {
      this.verticalVelocity = DEFAULT_CAMERA_MOVEMENT_VELOCITY;
    } else if (this.playerInput.movingDown) {
      this.verticalVelocity = -DEFAULT_CAMERA_MOVEMENT_VELOCITY;
    } else {
      this.verticalVelocity = 0;
    }

    // Raycast for intersections
    if (context.playerController.mouseEnabled) {
      this.raycaster.set(context.myCamera.getObject().getWorldPosition(), context.myCamera.getDirection()(new THREE.Vector3(0,0,0)));
    } else {
      this.raycaster.setFromCamera(context.playerInput.mousePositionIn2D, context.myCamera.camera);
    }

    let intersects = this.raycaster.intersectObjects(context.sceneRegistry.models);
    if (intersects.length != 0) {
      this.objectUnderCursor = intersects[0].object;
    } else {
      this.objectUnderCursor = undefined;
    }

  }

  getObjectUnderCursor() {
    return this.objectUnderCursor;
  }

}

export {PlayerController};
