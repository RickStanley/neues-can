import 'babel-polyfill';
function start(f){ /in/.test(document.readyState)?setTimeout(start,5,f) : f()}
start(() => {
    console.log('Ready!');
});