/*
 Copyright 2017 Karel 'somrlik' Syrový

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as THREE from 'three';

const HUD_TEXTURE_X_RESOLUTION = 1024;
const HUD_TEXTURE_Y_RESOLUTION = 1024;
const FONT_SIZE = 30;
const PROPORTIONAL_CROSSHAIR_MULTIPLIER = 0.03;

class HUD {

  constructor() {

    this.hudCanvas = document.createElement('canvas');
    this.hudCanvas.width = HUD_TEXTURE_X_RESOLUTION;
    this.hudCanvas.height = HUD_TEXTURE_Y_RESOLUTION;
    this.hudBitmap = this.hudCanvas.getContext('2d');

    this.hudTexture = new THREE.Texture(this.hudCanvas);
    this.hudMaterial = new THREE.MeshBasicMaterial({
      map: this.hudTexture
    });
    this.hudMaterial.transparent = true;

    this.hudGeometry = new THREE.PlaneGeometry(0.2, 0.2);
    this.hudPlane = new THREE.Mesh(this.hudGeometry, this.hudMaterial /*material*/);

    this.hudDoom = document.createElement('img');
    this.hudDoom.src = require('./assets/textures/doomhud.png');

    this.hudBitmap.font = "Normal " + FONT_SIZE + "px monospace";
    this.hudBitmap.fillStyle = "rgba(245,245,245,0.3)";
  }

  renderDebug(context) {
    this.hudBitmap.textAlign = 'left';
    this.hudBitmap.strokeRect(0, 0, HUD_TEXTURE_X_RESOLUTION, HUD_TEXTURE_Y_RESOLUTION);
    this.hudBitmap.fillText('TIME: ' + Date.now(), 5, 30);

    let lookingAtObject = context.playerController.objectUnderCursor ? true : false;
    this.hudBitmap.fillText("Looking at object: " + lookingAtObject, 5, HUD_TEXTURE_Y_RESOLUTION - 5 - 3*FONT_SIZE);

    let headingVector = context.myCamera.getDirection()(new THREE.Vector3(0,0,0));
    let heading = "";
    heading += "X,Z,Y:";
    heading += " " + Math.round(headingVector.x*1000)/1000;
    heading += " " + Math.round(headingVector.z*1000)/1000;
    heading += " " + Math.round(headingVector.y*1000)/1000;
    this.hudBitmap.fillText("Heading: " + heading, 5, HUD_TEXTURE_Y_RESOLUTION - 5 - FONT_SIZE*2);

    let movement = "";
    movement += " W:" + context.playerInput.movingForwards;
    movement += " A:" + context.playerInput.movingLeftwards;
    movement += " S:" + context.playerInput.movingBackwards;
    movement += " D:" + context.playerInput.movingRightwards;
    this.hudBitmap.fillText('State: ' + movement, 5, HUD_TEXTURE_Y_RESOLUTION - 5 - FONT_SIZE);

    let inputs = context.playerInput.inputQueue.join(',');
    this.hudBitmap.fillText('Inputs: ' + inputs, 5, HUD_TEXTURE_Y_RESOLUTION - 5);
  }

  renderDoom(context) {
    let ratio = HUD_TEXTURE_X_RESOLUTION / this.hudDoom.width;
    this.hudBitmap.drawImage(this.hudDoom,
      0, 0,
      this.hudDoom.width, this.hudDoom.height,
      0, HUD_TEXTURE_Y_RESOLUTION - this.hudDoom.height * ratio,
      HUD_TEXTURE_X_RESOLUTION, this.hudDoom.height * ratio
    );
  }

  render(context) {
    this.hudBitmap.clearRect(0, 0, HUD_TEXTURE_X_RESOLUTION, HUD_TEXTURE_Y_RESOLUTION);
    this.hudBitmap.strokeStyle = "rgba(255,0,0,1)";
    if (context.debug) this.renderDebug(context);
    if (context.playerInput.doomMode) this.renderDoom(context);

    // TODO: Render crosshair proportionally to resolution of viewport
    if (context.playerController.objectUnderCursor) {
      this.hudBitmap.strokeStyle = 'rgba(77, 66, 55, 1)';
      this.hudBitmap.textAlign = 'center';
      this.hudBitmap.fillText("Click to change color", HUD_TEXTURE_X_RESOLUTION/2, HUD_TEXTURE_Y_RESOLUTION/2 + 100);
    }
    this.hudBitmap.beginPath();
    this.hudBitmap.arc(HUD_TEXTURE_X_RESOLUTION/2, HUD_TEXTURE_Y_RESOLUTION/2, ((context.viewportW+320)/2) * PROPORTIONAL_CROSSHAIR_MULTIPLIER, 0, 2*Math.PI);
    this.hudBitmap.stroke();
    this.hudBitmap.beginPath();
    this.hudBitmap.arc(HUD_TEXTURE_X_RESOLUTION/2, HUD_TEXTURE_Y_RESOLUTION/2, ((context.viewportW+320)/2) * PROPORTIONAL_CROSSHAIR_MULTIPLIER/8, 0, 2*Math.PI);
    this.hudBitmap.fill();

    this.hudTexture.needsUpdate = true;
  }

}

export {HUD};
