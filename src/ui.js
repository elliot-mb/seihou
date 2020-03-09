import Text from "/src/text.js"
import Plus from "/src/plus.js"
import Menu from "/src/menu.js"
export default class UI{

    constructor(debug){

        this.scoreStyle = new Text(625, 70, "20px Open Sans", "white", "left");
        this.scoreVal = 0;
        this.hiScoreStyle = new Text(625, 35, "20px Open Sans", "white", "left");
        this.hiScore = 0;
        this.playerStyle = new Text(625, 150);
        this.multiplierStyle = new Text(625, 185, "20px Open Sans", "white", "left");
        this.multiplier = 0;
        this.timeStyle = new Text(625, 255, "20px Open Sans", "white", "left");
        this.time = 0;
        this.damageBoostStyle = new Text(625, 220, "20px Open Sans", "black", "left");
        this.damageBoost = 0;
        this.promptStyle = new Text(300, 220, "50px Open Sans", "white", "center");
        this.renderPrompt = false;

        this.boostBar = {
            leftX: this.damageBoostStyle.position.x,
            topY: this.damageBoostStyle.position.y-17,
            rightX: 245, //lenght
            bottomY: 20, //height
            colour: "rgba(255, 255, 255, 0.5)",
            boostColour: "rgba(255, 255, 0, 1)",
            maxBoost: 100 //max boost in percent (on the bar), x5 to get the actual multiplier/graze
        };

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
            style: new Text(null, 794, "18px Open Sans", "white", "center")
        };

        this.deltaLength = 0;
        this.lastLength = 0;
        this.lives;
        this.score;

        this.healthBar = {
            leftX: 15,
            topY: 15,
            rightX: 570, //lenght
            bottomY: 15 //height
        };

        this.healthBarColour = "rgba(255, 255, 255, 0.5)"
        this.healthColour = "rgba(255, 15, 15, 1)"
        this.plusArray = [];
        this.fps;
        this.fpsAverage = {
            tempFrameID: 0,
            sumX: 0,
            xBar: 0 //x̄
        }; 

        this.fpsStyle = new Text(645, 790, "15px Open Sans", "white", "right");
        if (debug){
            this.bulletsOnScreenStyle = new Text(5, 790, "15px Roboto", "white", "left");
            this.liveBulletText;
        };

        this.gameRunning = false;
        this.reset = false;
        this.deltaMultiplier = 0;
        this.bonusMultiplier = 1000000;
        this.lastBossTime = 0;
        this.menu = new Menu();
        this.startTime = 0;
        this.stagePromptPrompts = [ //dialogues
            ["--Marisa--", "X to shoot and arrow keys/WASD to move", "Theme: spinning bullets!"],
            ["--Cirno--", "Now lets get serious", "Theme: circle pulses!"],
            ["--Default--", "Welcome to the third circle of hell", "Theme: hail of bullets!"],
            ["--Default 2 electric boogaloo--", "Fourth time's the charm", "Theme: reverse attacks!"]
        ];
    }

    update(frameID, timestamp, bossHandler, deltaTime, player, ctx){

        this.lives = player.lives;
        this.time = timestamp - this.startTime;
        if(this.time <= 0){
            this.scoreVal = 0;
            this.multiplier = 0;
        }
        this.damageBoost += ((this.multiplier/5)-this.damageBoost)/25;
        player.emitter.fireRate = 10+(this.multiplier/40);
        
        if (this.multiplier > this.boostBar.maxBoost*5){
            this.multiplier += (((this.boostBar.maxBoost)*5)-this.multiplier)/500;
        }

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
        if (frameID){
            this.fpsAverage.sumX += this.fps; 
            this.fpsAverage.xBar = this.fpsAverage.sumX/(frameID-this.fpsAverage.tempFrameID); //x̄
        }

        if((!timestamp) || (!deltaTime)){
            this.score = "ERR"+this.hiScore;
        }else if(this.scoreIncrease){
            this.scoreVal += deltaTime/100;
            this.score = "SCORE " + Math.round(this.scoreVal);
        }else{
            this.score = "SCORE " + Math.round(this.scoreVal);
        }

        if ((frameID % 10) == 0){
            this.deltaMultiplier = this.multiplier - this.lastMultiplier;
            this.lastMultiplier = this.multiplier;

            if ((this.deltaMultiplier > 0) && (player.invincible != true)){
                this.plusArray.push(new Plus(player.position.x, player.position.y, this.deltaMultiplier*100, 10, 100));
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
                    for(let i = 0; i <= this.plusArray.length; i++){
                        this.plusArray[i].draw(ctx);
                    }
                }catch(e){
                    console.log("error lmao: "+e);
                }
            }
        }  
    }

    draw(ctx, bossHandler, player, GAME_WIDTH, GAME_HEIGHT, timestamp){

        //rendering order 

        if (this.renderBossIndicator){this.drawIndicator(ctx, bossHandler.position.x);}
        ctx.fillStyle = "rgba(155, 50, 40, 1)"
        ctx.fillRect(600, 0, 1000, 800);
        this.fpsStyle.draw(ctx, this.fps + "fps");
        this.scoreStyle.draw(ctx, this.score);
        this.hiScoreStyle.draw(ctx, "HISCORE "+Math.round(this.hiScore));
        this.playerStyle.draw(ctx, "PLAYER ")
        this.multiplierStyle.draw(ctx, "GRAZE "+Math.round(this.multiplier));
        this.drawBoostBar(ctx);
        this.damageBoostStyle.draw(ctx, "DAMAGE BOOST +"+Math.round(this.damageBoost*10)/10+"%");
        this.timeStyle.draw(ctx, ("TIME "+Math.floor(this.time/100)));
        this.drawPlayerLives(ctx); 
        if (this.renderHealthBar){this.drawHealthBar(ctx, bossHandler);}
        if (this.debug){this.bulletsOnScreenStyle.draw(ctx, this.liveBulletText + player.emitter.bulletArray.length);}
        if (this.renderPrompt){this.stagePrompt(ctx, bossHandler, timestamp);}``
    
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

    drawBoostBar(ctx){
        ctx.fillStyle = this.boostBar.colour;
        ctx.fillRect(this.boostBar.leftX, this.boostBar.topY, this.boostBar.rightX, this.boostBar.bottomY);
        ctx.fillStyle = this.boostBar.boostColour;
        ctx.fillRect(this.boostBar.leftX, this.boostBar.topY, (Math.abs((this.boostBar.rightX/this.boostBar.maxBoost)*this.damageBoost)), this.boostBar.bottomY);
    }

    drawIndicator(ctx, x){
        ctx.fillStyle = this.bossIndicator.colour;
        ctx.fillRect(x-(this.bossIndicator.width/2), this.bossIndicator.y, this.bossIndicator.width, this.bossIndicator.height);
        ctx.fillStyle = this.bossIndicator.secondaryColour;
        ctx.fillRect(x-(this.bossIndicator.width/1.3333), this.bossIndicator.y-5, this.bossIndicator.width*1.5, this.bossIndicator.height+5);
        this.bossIndicator.style.position.x = x;
        this.bossIndicator.style.draw(ctx, "BOSS")
    }

    addBonus(bossHandler){
        let bonus = Math.floor(Math.pow((bossHandler.breakTime-this.lastBossTime), -1)*this.bonusMultiplier/100)*100;
        this.plusArray.push(new Plus(300, 150, bonus, 100, 300));
        this.scoreVal += bonus; //calculates score bonus for killing boss in a certain time
        this.lastBossTime = bossHandler.breakTime;
    }

    resetUI(){
        for (let i = 0; i < this.plusArray.length; i++){
            this.plusArray[i].existanceTime = 2000;
        }
        this.lastBossTime = 0;
        this.bonusMultiplier = 1000000;
        this.fpsAverage.sumX = 0;
        this.fpsAverage.xBar = 0;
    }

    stagePrompt(ctx, bossHandler, timestamp){
        if(bossHandler.endless){

            ctx.fillStyle = "rgba(10, 10, 10, 0.75)"
            ctx.fillRect(0,0,600,800);
            this.menu.floatyText(timestamp, 300, 220, 1000, 1500, 5, -15, [this.promptStyle], 100);
            this.promptStyle.font = "50px Open Sans";
            if(timestamp%1100 <= 1000){
                this.promptStyle.draw(ctx, "GET READY");
            }else if(timestamp%1100 <= 1100){
                this.promptStyle.draw(ctx, "TO DIE");
            }
            this.promptStyle.position.y += 100;
            this.promptStyle.font = "40px Open Sans";
            this.promptStyle.draw(ctx, "--ENDLESS--");
            this.promptStyle.position.y += 50; //newline
            this.promptStyle.font = "20px Open Sans";
            this.promptStyle.draw(ctx, "All attacks procedureally generated");
            this.promptStyle.position.y += 50; //newline
            this.promptStyle.draw(ctx, "Good luck...");

        }else{
            ctx.fillStyle = "rgba(10, 10, 10, 0.75)"
            ctx.fillRect(0,0,600,800);
            this.menu.floatyText(timestamp, 300, 220, 1000, 1500, 5, -15, [this.promptStyle], 100);
            this.promptStyle.font = "50px Open Sans";
            if((bossHandler.bossID != 0)&&((timestamp%3000) <= 1000)){
                this.promptStyle.draw(ctx, "GET READY");
            }else if((bossHandler.bossID != 0)&&((timestamp%3000) <= 2000)){
                this.promptStyle.draw(ctx, "BOSS' DEFENSE UP!");
            }else{
                this.promptStyle.draw(ctx, "STAGE "+(bossHandler.bossID+1));
            }
            this.promptStyle.position.y += 100; //newline
            this.promptStyle.font = "40px Open Sans";
            this.promptStyle.draw(ctx, this.stagePromptPrompts[bossHandler.bossID][0]);
            this.promptStyle.position.y += 50; //newline
            this.promptStyle.font = "20px Open Sans";
            this.promptStyle.draw(ctx, this.stagePromptPrompts[bossHandler.bossID][1]);
            this.promptStyle.position.y += 50; //newline
            this.promptStyle.font = "20px Open Sans";
            this.promptStyle.draw(ctx, this.stagePromptPrompts[bossHandler.bossID][2]);
            this.promptStyle.position.y = 220;
        }   
    }
}