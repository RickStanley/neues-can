// ----------- ATTENTION --------------
// Delete this.after first use
// Broserify already wraps our code into IIFE, but if you exceptical about this
// you can use any of the following functions to wait for DOM
// $(function () { "use strict"; /*BODY*/ });  // this is short for jQuery.ready();
// document.addEventListener("DOMContentLoaded", function (event) { /*BODY*/ }, false);
// window.addEventListener("load", function , false);
import sayHello from './global/globals';
document.write(`<br> ${sayHello("User")}`);
