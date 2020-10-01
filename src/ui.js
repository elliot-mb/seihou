import Text from "/src/text.js"
import Plus from "/src/plus.js"
import Menu from "/src/menu.js"
export default class UI{

    constructor(debug){

        this.gameWindow = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            scaler: 0
        }

        this.instructionStyle = new Text(1750, 500, "20px Source Sans Pro", "white", "center");

        this.scoreStyle = new Text(625, 70, "20px Source Sans Pro", "white", "left");
        this.scoreVal = 0;
        this.scoreDisplay = 0;
        this.hiScoreStyle = new Text(625, 35, "20px Source Sans Pros", "white", "left");
        this.hiScore = 0;
        this.playerStyle = new Text(625, 150);
        this.multiplierStyle = new Text(625, 185, "20px Source Sans Pro", "white", "left");
        this.graze = 0;
        this.deltaGraze= 0;
        this.lastGraze = 0;
        this.timeStyle = new Text(625, 255, "20px Source Sans Pro", "white", "left");
        this.time = 0;
        this.damageBoostStyle = new Text(625, 220, "20px Source Sans Pro", "black", "left");
        this.damageBoost = 0;        
        this.multiplier = 0;
        this.promptStyle = new Text(300, 220, "50px Source Sans Pro", "white", "center");
        this.renderPrompt = false;
        this.bonus = 0;

        this.boostBar = {
            trickle: 0.025, //damage boost passive increase rate
            leftX: this.damageBoostStyle.position.x,
            topY: this.damageBoostStyle.position.y-17,
            rightX: 245, //lenght
            bottomY: 20, //height
            colour: "rgba(255, 255, 255, 0.5)",
            boostColour: "rgba(255, 255, 0, 1)",
            maxBoost: 100 //max boost in percent (on the bar), x5 to get the actual multiplier/graze
        };

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
            style: new Text(null, 794, "18px Source Sans Pro", "white", "center")
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

        this.fpsStyle = new Text(645, 790, "15px Source Sans Pro", "white", "right");
        if (debug){
            this.bulletsOnScreenStyle = new Text(350, 790, "15px Source Sans Pro", "white", "left");
            this.liveBulletText;
        };

        this.gameRunning = false;
        this.reset = false;
        this.bonusMultiplier = 1000000;
        this.lastBossTime = 0;
        this.menu = new Menu();
        this.startTime = 0;
        this.stagePromptPrompts = [ //dialogues
            ["--Cirno--", "X to shoot and arrow keys/WASD to move", "Theme: circle pulses!"],
            ["--Lucina--", "Things begin to heat up", "Theme: spinning bullets!"],
            ["--Default--", "Welcome to the third circle of hell", "Theme: hail of bullets!"],
            ["--Default 2 electric boogaloo--", "Fourth time's the charm", "Theme: reverse attacks!"]
        ];
        this.endless;
        this.player;
    }

    update(frameID, timestamp, bossHandler, deltaTime, player, ctx){
        
        this.player = player;

        this.endless = bossHandler.endless;

        this.lives = player.lives;
        this.time = timestamp - (this.startTime);
        if(this.time <= 0){
            this.scoreVal = 0;
            this.bonus = 0;
            this.multiplier = 0;
        }
        this.damageBoost += ((this.multiplier/5)-this.damageBoost)/25;
        player.emitter.fireRate = 10+(this.multiplier/40);
        
        if (this.multiplier > this.boostBar.maxBoost*5.01){
            this.multiplier = this.boostBar.maxBoost*5;
        }
        
        //debug

        if (this.debug){
            if ((frameID % 60) == 0){ //updates bullets text
                this.deltaLength = bossHandler.currentEmitter.bulletArray.length - this.lastLength;
                this.lastLength = bossHandler.currentEmitter.bulletArray.length;
                this.liveBulletText = (this.deltaLength + " dBullets, " + bossHandler.currentEmitter.bulletArray.length + " bulletArray.length, " + bossHandler.currentEmitter.bulletCount + " bullets created, time: " + Math.round(timestamp/1000) + "s");
            }
        }
        
        //

        if (this.scoreDisplay > this.hiScore){
            this.hiScore = this.scoreDisplay;
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
            this.score = "SCORE " + Math.round(this.scoreDisplay);
        }else{
            this.score = "SCORE " + Math.round(this.scoreDisplay);
        }

        //handles when to add the little score numbers that eminate from the player
    
        if ((frameID % 10) == 0){
            this.deltaGraze = this.graze - this.lastGraze;
            this.lastGraze = this.graze;

            if ((this.deltaGraze > 0) && (player.invincible != true)){
                this.plusArray.push(new Plus(player.position.x, player.position.y, this.deltaGraze, (5+Math.pow(this.deltaGraze/15, 1.1))*this.gameWindow.scaler, 100));
                this.scoreVal += this.deltaGraze;
            }
        }

        for (let i = 0; i <= this.plusArray.length; i++){
            if (this.plusArray.length > 0){
                try{
                    if (this.plusArray[i].remove){
                        delete this.plusArray[i].value;
                        this.plusArray.splice(i, 1);
                    }
                    this.plusArray[i].update(deltaTime, player);
                    for(let i = 0; i <= this.plusArray.length; i++){
                        this.plusArray[i].draw(ctx);
                    }
                }catch(e){

                }
            }
        }  

        this.scoreDisplay = (this.scoreVal*Math.log(this.graze+2))/(this.time/2000)+this.bonus;
    }

    isResized(canvas, scaler, margin, footer){ //method that deals with window resize events
        
        this.gameWindow = { 
            playAreaWidth: 704*scaler/938,
            y: 0,
            width: scaler*(4/3),
            height: scaler,
            scaler: scaler/938,
            margin: margin,
            canvas: canvas,
            footer: footer
        };

        let commonX = (this.gameWindow.scaler*733)+this.gameWindow.margin;
        let commonFont = `${30*this.gameWindow.scaler}px Source Sans Pro`;

        this.hiScoreStyle = new Text(commonX, this.gameWindow.scaler*50, commonFont);
        this.scoreStyle = new Text(commonX, this.gameWindow.scaler*100, commonFont);
        this.playerStyle = new Text(commonX, this.gameWindow.scaler*150, commonFont);
        this.multiplierStyle = new Text(commonX, this.gameWindow.scaler*200, commonFont);
        this.damageBoostStyle = new Text(commonX, this.gameWindow.scaler*250, commonFont, "black");
        this.timeStyle = new Text(commonX, this.gameWindow.scaler*300, commonFont, "white");
        this.fpsStyle = new Text((this.gameWindow.scaler*645)+this.gameWindow.margin, this.gameWindow.scaler*926, `${20*this.gameWindow.scaler}px Source Sans Pro`, "white", "left");
        
        this.healthBar = {
            leftX: this.gameWindow.margin+18*this.gameWindow.scaler,
            topY: 18*this.gameWindow.scaler,
            rightX: 668*this.gameWindow.scaler, //lenght
            bottomY: 18*this.gameWindow.scaler //height
        };

        //below code changes positions of stuff

        this.boostBar.topY = this.damageBoostStyle.position.y-(25*this.gameWindow.scaler);
        this.boostBar.leftX = this.damageBoostStyle.position.x;
        this.boostBar.bottomY = 30*this.gameWindow.scaler;
        this.boostBar.rightX = 300*this.gameWindow.scaler;

        this.bossIndicator.height = 25*this.gameWindow.scaler;
        this.bossIndicator.width = 50*this.gameWindow.scaler;
        this.bossIndicator.y = canvas.height-footer-this.bossIndicator.height;
        this.bossIndicator.style.position.y = this.bossIndicator.y+(20*this.gameWindow.scaler);
        this.bossIndicator.style.font = `${20*this.gameWindow.scaler}px Source Sans Pro`;

        this.instructionStyle.position.x = this.gameWindow.margin + 980*this.gameWindow.scaler;
        this.instructionStyle.position.y = 500*this.gameWindow.scaler;
        this.instructionStyle.font = `${this.gameWindow.scaler*25}px Source Sans Pro`; 
    }  

    draw(ctx, bossHandler, player, timestamp){

        //rendering order 

        if (this.renderBossIndicator){this.drawIndicator(ctx, bossHandler.position.x);}
        ctx.fillStyle = "rgba(187, 10, 33, 1)"
        ctx.fillRect((this.gameWindow.scaler*704)+this.gameWindow.margin, 0, this.gameWindow.scaler*547, this.gameWindow.height);
        this.fpsStyle.draw(ctx, Math.round(player.smoothedFps) + "fps");
        this.scoreStyle.draw(ctx, this.score);
        this.hiScoreStyle.draw(ctx, "HISCORE "+Math.round(this.hiScore));
        this.playerStyle.draw(ctx, "PLAYER ")
        this.multiplierStyle.draw(ctx, "GRAZE "+Math.round(this.graze));
        this.drawBoostBar(ctx);
        this.damageBoostStyle.draw(ctx, "DAMAGE BOOST +"+Math.round(this.damageBoost*10)/10+"%");
        this.timeStyle.draw(ctx, ("TIME "+Math.floor(this.time/100)));
        this.drawPlayerLives(ctx); 
        if (this.renderHealthBar){this.drawHealthBar(ctx, bossHandler);}
        if (this.debug){this.bulletsOnScreenStyle.draw(ctx, this.liveBulletText + " player.emitter.length: " + player.emitter.bulletArray.length);}
        if (this.renderPrompt){this.stagePrompt(ctx, bossHandler, timestamp);}

        this.instructionStyle.position.x = this.gameWindow.margin + 980*this.gameWindow.scaler;
        this.instructionStyle.position.y = 500*this.gameWindow.scaler;
        
        this.instructionStyle.draw(ctx, 'x to shoot');
        this.instructionStyle.position.y += (25*this.gameWindow.scaler);
        this.instructionStyle.draw(ctx, 'arrows, wsad to move');
        this.instructionStyle.position.y += (25*this.gameWindow.scaler);
        this.instructionStyle.draw(ctx, 'p to pause');
    }

    drawPlayerLives(ctx){
        let i;
        for (i = 0; i < this.lives; i++){
            ctx.beginPath(); 
            ctx.arc((this.gameWindow.margin+850*this.gameWindow.scaler + (i*30*this.gameWindow.scaler)), 140*this.gameWindow.scaler, 10*this.gameWindow.scaler, 0, 2 * Math.PI, false); //shapes and locates the path
            ctx.fillStyle = "#ffffff";
            ctx.fill(); 
            ctx.lineWidth = 6*this.gameWindow.scaler; 
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
        ctx.fillRect(x-(this.bossIndicator.width/1.3333), this.bossIndicator.y-(5*this.gameWindow.scaler), this.bossIndicator.width*1.5, this.bossIndicator.height+(5*this.gameWindow.scaler));
        this.bossIndicator.style.position.x = x;
        this.bossIndicator.style.draw(ctx, "BOSS")
    }

    addBonus(bossHandler){
        this.bonus += Math.floor(Math.pow((bossHandler.breakTime-this.lastBossTime), -1)*this.bonusMultiplier/100)*100;
        this.plusArray.push(new Plus((this.gameWindow.width/3.8)+this.gameWindow.margin, (this.gameWindow.height/5)-this.gameWindow.footer/7.5, this.bonus, 100, 300));
        console.log(`i do be creating a big bonus text at ${(this.gameWindow.width/3.8)+this.gameWindow.margin}, ${(this.gameWindow.height/2)+this.gameWindow.footer}`)
        this.lastBossTime = bossHandler.breakTime;
    }

    resetUI(){
        for (let i = 0; i < this.plusArray.length; i++){
            this.plusArray[i].existanceTime = 200000;
        }
        this.lastBossTime = 0;
        this.bonusMultiplier = 1000000;
        this.fpsAverage.sumX = 0;
        this.fpsAverage.xBar = 0;
    }

    stagePrompt(ctx, { endless, bossID }, timestamp){
        this.player.invincible = true;
        ctx.fillStyle = "rgba(10, 10, 10, 0.75)";
        ctx.fillRect(this.gameWindow.margin,0,this.gameWindow.playAreaWidth,this.gameWindow.height);
        this.menu.floatyText(timestamp, this.gameWindow.margin+(this.gameWindow.playAreaWidth/2), 220*this.gameWindow.scaler, 1000, 1500, 5, -15, [this.promptStyle], 100);
        this.promptStyle.font = `${50*this.gameWindow.scaler}px Source Sans Pro`;

        if(endless){ 
            if(timestamp%1500 <= 1000){
                this.promptStyle.draw(ctx, "GET READY");
            }else if(timestamp%1500 <= 1500){
                this.promptStyle.draw(ctx, "TO DIE");
            }
            this.promptStyle.position.y += 100;
            this.promptStyle.font = "40px Source Sans Pro";
            this.promptStyle.draw(ctx, "--ENDLESS--");
            this.promptStyle.position.y += 50; //newline
            this.promptStyle.font = "20px Source Sans Pro";
            this.promptStyle.draw(ctx, "All attacks procedureally generated");
            this.promptStyle.position.y += 50; //newline
            this.promptStyle.draw(ctx, "Good luck...");

        }else{
            if((bossID != 0)&&((timestamp%3000) <= 1000)){
                this.promptStyle.draw(ctx, "GET READY");
            }else if((bossID != 0)&&((timestamp%3000) <= 2000)){
                this.promptStyle.draw(ctx, "BOSS' DEFENSE UP!");
            }else{
                this.promptStyle.draw(ctx, "STAGE "+(bossID+1));
            }
            this.promptStyle.position.y += 117*this.gameWindow.scaler; //newline
            this.promptStyle.font = `${47*this.gameWindow.scaler}px Source Sans Pro`;
            this.promptStyle.draw(ctx, this.stagePromptPrompts[bossID][0]);
            this.promptStyle.position.y += 59*this.gameWindow.scaler; //newline
            this.promptStyle.font = `${24*this.gameWindow.scaler}px Source Sans Pro`;
            this.promptStyle.draw(ctx, this.stagePromptPrompts[bossID][1]);
            this.promptStyle.position.y += 59*this.gameWindow.scaler; //newline
            this.promptStyle.font = `${24*this.gameWindow.scaler}px Source Sans Pro`;
            this.promptStyle.draw(ctx, this.stagePromptPrompts[bossID][2]);
            this.promptStyle.position.y = 258*this.gameWindow.scaler;
        }   
    }
}