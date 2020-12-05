import Player from "/src/player.js"; //imports class 
import Controller from "/src/controller.js"; 
import Menu from "/src/menu.js";
import BossHandler from "/src/bosshandler.js";
import UI from "/src/ui.js";
import Text from "/src/text.js";
import Image from "/src/image.js"

let version = `v0.4.7`;
var c = document.getElementById("canvas"); //canvas
var ctx = c.getContext("2d"); //gives the renderer context to draw in respect to 
window.addEventListener('resize', resizeCanvas, false);

let gameTime, startTime = 0;

// OBJECTS
let player = new Player(); //player object creation using Player class 
let ui = new UI(false); //debug mode 
let controller = new Controller(); //object that handles key input
let bossHandler = new BossHandler();
let menu = new Menu(c.width,c.height,version);

// VARIABLES

let scaler = 0;
let temp = 0;

let margin = 0;
let temp1 = 0;

let footer = 0;
let temp2 = 0;

let paused = false;
let justPressed = false;

let doneReset = false;

let pauseTime = 0;
let time1;
let time2;
let pauseTextStyle = new Text(0,0,'200px Source Sans Pro', 'white', 'center');

console.log(`initialised\n     
running build ${version}\n
UI debug is set to ${ui.debug}`); 

resizeCanvas();

let images = [ //array of image objects with their image data and respective croppings (sx, sy, sWidth and sHeight)
    new Image(document.getElementById("cirno")),  //sx and sy select a point on the image to crop from, and sWidth and sHeight determine how far to drag out the crop tool so to speak
    new Image(document.getElementById("lucina")),
    new Image(document.getElementById("default")),
    new Image(document.getElementById("logo")),
    new Image(document.getElementById("player"))
]; //we'll need to for the player object when they move to the right and left to animate them :D

//let emitter = new Emitter(0, 0, 0, 0, 0, 0, 0, 0); //fireRate, range, deltaAngle, number of shot pairs, speed, delta speed, delta delta speed, radius



document.body.addEventListener("keydown", function (e) { //when key pressed, the pressed keycode is fed to the controller object
    controller.checkKey(e.keyCode, 1); //sets the arrowkey direction to '1'
    images[4].update(controller);
});
document.body.addEventListener("keyup", function (e) { //when key released, the released keycode is fed to the controller object
    controller.checkKey(e.keyCode, 0); //resets the arrowkey direction to '0'
    images[4].update(controller);
});

let frameID = 0, 
    lastTime = 0,
    gameOver = 1000; //1000 means the player has not died 

function drawPicture(ID, x, y, width, height){
    let image;
    try {
        image = images[ID];
    }catch(e){
        console.log("Image does not exist. Error:" + e);    
    }

    try {
        ctx.drawImage(image.image, image.sx, image.sy, image.sWidth, image.sHeight, x-(width/2), y-(height/2), width, height);
    }catch (e){
        console.log(`couldnt draw image:\n${e}`);
    }
    //ctx.drawImage(image, x-(width/2), y-(height/2), width, height);

}

let frameIDReset = false;

function gameLoop(gameTime, deltaTime){ //main game loop
    if(frameIDReset != true){
        frameID = 0;
        frameIDReset = true;
    }

    let runningTime;

    if(controller.pause == 1){
        if((paused)&&(!justPressed)){ 
            paused = false;
            justPressed = true;//stops the user just holding the button
            time2 = gameTime; //time it was paused at
            //console.log(time2);
            pauseTime += (time2 - time1);
            //console.log(pauseTime);
        }else if (!justPressed){
            paused = true;
            justPressed = true;
            time1 = gameTime;
            //console.log(time1);
        }
    }else{ //user lets go of p 
        justPressed = false; //only way to unpause is to let go of p and press it again to toggle
    }

    runningTime = gameTime - pauseTime;

    if(!paused){
        //memory dump (deletes references to unused objects in the emitter arrays)
        bossHandler.currentEmitter.dump();
        player.emitter.dump();

        ctx.fillStyle = "rgba(25,0,0,1)" //colour of background
        ctx.fillRect((c.width-c.height*(4/3))/2, 0, c.height*(4/3), 938*ui.gameWindow.scaler); //draws play area background

        
        //emitter.update(frameID, 300, 200); //different emitters can be chosen to update and draw
        
        player.update(deltaTime, controller, frameID, ctx, ui, runningTime); //calls player object function to update player based on time between frames and controller object members
        
        if(player.renderPlayerSprite){
            drawPicture(4, player.position.x, player.position.y, 100*scaler/938, 100*scaler/938);
        }

        bossHandler.update(runningTime/gameOver, frameID, ctx, deltaTime, ui, player);
        
        if ((bossHandler.currentEmitter.collisionCheck(player) > 0) && (player.invincible != true)){
            player.kill(); //resets players position, velocity etc.
            player.lives -= 1;
            ui.multiplier *= 0.25; //quaters multiplier on death
        }
        
        if ((bossHandler.currentEmitter.grazeCheck(player) > 0)&&(player.invincible != true)){
            ui.graze += 45;
            ui.multiplier += 1;
            /*
            switch(bossHandler.bossID){
                case 0:
                    ui.multiplier += 1;
                    break;
                case 1:
                    ui.multiplier += 1;
                    break;
                case 2:
                    ui.multiplier += 1;
                    break;
                default:
                    ui.multiplier += 1;
                    break;
            }*/
        }

        ui.multiplier += ui.boostBar.trickle*(deltaTime/10);


        player.draw(ctx); //draws player

        drawPicture(bossHandler.bossID, bossHandler.boss.position.x, bossHandler.boss.position.y, 75*scaler/938, 85*scaler/938);

        ui.update(frameID, runningTime, bossHandler, deltaTime, player, ctx);

        ctx.fillStyle = 'rgb(20, 10, 30)'; //draws boxes around the play area
        ctx.fillRect(0,0,margin,c.height);
        ctx.fillRect(margin+1250*(scaler/938),0,margin,c.height);
        ctx.fillRect(0,c.height,c.width,-footer);

        ui.draw(ctx, bossHandler, player, runningTime);

        frameID++;
        //once the loop has completed it calles the loop again, and so it runs until broken out of or closed
    }else{ //pauseloop
        ctx.fillStyle = 'rgba(200, 0, 0, 0)';
        ctx.fillRect(margin,0,1251*(scaler/938),scaler);
        pauseTextStyle.draw(ctx, '  ▌▌');
    }
}

function resizeCanvas(){ //determines new canvas dimensions on updated viewport, feeds all other classes data they need to rescale
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    pauseTextStyle.position.x = c.width/2;

    let deltaScaler;
    let deltaMargin;
    let deltaFooter;

    temp = scaler/938;

    if(canvas.width > c.height*(4/3)){ //queary whether width is less than height*(4/3)
        temp1 = margin;
        temp2 = 0;
        scaler = c.height
        margin = (c.width-scaler*(4/3))/2;
        footer = 0;
    }else{
        temp1 = 0;
        temp2 = footer;
        scaler = c.width/(4/3)
        margin = 0;
        footer = c.height - (c.width/(4/3)); //calculates footer by dividing width by the scaler (4/3)
    }

    deltaScaler = 1 - (temp - scaler/938);
    deltaMargin = (temp1 - margin);
    deltaFooter = (temp2 - footer);

    pauseTextStyle.position.y = scaler/1.85;
    pauseTextStyle.font = `${scaler/982*70}px Source Sans Pro`

    //console.log(deltaMargin, margin, temp1);

    //console.log(`screen is ${deltaScaler} times larger, ${deltaMargin}`);

    menu.isResized(c, scaler); //recalculate elements based on new viewport size
    player.isResized(c, scaler, deltaScaler, deltaMargin, deltaFooter, margin);
    ui.isResized(c, scaler, margin, footer);
    bossHandler.isResized(c, scaler, margin);
}

function mainLoop(timestamp){

    let deltaTime = timestamp - lastTime; //calculates difference in time between frames
    lastTime = timestamp; //sets the current time to be the next frame's last time
    if ((controller.selectCampaign-controller.firing == 1)&&(ui.gameRunning!=true)){ //z key is pressed and game isnt running 
        ui.reset = false;
        menu.animate = -1;
    }
    if ((controller.selectEndless-controller.firing == 1)&&(ui.gameRunning!=true)){
        ui.reset = false;
        //start endless
        menu.animate = -1;
        bossHandler.endless = true;
    }
    if (ui.gameRunning){
        if ((frameID < 1)&&(!doneReset)){ //for the first one frames the game time is paused
            startTime = timestamp;
            //console.log("reset time @ frame "+frameID);
            player.position = { //sets player to spawn at spawn for the first run of the gameloop
                x: player.spawn.x,
                y: player.spawn.y
            }
            doneReset = true;
        }
        gameTime = timestamp - startTime;
        gameLoop(gameTime, deltaTime);
    }else{
        pauseTime = 0;
        doneReset = false;

        menu.update(ui, timestamp);
        menu.draw(ctx, timestamp, ui);
        if(!menu.deathScreen){
            drawPicture(3, menu.titleStyle.position.x-(5*ui.gameWindow.scaler), menu.titleStyle.position.y-(100*ui.gameWindow.scaler), ui.gameWindow.scaler*600, ui.gameWindow.scaler*300);
        }
        
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