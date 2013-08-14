iObserveApp.controller('StatisticsCtrl', function($scope, $dialog, iObserveStates, iObserveData, iObserveUtilities) {
    $scope.roomListRequested = false;
    $scope.roomListButton = 0;
    $scope.studyChartButton = 0;
    $scope.sessionListRequested = false;
    $scope.sessionListButton = 0;
    $scope.sessionInfoListRequested = false;
    $scope.sessionInfoListButton = 0;
    $scope.sessionSequenceRequested = false;
    $scope.sessionSequenceButton = 0;
    $scope.chartPartialLoaded = false;

    $scope.chartRequested = false;
    $scope.showChart = false;

    $scope.chartList = iObserveUtilities.loadJSONFile("js/chartTypes.json");
    $scope.chartName = "";

    iObserveData.setUserId(iObserveStates.getUserId());
    $scope.studies = iObserveData.doGetStudies();

    $scope.timeConverter = iObserveUtilities.timeConverter;
    $scope.timeConverterShort = iObserveUtilities.timeConverterShort;
    $scope.tDiff = iObserveUtilities.tDiff;
    $scope.tDiffMoment = iObserveUtilities.tDiffMoment;

    $scope.showSessionList = false;

    var activeStudyButton = null;
    var activeRoomButton = null;
    var activeSessionButton = null;

    $scope.partialLoaded = function () {
        $scope.chartPartialLoaded = true;
    }

    $scope.foldRooms = function($study, e) {
        $("button.btn").addClass("btn-info").removeClass("btn-success").removeClass("active");
        $(e.target).closest('button').removeClass("btn-info").addClass("btn-success").addClass("active");
        activeStudyButton = $(e.target).closest('button');
        $scope.sessionSequenceRequested = false;
        $scope.chartShortName = "";
        $scope.chartRequested = false;
        if($scope.currentStudy == $study || $scope.roomListRequested == false) {
            if($scope.roomListRequested == true) {
                $scope.roomListRequested = false;
                $scope.sessionListRequested = false;
                $scope.sessionInfoListRequested = false;
                $scope.sessionSequenceRequested = false;
                $scope.chartPartialLoaded = false;
                $(e.target).closest('button').removeClass("btn-success").addClass("btn-info").removeClass("active");
            }
            else {
                $scope.roomListRequested = true;
                $scope.currentStudy = $study;
                iObserveData.doGetRoomsForSpace($scope.currentStudy._id).then(function(resultData) {
                    $scope.rooms = resultData;
                })
            }
        }
        else {
            $scope.roomListRequested = false;
            $scope.sessionListRequested = false;
            $scope.sessionInfoListRequested = false;
            $scope.foldRooms($study, e);
        }
    };

    $scope.foldSessions = function($room, e) {
        $("button.btn").addClass("btn-info").removeClass("btn-success").removeClass("active");
        $(e.target).closest('button').removeClass("btn-info").addClass("btn-success").addClass("active");
        activeStudyButton.removeClass("btn-info").addClass("btn-success").addClass("active");
        activeRoomButton = $(e.target).closest('button');
        $scope.sessionSequenceRequested = false;
        $scope.chartShortName = "";
        $scope.chartRequested = false;
        if($scope.currentRoom == $room || $scope.sessionListRequested == false) {
            if($scope.sessionListRequested == true) {
                $scope.sessionListRequested = false;
                $scope.sessionInfoListRequested = false;
                $scope.sessionSequenceRequested = false;
                $scope.chartPartialLoaded = false;
                $(e.target).closest('button').removeClass("btn-success").addClass("btn-info").removeClass("active");
            }
            else {
                $scope.sessionListRequested = false;
                $scope.currentRoom = $room;
                iObserveData.doGetSessionsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id).then(function(resultData) {
                    $scope.sessions = resultData;
                    $scope.sessionListRequested = true;
                    if($scope.sessions.length > 0)
                        $scope.showSessionList = true;
                })
            }
        //    $(angular.element(e.target)).parent().siblings().toggleClass('selected');
        }
        else {
            $scope.sessionListRequested = false;
            $scope.sessionInfoListRequested = false;
            //   $scope.roomListButton = 0;
            $scope.foldSessions($room, e);
        }
    };

    $scope.foldSessionInfo = function($session, e) {
        $("button.btn").addClass("btn-info").removeClass("btn-success").removeClass("active");
        $(e.target).closest('button').removeClass("btn-info").addClass("btn-success").addClass("active");
        activeStudyButton.removeClass("btn-info").addClass("btn-success").addClass("active");
        activeRoomButton.removeClass("btn-info").addClass("btn-success").addClass("active");
        activeSessionButton = $(e.target).closest('button');
        $scope.sessionSequenceRequested = false;
        $scope.chartShortName = "";
        $scope.chartRequested = false;
        if($scope.currentSession == $session || $scope.sessionInfoListRequested == false) {
            if($scope.sessionInfoListRequested == true) {
                $scope.sessionInfoListRequested = false;
                $scope.sessionSequenceRequested = false;
                $scope.chartPartialLoaded = false;
                $(e.target).closest('button').removeClass("btn-success").addClass("btn-info").removeClass("active");
            }
            else {
                $scope.sessionInfoListRequested = false;
                $scope.currentSession = $session;
                iObserveData.doGetEvents($scope.currentSession._id).then(function(resultData) {
                    $scope.chartData = resultData;
                    $scope.sessionInfoListRequested = true;
                });
            }
         //   $(angular.element(e.target)).parent().siblings().toggleClass('selected');
        }
        else {
            $scope.sessionInfoListRequested = false;
            //   $scope.roomListButton = 0;
            $scope.foldSessionInfo($session, e);
        }
    };

    $scope.displaySessionSequence = function(e) {
        $scope.sessionSequenceRequested = !$scope.sessionSequenceRequested;
        $(e.target).closest('button').toggleClass("btn-info").toggleClass("btn-success");
    }

    $scope.displayChart = function($chart) {
        $scope.chartName = $chart.name;
        $scope.chartShortName = $chart.shortName;
        $scope.chartRequested = true;
    //    $scope.chartDialogOpts.templateUrl = '/iObserveAngular/partial/charts/' + $scope.chartShortName + '.html';
    //    openDialog();
    };

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

    $scope.getChartControllerName = function () {
        return "ChartCtrl-" + $scope.chartShortName;
    }
/*
    var openDialog = function(){
        var d = $dialog.dialog($scope.chartDialogOpts);
        d.open().then(function(result){
            if(result)
            {
                alert('dialog closed with result: ' + result);
            }
        });
    };
*/



})
/*
iObserveApp.controller('TestDialogController', ['$scope', function($scope, dialog, chartData) {
    $scope.chartData = chartData;
    $scope.close = function(result){
        dialog.close(result);
    };


    function plotChart() {

        ;
    }
    plotChart();
}]);
*/

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