function main() {
    var DISPLAY_WIDTH = 320;
    var DISPLAY_HEIGHT = 512;
    var STAGE_WIDTH = DISPLAY_WIDTH;
    var STAGE_HEIGHT = 360;
    var SCORE_LEFT = 16;
    var SCORE_TOP = 16;
    var SCORE_TITLE_WIDTH = 48;
    var TITLE_TOP = 120;
    var GAMEOVER_TOP = 200;

    // 左右どちらのボタンが押されているかを管理します
    var INPUT_NONE = 0;
    var INPUT_LEFT = 1;
    var INPUT_RIGHT = 2;

    var lastScore = 0;
    var highScore = 0;
    var volume = false;
    var playingBGM = null;

    // 表示領域をデバイスの中央に設定します
    (function () {
        var doc = document.documentElement;
        var width = doc.clientWidth;
        var height = doc.clientHeight;
        var canvasAspect = DISPLAY_WIDTH / DISPLAY_HEIGHT;
        var windowAspect = doc.clientWidth / doc.clientHeight;
        console.log("canvas:%s, window:%s", canvasAspect, windowAspect);
        var bodyStyle = document.getElementsByTagName("body")[0].style;
        if (canvasAspect < windowAspect) {
            var newHeight = height;
            var newWidth = height * canvasAspect;
        }
        if (windowAspect < canvasAspect) {
            var newHeight = width / canvasAspect;
            var newWidth = width;
        }
        bodyStyle.width = newWidth + "px";
        bodyStyle.height = newHeight + "px";
        console.log(bodyStyle);
    })();

    enchant();
    var core = new Core(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    core.preload("img/chara1.png", "img/icon1.png", "img/cursor.png", "img/heart.png", "img/title-logo.png", "img/start.png", "img/gameover.png", "img/retry.png", "img/send-score.png", "img/volume.png", "img/yourname.png", "img/alphabets.png"
            , "sound/main.mp3", "sound/hit.wav", "sound/get.wav", "sound/start.wav");
    core.fps = 15;
    core.onload = function () {
        var playSE = function (filename) {
            if (!volume) {
                return;
            }
            var se = core.assets["sound/" + filename];
            se.clone().play();
        };
        var playBGM = function (filename) {
            if (playingBGM) {
                core.assets["sound/" + playingBGM].stop();
            }
            var bgm = core.assets["sound/" + filename];
            var vol = volume ? 1 : 0;
            bgm.play();
            bgm.volume = vol;
            bgm.src.loop = true;
            playingBGM = filename;
        };
        var stopBGM = function () {
            if (!playingBGM) {
                return;
            }
            var bgm = core.assets["sound/" + playingBGM];
            bgm.stop();
            bgm.src.loop = false;
            playingBGM = null;
        };

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
                surface.context.fillStyle = "#ffeecc";
                surface.context.fillRect(0, 0, areaWidth, areaHeight);
                return surface;
            })();
            sprite.x = 0;
            sprite.y = STAGE_HEIGHT;
            return sprite;
        };
        var newCursor = function () {
            var width = 240;
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
        /**
         * 右下に設置する音声の ON/OFF コントロールボタンを生成します。
         * @param {Boolean} isBlack 黒アイコンの場合は true, 白アイコンの場合は false
         * @returns {Sprite}
         */
        var newVolumeControl = function (isBlack) {
            var width = 64;
            var height = 64;
            var sprite = new Sprite(width, height);
            var index = (isBlack ? 0 : 2) + (volume ? 0 : 1); // 黒 ON: 0, 黒 OFF: 1, 白 ON: 2, 白 OFF: 3
            sprite.image = core.assets["img/volume.png"];
            sprite.frame = [index];
            sprite.x = DISPLAY_WIDTH - width;
            sprite.y = DISPLAY_HEIGHT - height;
            sprite.addEventListener(Event.TOUCH_END, function () {
                volume = volume ? false : true; // toggle
                if (playingBGM) {
                    var bgm = core.assets["sound/" + playingBGM];
                    var vol = volume ? 1 : 0;
                    bgm.volume = vol;
                }
                var index = (isBlack ? 0 : 2) + (volume ? 0 : 1);
                sprite.frame = [index];
            });
            return sprite;
        };

        var startNewGame = function () {
            var gameScene = new Scene();
            var background = newBackground();
            var bear = newPlayer();
            var controller = newController();
            var cursor = newCursor();
            var scoreTitle = newScoreTitle();
            var scoreNumber = newScoreNumber();
            var volume = newVolumeControl(true);
            gameScene.addChild(background);
            gameScene.addChild(bear);
            gameScene.addChild(controller);
            gameScene.addChild(cursor);
            gameScene.addChild(volume);
            gameScene.addChild(scoreTitle);
            gameScene.addChild(scoreNumber);

            var currentInput = INPUT_NONE;

            // ハートをキャッチするたびに増える得点です
            var score = 0;

            // ボールがプレイヤーに当たった時に true になります
            var gameover = false;

            // 画面上のオブジェクトの密度をコントロールするための変数です
            var densityFactor = 0;

            // ハートの出現頻度をコントロールするための変数です
            var heartFactor = 0;

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
                        playSE("get.wav");
                    }
                });
                return sprite;
            };
            var getBallSpeedFactor = function (score) {
                var rand = Math.random();
                if (score < 5) {
                    return rand;
                }
                if (score < 15) {
                    return rand * score / 5;
                }

                // 15 点以上は緩急織り交ぜて出現させる
                var sinRand = 0.5 * Math.sin(Math.PI * (rand - 0.5)) + 0.5;
                if (score < 25) {
                    return sinRand * 3;
                }
                // 25 点以上はさらに振れ幅を大きく
                if (score < 35) {
                    return sinRand * 4;
                }
                // 35 点以上は豪速球も取り入れて完全に殺しに行く
                return (Math.random() < 0.9) ? sinRand * 5 : 6;
            };
            var createBall = function (e) {
                var width = 16;
                var height = 16;
                var sprite = new Sprite(width, height);
                sprite.image = core.assets["img/icon1.png"];
                sprite.x = Math.random() * (STAGE_WIDTH - width);
                var topToBottom = (Math.random() < 0.5); // true: 上から下, false: 下から上
                var speed = 2 + getBallSpeedFactor(score);
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
                        lastScore = score;
                        highScore = Math.max(score, highScore);
                        bear.frame = [3];
                        bear.removeEventListener(Event.ENTER_FRAME, moveBear);
                        bear.tl.moveTo(bear.x, STAGE_HEIGHT + 64, 15, function (t, b, c, d) {
                            var peak = 0.25;
                            var x = (t / d) - peak;
                            return 2 * (x * x * (c - b) + b - (peak * peak));
                        });
                        gameScene.removeEventListener(Event.ENTER_FRAME, createObject);
                        gameScene.tl.cue({
                            45: showGameover
                        });
                        stopBGM();
                        playSE("hit.wav");
                    }
                });
                return sprite;
            };
            /**
             * オブジェクトの出現確率の上昇率を返します。
             * 得点が増えるほどオブジェクトが出現しやすくなります。
             * ゲーム開始直後については得点にかぎらずオブジェクトを出やすくします。
             * 
             * @param {Number} score, age
             * @returns {Number}
             */
            var getHardness = function (score, age) {
                if (age < 4) {
                    return 0.25;
                }
                if (score < 3) {
                    return 0.005;
                }
                if (score < 6) {
                    return 0.01;
                }
                if (score < 9) {
                    return 0.015;
                }
                if (score < 12) {
                    return 0.02;
                }
                if (score < 16) {
                    return 0.03;
                }
                if (score < 20) {
                    return 0.04;
                }
                if (score < 24) {
                    return 0.05;
                }
                if (score < 28) {
                    return 0.07;
                }
                if (score < 32) {
                    return 0.1;
                }
                if (score < 36) {
                    return 0.15;
                }
                if (score < 40) {
                    return 0.2;
                }
                return 0.3;
            };
            /**
             * ハートの出現率を返します。
             * 得点が増えるほどボールの割合が増え、ハートの割合が減ります。
             * @param {Number} score
             * @returns {Number}
             */
            var getHeartFactorIncrease = function (score) {
                if (score < 2) {
                    return 0.7;
                }
                if (score < 4) {
                    return 0.5;
                }
                if (score < 6) {
                    return 0.4;
                }
                if (score < 8) {
                    return 0.3;
                }
                if (score < 12) {
                    return 0.2;
                }
                if (score < 14) {
                    return 0.15;
                }
                if (score < 16) {
                    return 0.1;
                }
                if (score < 20) {
                    return 0.07;
                }
                if (score < 24) {
                    return 0.05;
                }
                if (score < 28) {
                    return 0.03;
                }
                return 0.02;
            };
            var createObject = function (e) {
                densityFactor = Math.min(0.5, densityFactor + getHardness(score, gameScene.age));
                var rand = Math.random();
                if (densityFactor < rand) {
                    return;
                }

                heartFactor = Math.min(0.9, heartFactor + getHeartFactorIncrease(score));
                if (Math.random() < heartFactor) {
                    var heart = createHeart();
                    gameScene.insertBefore(heart, controller);
                    heartFactor = 0;
                } else {
                    var ball = createBall();
                    gameScene.insertBefore(ball, controller);
                }
                densityFactor = 0;
            };
            gameScene.addEventListener(Event.ENTER_FRAME, createObject);
            core.replaceScene(gameScene);
            playBGM("main.mp3");
        };
        var blackBackground = (function () {
            var sprite = new Sprite(DISPLAY_WIDTH, DISPLAY_HEIGHT);
            sprite.image = (function () {
                var surface = new Surface(DISPLAY_WIDTH, DISPLAY_HEIGHT);
                var context = surface.context;
                context.fillStyle = "#000000";
                context.fillRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
                return surface;
            })();
            return sprite;
        })();
        var newButton = function (filename, y, callback) {
            var width = 180;
            var height = 60;
            var sprite = new Sprite(width, height);
            sprite.image = core.assets["img/" + filename];
            sprite.frame = [0];
            sprite.x = (DISPLAY_WIDTH / 2) - (width / 2);
            sprite.y = y;
            var touchStart = function () {
                this.frame = [1];
            };
            var touchEnd = function () {
                this.frame = [0];
                this.removeEventListener(Event.TOUCH_START, touchStart);
                this.removeEventListener(Event.TOUCH_END, touchEnd);
                playSE("start.wav");
                callback();
            };
            sprite.addEventListener(Event.TOUCH_START, touchStart);
            sprite.addEventListener(Event.TOUCH_END, touchEnd);
            return sprite;
        };
        var titleScene = (function () {
            var scene = new Scene();
            var title = (function () {
                var width = DISPLAY_WIDTH;
                var height = 60;
                var sprite = new Sprite(width, height);
                sprite.image = core.assets["img/title-logo.png"];
                sprite.x = (DISPLAY_WIDTH / 2) - (width / 2);
                sprite.y = TITLE_TOP;
                return sprite;
            })();
            var bear = (function () {
                var width = 32;
                var height = 32;
                var sprite = new Sprite(width, height);
                sprite.image = core.assets["img/chara1.png"];
                sprite.frame = [0, 1, 1, 0, 2, 2];
                sprite.x = (DISPLAY_WIDTH / 2) - (width / 2);
                sprite.y = TITLE_TOP + 70;
                return sprite;
            })();
            var start = newButton("start.png", TITLE_TOP + 150, function () {
                bear.frame = [1];
                scene.tl.cue({10: startNewGame});
            });
            scene.addChild(blackBackground);
            scene.addChild(title);
            scene.addChild(bear);
            scene.addChild(start);
            scene.addChild(newVolumeControl(false));
            return scene;
        })();

        /**
         * 現在の Scene をゲームオーバー画面に切り替えます
         */
        var showGameover = function () {
            var scene = new Scene();
            var bear = (function () {
                var width = 32;
                var height = 32;
                var sprite = new Sprite(width, height);
                sprite.image = core.assets["img/chara1.png"];
                sprite.frame = [3];
                sprite.x = (DISPLAY_WIDTH / 2) - (width / 2);
                sprite.y = GAMEOVER_TOP - (height / 2);
                return sprite;
            })();
            var gameover = (function () {
                var width = DISPLAY_WIDTH;
                var height = 60;
                var sprite = new Sprite(width, height);
                sprite.image = core.assets["img/gameover.png"];
                sprite.x = (DISPLAY_WIDTH / 2) - (width / 2);
                sprite.y = -2 * height;
                sprite.tl.moveBy(0, GAMEOVER_TOP + height / 2, 24, enchant.Easing.BOUNCE_EASEOUT);
                return sprite;
            })();
            var highScoreTitle = (function () {
                var label = new Label();
                label.text = "High Score:";
                label.textAlign = "right";
                label.x = (-DISPLAY_WIDTH / 2);
                label.y = GAMEOVER_TOP + 32;
                label.color = "#eeeeee";
                label.font = "14px/16px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
                return label;
            })();
            var highScoreNumber = (function () {
                var label = new Label();
                label.text = highScore;
                label.x = (DISPLAY_WIDTH / 2);
                label.y = GAMEOVER_TOP + 32;
                label.color = "#eeeeee";
                label.font = "bold 16px/16px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
                return label;
            })();
            var scoreTitle = (function () {
                var label = new Label();
                label.text = "Score:";
                label.textAlign = "right";
                label.x = (-DISPLAY_WIDTH / 2);
                label.y = GAMEOVER_TOP + 52;
                label.color = "#eeeeee";
                label.font = "14px/16px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
                return label;
            })();
            var scoreNumber = (function () {
                var label = new Label();
                label.text = lastScore;
                label.x = (DISPLAY_WIDTH / 2);
                label.y = GAMEOVER_TOP + 52;
                label.color = "#eeeeee";
                label.font = "bold 16px/16px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
                return label;
            })();
            var retry = newButton("retry.png", GAMEOVER_TOP + 90, function () {
                scene.tl.cue({10: startNewGame});
            });
            var sendScore = newButton("send-score.png", GAMEOVER_TOP + 150, function () {
                scene.tl.cue({10: showSendScore});
            });

            scene.addChild(blackBackground);
            scene.addChild(gameover);
            scene.addChild(bear);
            scene.addChild(scoreTitle);
            scene.addChild(scoreNumber);
            scene.addChild(highScoreTitle);
            scene.addChild(highScoreNumber);
            scene.addChild(retry);
            scene.addChild(sendScore);
            scene.addChild(newVolumeControl(false));
            core.replaceScene(scene);
        };

        /**
         * スコア送信画面を表示します
         */
        var showSendScore = function () {
            var charWidth = 40;
            var charHeight = 40;
            var charCols = 7;
            var charRows = 4;
            var keyboardWidth = charWidth * charCols;
            var keyboardHeight = charHeight * charRows;
            var keyboardTop = 80;
            var keyboardLeft = (DISPLAY_WIDTH / 2) - keyboardWidth / 2;
            var scene = new Scene();
            var yourname = (function () {
                var width = 320;
                var height = 60;
                var sprite = new Sprite(width, height);
                sprite.image = core.assets["img/yourname.png"];
                sprite.x = (DISPLAY_WIDTH / 2) - (width / 2);
                sprite.y = 20;
                return sprite;
            })();
            var getAlphabet = function (index) {
                var width = charWidth;
                var height = charHeight;
                var x = (index % 7) * width;
                var y = Math.floor(index / 7) * height;
                var sprite = new Sprite(width, height);
                sprite.image = core.assets["img/alphabets.png"];
                sprite.frame = [index];
                sprite.x = keyboardLeft + x;
                sprite.y = keyboardTop + y;
                return sprite;
            };
            var alphabets = (function () {
                var arr = [];
                for (var i = 0; i < 28; i++) {
                    arr[i] = getAlphabet(i);
                }
                return arr;
            })();
            var keyboard = (function () {
                var width = keyboardWidth;
                var height = keyboardHeight;
                var sprite = new Sprite(keyboardWidth, keyboardHeight);
                var currentIndex = -1;
                sprite.x = keyboardLeft;
                sprite.y = keyboardTop;
                var getIndex = function (e) {
                    var x = e.x - keyboardLeft;
                    var y = e.y - keyboardTop;
                    var col = Math.floor(x / charWidth);
                    if (col < 0 || charCols <= col) {
                        return -1;
                    }
                    var row = Math.floor(y / charHeight);
                    if (row < 0 || charRows <= row) {
                        return -1;
                    }
                    return row * 7 + col;
                };
                var touchKeyboard = function (e) {
                    var index = getIndex(e);
                    if (currentIndex === index) {
                        return;
                    }
                    if (0 <= currentIndex) {
                        alphabets[currentIndex].frame = [currentIndex];
                    }
                    if (0 <= index) {
                        alphabets[index].frame = [index + 28];
                    }
                    currentIndex = index;
                };
                sprite.addEventListener(Event.TOUCH_START, touchKeyboard);
                sprite.addEventListener(Event.TOUCH_MOVE, touchKeyboard);
                sprite.addEventListener(Event.TOUCH_END, function (e) {
                    if (currentIndex === -1) {
                        return;
                    }
                    alphabets[currentIndex].frame = [currentIndex];
                    currentIndex = -1;
                });
                return sprite;
            })();
            var textarea = (function () {
                var width = 160;
                var height = 80;
                var sprite = new Sprite(width, height);
                sprite.image = (function () {
                    var surface = new Surface(width, height);
                    var context = surface.context;
                    context.lineWidth = 4.0;
                    context.strokeStyle = "#eeeeee";
                    context.strokeRect(0, 0, width, height);
                    return surface;
                })();
                sprite.x = (DISPLAY_WIDTH / 2) - (width / 2);
                sprite.y = keyboardTop + keyboardHeight + 20;
                return sprite;
            })();
            var sendScore = newButton("send-score.png", DISPLAY_HEIGHT / 2 + 150, function () {
                scene.tl.cue({10: showGameover});
            });

            scene.addChild(blackBackground);
            scene.addChild(yourname);
            alphabets.map(function (a) {
                scene.addChild(a);
            });
            scene.addChild(keyboard);
            scene.addChild(textarea);
            scene.addChild(sendScore);
            scene.addChild(newVolumeControl(false));
            core.replaceScene(scene);
        };
        core.replaceScene(titleScene);
    };
    core.start();
}

window.onload = main;