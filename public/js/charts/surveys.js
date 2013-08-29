iObserveApp.controller('ChartCtrl-survey', function($scope, $timeout, iObserveData) {

    $scope.surveys = [];
    $scope.selectedSurvey = null;
    $scope.dropdown = [];

    var sampleData = [
        {
            id : 1,
            label : "Radio Chart 1",
            type : "RadioButtons",
            maxValue: 36,
            results : [
                {
                    label: "item 1",
                    value: 36
                },
                {
                    label: "item 2",
                    value: 23
                },
                {
                    label: "item 3",
                    value: 10
                }
            ]
        },
        {
            id : 2,
            label : "Radio Chart 2",
            type : "RadioButtons",
            maxValue: 33,
            results : [
                {
                    label: "question A",
                    value: 11
                },
                {
                    label: "q b",
                    value: 33
                },
                {
                    label: "query X",
                    value: 21
                }
            ]
        },
        {
            id : 3,
            label : "Check Box Chart 1",
            type : "Checkboxes",
            maxValue: 20,
            results : [
                {
                    label: "item 1",
                    value: 5
                },
                {
                    label: "item 2",
                    value: 10
                },
                {
                    label: "item 3",
                    value: 20
                }
            ]
        },
        {
            id : 4,
            label : "Check Box Chart 1",
            type : "Checkboxes",
            maxValue: 20,
            results : [
                {
                    label: "item 1",
                    value: 5
                },
                {
                    label: "item 2",
                    value: 10
                },
                {
                    label: "item 3",
                    value: 20
                }
            ]
        },
        {
            id : 5,
            label : "Check Box Chart 1",
            type : "Checkboxes",
            maxValue: 20,
            results : [
                {
                    label: "item 1",
                    value: 5
                },
                {
                    label: "item 2",
                    value: 5
                },
                {
                    label: "item 3",
                    value: 5
                },
                {
                    label: "item 4",
                    value: 10
                }
            ]
        },
        {
            id : 6,
            label : "Check Box Chart 1",
            type : "Checkboxes",
            maxValue: 20,
            results : [
                {
                    label: "item 1",
                    value: 30
                },
                {
                    label: "item 2",
                    value: 30
                },
                {
                    label: "item 3",
                    value: 30
                }
            ]
        }
    ];


    // Convert an array of objects into an array of primitives from the key 'extractItem'
    var extractObjectsFromObjectArray = function (arrayOfObjects, extractItem) {
        var newArray = [];
        for(var i=0; i<arrayOfObjects.length; i++) {
            newArray.push(arrayOfObjects[i][extractItem]);
        }
        return newArray;
    }

    // Add up a total for answers (one survey, multiple poeple)
    // Relying on the fact that order is preserved in JSON arrays - that the question index matches the inner answer index
    // answerArray : the entire set of answers for a single survey
    // questionLabels : array of strings containing the possible answers
    // answerIndex : where the answer is located within a single person's survey
    var tallyRadioButtonAnswers = function (answerArray, questionLabels, answerIndex) {
        var scores = [];
        for(var i=0; i<questionLabels.length; i++) { scores[i] = 0; }
        for(var j=0; j<answerArray.length; j++) {
                    var scoreIndex = questionLabels.indexOf(answerArray[j][answerIndex].answer);
                    if(scoreIndex != -1)
                        scores[scoreIndex]++;
        }
        return scores;
    }

    var tallyCheckBoxAnswers = function (answerArray, questionLabels, answerIndex) {
        var scores = [];
        for(var i=0; i<questionLabels.length; i++) { scores[i] = 0; }
        for(var j=0; j<answerArray.length; j++) {
            var answer = answerArray[j][answerIndex].answer;
            // A checkbox answer is an array and may have zero to many values
            for(var k=0; k<answer.length; k++) {
                var scoreIndex = questionLabels.indexOf(answer[k]);
                if( scoreIndex != -1)
                    scores[scoreIndex]++;
            }
        }
        return scores;
    }

    var setupSelectionMenu = function () {
            for(var i=0; i < $scope.surveys.length; i++) {
                var currentSurvey = $scope.surveys[i];
                var newObject = {
                    text : currentSurvey.label.toString(), index: i
                }
                $scope.dropdown.push(newObject);
            }
    };

    $scope.processData = function () {

        var charts = [];
        var textAnswers = [];

        // Set up Question structures with Answer tallies
        for(var i=0; i<$scope.surveys[$scope.selectedSurvey.index].questions.length; i++) {
            var currentQuestion = $scope.surveys[$scope.selectedSurvey.index].questions[i];
            switch(currentQuestion.type) {
                case 'TextField' :
                    var newTFObject = {
                        id : currentQuestion._id,
                        label : currentQuestion.label,
                        type : currentQuestion.type
                    }; textAnswers.push(newTFObject); break;
                case 'TextArea' :
                    var newTAObject = {
                        id : currentQuestion._id,
                        label : currentQuestion.label,
                        type : currentQuestion.type
                    }; textAnswers.push(newTAObject); break;
                case 'RadioButtons' :
                    var labels = extractObjectsFromObjectArray(currentQuestion.options, 'label');
                    var newRBChartObject = {
                        id : currentQuestion._id,
                        label : currentQuestion.label,
                        type : currentQuestion.type,
                        itemLabels : labels,
                        itemTotals : tallyRadioButtonAnswers($scope.surveys[$scope.selectedSurvey.index].answers, labels, i)
                    }; charts.push(newRBChartObject); break;
                case 'Checkboxes' :
                    var labels = extractObjectsFromObjectArray(currentQuestion.options, 'label');
                    var newCBChartObject = {
                        id : currentQuestion._id,
                        label : currentQuestion.label,
                        type : currentQuestion.type,
                        itemLabels : labels,
                        itemTotals : tallyCheckBoxAnswers($scope.surveys[$scope.selectedSurvey.index].answers, labels, i)
                    }; charts.push(newCBChartObject); break;
                default : break;
            }
        }

        drawChart();

    };


    $scope.$watch('chartPartialLoaded', function(newValue) {
        iObserveData.goGetSurveysForSpace($scope.currentStudy._id).then(function(resultData) {
            $scope.surveys = resultData;
            //$timeout(setupSelectionMenu, 0);
            setupSelectionMenu();
        })
    });

    function drawChart() {

        var xTranslation = 0, yTranslation = 0, labelpad = 165;

        var margin = {top: 75, right: 75, bottom: 75, left: 75},
            width = 250 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;

        var svg = d3.select("#chartSurvey").append("svg")
            .attr("class", "surveychart")
            .attr("width", 1024)
            .attr("height", 723)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        for(var i=0; i<sampleData.length; i++) {
            var data = sampleData[i].results;

            // Two functions to fit raw data into appropriate chart sizing
            var xFit = d3.scale.linear().domain([0, sampleData[i].maxValue]).range([0, width]);
            var yFit = d3.scale.ordinal().domain(d3.range(data.length)).rangeBands([0, width], .2);

            // Each chart set up
            var newG = svg.append("g");

            newG.attr("transform", function() {
                    var x = xTranslation;
                    var y = yTranslation;
                    yTranslation = xTranslation == 750 ? yTranslation+250 : yTranslation;
                    xTranslation = xTranslation == 750 ? 0 : xTranslation+250;
                    return "translate(" + x + "," + y + ")";
                })
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            newG.selectAll("line")
                .data(xFit.ticks(10))
                .enter().append("line")
                .attr("x1", xFit)
                .attr("x2", xFit)
                .attr("y1", 0)
                .attr("y2", height)
                .style("stroke", "#ccc");

            var bars = newG.selectAll("g.rect")
                .data(data)
                .enter().append("svg:rect")
                // Individual bars set up
                .attr("fill", "darkblue" )
                .attr("width", function(d) { return xFit(d.value); })
                .attr("height", function(d,i) {return yFit.rangeBand()} )
                .attr("y", function(d,i) {return yFit(i)});

            var bartext = newG.selectAll(".bartext")
                .data(data)
                .enter().append("text")
                .attr("x", function(d) { return xFit(d.value); })
                .attr("y", function(d,i) { return yFit(i) + yFit.rangeBand() / 2; })
                .attr("dx", -3) // padding-right
                .attr("dy", ".35em") // vertical-align: middle
                .attr("text-anchor", "end") // text-align: right
                .text(function(d) { return d.value; })

            var labels = newG.selectAll(".labels")
                .data(data)
                .enter().append("text")
                .attr("x", 0 )
                .attr("y", function(d,i) { return yFit(i) + yFit.rangeBand() / 2; })
                .attr("dx", -3) // padding-right
                .attr("dy", ".35em") // vertical-align: middle
                .attr("text-anchor", "end") // text-align: right
                .text(function(d) { return d.label; });

            var title = newG.append("text")
                .attr("x", width/2 )
                .attr("y", height+20)
                .attr("dx", -3) // padding-right
                .attr("dy", ".35em") // vertical-align: middle
                .attr("text-anchor", "middle") // text-align: right
                .attr("font-size", 14)
                .text(sampleData[i].label);

            newG.selectAll(".rule")
                .data(xFit.ticks(5))
                .enter().append("text")
                .attr("class", "rule")
                .attr("x", xFit)
                .attr("y", 0)
                .attr("dy", -3)
                .attr("text-anchor", "middle")
                .text(String);

            var axisH = newG.append("line")
                .attr("y1", 0)
                .attr("y2", height)
                .style("stroke", "#000");

         /*   bars.append("svg:text")
                .attr("x", 0)
                .attr("y", 10 + yFit.rangeBand() / 2)
                .attr("dx", -6)
                .attr("dy", ".35em")
                .attr("text-anchor", "end")
                .text(function(d) { return d.label; })

            var rules = newG.selectAll("g.rule")
                .data(xFit.ticks(10))
                .enter().append("svg:g")
                .attr("class", "rule")
                .attr("transform", function(d) { return "translate(" + xFit(d.value) + ", 0)"; })

            rules.append("svg:line")
                .attr("y1", height)
                .attr("y2", height + 6)
                .attr("x1", labelpad)
                .attr("x2", labelpad)
                .attr("stroke", "black");

            rules.append("svg:line")
                .attr("y1", 0)
                .attr("y2", height)
                .attr("x1", labelpad)
                .attr("x2", labelpad)
                .attr("stroke", "white")
                .attr("stroke-opacity", .3);

            rules.append("svg:text")
                .attr("y", height + 8)
                .attr("x", labelpad)
                .attr("dy", ".71em")
                .attr("text-anchor", "middle")
                .text(xFit.tickFormat(10));
*/
            /*
            var rect = d3.svg.line()
                .interpolate("basis")
                .x(function(d, i) { return x(d.itemTotals[i]); })
                .y(function(d, i) { return y(d.itemLabels[i]); });

            svg.append("g")
                .attr("transform", function(d) {
                    xTranslation = xTranslation/120 < 5 ? xTranslation+120 : -120;
                    yTranslation = xTranslation/120 == 5 ? yTranslation+120 : yTranslation;
                    return "translate(" + xTranslation + "," + yTranslation + ")";
                })
                .selectAll(".line")
                .data(data)
                .enter()
                .append("path")
                .attr("class", "line")
                .attr("d", line);
*/
           //     .append("g")
           //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        }
   /*
        var w = 815,
            h = 260,
            labelpad = 165,
            x = d3.scale.linear().domain([0, 100]).range([0, w]),
            y = d3.scale.ordinal().domain(d3.range(sampleData.length)).rangeBands([0, h], .2);

        var svg = d3.select("#chartSurvey").selectAll()
            .data(sampleData)
            .enter().append("svg")
            .attr("class", function(d) { return d.type })
            .attr("width", 100)
            .attr("height", 100)
            .append("g")
            .attr("class", "bar")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");

        var bars = svg.selectAll(".bar");

        bars.append("svg:rect")
            .attr("fill", "darkblue" )
            .attr("width", x)
            .attr("height", y.rangeBand());

        bars.append("svg:text")
            .attr("x", 0)
            .attr("y", 10 + y.rangeBand() / 2)
            .attr("dx", -6)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function(d) { return d.label; });
    */
/*
        svg.selectAll(".RadioButtons").selectAll("g.bar")
            .append("svg:g")
            .attr("class", "bar")
            .attr("transform", function(d, i) { return "translate(" + labelpad + "," + y(i) + ")"; });
*/
    }
});