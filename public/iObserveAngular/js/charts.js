iObserveApp.factory('iObserveCharting', function () {
        var sessionChartList = [
            {
                id: 1,
                name: "Position over time"
            },
            {
                id: 2,
                name: "Interactions for a single session"
            }
        ];
        var studyChartList = [
            {
                id: 3,
                name: "Visitor demographics"
            }
        ];
        return {
            sessionChartList : sessionChartList,
            studyChartList : studyChartList
        }
});