$(document).ready(function() {

    'use strict'

    console.log("Loaded!");

    var rectangle = d3.select('#rect-demo').
        append("svg:svg").
        attr("width", 400).
        attr("height", 300);

    rectangle.append("svg:rect").
        attr("x", 100).
        attr("y", 100).
        attr("height", 100).
        attr("width", 200);

});
