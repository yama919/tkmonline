enchant();

var Game = function () { }

Game.isOpen = false;
Game.canSend = true;
Game.core = null;

Game.send = function (message) {
    if (this.canSend) {
        send(message);
        this.canSend = false;
    }
}

Game.addLabel = function (text, x, y, font, color) {
    if (!font) {
        font = '14px "メイリオ",Meiryo';
    } else {
        font += ' ' + '"メイリオ",Meiryo';
    }

    var label = new Label(text);

    label.x = x;
    label.y = y;
    label.font = font;

    if (color || color === 0) { label.color = color; }

    this.core.rootScene.addChild(label);

    return label;
}

Game.addSprite = function (image, frame, x, y, width, height, onTouch, opacity) {
    var sprite = new Sprite(width, height);

    sprite.image = this.core.assets[image];
    sprite.frame = frame;
    sprite.x = x;
    sprite.y = y;

    if (onTouch) { sprite.addEventListener('touchstart', onTouch); }
    if (opacity || opacity === 0) { sprite.opacity = opacity; }

    this.core.rootScene.addChild(sprite);

    return sprite;
}

Game.addMovable = function (image, frame, width, height) {
    var sprites = [];
    var spritesStatic = [];
    for(let i = 0; i < 5; i++) {
        sprites.push(new Sprite(width, height));
        spritesStatic.push(new Sprite(width, height));
        sprites[i].frame = frame;
        spritesStatic[i].frame = frame;
        sprites[i].opacity = 0.4;
        sprites[i].x = 50 + i * 20;
        spritesStatic[i].x = 50 + i * 20;
        sprites[i].y = 50;
        spritesStatic[i].y = 50;
        sprites[i].image = this.core.assets[image];
        spritesStatic[i].image = this.core.assets[image];
        sprites[i].addEventListener('touchmove', function () {
            return function(e) {
                for(let j = 0; j < 5; j++) {
                    sprites[j].x = e.x + j * 20;
                    sprites[j].y = e.y;
                }
            }
            
        }());
        sprites[i].addEventListener('touchend', function (that) {
            return function(e) {
                for(let j = 0; j < 5; j++) {
                    sprites[j].x = 50 + j * 20;
                    sprites[j].y = 50;                        
                    var XY = Game.calcJustXY(e.x, e.y);
                    if(Game.canPlace(e) && XY) {
                        var candidate = [];
                        for(let i = 0; i < 5; i++) {
                            candidate.push(new Sprite(width, height));
                            candidate[i].frame = frame;
                            candidate[i].opacity = 0.2;
                            candidate[i].x = XY[0] + i * 20;
                            candidate[i].y = XY[1];
                            candidate[i].image = that.core.assets[image];
                        }
                        candidate.forEach(s => that.core.rootScene.addChild(s));    
                    }
                }
            }
            
        }(this));
    }
    spritesStatic.forEach(s => this.core.rootScene.addChild(s));    
    sprites.forEach(s => this.core.rootScene.addChild(s));    
}

Game.canPlace = function(e) {
    console.log(e);
    return true;
}

Game.calcJustXY = function (x, y) {
    var retX = 0;
    var retY = 0;
    if(x < 250) {
        return null;
    }
    if(y < 20) {
        return null;
    }
    for(let _x = 1; _x <= 20; _x++ ) {
        if(x < 300 + 20 * _x) {
            retX = 300 + 20 * (_x - 1);
            break;
        }
    }
    for(let _y = 1; _y <= 20; _y++ ) {
        if(y < 73 + 20 * _y) {
            retY = 73 + 20 * (_y - 1);
            break;
        }
    }
    if(retX === 0 || retY === 0) {
        return null;
    }
    return [retX, retY];
}

Game.onLoad = function () {
    this.core = new Core(1000, 785);

    this.core.fps = 120;

    this.core.preload(
          'view/background.png'
          , 'view/block.png'
    );

    this.core.onload = function () {
        Game.isOpen = true;
        Game.send('a');
    }

    this.core.start();
}

Game.onMessage = function (game) {
    if (game.sound !== '') { sound(game.sound); }

    this.canSend = true;
    this.removeAll();
    this.addSprite('view/background.png', 0, 0, 0, 1000, 785);
    this.addMovable('view/block.png', 0, 20, 20);
}

Game.removeAll = function () {
    while (this.core.rootScene.childNodes.length > 0) {
        this.core.rootScene.removeChild(this.core.rootScene.childNodes[0]);
    }
}

Game.hasPriorityColor = function (game, color) {
    if (color !== Index.NONE) {
        var i;
        var len1 = game.priority.length;
        for (i = 0; i < len1; i++) if (game.priority[i] === color) {
            return true;
        }
    }
    
    return false;
}

Game.hasPriorityUid = function (game, uid) {
    var i;
    var len1 = game.priority.length;
    for (i = 0; i < len1; i++) {
        if (game.playerList[game.priority[i]].uid === uid) { return true; }
    }
    
    return false;
}

