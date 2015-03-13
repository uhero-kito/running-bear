function main() {
    var DISPLAY_WIDTH = 320;
    var DISPLAY_HEIGHT = 450;

    enchant();
    var core = new Core(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    core.fps = 15;
    core.onload = function () {
    };
    core.start();
}
