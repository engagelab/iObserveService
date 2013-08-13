iObserveApp.controller('ChartCtrl-frequencyMap', function($scope, $timeout, iObserveData) {

    var chartData = [];

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", 1024)
        .attr("height", 723)
        .attr("top", 45);

    var processData = function () {

        for(var i=0; i<$scope.eventCollection.length; i++) {
            var eventSubset = $scope.eventCollection[i];
            for(var j=0; j<eventSubset.length; j++) {
                var event = eventSubset[j];
                var dataPoint = {
                    type : i.toString(),
                    x : event.xpos,
                    y : event.ypos,
                    radius : getEventRadius(event),
                    color : getEventColor(event)
                }
                chartData.push(dataPoint);
            }
        }
    };


    var getEventRadius = function (event) {
        return event.interactions.length * 5;
    }

    var color = d3.scale.category20b();

    // At present, visitors are always the same count in each interaction item
    var getEventColor = function (event) {
        switch(event.interactions[0].visitors.length) {
            case 1 : return color(8); break;
            case 2 : return color(7); break;
            case 3 : return color(6); break;
            case 4 : return color(5); break;
            default : break;
        }
    }

    $scope.$watch('chartPartialLoaded', function(newValue) {
        iObserveData.doGetEventsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id).then(function(resultData) {
            $scope.sessionDetails = resultData.sessions;
            $scope.eventCollection = resultData.events;
            processData();
            drawChart();
            $timeout(assignCheckBoxes, 0);
        })
    });

    var drawChart = function () {
        var circle = svg.selectAll("circle")
            .data(chartData)
            .enter()
            .append("svg:circle");

        d3.selectAll("circle")
            .style("stroke", "gray")
            .attr("r", function(d) { return d.radius; })
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("fill", function(d) { return d.color; });
    }

    var assignCheckBoxes = function () {
        d3.selectAll(".filter_button")
            .property("checked", true)
            .on("change", function() {
                var type = this.value,
                    display = this.checked ? "inline" : "none";

                svg.selectAll("circle")
                    .filter(function(d) { return d.type === type; })
                    .attr("display", display);
            });
    }
});







/*  Old demographics test
 var sampleChartData = [
 {
 id: 1,
 type: "a",
 radius: 40,
 x: 50,
 y: 50
 }
 ];


 var svg = d3.select("#chart")
 .append("svg")
 .attr("width", 100)
 .attr("height", 100);

 var circle = svg.selectAll("circle")
 .data(sampleChartData)
 .enter()
 .append("svg:circle");

 d3.selectAll("circle")
 .style("stroke", "gray")
 .style("fill", "white")
 .attr("r", function(d) { return d.radius; })
 .attr("cx", function(d) { return d.x; })
 .attr("cy", function(d) { return d.y; });

 d3.selectAll(".filter_button")
 .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
 .on("mouseout", function(){d3.select(this).style("fill", "white");})
 .property("checked", false)
 .on("change", function() {
 if(this.checked) {
 svg.selectAll("circle");
 circle.style("fill", "steelblue");
 circle.transition()
 .duration(750)
 .delay(function(d, i) { return i * 10; })
 .attr("r", function(d) { return Math.sqrt(d.radius * 2); });
 }
 else {
 svg.selectAll("circle");
 circle.style("fill", "white");
 circle.transition()
 .duration(750)
 .delay(function(d, i) { return i * 10; })
 .attr("r", function(d) { return d.radius; });
 }
 });
 */