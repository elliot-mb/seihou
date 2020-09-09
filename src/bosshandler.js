import Emitter from "/src/emitter.js"
import Circle from "/src/circle.js"
export default class BossHandler{

    //i gave up on trying to read files so im storing all the boss data in a class
    constructor(){

        this.boss = new Circle(0, 200, 50, 20, "rgba()", "rgba()");
        this.maxHealth = 6;
        this.health = this.maxHealth;
        this.breakTime = 5;
        this.bulletResistance = 2.0;
        this.resistanceIncrease = 0.75;
        this.position = {
            x: 300,
            y: 200
        }
        this.offset = {}
        this.bossID = 0; //set to the boss you want it to start on 0=boss1, 1=boss2 etc.
        //cirno
        this.boss1 = {  //THEME: SPINNING BULLETS

            attackArray: [
                [1.5, 180, 0.05, 12, 0.4, 0, 0, 9, "rgba(127, 127, 50)", 9], //4, 30, 0.55, 4, -0.4, 0.5, -0.8, 10, "rgba(0, 100, 150)", "rgba(186, 241, 255)"
                [2, 180, 0.125, 8, 0.05, 0.1, -0.3, 7, "rgba(127, 127, 50)", 100],
                [2, 180, 0.1, 10, 0.1, 0, 1, 10, "rgba(111, 45, 122)", 10],
                [2.5, 180, 0.1, 5, 0, -0.1, 0.2, 20, "rgba(50, 127, 50)", 20],
                [1, 180, 0.125, 6, 0.5, 1, -0.5, 7.5, "rgba(50, 127, 50)", 30]
            ],

        }
        //fhana
        this.boss2 = { //THEME: CIRCLE PULSES

            attackArray: [                 
                [14, 180, 0.5, 2, -0.7, 1.1, -1, 9, "rgba(50, 127, 127, 1)", 9],
                [10, 60, -0.55, 3, -0.4, 0.5, -0.8, 10, "rgba(0, 100, 150)", 10],
                [7, 180, 0.11, 4, -0.7, 1.1, -1, 9, "rgba(127, 127, 5)", 9],
                [5, 90, null, 5, 0.5, 0, 0, 8, "rgba(0, 100, 150, 1)", 350],
                [15, 180, -0.75, 2, 0.5, -0.1, 0, 12, "rgba(0, 100, 150)", 10],
            ],

        }

        this.boss3 = { //THEME: HAIL OF BULLETS!

            attackArray: [
                [4, 180, -0.2, 8, 0.25, 0, 0, 5, "rgba(0, 100, 150)", 350], 
                [6, 180, 0.15, 7, 0.2, 0, 0, 9, "rgba(127, 127, 50)", 9], 
                [1.5, 180, -0.5, 10, 0.25, -0.1, 0, 9, "rgba(66, 12, 100)", 150],
                [3, 180, 0.11, 8, 0, 0, 0, 9, "rgba(127, 127, 50)", 9],
                [10, 180, -0.22, 3, -0.7, 1.1, -1, 8, "rgba(127, 127, 50)", 9]
            ],

        }

        this.boss4 = { //THEME: REVERSE ATTACKS

            attackArray: [
                [2.5, 180, 0.055, 3, 0.55, -0.285, 0.06, 8, "rgba(0, 200, 250)", 350],
                [5, 90, 0.075, 3, 0.55, -0.285, 0.06, 8, "rgba(0, 200, 250)", 350],
                [10, 45, 0.075, 3, 0.75, -0.285, 0.06, 8, "rgba(0, 200, 250)", 350],
                [7.5, 95.5, -0.33, 5, 0.58, -0.6, 0.3, 13.25, "rgba(111, 51, 189)", 200],
                []
            ]

        }
        this.currentEmitter = new Emitter();
        this.attackID = -2;
        this.attackIndex = this.attackID+1;
        // variables for class-wide slope

        //endless variables 
        this.endless = false;
        this.attacking = false;
        this.iteration = 0;
    }

    // this.break(args); controls behaviour during prompts

    isResized(canvas, scaler, margin){ //handles resize events
        this.currentEmitter.isResized(scaler, margin);
        this.offset = {
            x: (352*scaler/938)+margin,
            y: (235*scaler/938),
            width: scaler*0.75,
            scaler: scaler/938,
            canvas: canvas,
            margin: margin
        }
        this.boss.outlineWidth = 20*this.offset.scaler;
    }

    // METHOD THAT DEFINES THE FLOW OF THE GAME: THE ATTACKS, THE ORDER, THE TIME EACH ONE TAKES, ETC.

    update(time, frameID, ctx, deltaTime, ui, player){

        this.currentEmitter.endless = this.endless;
        
        // ATTACK
        if (player.lives <= 0){
            // stops the game
            this.iteration = 0;
            ui.scoreIncrease = false;
            ui.renderHealthBar = false;
            this.boss.position.x += (this.offset.x - this.boss.position.x)/50;
            this.boss.position.y += (-150 - this.boss.position.y)/50;
            this.position.x = this.boss.position.x;
            this.position.y = this.boss.position.y;
            this.health = 0;
            this.attackIndex = 100000;
            this.attackID = 100000;
            ui.gameRunning = false;
            ui.reset = true;
        }else{
            if(ui.renderHealthBar){
                this.health -= ((1+(ui.multiplier/500))/this.bulletResistance)*player.emitter.collisionCheck(this.boss)*0.75;
                ui.scoreVal += deltaTime*(1+(ui.multiplier/10))*player.emitter.collisionCheck(this.boss)*3.5;
                ui.multiplier += 0.05*player.emitter.collisionCheck(this.boss);
            }
        }

        this.renderBossAndBullets(ctx, deltaTime, frameID);

        if(this.endless){ //bug: when you die it adds all the points to your score from deleting the bullets //another bug all the attacks were way too hard c. v0.3.0a

            if((time <= this.breakTime)&&(this.attackID <= -1)){

                this.attacking = false;
                ui.fpsAverage.tempFrameID = 0;
                this.break(null, ui, deltaTime, player, ctx);
                if(this.iteration <= 0){ui.renderPrompt = true;}
                this.currentEmitter.fps = ui.fpsAverage.xBar;

            }else if(this.health >= 0){

                if(this.attacking == false){
                    this.randomize();
                    this.attacking = true;
                    this.attackID = 0;
                    this.iteration++;
                }

                ui.scoreIncrease = true;
                ui.renderHealthBar = true;
                ui.renderBossIndicator = true;
                ui.renderPrompt = false;

                this.moveSideToSide(time, frameID); //without this, a bug was caused where the emitter wouldnt draw any bullets to the screen (for documentation)
                
                //console.log(this.currentEmitter);
                this.breakTime = time + 3;

           }else if(time <= this.breakTime){
                this.attackID--;
           }

        }else{

        switch (this.bossID){

            case 0: //BOSS 1
                if ((time <= this.breakTime) && (this.attackID <= -1)){

                    this.currentEmitter.purgePlus(); //outright purges the array of plusses regardless of .remove

                    ui.fpsAverage.tempFrameID = 0;
                    this.break(0, ui, deltaTime, player, ctx);
                    ui.renderPrompt = true;
                    this.currentEmitter.fps = ui.fpsAverage.xBar;

                }else if ((this.health >= 0) && (this.attackIndex <= 0)){  // this if statement checks if the health is high enough to attack (i.e. the boss isnt dead) and if the attack index is correct, it needs to be the same as the index on the 2d array will be once the if statement has one once

                    ui.scoreIncrease = true;
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
                    ui.renderPrompt = false;
    
                    // SETS UP THE EMITTER WITH DESIRED PROPERTIES
    
                    if (this.attackID != 0){
                        this.attackID = 0;
                        this.emitterSetProperties(this.attackID, this.boss1);
                    }
                   
                    this.moveSideToSide(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 0)){ //break needs to have attack ID of PREVIOUS attack!
                
                    this.break(1, ui, deltaTime, player, ctx);
    
                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 1)){ 
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 1){
                        this.attackID = 1;
                        this.emitterSetProperties(this.attackID, this.boss1);
                    }  
    
                    this.moveTangent(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 1)){ //a nice rest
    
                    this.break(2, ui, deltaTime, player, ctx);
    
                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 2)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 2){
                        this.attackID = 2;
                        this.emitterSetProperties(this.attackID, this.boss1);
                    }
    
                    this.moveWavey(time, frameID, 100, 2);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 2)){ 
    
                    this.break(3, ui, deltaTime, player, ctx);

                // ATTACK 4
    
                }else if ((this.health >= 0) && (this.attackIndex <= 3)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 3){
                        this.attackID = 3;
                        this.emitterSetProperties(this.attackID, this.boss1);
                    }

                    this.moveCircle(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 3)){ 
    
                    this.break(4, ui, deltaTime, player, ctx);

                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 4)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
                    ui.bonusMultiplier = 10000000;
    
                    if (this.attackID < 4){
                        this.attackID = 4;
                        this.emitterSetProperties(this.attackID, this.boss1);
                    }
            
                    this.moveOverPlayer(time, frameID, player, 100);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 4)){ 
    
                    if (this.attackIndex == 4){
                        ui.addBonus(this);
                    }
                    this.attackIndex = 5;
                    this.health = this.maxHealth;
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (-150 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
    
                }else{
                    
                    this.bossID = 1;
                    this.attackID = -2;
                    this.breakTime = time+5;
                    this.attackIndex = this.attackID+1;
                    this.bulletResistance += this.resistanceIncrease;
                    ui.bonusMultiplier = 1500000;
                    this.uiHandle(ui, frameID);
                    this.currentEmitter.purge();
                }
                break;
            case 1: //BOSS 2
                if ((time <= this.breakTime) && (this.attackID <= -1)){

                    this.break(0, ui, deltaTime, player, ctx);
                    ui.renderPrompt = true;
                    this.currentEmitter.fps = ui.fpsAverage.xBar;

                }else if((this.health >= 0) && (this.attackIndex <= 0)){  // this if statement checks if the health is high enough to attack (i.e. the boss isnt dead) and if the attack index is correct, it needs to be the same as the index on the 2d array will be once the if statement has one once
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
                    ui.renderPrompt = false;
    
                    // SETS UP THE EMITTER WITH DESIRED PROPERTIES
    
                    if (this.attackID != 0){
                        this.attackID = 0;
                        this.emitterSetProperties(this.attackID, this.boss2);
                    }
            
                    this.moveSideToSide(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 0)){ //break needs to have attack ID of PREVIOUS attack!
                
                    this.break(1, ui, deltaTime, player, ctx);
    
                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 1)){ 
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 1){
                        this.attackID = 1;
                        this.emitterSetProperties(this.attackID, this.boss2);
                    }  

                    this.moveCircle(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 1)){ //a nice rest
    
                    this.break(2, ui, deltaTime, player, ctx);

                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 2)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 2){
                        this.attackID = 2;
                        this.emitterSetProperties(this.attackID, this.boss2);
                    }
    
                    this.moveSideToSide(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 2)){ 
    
                    this.break(3, ui, deltaTime, player, ctx);

                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 3)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 3){
                        this.attackID = 3;
                        this.emitterSetProperties(this.attackID, this.boss2);
                    }
    
                    this.moveWavey(time, frameID, 100, 2);
                    this.currentEmitter.deltaAngle = Math.cos(time * 0.5)/10;
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 3)){ 
    
                    this.break(4, ui, deltaTime, player, ctx);

                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 4)){
    
                    ui.bonusMultiplier = 11000000;
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 4){
                        this.attackID = 4;
                        this.emitterSetProperties(this.attackID, this.boss2);
                    }
    
                    this.moveWavey(time, frameID, 20, 3);
                    this.currentEmitter.range = 180 * (Math.sin(time));
                    this.currentEmitter.speed += (0.5+(Math.cos(time) * 0.1)-this.currentEmitter.speed)/25;
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 4)){ 
                    
                    if (this.attackIndex == 4){
                        ui.addBonus(this);
                    }
                    this.attackIndex = 5;
                    this.health = this.maxHealth;
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/50;
                    this.boss.position.y += (-150 - this.boss.position.y)/50;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
                    
                }else{

                    this.bossID = 2;
                    this.attackID = -2;
                    this.breakTime = time+5;
                    this.attackIndex = this.attackID+1;
                    this.bulletResistance += this.resistanceIncrease;
                    ui.bonusMultiplier = 2000000;
                    this.uiHandle(ui, frameID);
                    this.currentEmitter.purge();
                }
                break;
            case 2: // BOSS 3
                if ((time <= this.breakTime) && (this.attackID <= -1)){

                    this.break(0, ui, deltaTime, player, ctx);
                    ui.renderPrompt = true;
                    this.currentEmitter.fps = ui.fpsAverage.xBar;

                }else if((this.health >= 0) && (this.attackIndex <= 0)){  // this if statement checks if the health is high enough to attack (i.e. the boss isnt dead) and if the attack index is correct, it needs to be the same as the index on the 2d array will be once the if statement has one once
               
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
                    ui.renderPrompt = false;

                    // SETS UP THE EMITTER WITH DESIRED PROPERTIES
    
                    if (this.attackID != 0){
                        this.attackID = 0;
                        this.emitterSetProperties(this.attackID, this.boss3);
                    }
                   
                    this.moveSideToSide(time, frameID);
                    this.currentEmitter.radius = 9 + Math.sin(time*2)*2;
                    this.currentEmitter.deltaAngle = 0.15 + Math.sin(time/100);
                    this.breakTime = time + 3; //wait time between this attack and the next
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 0)){ //break needs to have attack ID of PREVIOUS attack!
                
                    this.break(1, ui, deltaTime, player, ctx);
    
                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 1)){ 
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 1){
                        this.attackID = 1;
                        this.emitterSetProperties(this.attackID, this.boss3);
                    } 

                    this.moveOverPlayer(time, frameID, player, 100);
                    this.breakTime = time + 3; // wait time between this attack and the next
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 1)){ //a nice rest
    
                    this.break(2, ui, deltaTime, player, ctx);
    
                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 2)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 2){
                        this.attackID = 2;
                        this.emitterSetProperties(this.attackID, this.boss3);
                    }
                    
                    this.currentEmitter.fireRate += 0.002;
                    this.currentEmitter.numberShotPairs *= 0.9991;
                    this.currentEmitter.deltaAngle += -0.005;

                    this.boss.position.x = this.position.x; //sets boss' position to be rendered at
                    this.boss.position.y = this.position.y;
                    this.currentEmitter.update(frameID, this.position.x, this.position.y);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 2)){ 
    
                    this.break(3, ui, deltaTime, player, ctx);

                // ATTACK 4
    
                }else if ((this.health >= 0) && (this.attackIndex <= 3)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 3){
                        this.attackID = 3;
                        this.emitterSetProperties(this.attackID, this.boss3);
                    }
                    
                    this.currentEmitter.speed = 0.1 + Math.abs(Math.sin(time)/5);
                    this.moveWavey(time, frameID, 40, 3);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 3)){ 
    
                    this.break(4, ui, deltaTime, player, ctx);

                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 4)){
    
                    ui.bonusMultiplier = 12000000;
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 4){
                        this.attackID = 4;
                        this.emitterSetProperties(this.attackID, this.boss3);
                    }
    
                    this.moveWavey(time, frameID, 50, 5);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 4)){ 
    
                    if (this.attackIndex == 4){
                        ui.addBonus(this);
                    }
                    this.attackIndex = 5;
                    this.health = this.maxHealth;
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/50;
                    this.boss.position.y += (-150 - this.boss.position.y)/50;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
    
                }else{
                    
                    this.bossID = 3;
                    this.attackID = -2;
                    this.breakTime = time+5;
                    this.attackIndex = this.attackID+1;
                    this.bulletResistance += this.resistanceIncrease;
                    ui.bonusMultiplier = 2500000;
                    this.uiHandle(ui, frameID);
                    this.currentEmitter.purge();
                }
                break;
            case 3: // BOSS 4
                if ((time <= this.breakTime) && (this.attackID <= -1)){

                    this.break(0, ui, deltaTime, player, ctx);
                    ui.renderPrompt = true;
                    this.currentEmitter.fps = ui.fpsAverage.xBar;

                }else if ((this.health >= 0) && (this.attackIndex <= 0)){  // this if statement checks if the health is high enough to attack (i.e. the boss isnt dead) and if the attack index is correct, it needs to be the same as the index on the 2d array will be once the if statement has one once

                    ui.scoreIncrease = true;
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
                    ui.renderPrompt = false;
    
                    // SETS UP THE EMITTER WITH DESIRED PROPERTIES
    
                    if (this.attackID != 0){
                        this.attackID = 0;
                        this.emitterSetProperties(this.attackID, this.boss4);
                    }
                    
                    this.moveOverPlayer(time, frameID, player, 100);
                    this.breakTime = time + 3; //wait time between this attack and the next
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 0)){ //break needs to have attack ID of PREVIOUS attack!
                
                    this.break(1, ui, deltaTime, player, ctx);
    
                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 1)){ 
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 1){
                        this.attackID = 1;
                        this.emitterSetProperties(this.attackID, this.boss4);
                    }  
    
                    //MOVEMENT
    
                    this.position.x += (((player.position.x - 50*Math.cos(time)) % 600) - this.position.x)/100; 
                    this.position.y += (200+((25 * Math.sin(time*2))) - this.position.y)/10;
    
                    this.currentEmitter.update(frameID, this.position.x, this.position.y);
                    this.boss.position.x = this.position.x; //sets boss' position to be rendered at
                    this.boss.position.y = this.position.y;
                    this.breakTime = time + 3; // wait time between this attack and the next
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 1)){ //a nice rest
    
                    this.break(2, ui, deltaTime, player, ctx);
    
                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 2)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 2){
                        this.attackID = 2;
                        this.emitterSetProperties(this.attackID, this.boss4);
                    }

                    this.boss.position.x = this.position.x; //sets boss' position to be rendered at
                    this.boss.position.y = this.position.y;
                    this.currentEmitter.update(frameID, this.position.x, this.position.y);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 2)){ 
    
                    this.break(3, ui, deltaTime, player, ctx);

                // ATTACK 4
    
                }else if ((this.health >= 0) && (this.attackIndex <= 3)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 3){
                        this.attackID = 3;
                        this.emitterSetProperties(this.attackID, this.boss4);
                    }
    
                    this.position.x += (300 + (50 * Math.sin(time * 1.5)) - this.position.x)/10;
                    this.position.y += (200 + (50 * Math.cos(time * 1.5)) - this.position.y)/10;
                    this.currentEmitter.speed = 0.1 + Math.abs(Math.sin(time)/5);
                    this.boss.position.x = this.position.x; //sets boss' position to be rendered at
                    this.boss.position.y = this.position.y;
                    this.currentEmitter.update(frameID, this.position.x, this.position.y);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 3)){ 
    
                    this.break(4, ui, deltaTime, player, ctx);

                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 4)){
    
                    ui.bonusMultiplier = 13000000;
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 4){
                        this.attackID = 4;
                        this.emitterSetProperties(this.attackID, this.boss4);
                    }
    
                    if(!time){
                    }else{
                        this.position.x += (300 + (75 * Math.sin(time * 1.5)) - this.position.x)/10;
                        this.position.y += (200 + (15*Math.cos(this.position.x * 0.1)) - this.position.y)/10;
                        this.currentEmitter.fireRate = ui.fps;
                        this.currentEmitter.range = 180 * (Math.sin(time));
                        this.currentEmitter.speed = 10 + (Math.cos(time) * 1.1);
                    }
                    this.boss.position.x = this.position.x; //sets boss' position to be rendered at
                    this.boss.position.y = this.position.y;
                    this.currentEmitter.update(frameID, this.position.x, this.position.y);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 4)){ 
                    
                    if (this.attackIndex == 4){
                        ui.addBonus(this);
                    }
                    this.attackIndex = 5;
                    this.health = this.maxHealth;
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/50;
                    this.boss.position.y += (-150 - this.boss.position.y)/50;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
    
                }else{
                    
                    this.bossID = 4;
                    this.attackID = -1;
                    this.attackIndex = 0;
                    this.bulletResistance += this.resistanceIncrease;
                    ui.bonusMultiplier = 3000000;
                    this.uiHandle(ui, frameID);
                    this.currentEmitter.purge();
                }
                break;
            default: 
                ui.scoreIncrease = false;
                ui.renderHealthBar = false;
                ui.renderBossIndicator = false;
                this.boss.position.x += (300 - this.boss.position.x)/50;
                this.boss.position.y += (-150 - this.boss.position.y)/50;
                this.position.x = this.boss.position.x;
                this.position.y = this.boss.position.y;
                this.renderBossAndBullets(ctx, deltaTime, frameID);
        }
    }
    }    

    emitterSetProperties(attackID, boss){
        this.currentEmitter.fireRate = boss.attackArray[attackID][0];
        this.currentEmitter.range = boss.attackArray[attackID][1];
        this.currentEmitter.deltaAngle = boss.attackArray[attackID][2];
        this.currentEmitter.numberShotPairs = boss.attackArray[attackID][3];
        this.currentEmitter.speed = boss.attackArray[attackID][4];
        this.currentEmitter.deltaSpeed = boss.attackArray[attackID][5];
        this.currentEmitter.deltaDSpeed = boss.attackArray[attackID][6];
        this.currentEmitter.radius = boss.attackArray[attackID][7];
        this.currentEmitter.fillColour = boss.attackArray[attackID][8];
        this.currentEmitter.border = boss.attackArray[attackID][9];
    }

    uiHandle(ui, frameID){
        ui.fpsAverage.sumX = 0;
        ui.fpsAverage.xBar = 0;
        ui.fpsAverage.tempFrameID = frameID;
    }

    renderBossAndBullets(ctx, deltaTime, frameID){
        this.currentEmitter.draw(ctx, deltaTime); //draws bullets
        let i;
        for (i = 1; i < this.attackID % 10 + 2; i++){
            this.boss.radius = 100*this.offset.scaler + i*25*this.offset.scaler;
            this.boss.fillColour = "rgba(" + (255 * Math.abs(Math.sin(frameID/60+0))) + "," + (255 *  Math.abs(Math.sin(frameID/60+30))) + "," + (255 *  Math.abs(Math.sin(frameID/60+90))) + ", 0.1)";
            this.boss.strokeColour = "rgba(" + (255 *  Math.abs(Math.sin(frameID/120+(i*3)))) + "," + (255 *  Math.abs(Math.sin(frameID/150+30+(i*3)))) + "," + (255 *  Math.abs(Math.sin(frameID/60+180+(i*3)))) + ", 0.2)";
            this.boss.draw(ctx); //draws boss
        }
        this.boss.radius = 50;
    }

    ////////////////////
    //Movement methods//
    ////////////////////

    moveSideToSide(time, frameID){
        if(!time){
        }else{
            this.position.x += (this.offset.x + ((50*this.offset.scaler) * Math.sin(time * 1.5)) - this.position.x)/10;
            this.position.y += (this.offset.y - this.position.y)/10;
        }
        this.currentEmitter.update(frameID, this.position.x, this.position.y);
        this.boss.position.x = this.position.x; //sets boss' position to be rendered at
        this.boss.position.y = this.position.y;
    }

    moveCircle(time, frameID){
        this.position.x += (this.offset.x+(((100*this.offset.scaler) * Math.cos(time*1))) - this.position.x)/10; 
        this.position.y += (this.offset.y+(((100*this.offset.scaler) * Math.sin(time*1))) - this.position.y)/10;
        this.currentEmitter.update(frameID, this.position.x, this.position.y);
        this.boss.position.x = this.position.x; //sets boss' position to be rendered at
        this.boss.position.y = this.position.y;
    }

    moveWavey(time, frameID, amplifier, frequency){
        this.position.x += (this.offset.x+(((100*this.offset.scaler) * Math.cos(time*0.5))) - this.position.x)/10;
        this.position.y += (this.offset.y+(((amplifier*this.offset.scaler) * Math.sin(time*frequency))) - this.position.y)/10;
        this.boss.position.x = this.position.x; //sets boss' position to be rendered at
        this.boss.position.y = this.position.y;
        this.currentEmitter.update(frameID, this.position.x, this.position.y);
    }

    moveTangent(time, frameID){
        this.position.x += (this.offset.x+(((100*this.offset.scaler) * Math.tan(time*0.5))) - this.position.x)/5;
        this.position.y += (this.offset.y - this.position.y)/10;
        this.boss.position.x = this.position.x; //sets boss' position to be rendered at
        this.boss.position.y = this.position.y;
        this.currentEmitter.update(frameID, this.position.x, this.position.y);
    }

    moveOverPlayer(time, frameID, player, speed){
        this.position.x += ((player.position.x) - this.position.x)/speed; 
        this.position.y += (this.offset.y+(((25*this.offset.scaler) * Math.sin(time*2))) - this.position.y)/10;
        this.currentEmitter.update(frameID, this.position.x, this.position.y);
        this.boss.position.x = this.position.x; //sets boss' position to be rendered at
        this.boss.position.y = this.position.y;
    }

    //////////////

    break(index, ui, deltaTime, player, ctx){
        if ((this.attackIndex == index-1)&&(index > 0)){
            ui.addBonus(this);
            ui.multiplier += 0.05;
        }
        this.currentEmitter.purge(true);
        if (this.currentEmitter.plusArray.length > 0){
            this.currentEmitter.purgeHandle(deltaTime, player, ctx, ui);
        }
        this.attackIndex = index;
        this.health = this.maxHealth;
        ui.renderHealthBar = false;
        ui.renderBossIndicator = false;
        this.boss.position.x += (this.offset.x - this.boss.position.x)/10;
        this.boss.position.y += (this.offset.y - this.boss.position.y)/10;
        this.position.x = this.boss.position.x;
        this.position.y = this.boss.position.y;
    }

    randomize(){
        this.currentEmitter.fireRate = 2+(Math.random()*8);
        let range = Math.random()*360;
        if(range >= 180){this.currentEmitter.range = 180;}else{this.currentEmitter.range = range;}
        this.currentEmitter.deltaAngle = Math.random()-0.5;
        this.currentEmitter.numberShotPairs = Math.round((Math.random()+1)*20/this.currentEmitter.fireRate);
        this.currentEmitter.speed = (0.6*Math.random())-0.3;
        this.currentEmitter.deltaSpeed = 0.25+((Math.random()-0.5))/(this.currentEmitter.fireRate*0.1);
        this.currentEmitter.deltaDSpeed = (Math.random()-0.5)/(this.currentEmitter.fireRate*0.1);
        this.currentEmitter.radius = ((Math.random()+1)*30)/(this.currentEmitter.numberShotPairs)/(this.currentEmitter.fireRate*0.15);
        this.currentEmitter.fillColour = "rgba("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+")";
        this.currentEmitter.border = 150;
    }

    reset(){
        this.health = this.maxHealth;
        this.breakTime = 5;
        this.bulletResistance = 2.0;
        this.position = {
            x: 300,
            y: 200
        }
        this.bossID = 0; //set to the boss you want it to start on 0=boss1, 1=boss2 etc.
        //cirno
        this.boss1 = {  //THEME: SPINNING BULLETS

            attackArray: [
                [1.5, 180, 0.05, 12, 0.4, 0, 0, 9, "rgba(127, 127, 50)", 9], //4, 30, 0.55, 4, -0.4, 0.5, -0.8, 10, "rgba(0, 100, 150)", "rgba(186, 241, 255)"
                [2, 180, 0.125, 8, 0.05, 0.1, -0.2, 7, "rgba(127, 127, 50)", 100],
                [2, 180, 0.1, 10, 0.1, 0, 1, 10, "rgba(111, 45, 122)", 10],
                [2.5, 180, 0.1, 5, 0, -0.1, 0.2, 20, "rgba(50, 127, 50)", 20],
                [3, 180, 0.125, 6, 0.5, 1, -2, 7.5, "rgba(50, 127, 50)", 30]
            ],

        }
        //fhana
        this.boss2 = { //THEME: CIRCLE PULSES

            attackArray: [                 
                [14, 180, 0.5, 2, -0.7, 1.1, -1, 9, "rgba(50, 127, 127, 1)", 9],
                [10, 60, -0.55, 3, -0.4, 0.5, -0.8, 10, "rgba(0, 100, 150)", 10],
                [7, 180, 0.11, 4, -0.7, 1.1, -1, 9, "rgba(127, 127, 5)", 9],
                [5, 90, null, 5, 0.5, 0, 0, 8, "rgba(0, 100, 150, 1)", 350],
                [15, 180, -0.75, 2, 0.5, -0.1, 0, 12, "rgba(0, 100, 150)", 10],
            ],

        }

        this.boss3 = { //THEME: HAIL OF BULLETS!

            attackArray: [
                [4, 180, -0.2, 8, 0.25, 0, 0, 5, "rgba(0, 100, 150)", 350], 
                [6, 180, 0.15, 7, 0.2, 0, 0, 9, "rgba(127, 127, 50)", 9], 
                [1.5, 180, -0.5, 10, 0.25, -0.1, 0, 9, "rgba(66, 12, 100)", 150],
                [3, 180, 0.11, 8, 0, 0, 0, 9, "rgba(127, 127, 50)", 9],
                [10, 180, -0.22, 3, -0.7, 1.1, -1, 8, "rgba(127, 127, 50)", 9]
            ],

        }

        this.boss4 = { //THEME: REVERSE ATTACKS

            attackArray: [
                [2.5, 180, 0.055, 3, 0.55, -0.285, 0.06, 8, "rgba(0, 200, 250)", 350],
                [5, 90, 0.075, 3, 0.55, -0.285, 0.06, 8, "rgba(0, 200, 250)", 350],
                [10, 45, 0.075, 3, 0.75, -0.285, 0.06, 8, "rgba(0, 200, 250)", 350],
                [7.5, 95.5, -0.33, 5, 0.58, -0.6, 0.3, 13.25, "rgba(111, 51, 189)", 200],
                []
            ]

        }
        this.attackID = -2;
        this.attackIndex = this.attackID+1;
        // variables for class-wide slope

        //endless variables 
        this.endless = false;
        this.attacking = false;
        this.iteration = 0;

    }

}