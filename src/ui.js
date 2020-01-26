import Text from "/src/text.js"
import Plus from "/src/plus.js"
export default class UI{

    constructor(debug){

        this.scoreStyle = new Text(625, 70, "20px Johnston100W03-Regular", "white", "left");
        this.scoreVal = 0;
        this.hiScoreStyle = new Text(625, 35, "20px Johnston100W03-Regular", "white", "left");
        this.hiScore = 0;
        this.playerStyle = new Text(625, 150);
        this.multiplierStyle = new Text(625, 185, "20px Johnston100W03-Regular", "white", "left");
        this.multiplier = 0;
        this.timeStyle = new Text(625, 220, "20px Johnston100W03-Regular", "white", "left");
        this.time = 0;
        this.lastMultiplier = 0;
        this.debug = debug;
        this.timestamp;
        this.scoreIncrease = false; 
        this.renderHealthBar = true;
        this.renderBossIndicator = true;
        this.bossIndicator = {
            width: 50,
            height: 25,
            y: 775,
            colour: "rgba(233, 59, 59, 0.8)",
            secondaryColour: "rgba(233, 59, 59, 0.5)",
            style: new Text(null, 794, "18px Johnston100W03-Regular", "white", "center")
        }
        this.deltaLength = 0;
        this.lastLength = 0;
        this.lives;
        this.score;
        this.healthBar = {
            leftX: 15,
            topY: 15,
            rightX: 570, //lenght
            bottomY: 15 //height
        }
        this.healthBarColour = "rgba(255, 255, 255, 0.5)"
        this.healthColour = "rgba(255, 15, 15, 1)"
        this.plusArray = [];
        this.fps;
        this.fpsStyle = new Text(645, 790, "15px Johnston100W03-Regular", "white", "right");
        if (debug){
            this.bulletsOnScreenStyle = new Text(5, 790, "15px Roboto", "white", "left");
            this.liveBulletText;
        }
        this.gameRunning = false;
        this.reset = false;
        this.deltaMultiplier = 0;

    }

    update(frameID, timestamp, bossHandler, deltaTime, player, ctx){

        this.lives = player.lives;
        this.time = timestamp;

        if (this.debug){
            if ((frameID % 60) == 0){ //updates bullets text
                this.deltaLength = bossHandler.emitter.bulletArray.length - this.lastLength;
                this.lastLength = bossHandler.emitter.bulletArray.length;
                this.liveBulletText = (this.deltaLength + " delta bullets, " + bossHandler.emitter.bulletArray.length + " bulletArray.length, " + bossHandler.emitter.bulletCount + " bullets created, time: " + Math.round(timestamp/1000) + "s");
            }
        }

        if (this.scoreVal > this.hiScore){
            this.hiScore = this.scoreVal;
        }

        this.fps = Math.round(1000/deltaTime);

        if((!timestamp) || (!deltaTime)){
            this.score = "LOADING"
        }else if(this.scoreIncrease){
                this.scoreVal += deltaTime/100;
                this.score = "SCORE " + Math.round(this.scoreVal);
        }

        if ((frameID % 10) == 0){
            this.deltaMultiplier = this.multiplier - this.lastMultiplier;
            this.lastMultiplier = this.multiplier;

            if ((this.deltaMultiplier > 0) && (player.invincible != true)){
                this.plusArray.push(new Plus(player.position.x, player.position.y, this.deltaMultiplier*100));
                this.scoreVal += this.deltaMultiplier*100;
            }
        }

        for (let i = 0; i <= this.plusArray.length; i++){
            if (this.plusArray.length > 0){
                try{
                    if (this.plusArray[i].remove){
                        this.plusArray.splice(i, 1);
                    }  
                    this.plusArray[i].update(deltaTime, player);
                    this.plusArray[i].draw(ctx);
                }catch(e){
                }
            }
        }
        
    }

    draw(ctx, bossHandler, player, GAME_WIDTH, GAME_HEIGHT){

        if (this.renderBossIndicator){this.drawIndicator(ctx, bossHandler.position.x)};
        ctx.fillStyle = "rgba(155, 50, 40, 1)"
        ctx.fillRect(600, 0, 1000, 800);
        this.fpsStyle.draw(ctx, this.fps + "fps");
        this.scoreStyle.draw(ctx, this.score);
        this.hiScoreStyle.draw(ctx, "HISCORE " + Math.round(this.hiScore));
        this.playerStyle.draw(ctx, "PLAYER ")
        this.multiplierStyle.draw(ctx, "GRAZE " + Math.round(this.multiplier));
        this.timeStyle.draw(ctx, ("TIME " + Math.floor(this.time/100)));
        this.drawPlayerLives(ctx);
        if (this.renderHealthBar){this.drawHealthBar(ctx, bossHandler);};
        if (this.debug){this.bulletsOnScreenStyle.draw(ctx, this.liveBulletText + player.emitter.bulletArray.length);}

    }

    drawPlayerLives(ctx){
        let i;
        for (i = 0; i < this.lives; i++){

            ctx.beginPath(); 
            ctx.arc((725 + (i*25)), 145, 8, 0, 2 * Math.PI, false); //shapes and locates the path
            ctx.fillStyle = "#ffffff";
            ctx.fill(); 
            ctx.lineWidth = 5; 
            ctx.strokeStyle = "#e83535"; 
            ctx.stroke(); 

        }
    }

    drawHealthBar(ctx, bossHandler){

        ctx.fillStyle = this.healthBarColour;
        ctx.fillRect(this.healthBar.leftX, this.healthBar.topY, this.healthBar.rightX, this.healthBar.bottomY);
        ctx.fillStyle = this.healthColour;
        ctx.fillRect(this.healthBar.leftX, this.healthBar.topY, (Math.abs((this.healthBar.rightX/bossHandler.maxHealth)*bossHandler.health)), this.healthBar.bottomY);

    }

    drawIndicator(ctx, x){
        ctx.fillStyle = this.bossIndicator.colour;
        ctx.fillRect(x-(this.bossIndicator.width/2), this.bossIndicator.y, this.bossIndicator.width, this.bossIndicator.height);
        ctx.fillStyle = this.bossIndicator.secondaryColour;
        ctx.fillRect(x-(this.bossIndicator.width/1.3333), this.bossIndicator.y-5, this.bossIndicator.width*1.5, this.bossIndicator.height+5);
        this.bossIndicator.style.position.x = x;
        this.bossIndicator.style.draw(ctx, "BOSS")
    }

    resetUI(){
        for (let i = 0; i < this.plusArray.length; i++){
            this.plusArray[i].existanceTime = 1000;
        }
    }
}