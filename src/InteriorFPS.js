/*
 Copyright 2017 Karel 'somrlik' Syrový

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import Stats from './lib/Stats';
import Detector from './lib/Detector';
import * as THREE from 'three';
import {Logger} from './Logger';
import {MyCamera} from './MyCamera';
import {PlayerInput} from './PlayerInput';
import {PlayerController} from "./PlayerController";
import {SceneRegistry} from './SceneRegistry';

class InteriorFPS {

  constructor() {
    this.stats = new Stats();
    this.container = document.createElement('div');
    this.container.id = "webgl-container";

    this.debug = false;
    this.scene = false;
    this.renderer = false;
    /*
    this.viewportW = window.innerWidth;
    this.viewportH = window.innerHeight;
    */

    this.viewportW = 800;
    this.viewportH = 600;

    this.animating = true;

    this.myCamera = new MyCamera(this);

    this.playerInput = new PlayerInput();

    this.playerController = new PlayerController(this.myCamera, this.playerInput);

    this.sceneRegistry = new SceneRegistry();

    // Attach camera tracking object to scene
    this.sceneRegistry.addCamera(this.myCamera.getObject());

    Logger.log("Constructed InteriorFPS...");

    if (module.hot) {
      let context = this;
      module.hot.dispose(() => {
        InteriorFPS.reloadEverything(context);
      });
    }
  }

  static reloadEverything(context) {
    Logger.log("[HMR] Disposing of side-effects of hot reload...");
    context.container.parentNode.removeChild(context.container);
    context.container.innerHTML = "";
    // Just delete the whole object and let it rebuild?
    context.animating = false;
    // Remove some listeners
    context.playerInput.enabled = false;
    // I mean this works decently...
    context.prototype = undefined;
  }

  run() {
    let context = this;
    if (! Detector.webgl) {
      Detector.addGetWebGLMessage();
      Logger.log("Haven't detected any WebGL context. Exiting...");
      return;
    }

    if (this.debug) {
      Logger.log("Enabled debug  mode...");
      this.stats.showPanel(0);
      this.container.appendChild(this.stats.dom);
      Logger.log("Appended stats to container");
      Logger.attach(document.body);
      Logger.log("Appended logger to body");
    }

    document.body.appendChild(this.container);

    // Make a renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( this.viewportW, this.viewportH );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Attach handlers for common I/O
    InteriorFPS.attachEventHandlers(this);
    this.playerInput.handleInput(this);

    // Append renderer to DOM
    this.container.appendChild(this.renderer.domElement);
    Logger.log("Ending run, starting animation");

    // Set first delta
    this.prevTime = performance.now();
    this.delta = 1e-6;
    this.animate();
  }

  static attachEventHandlers(context) {

    window.addEventListener('resize', () => {
      InteriorFPS.onWindowResize(context);
    }, false);

    // Attach clicking event
    context.renderer.domElement.addEventListener('click', (event) => {
      // Reroute clicking event if pointerLock is already attached
      if (context.playerController.mouseEnabled) {
        context.playerInput.clickedIn3D = true;
        return;
      }
      Logger.log("Requested browser to do pointerLock on renderer.");
      let element = event.target;
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
      element.requestPointerLock();

      context.playerController.mouseEnabled = true;

    }, false);

    // Attach pointerLock for the canvas
    let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    // TODO: Display warning?
    if (havePointerLock) {
      Logger.log("I have pointerLock available.");
    } else {
      Logger.log("No pointerLock controls!!!");
    }

    document.addEventListener( 'pointerlockchange', (event) => {
      context.pointerLockChange(context, event);
    }, false );
    document.addEventListener( 'mozpointerlockchange', (event) => {
      context.pointerLockChange(context, event);
    }, false );
    document.addEventListener( 'webkitpointerlockchange', (event) => {
      context.pointerLockChange(context, event);
    }, false );
    document.addEventListener( 'pointerlockerror', (event) => {
      context.pointerLockError(context, event);
    }, false );
    document.addEventListener( 'mozpointerlockerror', (event) => {
      context.pointerLockError(context, event);
    }, false );
    document.addEventListener( 'webkitpointerlockerror', (event) => {
      context.pointerLockError(context, event);
    }, false );

  }

  static onWindowResize(context) {
    context.viewportW = window.innerWidth;
    context.viewportH = window.innerHeight;
    context.myCamera.camera.aspect = context.viewportW / context.viewportH;
    context.myCamera.camera.updateProjectionMatrix();
    context.myCamera.update(context);
    context.renderer.setSize( context.viewportW, context.viewportH );
    Logger.log("Resized window - updated camera and renderer");
  }

  pointerLockChange(context, event) {
    if (document.pointerLockElement == undefined) {
      Logger.log("PointerLock released.");
      context.playerController.mouseEnabled = false;
    } else {
      Logger.log("PointerLock attached.");
      context.playerController.mouseEnabled = true;
    }
  }

  pointerLockError(context, event) {
    Logger.log("Caught pointerLock error as " + event.type);
  }

  animate() {
    let context = this;
    if (this.animating) {
      requestAnimationFrame(() => {
        context.animate();
      });
    }

    // Compute current delta
    let time = performance.now();
    this.delta = (time - this.prevTime ) / 1000;

    // Test cube rotation
    for (let i = 0; i < this.sceneRegistry.models.length; i++) {
      let model = this.sceneRegistry.models[i];
      model.rotation.x += 0.03 + Math.random()/10;
      model.rotation.y += 0.03 ;
    }

    // Update everything from player's input to be ready to chew it in frame
    this.playerController.update(context);

    if (this.playerInput.clickedIn2D) {
      this.playerInput.clickedIn2D = false;
      Logger.log("User clicked in 2D - that means pointerLock is not supported");
    }

    if (this.playerInput.clickedIn3D) {
      this.playerInput.clickedIn3D = false;
      Logger.log("User clicked in 3D");

      let objectUnderCursor = this.playerController.getObjectUnderCursor();
      if (objectUnderCursor) objectUnderCursor.material.color.set(0xffffff * Math.random());
    }

    // Camera movement
    let velocity = new THREE.Vector3(
      this.playerController.sideVelocity * this.delta,
      this.playerController.verticalVelocity * this.delta,
      -this.playerController.frontVelocity * this.delta
    );
    this.myCamera.getObject().translateX(velocity.x);
    this.myCamera.getObject().translateY(velocity.y);
    this.myCamera.getObject().translateZ(velocity.z);

    // Update camera and render HUD
    this.myCamera.render(context);

    // Render everything
    this.renderer.render(this.sceneRegistry.scene, this.myCamera.camera);
    if (this.debug) this.stats.update();
    this.prevTime = time;
  }

}

export {InteriorFPS as default};
