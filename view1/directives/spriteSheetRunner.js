var refresh;
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
                    w = scope.stage.canvas.width;
                    h = scope.stage.canvas.height;
                    loaderSvc.getLoader().addEventListener("complete", handleComplete);
                    loaderSvc.loadAssets();
                }
                function handleComplete() {
                    sky = new Sky({width:w, height:h});
                    sky.addToStage(scope.stage);
                    ground = new Ground({width:w, height:h});
                    hill = new Hill({width:w, height:h, scaleFactor: 4, assetName: 'hill', groundHeight: ground.getHeight()});
                    hill.setAlpha(0.7);
                    hill.addToStage(scope.stage);
                    hill2 = new Hill({width:w, height:h, scaleFactor: 3, assetName: 'hill2', groundHeight: ground.getHeight()});
                    hill2.addToStage(scope.stage);
                    ground.addToStage(scope.stage);

                    scope.stage.addEventListener("stagemousedown", handleEvent);
                    createjs.Ticker.timingMode = createjs.Ticker.RAF;
                    createjs.Ticker.addEventListener("tick", tickStop);
                    scope.status = "paused";
                    window.onkeydown = keydown;
                    scope.updateMap = addGrant;
                    scope.setFn({theDirFn: scope.updateMap});
                    scope.$apply();
                }
                function addGrant(option) {
                    document.getElementById('gender').value = option;
                    if (grant) {
                        grant.removeFromStage(scope.stage);
                    }
                    switch(option) {
                        case 0:
                            grant = new Character(
                                {
                                    characterAssetName: 'grant2', 
                                    y: 136,
                                    width: 173,
                                    height: 192,
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
                                    y: 136,
                                    width: 160,
                                    height: 193,
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
                function run() {
                    if (scope.status === "paused") {
                        createjs.Ticker.addEventListener("tick", tickRun);
                        scope.status = "running";
                        grant.playAnimation("run");
                        refresh = setInterval(function(){ 
                            scope.score = scope.score + 1;
                            scope.$apply();    
                        }, 1000);
                    }
                }
                function stopRun() {
                    if (scope.status === "running") {
                        createjs.Ticker.removeEventListener("tick", tickRun);
                        createjs.Ticker.addEventListener("tick", tickStop);
                        scope.status = "paused";
                        grant.playAnimation("stop");
                        clearInterval(refresh); 
                    }
                }
                function handleEvent() {
                    if (scope.status === "paused") {
                        run();
                    } else if (scope.status === "running") {
                        stopRun();
                    }
                }
                function keydown(event) {
                    if (event.keyCode === 39) {//if keyCode is "Right"
                        run()
                    }
                    if (event.keyCode === 37) {//if keyCode is "Left"
                        stopRun();
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
