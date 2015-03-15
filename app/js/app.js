function main() {
    var DISPLAY_WIDTH = 320;
    var DISPLAY_HEIGHT = 450;
    var STAGE_WIDTH = DISPLAY_WIDTH;
    var STAGE_HEIGHT = DISPLAY_WIDTH;
    var SCORE_LEFT = 16;
    var SCORE_TOP = 16;
    var SCORE_TITLE_WIDTH = 48;

    // 左右どちらのボタンが押されているかを管理します
    var INPUT_NONE = 0;
    var INPUT_LEFT = 1;
    var INPUT_RIGHT = 2;

    enchant();
    var core = new Core(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    core.preload("img/chara1.png", "img/icon1.png", "img/cursor.png", "img/heart.png");
    core.fps = 15;
    core.onload = function () {
        var newBackground = function () {
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
        };
        var newPlayer = function () {
            var width = 32;
            var height = 32;
            var sprite = new Sprite(width, height);
            sprite.image = core.assets["img/chara1.png"];
            sprite.frame = [0];
            sprite.x = (STAGE_WIDTH / 2) - (width / 2);
            sprite.y = (STAGE_HEIGHT / 2) - (height / 2);
            return sprite;
        };
        var newController = function () {
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
        };
        var newCursor = function () {
            var width = 120;
            var height = 120;
            var areaWidth = STAGE_WIDTH;
            var areaHeight = DISPLAY_HEIGHT - STAGE_HEIGHT;
            var sprite = new Sprite(width, height);
            sprite.image = core.assets["img/cursor.png"];
            sprite.x = (areaWidth / 2) - (width / 2);
            sprite.y = STAGE_HEIGHT + (areaHeight - height) / 2;
            return sprite;
        };
        var newScoreTitle = function () {
            var label = new Label();
            label.text = "Score:";
            label.font = "14px/16px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
            label.x = SCORE_LEFT;
            label.y = SCORE_TOP;
            return label;
        };
        var newScoreNumber = function () {
            var label = new Label();
            label.text = "0";
            label.font = "bold 16px/16px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
            label.x = SCORE_LEFT + SCORE_TITLE_WIDTH;
            label.y = SCORE_TOP;
            return label;
        };

        var startNewGame = function () {
            var gameScene = new Scene();
            var background = newBackground();
            var bear = newPlayer();
            var controller = newController();
            var cursor = newCursor();
            var scoreTitle = newScoreTitle();
            var scoreNumber = newScoreNumber();
            gameScene.addChild(background);
            gameScene.addChild(bear);
            gameScene.addChild(controller);
            gameScene.addChild(cursor);
            gameScene.addChild(scoreTitle);
            gameScene.addChild(scoreNumber);

            var currentInput = INPUT_NONE;

            // ハートをキャッチするたびに増える得点です
            var score = 0;

            // ボールがプレイヤーに当たった時に true になります
            var gameover = false;

            // 画面上のオブジェクトの密度をコントロールするための変数です
            var densityFactor = 0;

            /**
             * 右または左が入力された際の処理です。
             * 以下の処理を行います。
             * 
             * - ボタンのスプライトを変更し、押された感じを表現します
             * - プレイヤーのモーションを走っている状態にします
             * 
             * @param {Number} input INPUT_LEFT または INPUT_RIGHT
             */
            var receiveInput = function (input) {
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
             * ボタン上をタッチまたはスワイプした際に発火する関数です。
             * タッチされた座標から右か左かを判別して receiveInput を呼び出します
             * 
             * @param {Event} e
             */
            var inputCursor = function (e) {
                var input = (e.x < STAGE_WIDTH / 2) ? INPUT_LEFT : INPUT_RIGHT;
                receiveInput(input);
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

            // カーソルキーの右・左にも対応します
            gameScene.addEventListener(Event.LEFT_BUTTON_DOWN, function () {
                receiveInput(INPUT_LEFT);
            });
            gameScene.addEventListener(Event.LEFT_BUTTON_UP, function () {
                if (currentInput === INPUT_LEFT) {
                    stopCursor();
                }
            });
            gameScene.addEventListener(Event.RIGHT_BUTTON_DOWN, function () {
                receiveInput(INPUT_RIGHT);
            });
            gameScene.addEventListener(Event.RIGHT_BUTTON_UP, function () {
                if (currentInput === INPUT_RIGHT) {
                    stopCursor();
                }
            });

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
                        gameScene.removeChild(sprite);
                    }
                    // プレイヤーがハートをキャッチしたら得点を +1 します
                    if (sprite.within(bear, width / 2)) {
                        gameScene.removeChild(sprite);
                        score++;
                        scoreNumber.text = score;
                    }
                });
                return sprite;
            };
            var getBallSpeedFactor = function (age) {
                var rand = Math.random();
                if (age < 150) {
                    return rand;
                }
                if (age < 450) {
                    return rand * age / 150;
                }

                // 30 秒以降は緩急織り交ぜて出現させる
                var sinRand = 0.5 * Math.sin(Math.PI * (rand - 0.5)) + 0.5;
                if (age < 900) {
                    return sinRand * 3;
                }
                // 60 秒以降はさらに振れ幅を大きく
                return sinRand * 4;
            };
            var createBall = function (e) {
                var width = 16;
                var height = 16;
                var sprite = new Sprite(width, height);
                sprite.image = core.assets["img/icon1.png"];
                sprite.x = Math.random() * (STAGE_WIDTH - width);
                var topToBottom = (Math.random() < 0.5); // true: 上から下, false: 下から上
                var speed = 2 + getBallSpeedFactor(gameScene.age);
                sprite.y = topToBottom ? -width : STAGE_HEIGHT;
                var frameIndex = (Math.random() < 0.5) ? 0 : 1;
                sprite.frame = [frameIndex];
                sprite.addEventListener(Event.ENTER_FRAME, function (e) {
                    sprite.rotate(15);
                    if (gameover) {
                        return;
                    }
                    sprite.y += topToBottom ? speed : -speed;
                    var out = (topToBottom && STAGE_HEIGHT < sprite.y) || (!topToBottom && sprite.y < -width);
                    if (out) {
                        gameScene.removeChild(sprite);
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
                        gameScene.removeEventListener(Event.ENTER_FRAME, createObject);
                        gameScene.tl.cue({
                            60: startNewGame
                        });
                    }
                });
                return sprite;
            };
            /**
             * オブジェクトの出現確率の上昇率を返します。
             * 時間が経てば経つほどオブジェクトが出現しやすくなります。
             * 
             * @param {Number} age
             * @returns {Number}
             */
            var getHardness = function (age) {
                if (age < 4) {
                    return 0.25;
                }
                if (age < 150) {
                    return 0.003;
                }
                if (age < 300) {
                    return 0.005;
                }
                if (age < 450) {
                    return 0.007;
                }
                if (age < 600) {
                    return 0.01;
                }
                if (age < 750) {
                    return 0.02;
                }
                if (age < 900) {
                    return 0.03;
                }
                if (age < 1050) {
                    return 0.05;
                }
                if (age < 1200) {
                    return 0.07;
                }
                if (age < 1500) {
                    return 0.1;
                }
                return 0.2;
            };
            /**
             * ハートの出現率を返します。
             * 時間が経てば経つほどボールの割合が増え、ハートの割合が減ります。
             * @param {Number} age
             * @returns {Number}
             */
            var getHeartFreq = function (age) {
                if (age < 600) {
                    return 0.5;
                }
                if (age < 900) {
                    return 0.4;
                }
                if (age < 1200) {
                    return 0.3;
                }
                return 0.2;
            };
            var createObject = function (e) {
                densityFactor = Math.min(0.5, densityFactor + getHardness(gameScene.age));
                var rand = Math.random();
                if (densityFactor < rand) {
                    return;
                }

                if (rand < densityFactor * getHeartFreq(gameScene.age)) {
                    var heart = createHeart();
                    gameScene.insertBefore(heart, controller);
                } else {
                    var ball = createBall();
                    gameScene.insertBefore(ball, controller);
                }
                densityFactor = 0;
            };
            gameScene.addEventListener(Event.ENTER_FRAME, createObject);
            core.replaceScene(gameScene);
        };

        startNewGame();
    };
    core.start();
}
