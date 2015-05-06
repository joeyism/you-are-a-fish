// jshint ignore: start

'use strict';

angular.module('youAreAFishApp').directive('fishbowl',['$compile','$interval',function($compile,$interval){

    return {
        restrict: 'A',
        templateUrl: 'app/tpl/fishbowl-tpl.html',
        link: function(scope,element){

            var maxVelocity = 0.001,
                fishes=[],
                noOfFishes = 8,
                tankWidth = 1024,
                tankHeight =570,
                width = tankWidth - 100,
                height= tankHeight - 80,
                fishNodes,
            textAnim,
            intervalPeriod = 50;

            var socket = io();


            var randomWithCeil = function(num){
                return Math.ceil(Math.random()*num);
            };

            var imageFlipper = function(d){
                if (d.vx > 0){
                    return d.imageFlip;
                } else {
                    return d.image;
                };
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
                this.user = "";
            };

            var addNewFish = function(user){
                var thisFish = new fish();
                fishes.push({
                    msg: thisFish.msg,
                    x: thisFish.x,
                    y: thisFish.y,
                    vx: thisFish.vx,
                    vy: thisFish.vy,
                    v: thisFish.v,
                    image: thisFish.image,
                    imageFlip: thisFish.imageFlip,
                    user: user
                });
            };

            var tip = d3.tip()
            .attr('class', 'd3-tip')
            //.offset([-10, 0])
            .html(function(d) {
                return "<p class='triangle-right'>" + d.msg+"</p>";
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
                .attr("id",function(d){return d.user; })
                .attr("xlink:href",function(d){return imageFlipper(d);})
                .attr("x", function(d,i){return d.x;})
                .attr("y", function(d,i){return d.y;})
                .attr("width", "10%")
                .attr("height","10%")
                //.on('mouseover', tip.show)
                //.on('mouseout', tip.hide)
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
                    return imageFlipper(d);
                });
            };

            scope.submit = function(){
                socket.emit('chat message',scope.msg);
                scope.msg = "";
            };

            scope.refreshFish = function(){
                $interval.cancel(textAnim);
                showFishes();
                scope.refreshFish();
            };

            // chatting
            socket.on('chat message', function(response){
                var responseObj = JSON.parse(response);
                fishes.forEach(function(fish, i){
                    if (fish.user === responseObj.user){
                        fishes[i].msg = responseObj.msg;
                        var thisFish = fishes[i];
                        var messageShow = $interval(function(){tip.show(thisFish, document.getElementById(thisFish.user));}, intervalPeriod);
                    }
                });
            });

            socket.on('connectme', function(response){
                var user = JSON.parse(response).user;
                var length = JSON.parse(response).length;
                noOfFishes = length;
                while (fishes.length < length+1){
                    scope.appendFish(user);
                }
            });

            socket.on('disconnectme',function(user){
                scope.removeFish(user);
            });

            // fishes
            textAnim = $interval(function (index) {
                moveFishes();
            }, intervalPeriod);
            addNewFish();
            showFishes();

        }
    };

}]);
