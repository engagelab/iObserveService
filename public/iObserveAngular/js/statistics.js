iObserveApp.controller('StatisticsCtrl', function($scope, iObserveStates, iObserveData, iObserveCharting, iObserveUtilities) {
    $scope.studyChartRequested = false;
    $scope.sessionChartRequested = false;
    $scope.sessionListRequested = false;
    $scope.sessionChartRequested = false;

    $scope.sessionChartList = iObserveCharting.sessionChartList;
    $scope.selectedChart = null;

    iObserveData.setUserId(iObserveStates.getUserId());
    $scope.studies = iObserveData.doGetStudies();

    $scope.timeConverter = iObserveUtilities.timeConverter;
    $scope.tDiff = iObserveUtilities.tDiff;

    $scope.foldStudyChart = function($study) {
        $scope.currentStudy = $study;
        $scope.studyChartRequested = !$scope.studyChartRequested;


    };

    $scope.foldSessionChart = function($session) {
        $scope.sessionChartRequested = !$scope.sessionChartRequested;


    };

    $scope.foldSessions = function($study) {
        $scope.currentStudy = $study;
        $scope.sessionListRequested = !$scope.sessionListRequested;

        $scope.sessions = $scope.currentStudy.sessionobs;

    };

    $scope.displayChart = function($chart) {
        $scope.selectedChart = $chart;
    };

    $scope.displayChart = function($chart) {
        $scope.sessionChartRequested = true;

    };
})

iObserveApp.directive('chartElement', function () {
    return {
        restrict: 'E',
        link:function(scope,element,attrs) {
            var htmlText = '<div>Another test</div>';
            element.html(htmlText)
        }
    }
})