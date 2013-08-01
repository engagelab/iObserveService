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
        $scope.chartShortName = $chart.shortName;
        $scope.serverData = "Test Data";

    };
})


/*
iObserveApp.directive('chartVisualization', function (iObserveCharting) {
    return {
        restrict: 'E',
        replace: true,
        template: '<div id="chartTemplateRootElement">' +
                      '<form ng-submit="">' +
                            'Select all <input type="checkbox" ng-model="chartControls.selectAll">' +
                      '</form>' +
                      '<div id="chart"></div>' +
                  '</div>',
        scope: {
            val: '=val',
            chartControls: '='
        },
        link: function (scope, element, attrs) {

            var svg = d3.select("#chart")
                .append("svg")
                .attr("width", 100)
                .attr("height", 100);

            scope.$watch('val', function (newVal, oldVal) {
                if (!newVal || newVal === oldVal) {
                    return;
                }
                svg.selectAll('*').remove();
                iObserveCharting.plotChart(newVal, svg);
            });

            scope.$watch('chartControls.selectAll', function (newVal, oldVal) {
                if (newVal === oldVal) {
                    return;
                }
                if (newVal)
                    iObserveCharting.modifyChart("selectAllCircles", newVal, svg);
            })
        }
    }
});
*/