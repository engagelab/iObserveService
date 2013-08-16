iObserveApp.controller('ChartCtrl-positionOverTime', function($scope, iObserveData, iObserveUtilities) {

    var chartData = [];
    var linkData = [];
    var linkCircleData = [];
    var firstEventCreationTime = null;
    var lastEventCreationTime = 0;

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", 1024)
        .attr("height", 723)
        .attr("top", 45);

    var processData = function () {
        var xPrev = 0, yPrev = 0;
        var relativeCreationTime = 0;
        if($scope.chartData.length > 0) {
            firstEventCreationTime = moment.unix($scope.chartData[0].created_on);
            xPrev = $scope.chartData[0].xpos;
            yPrev = $scope.chartData[0].ypos;
        }
        for(var i=0; i<$scope.chartData.length; i++) {
            var event = $scope.chartData[i];
            relativeCreationTime = getRelativeCreationTime(event.created_on);
            for(var j=0; j<event.interactions.length; j++) {
                var interaction = event.interactions[j];
                for(var k=0;  k<interaction.visitors.length; k++) {
                    var visitor = interaction.visitors[k];
                    var eventDataPoint = {
                        eventIndex : i,
                        visitorIndex : interaction.visitors.indexOf(visitor),
                        relativeCreationTime : relativeCreationTime,
                        x : event.xpos,
                        y : event.ypos,
                        radius : 5,
                        color : iObserveUtilities.decColor2hex(visitor.color),
                        sex: visitor.sex,
                        age: visitor.age,
                        nationality : visitor.nationality
                    }
                    chartData.push(eventDataPoint);
                }
            }
            var linkDataPoint = {
                eventIndex : i,
                relativeCreationTime : relativeCreationTime,
                x : event.xpos,
                y : event.ypos,
                xPrev : xPrev,
                yPrev : yPrev
            }
            var linkCircleDataPoint = {
                eventIndex : i,
                relativeCreationTime : relativeCreationTime,
                x : event.xpos,
                y : event.ypos
            }
            linkData.push(linkDataPoint);
            linkCircleData.push(linkCircleDataPoint);
            xPrev = event.xpos;
            yPrev = event.ypos;
        }
        lastEventCreationTime = event.created_on;
    };

    var getRelativeCreationTime = function (time) {
        var b = moment.unix(time);
        var difference = b.diff(firstEventCreationTime, 'seconds');
        return difference;
    }

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

        svg.append("defs").append("svg:marker")
            .attr("id", "arrowGray")
            .attr("viewBox","0 0 10 10")
            .attr("refX","30")
            .attr("refY","5")
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth","9")
            .attr("markerHeight","5")
            .attr("orient","auto")
            .append("svg:path")
            .attr("d","M 0 0 L 10 5 L 0 10 z")
            .attr("fill", "black");

        var eventLink = svg.selectAll(".eventLink")
            .data(linkData)
            .enter()
            .append("svg:line")
            .attr("class", "eventLink")
            .attr("marker-end", "url(#arrowGray)")
            .filter(function(d, i) { return i != 0; })
            .attr("x1", function(d) { return d.xPrev})
            .attr("y1", function(d) { return d.yPrev})
            .attr("x2", function(d) { return d.x})
            .attr("y2", function(d) { return d.y})
            .attr("display", function(d) { return d.eventIndex <= 0 ? "inline" : "none"})
            .attr("stroke-width", 2)
            .attr("stroke", "black");

        var linkCircle = svg.selectAll(".linkCircle")
            .data(linkCircleData)
            .enter()
            .append("svg:circle")
            .attr("class", "linkCircle")
            .style("stroke", "gray")
            .attr("r", 20 )
            .attr("cx", function(d) { return d.x })
            .attr("cy", function(d) { return d.y })
            .attr("display", function(d) { return d.eventIndex <= 0 ? "inline" : "none"})
            .attr("fill", "white");

        var eventCircle = svg.selectAll(".eventCircle")
            .data(chartData)
            .enter()
            .append("svg:circle")
            .attr("class", "eventCircle")
            .style("stroke", "gray")
            .attr("r", function(d) { return d.radius; })
            .attr("cx", function(d) { return calculateClusterCoordinates(d.x, d.y, d.visitorIndex).x; })
            .attr("cy", function(d) { return calculateClusterCoordinates(d.x, d.y, d.visitorIndex).y; })
            .attr("display", function(d) { return d.eventIndex <= 0 ? "inline" : "none"})
            .attr("fill", function(d) { return d.color; });

        // Works by relative creation time from first event
        // Usage:  http://code.ovidiu.ch/dragdealer/
        new Dragdealer('eventSlider', {
                horizontal: true,
                vertical: false,
                xPrecision: 1024,
                x: 0,
                animationCallback: function(x, y)
                {
                    var totalSteps = getRelativeCreationTime(lastEventCreationTime);
                    $("#eventSliderBar").html("<span>t: "+Math.round(x*totalSteps)+"s</span>");
                    svg.selectAll(".eventCircle")
                        .attr("display", function(d) { return d.relativeCreationTime <= x*totalSteps ? "inline" : "none"});
                    svg.selectAll(".eventLink")
                        .attr("display", function(d) { return d.relativeCreationTime <= x*totalSteps ? "inline" : "none"});
                    svg.selectAll(".linkCircle")
                        .attr("display", function(d) { return d.relativeCreationTime <= x*totalSteps ? "inline" : "none"})
                }
        });

        /* Works by equally dividing by number of events
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
        */

    }

});







