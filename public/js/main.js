$(document).ready(function() {

    'use strict'

    console.log("Loaded!");

    // Simple Rectangle Demo
    var rect_demo = d3.select('#rect-demo').
        append("svg:svg").
        attr("width", 400).
        attr("height", 300);

    rect_demo.append("svg:rect").
        attr("x", 100).
        attr("y", 100).
        attr("height", 100).
        attr("width", 200);

    // Bar Graph Demo
    var book_data = [
        {year: 2000, books: 10},
        {year: 2001, books: 23},
        {year: 2002, books: 41},
        {year: 2003, books: 21},
        {year: 2004, books: 62}
    ];

    var largest_data = d3.max(book_data, function(d) { return d.books });

    var barWidth = 40;
    var barGutter = 10;
    var bottom_padding = 30;
    var width = book_data.length * (barWidth + barGutter);
    var height = 200;

    var bar_demo = d3.select('#rect-demo').
        append('svg:svg').
        attr('height', height + bottom_padding).
        attr('width', width);

    var x_scale = d3.scale.linear().
        domain([0, book_data.length]).
        range([0, width + barGutter]);
    var y_scale = d3.scale.linear().
        domain([0, largest_data]).
        range([0, height]);

    bar_demo.selectAll('rect').
        data(book_data).
        enter().
        append("svg:rect").
        attr("x", function(d, i) { return x_scale(i); }).
        attr("y", function(d) { return height - y_scale(d.books); }).
        attr("width", barWidth).
        attr("height", function(d) { return y_scale(d.books); });

    bar_demo.selectAll('text').
        data(book_data).
        enter().
        append("svg:text").
        attr("x", function(d, i) { return x_scale(i); }).
        attr("y", function(d) { return height - y_scale(d.books); }).
        attr("dx", barWidth/2).
        attr("dy", "1.2em").
        attr("text-anchor", "middle").
        text(function(d) { return d.books; }).
        attr("fill", "white");

    bar_demo.selectAll('text.xAxis').
        data(book_data).
        enter().
        append('svg:text').
        attr('class', 'xAxis').
        attr('x', function(d, i) { return x_scale(i); }).
        attr('y', height + bottom_padding).
        attr("dx", barWidth/2).
        attr('style', 'font-size: 12; font-family: Helvetica, sans-serif;')
        attr('text-anchor', 'middle').
        text(function(d) { return d.year; }).
        attr('fill', 'white');
});
