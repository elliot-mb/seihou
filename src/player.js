import Emitter from "/src/emitter.js"
export default class Player{ //exports the class for use in game.js

    constructor(gameWidth, gameHeight){ //constructs object with these properties 

        this.speed = 0.07; 
        this.maxLives = 5;
        this.lives = this.maxLives;
        this.dampening = 0.8; //1 - zero dampening, 0 - infinte dampening  
        this.bounce = 0; //engery after collision with wall multiplier (if set over 1 may cause bugs)
        this.radius = 8; 
        this.outlineWidth = 5;
        
        this.gameWindow = {
            width: gameWidth,
            height: gameHeight
        }

        this.spawn = {
            startX: 300,
            startY: 660 
        }

        this.position = {
            x: this.spawn.startX,
            y: this.spawn.startY 
        }

        this.velocity = { //velocity variables initialised 
            x: 0,
            y: 0
        }
        this.invincible = false;
        this.invincFrames = 100;
        this.spentFrames = 100;

        this.emitter = new Emitter(10, 30, 0, 3, 1, 1, 0, 10, "rgba(0,0,0)", 10);
    }
    
    draw(ctx){ 

        if (this.lives > 0){

            if (this.invincible){ //when the player is respawing
                if ((this.spentFrames <= this.invincFrames) && (this.spentFrames % 15 < 10)){
            
                    ctx.beginPath(); //draws centre
                    ctx.arc(this.position.x, this.position.y + ((this.gameWindow.height - this.spawn.startY) / Math.pow(this.spentFrames, 0.5) - 15), this.radius, 0, 2 * Math.PI, false); //shapes and locates the path
                    ctx.fillStyle = "#e83535"; //colour of inside circle
                    ctx.fill();

                    ctx.beginPath(); //draws recovering peremeter
                    ctx.arc(this.position.x, this.position.y + ((this.gameWindow.height - this.spawn.startY) / Math.pow(this.spentFrames, 0.5) - 15), this.radius, ((2/this.invincFrames) * this.spentFrames) * Math.PI, ((4/this.invincFrames) * this.spentFrames) * Math.PI, false); //shapes and locates the path
                    ctx.lineWidth = this.outlineWidth; //width of outline
                    ctx.strokeStyle = "#ffffff"; //colour of outline
                    ctx.stroke(); //draws outline 

                }else{

                }

                this.spentFrames++;

            }else{ //when the player isnt respawning

                ctx.beginPath(); //begins a vector path
                ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); //shapes and locates the path
                ctx.fillStyle = "#ffffff"; //colour of inside circle
                ctx.fill(); //draws filled circle
                ctx.lineWidth = this.outlineWidth; //width of outline
                ctx.strokeStyle = "#e83535"; //colour of outline
                ctx.stroke(); //draws outline 
            }

        }

    }

    update(deltaTime, controller, frameID, ctx, ui){ //takes properties of controller and converts that to delta x and delta y, factoring in frame times
        
        if (!deltaTime) return;//first frame is handled by this statement

        let dirX = controller.dir.right - controller.dir.left; //takes the left direction from the right, so if both are pressed it doesnt move on that axis
        let dirY = controller.dir.down - controller.dir.up; //takes 'up' direction from 'down', so if both are pressed it doesnt move on that axis

        this.velocity.x += dirX * this.speed; //changes velocity x by the overall direction with coefficient constant 'speed'
        this.velocity.x *= this.dampening; //slows velocity when key isnt pressed, and limits velocity
        this.velocity.y += dirY * this.speed; //changes velocity y by the overall direction with coefficient constant 'speed'
        this.velocity.y *= this.dampening; //slows velocity when key isnt pressed, and limits velocity
        if (this.position.x > 0 + this.radius && this.position.x < this.gameWindow.width - this.radius){ //if the position is inside the play area, the character behaves normally
            this.position.x += this.velocity.x * deltaTime; //changes position by velocity divided by the time between frames, keeping it moving at the same rate no matter the framerate
        }else{
            this.velocity.x *= -(this.bounce); 
            if (this.position.x < 0 + this.radius){ //if off to the left of the play area
                this.position.x = 0.1 + this.radius; //move it back onto the play area
            }
            if (this.position.x > this.gameWindow.width - this.radius){ //if off to the right 
                this.position.x = (this.gameWindow.width - 0.1) - this.radius; //move it back onto the play area
            }
        }
        if (this.position.y > 0 + this.radius && this.position.y < this.gameWindow.height - this.radius){
            this.position.y += this.velocity.y * deltaTime;
        }else{
            this.velocity.y *= -(this.bounce); 
            if (this.position.y < 0 + this.radius){ //if too high up the play area
                this.position.y = 0.1 + this.radius; //move it back onto the play area
            }
            if (this.position.y > this.gameWindow.height - this.radius){ //if below the play area
                this.position.y = (this.gameWindow.height - 0.1) - this.radius; //move it back onto the play area
            }
        }   
        
        if (this.spentFrames >= this.invincFrames){ //controls invincibility rendering
            this.invincible = false;
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
    
    kill(){

        this.position = {
            x: this.spawn.startX,
            y: this.spawn.startY
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