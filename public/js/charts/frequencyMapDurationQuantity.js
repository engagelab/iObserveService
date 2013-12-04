iObserveApp.controller('ChartCtrl-frequencyMapDurationQuantity', function($scope, $timeout, iObserveData, ngProgress) {

    var chartData = [];
    var firstEventCreationTime = 0;
    var lastEventCreationTimeInSeconds = 0;
    var mapScale = 5;

    $scope.ageGroups = ["Child", "Young Adult", "Adult", "Middle Aged", "Senior"];
    $scope.nationalities = ["Norwegian", "Tourist", "Other"];

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", 1024)
        .attr("height", 723)
        .attr("top", 45);

    var processData = function () {
        var nextEventTime = 0;
        var relativeCreationTimeInSeconds = 0;


        // Iterate over the entire set of sessions
        for(var i=0; i<$scope.eventCollection.length; i++) {
            var eventSubset = $scope.eventCollection[i];

            // Iterate over events within the session
            for(var j=0; j<eventSubset.length; j++) {
                var storedVisitorsIds = [];
                var ageGroupList = [];
                var nationalityList = [];
                var event = eventSubset[j];

                // This counters a bug caused when an event is posted with no interactions
                if(event.interactions.length > 0) {

                    if(j == 0)
                        firstEventCreationTime = event.created_on;
                    relativeCreationTimeInSeconds = getRelativeCreationTime(event.created_on);

                    // Iterate through Interactions and Visitors and collect unique visitors for this event
                    for(var k=0; k<event.interactions.length; k++) {
                        var interaction = event.interactions[k];

                        for(var l=0;  l<interaction.visitors.length; l++) {
                            var visitor = interaction.visitors[l];
                            if(storedVisitorsIds.indexOf(visitor._id) == -1) {
                                storedVisitorsIds.push(visitor._id);
                                if(ageGroupList.indexOf(visitor.age) == -1) {
                                    ageGroupList.push(visitor.age);
                                }
                                if(nationalityList.indexOf(visitor.nationality) == -1) {
                                    nationalityList.push(visitor.nationality);
                                }
                            }
                        }
                    }

                    // Create a data point with the information gathered
                    if(j < eventSubset.length-1)
                        nextEventTime = eventSubset[j+1].created_on;
                    else if(j == eventSubset.length-1)
                        nextEventTime = event.created_on+1;   // The final event will be the exit of the session - represent it as one second long
                    var dataPoint = {
                        session : i.toString(),
                        relativeCreationTimeInSeconds : relativeCreationTimeInSeconds,
                        x : event.xpos,
                        y : event.ypos,
                        ageGroups : ageGroupList,
                        selectable : true,
                        nationalities : nationalityList,
                        radius : event.interactions[0].visitors.length,      // Adds a radius to represent number of visitors at the event
                        duration : getTimeDuration(event.created_on, nextEventTime)
                    }
                    chartData.push(dataPoint);
                    if(lastEventCreationTimeInSeconds < relativeCreationTimeInSeconds)
                        lastEventCreationTimeInSeconds = relativeCreationTimeInSeconds;
                }
            }
        }
    };

    // Calculate the time passed in seconds since the first event
    var getRelativeCreationTime = function (time) {
        var a = moment.unix(firstEventCreationTime);
        var b = moment.unix(time);
        var difference = b.diff(a, 'seconds');
        return difference;
    }

    // Calculate the time duration in seconds between events
    var getTimeDuration = function (timeNow, timeNext) {
        var a = moment.unix(timeNow);
        var b = moment.unix(timeNext);
        var difference = b.diff(a, 'seconds');
        return difference;
    }

    $scope.$watch('chartPartialLoaded', function(newValue) {
        iObserveData.doGetEventsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id).then(function(resultData) {
            $scope.sessionDetails = resultData[0].sessions;
            $scope.eventCollection = resultData[0].events;
            processData();
            drawChart();
            ngProgress.complete();
            $timeout(assignCheckBoxes, 0);
        })
    });

    var drawChart = function () {
        var circle = svg.selectAll(".eventCircle")
            .data(chartData)
            .enter()
            .append("svg:circle")
            .attr("class", "eventCircle")
            .style("fill", "#FF0000")
            .attr("r", function(d) { return d.radius*mapScale; })
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .style("opacity", function(d) {
                if(d.duration >= 40)
                    return 1;
                else if(d.duration >= 30)
                    return 0.8;
                else if(d.duration >= 20)
                    return 0.6;
                else if(d.duration >= 10)
                    return 0.4;
                else if(d.duration >= 5)
                    return 0.2;
                else if(d.duration > 0)
                    return 0.1;
                else
                    return 0;
            })
            .attr("display", function(d) { return d.relativeCreationTimeInSeconds == 0 ? "inline" : "none"});

        // The slider (dragger) - Works by relative creation time from first event
        // Usage:  http://code.ovidiu.ch/dragdealer/
        new Dragdealer('eventSlider', {
            horizontal: true,
            vertical: false,
            xPrecision: 1024,
            x: 0,
            animationCallback: function(x, y)
            {
                var totalSteps = lastEventCreationTimeInSeconds;
                $("#eventSliderBar").html("<i class='icon-double-angle-left'></i>&nbsp<span>t: "+Math.round(x*totalSteps)+"s</span>&nbsp<i class='icon-double-angle-right'></i>");
                svg.selectAll(".eventCircle")
                    .attr("display", function(d) { return d.relativeCreationTimeInSeconds <= x*totalSteps ? "inline" : "none"});
            }
        });

        new Dragdealer('scaleSlider', {
            horizontal: true,
            vertical: false,
            xPrecision: 100,
            x: 0.4,
            animationCallback: function(x, y)
            {
                $("#scaleSliderBar").html("<span>"+Math.round(x*this.xPrecision)+"%</span>");
                mapScale = x*this.xPrecision/10;
                svg.selectAll(".eventCircle")
                    .attr("r", function(d) { return d.radius*mapScale; })
            }
        });

    }

    var assignCheckBoxes = function () {

        d3.selectAll(".session_filter_button")
            .property("checked", true)
            .on("change", function() {
                var session = this.value,
                    display = this.checked ? "inline" : "none";

                svg.selectAll(".eventCircle")
                    .filter(function(d) { return d.session === session; })
                    .attr("display", display);
            });

        d3.selectAll(".age_filter_button")
            .property("checked", true)
            .on("change", function() {
                var age = this.value,
                    display = this.checked ? "inline" : "none";

                svg.selectAll(".eventCircle")
                    .filter(function(d) { return d.ageGroups.indexOf(age) != -1 && d.selectable; })
                    .attr("display", display);
            });

        d3.selectAll(".nation_filter_button")
            .property("checked", true)
            .on("change", function() {
                var nation = this.value,
                    display = this.checked ? "inline" : "none";

                svg.selectAll(".eventCircle")
                    .filter(function(d) { return d.nationalities.indexOf(nation) != -1; })
                    .attr("display", display);
            });

    }
});
