iObserveApp.controller('StatisticsCtrl', function($scope, iObserveStates, iObserveData, iObserveCharting, iObserveUtilities) {
    $scope.studyChartRequested = false;
    $scope.sessionChartRequested = false;
    $scope.sessionListRequested = false;
    $scope.sessionChartRequested = false;
    $scope.showChart = false;

    $scope.sessionChartList = iObserveCharting.sessionChartList;
    $scope.selectedChart = null;

    iObserveData.setUserId(iObserveStates.getUserId());
    $scope.studies = iObserveData.doGetStudies();

    $scope.timeConverter = iObserveUtilities.timeConverter;
    $scope.tDiff = iObserveUtilities.tDiff;

    $scope.foldStudyChart = function($study) {
        if($scope.currentStudy == $study || $scope.sessionChartRequested == false)
            $scope.studyChartRequested = !$scope.studyChartRequested;
        $scope.currentStudy = $study;
    };

    $scope.foldSessionChart = function($session) {
        $scope.sessionChartRequested = !$scope.sessionChartRequested;
    };

    $scope.foldSessions = function($study) {
        if($scope.currentStudy == $study || $scope.sessionListRequested == false)
            $scope.sessionListRequested = !$scope.sessionListRequested;
        $scope.currentStudy = $study;

        $scope.sessions = $scope.currentStudy.sessionobs;
    };

    $scope.displayChart = function($chart) {
        if($scope.selectedChart == $chart || $scope.showChart == false)
            $scope.showChart = !$scope.showChart;
        $scope.selectedChart = $chart;
        $scope.chartName = $chart.name;
  //      var chartSpace = d3.select("#chartSpace");
  //      iObserveCharting.selectedChart = $chart;

    };

//    $scope.displayChart = function($chart) {
//        $scope.sessionChartRequested = true;
//    };
})


iObserveApp.directive('ioVisualization', function (iObserveCharting) {
    return {
        restrict: 'E',
        scope: {
            val: '=',
            grouped: '='
        },
        link: function (scope, element, attrs) {
            // set up initial svg object
            var vis = d3.select(element[0])
                .append("svg")
                .attr("width", 100)
                .attr("height", 100);

            scope.$watch('val', function (newVal, oldVal) {
                if (!newVal || newVal === oldVal) {
                    return;
                }
                vis.selectAll('*').remove();

                iObserveCharting.plotChart(newVal, vis);

            });
        }
    }
});
