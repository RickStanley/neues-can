// ----------- ATTENTION --------------
// Delete this.after first use
// Use one of these functions to start script onWindowLoad
// This one is for routines that need to start immediatetly (self executing function)
// (function ( window, document, $, undefined ) { "use strict"; BODY })( window, document, jQuery);
// This is for routines that need to start AFTER the DOM/HTML document load(s)
// $(function () { "use strict"; /*BODY*/ });  // this is short for jQuery.ready();
// document.addEventListener("DOMContentLoaded", function (event) { /*BODY*/ }, false);
// window.addEventListener("load", function , false);

// For cross browser, just uncomment this block one of these blocks
// and execute scripts from the onReady(); method at the end
// you don't need to modify anything from here
// function bindReady(handler){
//     var called = false     
//     function ready() {
//         if (called) return
//         called = true
//         handler()
//     }     
//     if ( document.addEventListener ) {
//         document.addEventListener( "DOMContentLoaded", function(){
//             ready()
//         }, false )
//     } else if ( document.attachEvent ) { 
//         if ( document.documentElement.doScroll && window == window.top ) {
//             function tryScroll(){
//                 if (called) return
//                 if (!document.body) return
//                 try {
//                     document.documentElement.doScroll("left")
//                     ready()
//                 } catch(e) {
//                     setTimeout(tryScroll, 0)
//                 }
//             }
//             tryScroll()
//         }
//         document.attachEvent("onreadystatechange", function(){     
//             if ( document.readyState === "complete" ) {
//                 ready()
//             }
//         })
//     }
//     if (window.addEventListener)
//         window.addEventListener('load', ready, false)
//     else if (window.attachEvent)
//         window.attachEvent('onload', ready)
//     /*  else  // use this 'else' statement for very old browsers :)
//         window.onload=ready
//     */
// }
// readyList = []      
// function onReady(handler) {  
//     if (!readyList.length) { 
//         bindReady(function() { 
//             for(var i=0; i<readyList.length; i++) { 
//                 readyList[i]() 
//             } 
//         }) 
//     }   
//     readyList.push(handler) 
// }

// Usage:
// onReady(function () {});

// Dustin Diaz's version:
// function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}

// Usage:
// r(function () {});