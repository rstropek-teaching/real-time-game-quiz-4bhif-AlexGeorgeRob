/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts" />

const game = new Phaser.Game(
    950,                // Game width 
    750,                // Game height
    Phaser.CANVAS,      // Use HTML5 canvas for rendering (see also http://www.w3schools.com/html/html5_canvas.asp)
    '',                 // No parent 
    // Set methods for initializing, creating, and updating our game
    { preload: preload, create: create, update: update });

function preload() {
    // Preload images so that we can use them in our game
    game.load.image('background', 'images/background.jpg');
    game.load.image('bullet', 'images/bullet.png');
    game.load.image('tank', 'images/green_tank.png');
    game.load.image('wall', 'images/wall.png');
    game.load.image('box', 'images/box.png');
}

// Declare variables for spaceship, bullets, and meteors
let tank: Phaser.Sprite;
let tankBody: Phaser.Physics.Arcade.Body;

let bullets: Phaser.Group;
let bulletTime = 0;     // Helper storing the time when next bullet can be fired

let walls: Phaser.Group;
const wallSize = 50;

let boxes: Phaser.Group;
const boxSize = 50;

let forwardKey: Phaser.Key;
let backKey: Phaser.Key;
let leftKey: Phaser.Key;
let rightKey: Phaser.Key;
let fireKey: Phaser.Key;

const rotationSpeed = 0.9;
const moveSpeed = 2.5;

let gameIsOver: boolean = false; // Indicating whether the game is over (one tank destroyed)

function create() {
    // We have a filling background image -> disable clearBeforeRender to make game run faster. 
    // (see http://phaser.io/docs/2.4.2/PIXI.CanvasRenderer.html#clearBeforeRender for details)
    game.renderer.clearBeforeRender = false;

    //  We want arcade physics.
    // (see http://phaser.io/docs#arcadephysics for details)
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Add a background
    game.add.tileSprite(0, 0, game.width, game.height, 'background');

    // Create bullets, walls and boxes
    bullets = createSpriteGroup("bullet");
    walls = createSpriteGroup("wall");
    boxes = createSpriteGroup("box");

    // Add walls to the game
    for (let i = 0; i < game.width; i += wallSize) {
        walls.add(game.add.tileSprite(i, 0, wallSize, wallSize, 'wall'));
        walls.add(game.add.tileSprite(i, game.height - wallSize, wallSize, wallSize, 'wall'));

    }

    for (let i = wallSize; i < game.height - wallSize; i += wallSize) {
        walls.add(game.add.tileSprite(0, i, wallSize, wallSize, 'wall'));
        walls.add(game.add.tileSprite(game.width - wallSize, i, wallSize, wallSize, 'wall'));
    }

    walls.setAll('body.immovable', true);

    // Add boxes to the game
    boxes.enableBody = true;

    boxes.add(game.add.tileSprite(200, 200, boxSize, boxSize, 'box'));
    for (let i = 205; i <= 535; i += boxSize + 5) {
        boxes.add(game.add.tileSprite(200, i + boxSize, boxSize, boxSize, 'box'));
        boxes.add(game.add.tileSprite(game.width - 200 - boxSize, i - boxSize, boxSize, boxSize, 'box'));
    }
    boxes.add(game.add.tileSprite(game.width - 200 - boxSize, 540, boxSize, boxSize, 'box'));

    for (let i = 345; i <= 510; i += boxSize + 5) {
        boxes.add(game.add.tileSprite(i + boxSize, 150, boxSize, boxSize, 'box'));
        boxes.add(game.add.tileSprite(i, game.height - 150 - boxSize, boxSize, boxSize, 'box'));
    }

    boxes.add(game.add.tileSprite(450, 350, boxSize, boxSize, 'box'));

    boxes.setAll('body.moves', true);

    // Add the sprite for the tank
    tank = game.add.sprite(
        100,
        game.world.centerY,         // Center tank vertically
        'tank');
    tank.anchor.set(0.5);           // Set origin to middle of the sprite

    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tankBody = tank.body;
    tankBody.collideWorldBounds = true;

    // Setup game input handling
    forwardKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    backKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    fireKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
}

function update() {
    // Do nothing if game is already over
    if (gameIsOver) {
        return;
    }

    // Movement
    if (leftKey.isDown) {
        tankBody.angle -= rotationSpeed;
        console.log(tankBody.angle);
    } else if (rightKey.isDown) {
        tankBody.angle += rotationSpeed;
        console.log(tankBody.angle);
    }

    if (forwardKey.isDown) {
        tankBody.x = tankBody.x + moveSpeed * Math.cos(tankBody.angle * Math.PI / 180);
        tankBody.y = tankBody.y + moveSpeed * Math.sin(tankBody.angle * Math.PI / 180);

    } else if (backKey.isDown) {
        tankBody.x = tankBody.x - moveSpeed / 2 * Math.cos(tankBody.angle * Math.PI / 180);
        tankBody.y = tankBody.y - moveSpeed / 2 * Math.sin(tankBody.angle * Math.PI / 180);
    }

    // Fire if spacebar is pressed
    if (fireKey.justDown) {
        console.log(tank.x + " " + tank.y)
        fireBullet();
    }
    
    game.physics.arcade.collide(tank, walls);
    game.physics.arcade.collide(tank, boxes);
    game.physics.arcade.collide(boxes, boxes);
    game.physics.arcade.collide(walls, boxes);

    game.physics.arcade.overlap(tank, bullets, gameOver);
    game.physics.arcade.overlap(bullets, bullets,
        (bullet1: Phaser.Sprite, bullet2: Phaser.Sprite) => { bullet1.kill(); bullet2.kill(); });
    

    // Kill bullets and meteors that are out of the world's bound
    // bullets.forEachExists(b => { if ((b.y - b.height / 2) < 0) { b.kill(); } }, this);
    // meteors.forEachExists(m => { if ((m.y - m.height / 2) > game.height) { m.kill(); } }, this);

    // At the end, animate
    tank.angle = tankBody.angle;
}

function gameOver() {
    // Set game over indicator
    // gameIsOver = true;

    // Kill all sprites
    // bullets.forEachExists((b: Phaser.Sprite) => b.kill(), this);
    // walls.forEachExists((m: Phaser.Sprite) => m.kill(), this);
    // tank.kill();

    // Display "game over" text
    // let text = game.add.text(game.world.centerX, game.world.centerY, "Game Over :-(", { font: "65px Arial", fill: "#ff0044", align: "center" });
    // text.anchor.setTo(0.5, 0.5);
}

function fireBullet() {
    // Check if it is time to launch a new bullet.
    if (game.time.now > bulletTime) {
        // Find the first unused (=unfired) bullet
        let bullet = <Phaser.Sprite>bullets.getFirstExists(false);
        if (bullet) {
            // Display bullet at the current place of the space ship
            bullet.reset(tank.x, tank.y);

            bullet.angle = tank.angle;

            // Set velocity so that bullet is flying 
            bullet.body.velocity.x = bullet.body.x + 200 * Math.cos(bullet.angle * Math.PI / 180);
            bullet.body.velocity.y = bullet.body.y + 200 * Math.sin(bullet.angle * Math.PI / 180);

            // Set next time when a new bullet can be fired
            bulletTime = game.time.now + 1000;
        }
    }
}

function createSpriteGroup(imageName: string): Phaser.Group {
    let group = game.add.group();

    group.enableBody = true;
    group.physicsBodyType = Phaser.Physics.ARCADE;

    group.createMultiple(20, imageName);

    group.setAll('anchor.x', 0.5);
    group.setAll('anchor.y', 0.5);

    return group;
}