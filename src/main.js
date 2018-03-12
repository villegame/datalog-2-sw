var angular  = require('angular');
var datalogUi = require('./core');

window.$ = window.jQuery = require('jquery');

window.Plotly = require('plotly.js/lib/index-basic');

window.socket = require('socket.io-client')();
window.Charts = require('./charts');

require('bootstrap/dist/css/bootstrap.min.css');
require('./style.css');
