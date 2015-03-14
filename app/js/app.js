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

        // 左右どちらのボタンが押されているかを管理します
        var INPUT_NONE = 0;
        var INPUT_LEFT = 1;
        var INPUT_RIGHT = 2;
        var currentInput = INPUT_NONE;

        /**
         * ボタン上をタッチまたはスワイプした際に発火する関数です。
         * 以下の処理を行います。
         * 
         * - ボタンのスプライトを変更し、押された感じを表現します
         * - プレイヤーのモーションを走っている状態にします
         * 
         * @param {Event} e
         */
        var inputCursor = function (e) {
            var input = (e.x < STAGE_WIDTH / 2) ? INPUT_LEFT : INPUT_RIGHT;
            if (currentInput !== input) {
                currentInput = input;
                cursor.frame = [input];

                var newScale = (currentInput === INPUT_RIGHT) ? 1 : -1;
                bear.scaleX = newScale;
                bear.frame = [0, 0, 1, 1, 0, 0, 2, 2];
            }
        };

        /**
         * ボタンから指を離した際に発火する関数です。
         * 以下の処理を行います。
         * 
         * - ボタンのスプライトをデフォルトに変更します
         * - プレイヤーのモーションを止まっている状態にします
         * 
         * @param {Event} e
         */
        var stopCursor = function (e) {
            currentInput = INPUT_NONE;
            cursor.frame = [INPUT_NONE];
            bear.frame = [0];
        };
        cursor.addEventListener(Event.TOUCH_START, inputCursor);
        cursor.addEventListener(Event.TOUCH_MOVE, inputCursor);
        cursor.addEventListener(Event.TOUCH_END, stopCursor);

        /**
         * フレーム毎に実行される関数です。
         * もしも右か左のボタンが押されていたら、プレイヤーの位置を移動させます。
         * 
         * @param {Event} e
         */
        var moveBear = function (e) {
            if (currentInput === INPUT_NONE) {
                return;
            }

            var dx = (currentInput === INPUT_LEFT) ? -5 : 5;
            var newX = Math.min(Math.max(bear.x + dx, 0), STAGE_WIDTH - 32);
            bear.x = newX;
        };
        bear.addEventListener(Event.ENTER_FRAME, moveBear);
    };
    core.start();
}
