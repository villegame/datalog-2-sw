var angular  = require('angular');
var datalogUi = require('./core');

window.$ = window.jQuery = require('jquery');

// TODO: Plotly
//window.Plotly = require('plotly.js/dist/plotly-basic');

window.socket = require('socket.io-client')();
window.Charts = require('./charts');

//require('bootstrap');
require('bootstrap/dist/css/bootstrap.min.css');
require('./style.css');
