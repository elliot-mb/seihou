import Player from "/src/player.js"; //imports class 
import Controller from "/src/controller.js"; 
import Menu from "/src/menu.js";
import BossHandler from "/src/bosshandler.js";
import UI from "/src/ui.js";

/*
__  .______   
|  | |   _  \       //////////////
|  | |  |_)  |      127.0.0.1:5501
|  | |   ___/       //////////////
|  | |  |      
|__| | _|      
               
*/

console.log("initialised successfully"); //lets you know the process has started

var c = document.getElementById("ThisIsCanvas"); 
var ctx = c.getContext("2d"); //gives the renderer context
let marisa = document.getElementById("marisa");

let GAME_WIDTH = 600, //play area width
    GAME_HEIGHT = 800; // play area height

let gameTime, startTime = 0;

// OBJECTS
let player = new Player(GAME_WIDTH, GAME_HEIGHT); //player object creation using Player class
let ui = new UI(false); //debug mode 
let controller = new Controller(); //object that handles key input
let bossHandler = new BossHandler();
let menu = new Menu(1000,800);

//let emitter = new Emitter(0, 0, 0, 0, 0, 0, 0, 0); //fireRate, range, deltaAngle, number of shot pairs, speed, delta speed, delta delta speed, radius


document.body.addEventListener("keydown", function (e) { //when key pressed, the pressed keycode is fed to the controller object
    controller.checkKey(e.keyCode, 1); //sets the arrowkey direction to '1'
});
document.body.addEventListener("keyup", function (e) { //when key released, the released keycode is fed to the controller object
    controller.checkKey(e.keyCode, 0); //resets the arrowkey direction to '0'
});

let frameID = 0, 
    lastTime = 0,
    gameOver = 1000; //1000 means the player has not died 

let i = 0;


function drawPicture(x, y, width, height){
    let image;
    try {
        switch (bossHandler.bossID){
            case 0:
                image = document.getElementById("marisa");
                break;
            case 1: 
                image = document.getElementById("fhana");
                break;
            default:
                image = document.getElementById("default");
        }
    }catch(e){
        console.log("Image does not exist. Error:" + e);    
    }

    ctx.drawImage(image, x-(width/2), y-(height/2), width, height);

}


function gameLoop(gameTime, deltaTime){ //main game loop

    //memory dump (deletes references to unused objects in the emitter arrays)
    bossHandler.currentEmitter.dump();
    player.emitter.dump();

    ctx.fillStyle = "rgba(25,0,0,1)" //colour of background
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); //draws play area background
    
    //emitter.update(frameID, 300, 200); //different emitters can be chosen to update and draw

    bossHandler.update(gameTime/gameOver, frameID, ctx, deltaTime, ui, player);
    
    if ((bossHandler.currentEmitter.collisionCheck(player)) && (player.invincible != true)){
        player.kill(); //resets players position, velocity etc.
        player.lives -= 1;
        ui.multiplier /= 10;
    }
    
    if ((bossHandler.currentEmitter.grazeCheck(player))&&(player.invincible != true)){ui.multiplier += 0.5;}

    player.update(deltaTime, controller, frameID, ctx, ui); //calls player object function to update player based on time between frames and controller object members
    player.draw(ctx); //draws player with 2d context

    drawPicture(bossHandler.boss.position.x, bossHandler.boss.position.y, 75, 75);

    ui.update(frameID, gameTime, bossHandler, deltaTime, player, ctx);
    ui.draw(ctx, bossHandler, player, GAME_WIDTH, GAME_HEIGHT);

    frameID++;
    //once the loop has completed it calles the loop again, and so it runs until broken out of or closed
}

function mainLoop(timestamp){

    let deltaTime = timestamp - lastTime; //calculates difference in time between frames
    lastTime = timestamp; //sets the current time to be the next frame's last time
    if ((controller.select-controller.firing == 1)&&(ui.gameRunning!=true)){ //z key is pressed and game isnt running 
        ui.reset = false;
        menu.animate = -1;
    }
    if (ui.gameRunning){
        if (frameID < 1){ //for the first one frames the game time is paused
            startTime = timestamp;
            console.log("reset time @ frame "+frameID);
        }
        gameTime = timestamp - startTime
        gameLoop(gameTime, deltaTime);
    }else{
        menu.update(ui, timestamp);
        menu.draw(ctx, timestamp, ui);
    }
    if (ui.reset){ //when player runs out of lives
        frameID = 0;
        menu.reset();
        bossHandler.reset();
        player.reset();
        ui.resetUI();
    }
    requestAnimationFrame(mainLoop);
}

mainLoop(); //initial run of the game loop