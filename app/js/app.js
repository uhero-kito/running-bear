function main() {
    var DISPLAY_WIDTH = 320;
    var DISPLAY_HEIGHT = 450;
    var STAGE_WIDTH = DISPLAY_WIDTH;
    var STAGE_HEIGHT = DISPLAY_WIDTH;

    enchant();
    var core = new Core(DISPLAY_WIDTH, DISPLAY_HEIGHT);
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
        core.rootScene.addChild(background);
    };
    core.start();
}
