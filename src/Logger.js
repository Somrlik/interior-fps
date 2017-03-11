/*
Copyright 2017 Karel 'somrlik' Syrový

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class LoggerClass {

  constructor() {
    this.dom = document.createElement('div');
    this.dom.id = 'logger-container';
    this.dom.classList.add('logger');
    this.dom.style.overflowX = 'auto';

    this.startTime = Date.now();
    this.messages = [];
    this.history = 100;
    this.running = true;
  }

  attach(element) {
    element.appendChild(this.dom);
  }

  hide() {
    this.dom.classList.add('hidden');
  }

  show() {
    this.dom.classList.remove('hidden');
  }

  log(str) {
    if (! this.running) return;
    let message = '';
    message += '<p>';
    message += '<span>';
    let diff = new Date(Date.now() - this.startTime);
    message += LoggerClass.pad(diff.getMinutes(), 2) + ":" + LoggerClass.pad(diff.getSeconds(), 2) + ":" + LoggerClass.pad(diff.getMilliseconds(), 3) + " > ";
    message += '</span>';
    message += str + '</p>';

    if (this.messages.length > this.history) {
      this.messages.shift();
    }
    this.messages.push(message);

    this.dom.innerHTML = this.messages.join('');

    this.dom.scrollTop = this.dom.scrollHeight;
  }

  static pad(num, length) {
    if ((''+num).length >= length) return num;
    let lead = '0' + new Array(length).join('0');
    return (lead + num).slice(-length);
  }

  stop() {
    this.running = false;
  }
}

let Logger = new LoggerClass();

export {Logger};
