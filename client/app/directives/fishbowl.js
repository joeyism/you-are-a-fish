// jshint ignore: start

'use strict';

angular.module('youAreAFishApp').directive('fishbowl',['$compile',function($compile){

    return {
        restrict: 'A',
        templateUrl: 'app/tpl/fishbowl-tpl.html',
        link: function(scope,element){
            scope.nodes = [
                {"name": "foo", x: 50, y: 50},
                {"name": "bar", x: 100, y: 100}
            ];
            scope.moveDots = function(){
                for(var n = 0; n < $scope.nodes.length; n++){
                    var node = $scope.nodes[n];
                    node.x = Math.random() * 200 + 20;
                    node.y = Math.random() * 200 + 20;
                }
            }

            var mySvg = d3.select(element[0])
            .append("svg")
            .attr("width", 250)
            .attr("height", 250);

            mySvg.selectAll("circle")
            .data(scope.nodes)
            .enter()
            .append("circle")
            .attr("tooltip-append-to-body", true)
            .attr("tooltip", function(d){
                return d.name;
            })
            .call(function(){
                $compile(this[0].parentNode)(scope);
            });
            mySvg.selectAll("circle")
            .attr("cx", function(d,i){
                return d.x;
            })
            .attr("cy", function(d,i){
                return d.y;
            })
            .attr("r", 10);



        }
    };

}]);
