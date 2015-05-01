// jshint ignore: start

'use strict';

angular.module('youAreAFishApp').directive('fishbowl',['$compile',function($compile){

    return {
        restrict: 'A',
        templateUrl: 'app/tpl/fishbowl-tpl.html',
        link: function(scope,element){
            scope.nodes = [
                {"name": "foo", x: 50, y: 50, image:'/assets/images/fishes/fish_1.png'},
                {"name": "bar", x: 100, y: 100, image:'/assets/images/fishes/fish_1.png'}
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

            mySvg.selectAll("image")
            .data(scope.nodes)
            .enter()
            .append("svg:image")
            .attr("xlink:href",function(d){console.info(d.image); return d.image;})
            .attr("x", function(d,i){return d.x;})
            .attr("y", function(d,i){return d.y;})
            .attr("width", 100)
            .attr("height",100)
            .attr("tooltip-append-to-body", true)
            .attr("tooltip", function(d){
                return d.name;
            })
            .call(function(){
                $compile(this[0].parentNode)(scope);
            });



        }
    };

}]);
