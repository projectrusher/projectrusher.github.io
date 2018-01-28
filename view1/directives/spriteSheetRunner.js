let refresh;
let curDist;
myDirectives.directive('spriteSheetRunner', ['loaderSvc','Sky', 'Ground', 'Hill', 'Character', function (loaderSvc, Sky, Ground, Hill, Character) {
        "use strict";
        return {
            restrict : 'E',
            replace : true,
            scope :{
                width: '=width',
                height: '=height',
                score: '=score',
                lifesCount: '=lifesCount',
                setFn: '&'
            },
            template: "<canvas></canvas>",
            link: function (scope, element, attribute) {
                var w, h, sky, grant, ground, hill, hill2, runningSoundInstance;
                drawGame();
                element[0].width = scope.width;
                element[0].height = scope.height;
                w = scope.width;
                h = scope.height;
                function drawGame() {
                    //drawing the game canvas from scratch here
                    if (scope.stage) {
                        scope.stage.autoClear = true;
                        scope.stage.removeAllChildren();
                        scope.stage.update();
                    } else {
                        scope.stage = new createjs.Stage(element[0]);
                    }
                    w = '100%';
                    h = scope.stage.canvas.height;
                    loaderSvc.getLoader().addEventListener("complete", handleComplete);
                    loaderSvc.loadAssets();
                }
                function handleComplete() {
                    sky = new Sky({width:w, height:h});
                    sky.addToStage(scope.stage);
                    ground = new Ground({width:w, height:h});
                    hill = new Hill({width:w, height:h, scaleFactor: 3, assetName: 'hill', groundHeight: ground.getHeight()});
                    hill.setAlpha(0.7);
                    hill.addToStage(scope.stage);
                    hill2 = new Hill({width:w, height:h, scaleFactor: 2, assetName: 'hill2', groundHeight: ground.getHeight()});
                    hill2.addToStage(scope.stage);
                    ground.addToStage(scope.stage);

                    createjs.Ticker.timingMode = createjs.Ticker.RAF;
                    createjs.Ticker.addEventListener("tick", tickStop);
                    scope.status = "paused";
                    scope.updateMap = addGrant;
                    scope.setFn({theDirFn: scope.updateMap});
                    
                    scope.$on('startfunction', run);
                    scope.$on('addGrant', addGrant);

                    scope.$apply();
                }
                function addGrant(event, option) {
                    document.getElementById('gender').value = option;
                    if (grant) {
                        grant.removeFromStage(scope.stage);
                    }
                    switch(option) {
                        case 0:
                            grant = new Character(
                                {
                                    characterAssetName: 'grant2', 
                                    y: 100,
                                    width: 131,
                                    height: 144,
                                    count: 25,
                                    startRun: 15,
                                    endRun: 24,
                                    startStop: 0,
                                    endStop: 14,
                                    regX: -70
                                })
                            break;
                        case 1:
                            grant = new Character(
                                {
                                    characterAssetName: 'grant', 
                                    y: 100,
                                    width: 120,
                                    height: 145,
                                    count: 25,
                                    startRun: 15,
                                    endRun: 24,
                                    startStop: 0,
                                    endStop: 14,
                                    regX: -90
                                })
                            break;
                    }
                    grant.addToStage(scope.stage);
                    scope.$apply();
                }
                function run(event, distance) {
                    if (scope.status === "paused") {
                        createjs.Ticker.addEventListener("tick", tickRun);
                        scope.status = "running";
                        grant.playAnimation("run");
                        runningSoundInstance = createjs.Sound.play("runningSound", {loop: -1});
                        curDist = distance
                        refresh = setInterval(function(){ 
                            if (scope.score < curDist) {
                                scope.score = scope.score + 1;
                                scope.$apply();
                            }
                            if (scope.score === curDist) {
                                stopRun();
                            }
                        }, 1000);
                    } else {
                        clearInterval(refresh); 
                        createjs.Ticker.removeEventListener("tick", tickRun);
                        scope.status = "paused";
                        run(event, distance);
                    }
                }
                function stopRun() {
                    if (scope.status === "running") {
                        createjs.Ticker.removeEventListener("tick", tickRun);
                        createjs.Ticker.addEventListener("tick", tickStop);
                        scope.status = "paused";
                        grant.playAnimation("stop");
                        createjs.Sound.stop();
                        clearInterval(refresh); 
                    }
                }
                function tickRun(event) {
                    var deltaS = event.delta / 1000;
                    /*var position = grant.getX() + 0 * deltaS;

                    grant.setX((position >= w + grant.getWidth()) ? -grant.getWidth() : position);*/
                    ground.setX((ground.getX() - deltaS * 150) % ground.getTileWidth());
                    hill.move(deltaS * -30, 0);
                    if (hill.getX() + hill.getImageWidth() * hill.getScaleX() <= 0) {
                        hill.setX(w);
                    }
                    hill2.move(deltaS * -45, 0);
                    if (hill2.getX() + hill2.getImageWidth() * hill2.getScaleX() <= 0) {
                        hill2.setX(w);
                    }
                    scope.stage.update(event);
                }
                function tickStop(event) {
                    scope.stage.update(event);
                }
            }
        }
    }]);
