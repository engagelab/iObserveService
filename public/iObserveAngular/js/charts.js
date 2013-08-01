iObserveApp.factory('iObserveCharting', function () {
        var selectedChart = null;

        var sessionChartList = [
            {
                id: 1,
                name: "Position over time"
            },
            {
                id: 2,
                name: "Interactions for a single session"
            },
            {
                id: 3,
                name: "Demographics"
            }
        ];
        var studyChartList = [
            {
                id: 4,
                name: "Visitor demographics"
            }
        ];


        function plotChart(chartName, vis) {
            selectedChart = chartName;
            if(selectedChart == "Demographics") {
                vis.append("circle")
                    .style("stroke", "gray")
                    .style("fill", "white")
                    .attr("r", 40)
                    .attr("cx", 50)
                    .attr("cy", 50)
                    .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
                    .on("mouseout", function(){d3.select(this).style("fill", "white");});
            }
        }

        return {

            plotChart : plotChart,

            selectedChart : selectedChart,
            sessionChartList : sessionChartList,
            studyChartList : studyChartList
        }
});

