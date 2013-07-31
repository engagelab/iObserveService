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