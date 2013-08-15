iObserveApp.controller('ChartCtrl-positionOverTime', function($scope, iObserveData, iObserveUtilities) {

    var chartData = [];

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", 1024)
        .attr("height", 723)
        .attr("top", 45);

    var processData = function () {

        for(var i=0; i<$scope.chartData.length; i++) {
            var event = $scope.chartData[i];
            for(var j=0; j<event.interactions.length; j++) {
                var interaction = event.interactions[j];
                for(var k=0;  k<interaction.visitors.length; k++) {
                    var visitor = interaction.visitors[k];
                    var dataPoint = {
                        eventIndex : i,
                        visitorIndex : interaction.visitors.indexOf(visitor),
                        x : event.xpos,
                        y : event.ypos,
                        radius : 5,
                        color : iObserveUtilities.decColor2hex(visitor.color),
                        sex: visitor.sex,
                        age: visitor.age,
                        nationality : visitor.nationality
                    }
                    chartData.push(dataPoint);
                }
            }
        }
    };

    var getEventRadius = function (event) {
        return event.interactions.length * 5;
    }

    $scope.$watch('chartPartialLoaded', function(newValue) {
        iObserveData.doGetEventsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id).then(function(resultData) {
            $scope.sessionDetails = resultData.sessions;
            $scope.eventCollection = resultData.events;
            processData();
            drawChart();
         //   $timeout(assignCheckBoxes, 0);
        })
    });

    var calculateClusterCoordinates = function (x,y,visitorIndex) {
        var newCoords = {x : 0, y : 0};
        switch(visitorIndex) {
            case 0 : newCoords.x = x - 7; newCoords.y = y - 7; break;
            case 1 : newCoords.x = x + 7; newCoords.y = y - 7; break;
            case 2 : newCoords.x = x - 7; newCoords.y = y + 7; break;
            case 3 : newCoords.x = x + 7; newCoords.y = y + 7; break;
        }
        return newCoords;
    }

    var drawChart = function () {
        var circle = svg.selectAll("circle")
            .data(chartData)
            .enter()
            .append("svg:circle");

        d3.selectAll("circle")
            .style("stroke", "gray")
            .attr("r", function(d) { return d.radius; })
            .attr("cx", function(d) { return calculateClusterCoordinates(d.x, d.y, d.visitorIndex).x; })
            .attr("cy", function(d) { return calculateClusterCoordinates(d.x, d.y, d.visitorIndex).y; })
            .attr("display", function(d) { return d.eventIndex <= 0 ? "inline" : "none"})
            .attr("fill", function(d) { return d.color; });

        new Dragdealer('eventSlider', {
                horizontal: true,
                vertical: false,
                xPrecision: 1024,
                x: 0,
                animationCallback: function(x, y)
                {
                    var totalSteps = $scope.chartData.length;
                    svg.selectAll("circle")
                        .attr("display", function(d) { return d.eventIndex+1 <= x*totalSteps ? "inline" : "none"})
                }
        });

    }

});







