iObserveApp.factory('iObserveCharting', function () {
        var selectedChart = null;

        var sessionChartList = [
            {
                id: 1,
                name: "Position over time",
                shortName: "positionOverTime"
            },
            {
                id: 2,
                name: "Demographics",
                shortName: "demographics"
            }
        ];
        var studyChartList = [
            {
                id: 4,
                name: "Visitor demographics",
                shortName: "visitorDemographics"
            }
        ];


        function plotChart(chartName, svg) {
            selectedChart = chartName;

            if(selectedChart == "Demographics") {
                svg.append("circle")
                    .style("stroke", "gray")
                    .style("fill", "white")
                    .attr("r", 40)
                    .attr("cx", 50)
                    .attr("cy", 50)
                    .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
                    .on("mouseout", function(){d3.select(this).style("fill", "white");});
            }
            else if(selectedChart == "Position over time") {
                svg.append("circle")
                    .style("stroke", "gray")
                    .style("fill", "white")
                    .attr("r", 10)
                    .attr("cx", 50)
                    .attr("cy", 50);

                svg.append("circle")
                    .style("stroke", "gray")
                    .style("fill", "white")
                    .attr("r", 10)
                    .attr("cx", 20)
                    .attr("cy", 20);
            }
        }

        function modifyChart(instruction, state, svg) {
            if(instruction == "selectAllCircles") {
                if(state == true) {
                    var circle = svg.selectAll("circle");
                    circle.style("fill", "steelblue");
                    circle.data([32, 57]);
                    circle.transition()
                            .duration(750)
                            .delay(function(d, i) { return i * 10; })
                            .attr("r", function(d) { return Math.sqrt(d * 2); });
                }
            }
        }

        return {

            plotChart : plotChart,
            modifyChart : modifyChart,

            selectedChart : selectedChart,
            sessionChartList : sessionChartList,
            studyChartList : studyChartList
        }
});

