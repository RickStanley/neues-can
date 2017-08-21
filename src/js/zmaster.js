// jshint esversion: 6
// ----------- ATTENTION --------------
// Delete this.after first use
// Broserify already wraps our code into IIFE, but if you exceptical about this
// you can use any of the following functions to wait for DOM
// $(function () { "use strict"; /*BODY*/ });  // this is short for jQuery.ready();
// document.addEventListener("DOMContentLoaded", function (event) { /*BODY*/ }, false);
// window.addEventListener("load", function , false);
import * as gl from './global/globals';
const div = document.getElementById('container');
div.innerHTML += `<br> ${ gl.sayHello("User")}`;
const square = new gl.Rectangle(10, 10);
div.innerHTML += `<br> Am I a Rectangle squared or a square rectangled? <br> Area: ${square.area}`;