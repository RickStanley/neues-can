// jshint esversion: 6
// Global or constants go in here
class Rectangle {
    
    constructor(width, height) {
        this._width = width;
        this._height = height;
    }
    get width () {
        return this._width;
    }
    set width (width) {
        this._width = width;
    }
    get height () {
        return this._height;
    }
    set height (height) {
        this._height = height;
    }
    get area () {
        return this.calcArea();
    }
    calcArea () {
        return this._height * this._height;
    }
}
function sayHello(name) {
    return `Hello ${name}, I'm globals.js, you're using ES6!`;
}

export { sayHello, Rectangle };