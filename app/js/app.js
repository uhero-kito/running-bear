function main() {
    var DISPLAY_WIDTH = 320;
    var DISPLAY_HEIGHT = 450;
    var STAGE_WIDTH = DISPLAY_WIDTH;
    var STAGE_HEIGHT = DISPLAY_WIDTH;
    var SCORE_LEFT = 16;
    var SCORE_TOP = 16;
    var SCORE_TITLE_WIDTH = 48;

    enchant();
    var core = new Core(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    core.preload("img/chara1.png", "img/icon1.png", "img/cursor.png", "img/heart.png");
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
        var controller = (function () {
            var areaWidth = STAGE_WIDTH;
            var areaHeight = DISPLAY_HEIGHT - STAGE_HEIGHT;
            var sprite = new Sprite(areaWidth, areaHeight);
            sprite.image = (function () {
                var surface = new Surface(areaWidth, areaHeight);
                surface.context.fillStyle = "#ffffff";
                surface.context.fillRect(0, 0, areaWidth, areaHeight);
                return surface;
            })();
            sprite.x = 0;
            sprite.y = STAGE_HEIGHT;
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
        var scoreTitle = (function () {
            var label = new Label();
            label.text = "Score:";
            label.font = "14px/16px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
            label.x = SCORE_LEFT;
            label.y = SCORE_TOP;
            return label;
        })();
        var scoreNumber = (function () {
            var label = new Label();
            label.text = "0";
            label.font = "bold 16px/16px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
            label.x = SCORE_LEFT + SCORE_TITLE_WIDTH;
            label.y = SCORE_TOP;
            return label;
        })();
        core.rootScene.addChild(background);
        core.rootScene.addChild(bear);
        core.rootScene.addChild(controller);
        core.rootScene.addChild(cursor);
        core.rootScene.addChild(scoreTitle);
        core.rootScene.addChild(scoreNumber);

        // 左右どちらのボタンが押されているかを管理します
        var INPUT_NONE = 0;
        var INPUT_LEFT = 1;
        var INPUT_RIGHT = 2;
        var currentInput = INPUT_NONE;

        // ハートをキャッチするたびに増える得点です
        var score = 0;

        // ボールがプレイヤーに当たった時に true になります
        var gameover = false;

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

                if (!gameover) {
                    var newScale = (currentInput === INPUT_RIGHT) ? 1 : -1;
                    bear.scaleX = newScale;
                    bear.frame = [0, 0, 1, 1, 0, 0, 2, 2];
                }
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
            if (!gameover) {
                bear.frame = [0];
            }
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

        var createHeart = function () {
            var width = 32;
            var height = 32;
            var sprite = new Sprite(width, height);
            sprite.image = core.assets["img/heart.png"];
            sprite.x = Math.random() * (STAGE_WIDTH - width);
            var topToBottom = (Math.random() < 0.5); // true: 上から下, false: 下から上
            sprite.y = topToBottom ? -width : STAGE_HEIGHT;
            sprite.frame = [0, 0, 0, 1, 1, 1];
            sprite.addEventListener(Event.ENTER_FRAME, function (e) {
                if (gameover) {
                    return;
                }
                sprite.y += topToBottom ? 3 : -3;
                var out = (topToBottom && STAGE_HEIGHT < sprite.y) || (!topToBottom && sprite.y < -width);
                if (out) {
                    core.rootScene.removeChild(sprite);
                }
                // プレイヤーがハートをキャッチしたら得点を +1 します
                if (sprite.within(bear, width / 2)) {
                    core.rootScene.removeChild(sprite);
                    score++;
                    scoreNumber.text = score;
                }
            });
            return sprite;
        };
        var createBall = function (e) {
            var width = 16;
            var height = 16;
            var sprite = new Sprite(width, height);
            sprite.image = core.assets["img/icon1.png"];
            sprite.x = Math.random() * (STAGE_WIDTH - width);
            var topToBottom = (Math.random() < 0.5); // true: 上から下, false: 下から上
            var speed = 2 + (Math.random() * 3);
            sprite.y = topToBottom ? - width : STAGE_HEIGHT;
            var frameIndex = (Math.random() < 0.5) ? 0 : 1;
            sprite.frame = [frameIndex];
            sprite.addEventListener(Event.ENTER_FRAME, function (e) {
                sprite.rotate(15);
                if (gameover) {
                    return;
                }
                sprite.y += topToBottom ? speed : - speed;
                var out = (topToBottom && STAGE_HEIGHT < sprite.y) || (!topToBottom && sprite.y < - width);
                if (out) {
                    core.rootScene.removeChild(sprite);
                }
                // ボールがプレイヤーに当たったらゲームオーバーとします
                if (sprite.within(bear, width)) {
                    gameover = true;
                    bear.frame = [3];
                    bear.removeEventListener(Event.ENTER_FRAME, moveBear);
                    bear.tl.moveTo(bear.x, STAGE_HEIGHT + 64, 15, function (t, b, c, d) {
                        var peak = 0.25;
                        var x = (t / d) - peak;
                        return 2 * (x * x * (c - b) + b - (peak * peak));
                    });
                }
            });
            return sprite;
        };
        var createObject = function (e) {
            var rand = Math.random();
            if (0.06 < rand) {
                return;
            }

            if (0.03 < rand) {
                var heart = createHeart();
                core.rootScene.insertBefore(heart, controller);
            } else {
                var ball = createBall();
                core.rootScene.insertBefore(ball, controller);
            }
        };
        core.rootScene.addEventListener(Event.ENTER_FRAME, createObject);
    };
    core.start();
}
