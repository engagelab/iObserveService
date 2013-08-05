iObserveApp.controller('StatisticsCtrl', function($scope, $dialog, iObserveStates, iObserveData, iObserveUtilities) {
    $scope.roomListRequested = false;
    $scope.sessionListRequested = false;
    $scope.sessionInfoListRequested = false;
    $scope.sessionSequenceRequested = false;

    $scope.studyChartRequested = false;
    $scope.sessionChartRequested = false;
    $scope.showChart = false;

    $scope.chartList = iObserveUtilities.loadJSONFile("js/chartTypes.json");
    $scope.selectedChart = null;

    iObserveData.setUserId(iObserveStates.getUserId());
    $scope.studies = iObserveData.doGetStudies();

    $scope.timeConverter = iObserveUtilities.timeConverter;
    $scope.timeConverterShort = iObserveUtilities.timeConverterShort;
    $scope.tDiff = iObserveUtilities.tDiff;

    $scope.chartDialogOpts = {
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        templateUrl:  'default.html',
        controller: 'TestDialogController',
        resolve: {
            chartData: function() {
                return $scope.chartData;
            }
        }
    };
/*
    $scope.foldStudyChart = function($study) {
        if($scope.currentStudy == $study || $scope.sessionChartRequested == false)
            $scope.studyChartRequested = !$scope.studyChartRequested;
        $scope.currentStudy = $study;
    };
*/
/*
    $scope.displaySessionChart = function($session) {
        $scope.sessionChartRequested = !$scope.sessionChartRequested;
        $scope.currentSession = $session;
    };
*/

    $scope.foldRooms = function($study) {
        if($scope.currentStudy == $study || $scope.roomListRequested == false)
            $scope.roomListRequested = !$scope.roomListRequested;
        $scope.currentStudy = $study;

        $scope.rooms = [
            {
                label: "room 1"
            }
        ]
    };

    $scope.foldSessions = function($room) {
        if($scope.currentRoom == $room || $scope.sessionListRequested == false)
            $scope.sessionListRequested = !$scope.sessionListRequested;
        $scope.currentRoom = $room;

        $scope.sessions = $scope.currentStudy.sessionobs;
    };

    $scope.foldSessionInfo = function($session) {
        if($scope.currentSession == $session || $scope.sessionInfoListRequested == false)
            $scope.sessionInfoListRequested = !$scope.sessionInfoListRequested;
        $scope.currentSession = $session;

        $scope.chartData = iObserveData.doGetEvents($scope.currentSession._id);

    };


    // ***   Ideally, doGetEvents below should be requested only once, when a session is selected, triggered by the accordion opening, but this is not possible in current BootstrapUI version
    // ***   It would also remove the need for a button to activate the session sequence display

    $scope.displaySessionChart = function($chart) {
        $scope.selectedChart = $chart;
        $scope.chartName = $chart.name;
        $scope.chartShortName = $chart.shortName;
        $scope.chartDialogOpts.templateUrl = '/iObserveAngular/partial/charts/' + $scope.chartShortName + '.html';
        openDialog();
    };

    $scope.displaySessionSequence = function($session) {
        $scope.sessionSequenceRequested = !$scope.sessionSequenceRequested;
    }
/*
    $scope.$watch('chartData', function(chartData) {
        angular.forEach(chartData, function(event, idx){

        })
    }, true);
*/


    $scope.setVisitorClass = function (visitorColor) {
           return "visitor-color-" + visitorColor;
   //     var computedColour = "visitor-color-" + visitors.indexOf(visitor).toString();
   //         return computedColour;
    };

    var openDialog = function(){
        var d = $dialog.dialog($scope.chartDialogOpts);
        d.open().then(function(result){
            if(result)
            {
                alert('dialog closed with result: ' + result);
            }
        });
    };




})

iObserveApp.controller('TestDialogController', function($scope, dialog, chartData) {
    $scope.chartData = chartData;
    $scope.close = function(result){
        dialog.close(result);
    };
});




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