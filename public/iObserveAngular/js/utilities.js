iObserveApp.factory('iObserveUtilities', function () {
    var timeConverter = function($ts){
        var a = new Date($ts*1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date+','+month+' '+year+' '+hour+':'+min+':'+sec ;
        return time;
    };

    var tDiff = function($a,$b) {
        var a = new Date($a*1000);
        var b = new Date($b*1000);

        var nTotalDiff = b.getTime() - a.getTime();
        var oDiff = new Object();

        oDiff.days = Math.floor(nTotalDiff/1000/60/60/24);
        nTotalDiff -= oDiff.days*1000*60*60*24;

        oDiff.hours = Math.floor(nTotalDiff/1000/60/60);
        nTotalDiff -= oDiff.hours*1000*60*60;

        oDiff.minutes = Math.floor(nTotalDiff/1000/60);
        nTotalDiff -= oDiff.minutes*1000*60;

        oDiff.seconds = Math.floor(nTotalDiff/1000);

        return oDiff;
    };

    return {
        timeConverter : timeConverter,
        tDiff : tDiff
    }
});

//  Place a tag called <markdown></markdown> in a html file and this directive will convert any contained plain text to markup.
iObserveApp.directive('markdown', function () {
    var converter = new Showdown.converter();
    return {
        restrict: 'E',
        link:function(scope,element,attrs) {
            var htmlText = converter.makeHtml(element.text());
            element.html(htmlText)
        }
    }
})