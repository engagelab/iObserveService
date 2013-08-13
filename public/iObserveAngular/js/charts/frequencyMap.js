iObserveApp.controller('ChartCtrl-frequencyMap', function($scope) {


    var chartData = [
        {
            "key": "Male",
            "color": "#3B40BF",
            "values": [
                {
                    "label" : "Child",
                    "value" : 0
                },
                {
                    "label" : "Young Adult",
                    "value" : 0
                },
                {
                    "label" : "Adult",
                    "value" : 0
                },
                {
                    "label" : "Middle Aged",
                    "value" : 0
                },
                {
                    "label" : "Senior",
                    "value" : 0
                }
            ]
        },
        {
            "key": "Female",
            "color": "#BF3B3B",
            "values": [
                {
                    "label" : "Child",
                    "value" : 0
                },
                {
                    "label" : "Young Adult",
                    "value" : 0
                },
                {
                    "label" : "Adult",
                    "value" : 0
                },
                {
                    "label" : "Middle Aged",
                    "value" : 0
                },
                {
                    "label" : "Senior",
                    "value" : 0
                }
            ]
        },
        {
            "key": "Norwegian",
            "color": "#3BBF4D",
            "values": [
                {
                    "label" : "Child",
                    "value" : 0
                },
                {
                    "label" : "Young Adult",
                    "value" : 0
                },
                {
                    "label" : "Adult",
                    "value" : 0
                },
                {
                    "label" : "Middle Aged",
                    "value" : 0
                },
                {
                    "label" : "Senior",
                    "value" : 0
                }
            ]
        },
        {
            "key": "Tourist",
            "color": "#157047",
            "values": [
                {
                    "label" : "Child",
                    "value" : 0
                },
                {
                    "label" : "Young Adult",
                    "value" : 0
                },
                {
                    "label" : "Adult",
                    "value" : 0
                },
                {
                    "label" : "Middle Aged",
                    "value" : 0
                },
                {
                    "label" : "Senior",
                    "value" : 0
                }
            ]
        },
        {
            "key": "Other",
            "color": "#000000",
            "values": [
                {
                    "label" : "Child",
                    "value" : 0
                },
                {
                    "label" : "Young Adult",
                    "value" : 0
                },
                {
                    "label" : "Adult",
                    "value" : 0
                },
                {
                    "label" : "Middle Aged",
                    "value" : 0
                },
                {
                    "label" : "Senior",
                    "value" : 0
                }
            ]
        }
    ]

    $(function() {
        $( "#slider" ).slider({
            value:0,
            min: 0,
            max: $scope.sessions.eventob_ids.length,
            step: 50,
            slide: function( event, ui ) {
                $( "#amount" ).val( "$" + ui.value );
            }
        });
        $( "#amount" ).val( "$" + $( "#slider" ).slider( "value" ) );
    });

    var objSet = { "Male" : chartData[0], "Female" : chartData[1], "Norwegian" : chartData[2], "Tourist" : chartData[3], "Other" : chartData[4] };

    var processData = function () {

        for(var i=0; i<$scope.sessions.length; i++) {
            var session = $scope.sessions[i];
            // session in sessions
            for(var j=0; j<session.visitorgroup.visitors.length; j++) {
                var visitor = session.visitorgroup.visitors[j];
                var filter = visitor.sex;
                switch(visitor.age) {
                    case "Child" : objSet[filter].values[0].value++; break;
                    case "Young adult" : objSet[filter].values[1].value++; break;
                    case "Adult" : objSet[filter].values[2].value++; break;
                    case "Middle aged" : objSet[filter].values[3].value++; break;
                    case "Senior" : objSet[filter].values[4].value++; break;
                    default : break;
                }
                filter = visitor.nationality;
                switch(visitor.age) {
                    case "Child" : objSet[filter].values[0].value++; break;
                    case "Young adult" : objSet[filter].values[1].value++; break;
                    case "Adult" : objSet[filter].values[2].value++; break;
                    case "Middle aged" : objSet[filter].values[3].value++; break;
                    case "Senior" : objSet[filter].values[4].value++; break;
                    default : break;
                }
            }
        }
    };

    processData();

    var chart;
    nv.addGraph(function() {
        // chart = nv.models.multiBarHorizontalChart()
        chart = nv.models.multiBarChart()
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .margin({top: 30, right: 20, bottom: 50, left: 175})
            //.showValues(true)
            //.tooltips(false)
            //.barColor(d3.scale.category20().range())
            .showControls(true);

        chart.yAxis
            .tickFormat(d3.format(',d'));

        d3.select('#chart')
            .append("svg")
            .datum(chartData)
            .transition().duration(500)
            .call(chart);

        nv.utils.windowResize(chart.update);

        chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

        return chart;
    });

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