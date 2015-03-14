function main() {
    var DISPLAY_WIDTH = 320;
    var DISPLAY_HEIGHT = 450;
    var STAGE_WIDTH = DISPLAY_WIDTH;
    var STAGE_HEIGHT = DISPLAY_WIDTH;

    enchant();
    var core = new Core(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    core.preload("img/chara1.png", "img/cursor.png");
    core.fps = 15;
    core.onload = function () {
        var background = (function () {
            var sprite = new Sprite(STAGE_WIDTH, STAGE_HEIGHT);
            sprite.image = (function () {
                var surface = new Surface(STAGE_WIDTH, STAGE_HEIGHT);
                var context = surface.context;
                context.fillStyle = (function () {
                    var grad = context.createLinearGradient(0, 0, 0, STAGE_HEIGHT);
                    grad.addColorStop(0, "#cceedd");
                    grad.addColorStop(0.5, "#aaccbb");
                    grad.addColorStop(1, "#668877");
                    return grad;
                })();
                context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
                return surface;
            })();
            return sprite;
        })();
        var bear = (function () {
            var width = 32;
            var height = 32;
            var sprite = new Sprite(width, height);
            sprite.image = core.assets["img/chara1.png"];
            sprite.frame = [0];
            sprite.x = (STAGE_WIDTH / 2) - (width / 2);
            sprite.y = (STAGE_HEIGHT / 2) - (height / 2);
            return sprite;
        })();
        var cursor = (function () {
            var width = 120;
            var height = 120;
            var areaWidth = STAGE_WIDTH;
            var areaHeight = DISPLAY_HEIGHT - STAGE_HEIGHT;
            var sprite = new Sprite(width, height);
            sprite.image = core.assets["img/cursor.png"];
            sprite.x = (areaWidth / 2) - (width / 2);
            sprite.y = STAGE_HEIGHT + (areaHeight - height) / 2;
            return sprite;
        })();
        core.rootScene.addChild(background);
        core.rootScene.addChild(bear);
        core.rootScene.addChild(cursor);
    };
    core.start();
}
