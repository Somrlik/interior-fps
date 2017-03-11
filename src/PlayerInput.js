/*
 Copyright 2017 Karel 'somrlik' Syrový

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as THREE from 'three';
import {Logger} from './Logger';

const FORWARDS_BUTTON = 87;
const BACKWARDS_BUTTON = 83;
const LEFTWARDS_BUTTON = 65;
const RIGHTWARDS_BUTTON = 68;
const UP_BUTTON = 81;
const DOWN_BUTTON = 69;
const DEBUG_BUTTON = 36;

const MAX_CONTROLS_QUEUE_SIZE = 5;

class PlayerInput {

  constructor() {
    this.inputQueue = [];

    this.movingForwards = false;
    this.movingBackwards = false;

    this.movingLeftwards = false;
    this.movingRightwards = false;

    this.movingUp = false;
    this.movingDown = false;

    this.clickedIn2D = false;
    this.mousePositionIn2D = new THREE.Vector2();

    this.clickedIn3D = false;

    this.debugAllowed = false;

    this.doomMode = false;

    this.parentContext = false;

    this.enabled = true;
  }

  updateInputQueue(character) {
    if (this.inputQueue.length >= MAX_CONTROLS_QUEUE_SIZE) this.inputQueue.shift();
    this.inputQueue.push(character);
    if (this.inputQueue.join('') == 'iddqd') {
      Logger.log("DOOM mode enabled");
      if (! this.doomMode){
        let cont = document.createElement('div');
        cont.id = "music";
        cont.innerHTML += '<iframe width="0" height="0" src="http://www.youtube.com/embed/u6i9QkKk0Ik?autoplay=1" frameborder="0" allowfullscreen></iframe>';
        document.body.appendChild(cont);
      }
      this.doomMode = true;
    }
  }

  handleKeyDown(event) {
    if (! this.enabled) return;
    this.updateInputQueue(event.key);
    switch (event.keyCode) {
      case FORWARDS_BUTTON:
        this.movingForwards = true;
        break;
      case BACKWARDS_BUTTON:
        this.movingBackwards = true;
        break;
      case LEFTWARDS_BUTTON:
        this.movingLeftwards = true;
        break;
      case RIGHTWARDS_BUTTON:
        this.movingRightwards = true;
        break;
      case UP_BUTTON:
        this.movingUp = true;
        break;
      case DOWN_BUTTON:
        this.movingDown = true;
        break;
      case DEBUG_BUTTON:
        this.debugAllowed = !this.debugAllowed;
        this.parentContext.debug = this.debugAllowed;
        if (this.debugAllowed) {
          Logger.show();
        } else {
          Logger.hide();
        }
        break;
    }
  }

  handleKeyUp(event) {
    switch (event.keyCode) {
      case FORWARDS_BUTTON:
        this.movingForwards = false;
        break;
      case BACKWARDS_BUTTON:
        this.movingBackwards = false;
        break;
      case LEFTWARDS_BUTTON:
        this.movingLeftwards = false;
        break;
      case RIGHTWARDS_BUTTON:
        this.movingRightwards = false;
        break;
      case UP_BUTTON:
        this.movingUp = false;
        break;
      case DOWN_BUTTON:
        this.movingDown = false;
        break;
      case DEBUG_BUTTON:
        break;
    }
  }

  handleInput(parentContext) {
    this.parentContext = parentContext;
    this.debugAllowed = parentContext.debug;
    let context = this;
    let contextElement = document.body;
    Logger.log("Attached PlayerInput to " + contextElement);

    contextElement.addEventListener('keyup', function (event) {
      context.handleKeyUp(event);
    });
    contextElement.addEventListener('keydown', function (event) {
      context.handleKeyDown(event);
    });
  }

}

export {PlayerInput};
