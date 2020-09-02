import Emitter from "/src/emitter.js"
export default class Player{ //exports the class for use in game.js

    constructor(){ //constructs object with these properties 

        this.speed = 0.08; 
        this.maxLives = 5;
        this.lives = this.maxLives;
        this.dampening = 0.8; //1 - zero dampening, 0 - infinte dampening  
        this.bounce = 0; //energy after collision with wall multiplier (if set over 1 may cause bugs)
        this.startingRadius = 8; 
        this.outlineWidth = 5;
        
        this.gameWindow = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }

        this.spawn = {
            x: 0,
            y: 0 
        }

        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = { //velocity variables initialised 
            x: 0,
            y: 0
        }
        this.invincible = false;
        this.invincFrames = 100;
        this.spentFrames = 100;
        this.streams = 3;
        this.fireRate = 10;
        this.emitter = new Emitter(this.fireRate, 30, 0, this.streams, 1, 1, 0, 10, "rgba(0,0,0)", 10);
        this.smoothedFps = 60;
        this.radius;
    }
    
    draw(ctx){ 

        if (this.lives > 0){

            if (this.invincible){ //when the player is respawing
                if ((this.spentFrames <= this.invincFrames) && (this.spentFrames % 15 < 10)){
            
                    ctx.beginPath(); //draws centre
                    ctx.arc(this.position.x, this.position.y + ((this.gameWindow.height - this.spawn.y) / Math.pow(this.spentFrames, 0.5) - 15), this.radius*this.gameWindow.scaler, 0, 2 * Math.PI, false); //shapes and locates the path
                    ctx.fillStyle = "#e83535"; //colour of inside circle
                    ctx.fill();

                    ctx.beginPath(); //draws recovering peremeter
                    ctx.arc(this.position.x, this.position.y + ((this.gameWindow.height - this.spawn.y) / Math.pow(this.spentFrames, 0.5) - 15), this.radius*this.gameWindow.scaler, ((2/this.invincFrames) * this.spentFrames) * Math.PI, ((4/this.invincFrames) * this.spentFrames) * Math.PI, false); //shapes and locates the path
                    ctx.lineWidth = this.outlineWidth*this.gameWindow.scaler; //width of outline
                    ctx.strokeStyle = "#ffffff"; //colour of outline
                    ctx.stroke(); //draws outline 

                }else{

                }

                this.spentFrames++;

            }else{ //when the player isnt respawning

                ctx.beginPath(); //begins a vector path
                ctx.arc(this.position.x, this.position.y, this.radius*this.gameWindow.scaler, 0, 2 * Math.PI, false); //shapes and locates the path
                ctx.fillStyle = "#ffffff"; //colour of inside circle
                ctx.fill(); //draws filled circle
                ctx.lineWidth = this.outlineWidth*this.gameWindow.scaler; //width of outline
                ctx.strokeStyle = "#e83535"; //colour of outline
                ctx.stroke(); //draws outline 
            }

        }

    }

    update(deltaTime, controller, frameID, ctx, ui){ //takes properties of controller and converts that to delta x and delta y, factoring in frame times
        
        if(!deltaTime) return;//first frame is handled by this statement

        /*if(ui.damageBoost >= 75){
            this.emitter.numberShotPairs = 3;

        }else if(ui.damageBoost >= 50){
            this.emitter.numberShotPairs = 3;
        }else */
        if(ui.damageBoost >= 25){
            this.emitter.numberShotPairs = 3;
            this.emitter.radius = 7.5+Math.pow((ui.multiplier/40), 0.5);
        }else{
            this.emitter.numberShotPairs = 1;
            this.emitter.radius = 10+Math.pow((ui.multiplier/40), 0.5);
        }

        let dirX = controller.dir.right - controller.dir.left; //takes the left direction from the right, so if both are pressed it doesnt move on that axis
        let dirY = controller.dir.down - controller.dir.up; //takes 'up' direction from 'down', so if both are pressed it doesnt move on that axis

        if((dirX != 0)&&(dirY != 0)){
            let tempSpeed = this.speed*0.70707;
            this.velocity.x += dirX * tempSpeed * (this.gameWindow.scaler); //changes velocity x by the overall direction with coefficient constant 'speed'
            this.velocity.x *= this.dampening; //slows velocity when key isnt pressed, and limits velocity
            this.velocity.y += dirY * tempSpeed * (this.gameWindow.scaler); //changes velocity y by the overall direction with coefficient constant 'speed'
            this.velocity.y *= this.dampening; 
        }else{
            this.velocity.x += dirX * this.speed * (this.gameWindow.scaler); 
            this.velocity.x *= this.dampening; 
            this.velocity.y += dirY * this.speed * (this.gameWindow.scaler); 
            this.velocity.y *= this.dampening; 
        }
        
        if (this.position.x > this.gameWindow.x + this.radius*this.gameWindow.scaler && this.position.x < this.gameWindow.width + this.gameWindow.x - this.radius*this.gameWindow.scaler){ //if the position is inside the play area, the character behaves normally
            this.position.x += this.velocity.x * deltaTime; //changes position by velocity divided by the time between frames, keeping it moving at the same rate no matter the framerate
        }else{
            this.velocity.x *= -(this.bounce); 
            if (this.position.x < this.gameWindow.x + this.radius*this.gameWindow.scaler){ //if off to the left of the play area
                this.position.x += 1; //move it back onto the play area
            }
            if (this.position.x > this.gameWindow.width + this.gameWindow.x - this.radius*this.gameWindow.scaler){ //if off to the right 
                this.position.x -= 1; //move it back onto the play area
            } // BUG: the player used to get stuck in the barriers, what was going on? it turns out i had not accounted for the play area offset and shit 
        }
        if (this.position.y > this.gameWindow.y + this.radius*this.gameWindow.scaler && this.position.y < this.gameWindow.height - this.radius*this.gameWindow.scaler){
            this.position.y += this.velocity.y * deltaTime;
        }else{
            this.velocity.y *= -(this.bounce); 
            if (this.position.y < this.gameWindow.y + this.radius*this.gameWindow.scaler){ //if too high up the play area
                this.position.y = 0.1 + this.radius*this.gameWindow.scaler; //move it back onto the play area
            }
            if (this.position.y > this.gameWindow.height - this.radius*this.gameWindow.scaler){ //if below the play area
                this.position.y = (this.gameWindow.height - 0.1) - this.radius*this.gameWindow.scaler; //move it back onto the play area
            }
        }   
        
        if (this.spentFrames >= this.invincFrames){ //controls invincibility rendering
            this.invincible = false;
        }

        if(ui.fps){
            this.smoothedFps += (ui.fps - this.smoothedFps)/50;
            this.emitter.fireRate = (1500*((ui.multiplier/150)+1))/(4*this.smoothedFps*Math.log(this.emitter.numberShotPairs+1)); //(ui.multiplier/400) is between 0 and 1: 0 to 100%, +1 makes sure there are no divisions by 0
        }

        //shoots bullets from the player at the enemy

        if ((controller.firing) && (ui.gameRunning)){

            if (this.lives <= 0){
            }else if (this.spentFrames > this.invincFrames/2){
                this.emitter.playerShootUpdate(frameID, this.position.x, this.position.y);
                this.emitter.fillColour = "rgba("+(255*Math.abs(Math.sin(frameID+0))) + ","+(255*Math.abs(Math.cos(frameID+60)))+"," + (255*Math.abs(Math.sin(frameID+120)))+", 0.75)";
            }
        }

        this.emitter.draw(ctx, deltaTime);
    }

    isResized(canvas, scaler, deltaScaler, deltaMargin, deltaFooter, margin){

        this.emitter.isResized(scaler, margin);
        //console.log(this.emitter.playArea);
        this.gameWindow = { //calculates game window size based on canvas size
            x: 0,
            y: 0,
            width: (scaler*(4/3))-(547*(scaler/938)),
            height: scaler,
            scaler: scaler/938
        };

        this.position.x = (deltaScaler*this.position.x) - deltaMargin;
        this.position.y = (deltaScaler*this.position.y) + (deltaFooter*0.22);

        this.radius = this.startingRadius*this.gameWindow.scaler;
        /*

        this.position.x *= this.gameWindow.scaler;
        this.position.y *= this.gameWindow.scaler;

        */
        if(canvas.width-canvas.height*(4/3) >= 0){ // when the side bars are larger than zero it adds them to spawning pos
            this.spawn = {
                x: (canvas.width-canvas.height*(4/3))/2+this.gameWindow.width/2, 
                y: this.gameWindow.height/1.25
            }
            this.gameWindow.x = (canvas.width-scaler*(4/3))/2;
        }else{ // when less than 0 it no longer needs to add them, and if it did it would be adding a negative, offsetting the player to the left
            this.spawn = {
                x: this.gameWindow.width/2,
                y: this.gameWindow.height/1.25
            }
            this.gameWindow.x = 0;
        }    
        
        //console.log('resized')
    }


    
    kill(){

        this.position = {
            x: this.spawn.x,
            y: this.spawn.y
        }
        this.velocity = {
            x: 0,
            y: 0
        }
        if (this.lives > 1){
            this.invincible = true;
            this.spentFrames = 0;
        }
    }

    reset(){
        this.lives = this.maxLives;
        this.emitter.purge();
    }
}