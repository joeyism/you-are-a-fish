// jshint ignore: start

'use strict';

angular.module('youAreAFishApp').directive('fishbowl',['$compile','$interval',function($compile,$interval){

    return {
        restrict: 'A',
        templateUrl: 'app/tpl/fishbowl-tpl.html',
        link: function(scope,element){

            var maxVelocity = 5,
                fishes=[],
                noOfFishes = 8,
                tankWidth = 1024,
                tankHeight =570,
                width = tankWidth - 100,
                height= tankHeight - 80,
                fishNodes,
            textAnim,
            intervalPeriod = 100;

            var socket = io();


            var randomWithCeil = function(num){
                return Math.ceil(Math.random()*num);
            };

            var fish = function(){
                var fishPicNo = randomWithCeil(3);
                this.image = '/assets/images/fishes/fish_' + fishPicNo + '.png';
                this.imageFlip = '/assets/images/fishes/fish_' + fishPicNo + '_flipped.png';

                this.y = randomWithCeil(height);
                this.x = randomWithCeil(width);

                this.vx = randomWithCeil(maxVelocity);
                this.vy = randomWithCeil(maxVelocity);
                this.v = this.vy/this.vx;

                this.msg = "";
            };

            var addNewFish = function(){
                var thisFish = new fish();
                fishes.push({
                    msg: thisFish.msg,
                    x: thisFish.x,
                    y: thisFish.y,
                    vx: thisFish.vx,
                    vy: thisFish.vy,
                    v: thisFish.v,
                    image: thisFish.image,
                    imageFlip: thisFish.imageFlip
                });
            };

            var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Frequency:</strong> <span style='color:red'>" + d.msg+"rawr" + "</span>";
            });

            var mySvg = d3.select('#fishbowl')
            .append("svg")
            .attr("width", tankWidth)
            .attr("height", tankHeight);

            mySvg.call(tip);

            mySvg.append("image")
            .attr("xlink:href","/assets/images/fishtank.jpg")
            .attr("width","100%")
            .attr("height","100%");

            var showFishes = function(){
                fishNodes = mySvg.selectAll("image")
                .data(fishes)
                .enter()
                .append("svg:image")
                .attr("xlink:href",function(d){return d.imageFlip;})
                .attr("x", function(d,i){return d.x;})
                .attr("y", function(d,i){return d.y;})
                .attr("width", "10%")
                .attr("height","10%")
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .call(function(){
                    $compile(this[0].parentNode)(scope);
                });
            }

            var moveFishes= function() {
                fishNodes.attr("x", function(d) { 
                    if (d.x >= width || d.x <= 0){
                        d.vx = -d.vx;
                    }
                    d.x+= d.vx; 
                    return d.x; 
                })
                .attr("y", function(d) { 
                    if (d.y >= height || d.y <= 0){
                        d.vy = -d.vy;
                    }
                    d.y+=d.vy; 
                    return d.y; 
                })
                .attr("xlink:href",function(d){
                    if (d.vx > 0){
                        return d.imageFlip;
                    } else {
                        return d.image;
                    };
                });
            };

            scope.submit = function(){
                console.info(scope.msg);
                socket.emit('chat message',scope.msg);
            };

            scope.addNewFish = function(){
                fishNodes.remove();
                addNewFish();
                $interval.cancel(textAnim);
                showFishes();
                textAnim = $interval(function (index) {
                    moveFishes();
                }, intervalPeriod);
            };

            // chatting
            socket.on('chat message', function(msg){
                console.info(msg); 
            });

            socket.on('connectme', function(response){
                var ip = JSON.parse(response).ip;
                var length = JSON.parse(response).length;
                console.info(ip,length);
                noOfFishes = length;
                while (fishes.length < length){
                    scope.addNewFish();
                }
            });

            // fishes
            textAnim = $interval(function (index) {
                moveFishes();
            }, intervalPeriod);
            //for (var i = 0; i < noOfFishes+1; i++){
                addNewFish();
            //} 
            showFishes();

        }
    };

}]);
