uiClasses.factory("Character", ['loaderSvc', function (loaderSvc) {
    function Character(obj) {
        var spriteSheet = new createjs.SpriteSheet({
            framerate: 24,
            "images": [loaderSvc.getResult(obj.characterAssetName)],
            "frames": {"regX": obj.regX, "height": obj.height, "count": obj.count, "regY": 0, "width": obj.width, "spacing": 1},
            // define two animations, run (loops, 1.5x speed) and jump (returns to run):
            "animations": {
                "run": [obj.startRun, obj.endRun, "run", 0.7],
                "stop": [obj.startStop, obj.endStop, "stop", 1]
            }
        });
        this.grant = new createjs.Sprite(spriteSheet, "stop");
        this.grant.y = obj.y;

    }
    Character.prototype = {
        addToStage: function (stage) {
            stage.addChild(this.grant);
        },
        removeFromStage: function (stage) {
            stage.removeChild(this.grant);
        },
        getWidth: function () {
          return this.grant.getBounds().width * this.grant.scaleX;
        },
        getX: function () {
            return this.grant.x;
        },
        setX: function (val) {
            this.grant.x =  val;
        },
        playAnimation: function (animation) {
            this.grant.gotoAndPlay(animation);
        }
    };
    return (Character);
}
]);