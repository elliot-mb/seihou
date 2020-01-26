import Emitter from "/src/emitter.js"
import Circle from "/src/circle.js"
export default class BossHandler{

    //i gave up on trying to read files so im storing all the boss data in a class
    constructor(){

        this.boss = new Circle(0, 200, 50, 20, "rgba()", "rgba()");
        this.maxHealth = 450;
        this.health = this.maxHealth;
        this.breakTime;
        this.bulletResistance = 2.0;
        this.position = {
            x: 300,
            y: 200
        }
        this.bossID = 0; //set to the boss you want it to start on 0=boss1, 1=boss2 etc.
        //cirno
        this.boss1 = { //THEME: CIRCLE PULSES 

            attackArray: [ 
                [1.5, 180, 0.05, 12, 0.4, 0, 0, 9, "rgba(127, 127, 50)", 9], //4, 30, 0.55, 4, -0.4, 0.5, -0.8, 10, "rgba(0, 100, 150)", "rgba(186, 241, 255)"
                [2, 180, 0.1, 4, 0, -0.1, 0.2, 20, "rgba(50, 127, 50)", 20],
                [2, 180, 0.1, 10, 0.1, 0, 1, 10, "rgba(111, 45, 122)", 10],
                [2, 180, 0.125, 8, 0.05, 0.1, -0.2, 7, "rgba(127, 127, 50)", 100], 
                [3, 180, 0.125, 6, 0.5, 1, -2, 15, "rgba(50, 127, 50)", 30]
            ],

        }
        //fhana
        this.boss2 = { //THEME: SPINNING BULLETS

            attackArray: [
                [14, 180, 0.5, 2, -0.7, 1.1, -1, 9, "rgba(50, 127, 127)", 9],
                [10, 60, -0.55, 3, -0.4, 0.5, -0.8, 10, "rgba(0, 100, 150)", 10],
                [7, 180, 0.11, 4, -0.7, 1.1, -1, 9, "rgba(127, 127, 50)", 9],
                [5, 90, null, 5, 0.5, 0, 0, 8, "rgba(0, 100, 150, 1)", 350],
                [null, null, -0.2, 10, 25, 0, 0, 15, "rgba(0, 100, 150)", 10],
            ],

        }

        this.boss3 = { //THEME: HAIL OF BULLETS!

            attackArray: [
                [3.5, 180, -0.2, 8, 0.25, 0, 0, 5, "rgba(0, 100, 150)", 350], 
                [6, 180, 0.15, 7, 0.2, 0, 0, 9, "rgba(127, 127, 50)", 9], 
                [null, 90, -0.5, 4, 0.5, -0.5, 0, 9, "rgba(66, 12, 100)", 9],
                [3, 180, 0.11, 8, 0, 0, 0, 9, "rgba(127, 127, 50)", 9],
                [10, 180, 0.11, 3, -0.7, 1.1, -1, 9, "rgba(127, 127, 50)", 9]
            ],

        }

        this.boss4 = { //THEME: REVERSE ATTACKS

            attackArray: [
                [2.5, 180, 0.055, 3, 0.55, -0.285, 0.06, 8, "rgba(0, 200, 250)", 350],
                []
            ]

        }

        this.currentEmitter = new Emitter();
        this.attackID = -1;
        this.attackIndex = 0;

    }

    // METHOD THAT DEFINES THE FLOW OF THE GAME: THE ATTACKS, THE ORDER, THE TIME EACH ONE TAKES, ETC.

    update(time, frameID, ctx, deltaTime, ui, player){

        // ATTACK
        if (player.lives <= 0){
            // stops the game
            ui.scoreIncrease = false;
            ui.renderHealthBar = false;
            this.boss.position.x += (300 - this.boss.position.x)/50;
            this.boss.position.y += (-150 - this.boss.position.y)/50;
            this.position.x = this.boss.position.x;
            this.position.y = this.boss.position.y;
            this.renderBossAndBullets(ctx, deltaTime, frameID);
            this.health = 0;
            this.attackIndex = 100000;
            this.attackID = 100000;
            ui.gameRunning = false;
            ui.reset = true;
        }else{
            this.renderBossAndBullets(ctx, deltaTime, frameID);
            if((ui.renderHealthBar) && (player.emitter.collisionCheck(this.boss))){
                this.health -= (1+(ui.multiplier/25)/this.bulletResistance);
                ui.scoreVal += deltaTime * (1+(ui.multiplier/40));
            }
        }

        switch (this.bossID){

            case 0: //BOSS 1
                if ((this.health >= 0) && (this.attackIndex <= 0)){  // this if statement checks if the health is high enough to attack (i.e. the boss isnt dead) and if the attack index is correct, it needs to be the same as the index on the 2d array will be once the if statement has one once

                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    // SETS UP THE EMITTER WITH DESIRED PROPERTIES
    
                    if (this.attackID != 0){
                        this.attackID = 0;
                        this.emitterSetProperties(this.attackID, this.boss1);
                    }
            
                    this.moveSideToSide(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 0)){ //break needs to have attack ID of PREVIOUS attack!
                
                    this.attackIndex = 1; //this needs to be the ID of the following attack
                    this.health = this.maxHealth;
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
    
                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 1)){ 
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 1){
                        this.attackID = 1;
                        this.emitterSetProperties(this.attackID, this.boss1);
                    }  

                    this.moveCircle(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 1)){ //a nice rest
    
                    this.attackIndex = 2;
                    this.health = this.maxHealth;
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
    
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
    
                    this.attackIndex = 3;
                    this.health = this.maxHealth;
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
    
                }else if ((this.health >= 0) && (this.attackIndex <= 3)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 3){
                        this.attackID = 3;
                        this.emitterSetProperties(this.attackID, this.boss1);
                    }
    
                    this.moveTangent(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 3)){ 
    
                    this.attackIndex = 4;
                    this.health = this.maxHealth;
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;

                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 4)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 4){
                        this.attackID = 4;
                        this.emitterSetProperties(this.attackID, this.boss1);
                    }
    
                    this.moveTangent(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 4)){ 
    
                    this.attackIndex = 5;
                    this.health = this.maxHealth;
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/50;
                    this.boss.position.y += (-150 - this.boss.position.y)/50;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
                    
                }else{

                    this.bossID = 1;
                    this.attackID = -1;
                    this.attackIndex = 0;

                }
                break;
            case 1: // BOSS 2
                if ((this.health >= 0) && (this.attackIndex <= 0)){  // this if statement checks if the health is high enough to attack (i.e. the boss isnt dead) and if the attack index is correct, it needs to be the same as the index on the 2d array will be once the if statement has one once
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    // SETS UP THE EMITTER WITH DESIRED PROPERTIES
    
                    if (this.attackID != 0){
                        this.attackID = 0;
                        this.emitterSetProperties(this.attackID, this.boss2);
                    }
                   
                    this.moveSideToSide(time, frameID);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 0)){ //break needs to have attack ID of PREVIOUS attack!
                
                    this.attackIndex = 1; //this needs to be the ID of the following attack
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
    
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
    
                    this.attackIndex = 2;
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
    
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
    
                    this.attackIndex = 3;
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;

                // ATTACK 4
    
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
    
                    this.attackIndex = 4;
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;

                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 4)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 4){
                        this.attackID = 4;
                        this.emitterSetProperties(this.attackID, this.boss2);
                    }
    
                    this.moveWavey(time, frameID, 20, 3);
                    this.currentEmitter.fireRate = ui.fps;
                    this.currentEmitter.range = 180 * (Math.sin(time));
                    this.currentEmitter.speed += ((11 + (Math.cos(time) * 1.1))-this.currentEmitter.speed)/100;
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 4)){ 
    
                    this.attackIndex = 5;
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (-150 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
    
                }else{
                    
                    this.bossID = 2;
                    this.attackID = -1;
                    this.attackIndex = 0;

                }
                break;
            case 2: // BOSS 3
                if ((this.health >= 0) && (this.attackIndex <= 0)){  // this if statement checks if the health is high enough to attack (i.e. the boss isnt dead) and if the attack index is correct, it needs to be the same as the index on the 2d array will be once the if statement has one once

                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
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
                
                    this.attackIndex = 1; //this needs to be the ID of the following attack
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
    
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
    
                    this.attackIndex = 2;
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
    
                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 2)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 2){
                        this.attackID = 2;
                        this.emitterSetProperties(this.attackID, this.boss3);
                    }
                    
                    this.currentEmitter.fireRate = ui.fps/6;
                    this.currentEmitter.numberShotPairs += 0.01;
                    this.currentEmitter.radius += 0.005;
                    this.currentEmitter.speed *= -0.005;

                    this.boss.position.x = this.position.x; //sets boss' position to be rendered at
                    this.boss.position.y = this.position.y;
                    this.currentEmitter.update(frameID, this.position.x, this.position.y);
                    this.breakTime = time + 3;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 2)){ 
    
                    this.attackIndex = 3;
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;

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
    
                    this.attackIndex = 4;
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;

                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 4)){
    
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
                    this.attackID = -1;
                    this.attackIndex = 0;

                }
                break;
            case 3: // BOSS 4
                if ((this.health >= 0) && (this.attackIndex <= 0)){  // this if statement checks if the health is high enough to attack (i.e. the boss isnt dead) and if the attack index is correct, it needs to be the same as the index on the 2d array will be once the if statement has one once

                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    // SETS UP THE EMITTER WITH DESIRED PROPERTIES
    
                    if (this.attackID != 0){
                        this.attackID = 0;
                        this.emitterSetProperties(this.attackID, this.boss4);
                    }
                   
    
                
                    if(!time){
                    }else{
                        this.position.x += (300 + (50 * Math.sin(time * -2)) - this.position.x)/10;
                        this.position.y += (500 - (this.position.x) - this.position.y)/100;
                        this.currentEmitter.radius = 9 + Math.sin(time*2)*2;
                        this.currentEmitter.deltaAngle = 0.15 + Math.sin(time/100);
                    } 
        
                    this.currentEmitter.update(frameID, this.position.x, this.position.y);
                    this.boss.position.x = this.position.x; //sets boss' position to be rendered at
                    this.boss.position.y = this.position.y;
                    this.breakTime = time + 3; //wait time between this attack and the next
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 0)){ //break needs to have attack ID of PREVIOUS attack!
                
                    this.attackIndex = 1; //this needs to be the ID of the following attack
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
    
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
    
                    this.attackIndex = 2;
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;
    
                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 2)){
    
                    ui.scoreIncrease = true; //sets the score to increase
                    ui.renderHealthBar = true;
                    ui.renderBossIndicator = true;
    
                    if (this.attackID < 2){
                        this.attackID = 2;
                        this.emitterSetProperties(this.attackID, this.boss4);
                    }
                    
                    this.currentEmitter.fireRate = ui.fps;
                    this.currentEmitter.numberShotPairs += 0.02;
                    this.currentEmitter.radius += 0.01;
                    this.currentEmitter.speed -= 0.006;

                    this.boss.position.x = this.position.x; //sets boss' position to be rendered at
                    this.boss.position.y = this.position.y;
                    this.currentEmitter.update(frameID, this.position.x, this.position.y);
                    this.breakTime = time + 6;
    
                // REST
    
                }else if ((time <= this.breakTime) && (this.attackID <= 2)){ 
    
                    this.attackIndex = 3;
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;

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
    
                    this.attackIndex = 4;
                    this.health = this.maxHealth;
                     
                    ui.renderHealthBar = false;
                    ui.renderBossIndicator = false;
                    this.boss.position.x += (300 - this.boss.position.x)/10;
                    this.boss.position.y += (200 - this.boss.position.y)/10;
                    this.position.x = this.boss.position.x;
                    this.position.y = this.boss.position.y;

                // ATTACK
    
                }else if ((this.health >= 0) && (this.attackIndex <= 4)){
    
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
                    this.attackID = -1;
                    this.attackIndex = 0;

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

    renderBossAndBullets(ctx, deltaTime, frameID){

        this.currentEmitter.draw(ctx, deltaTime); //draws bullets
        let i;
        for (i = 1; i < this.attackID % 10 + 2; i++){
            this.boss.radius = 100 + i*5;
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
            this.position.x += (300 + (50 * Math.sin(time * 1.5)) - this.position.x)/10;
            this.position.y += (200 - this.position.y)/10;
        }

        this.currentEmitter.update(frameID, this.position.x, this.position.y);
        this.boss.position.x = this.position.x; //sets boss' position to be rendered at
        this.boss.position.y = this.position.y;
    }

    moveCircle(time, frameID){
        this.position.x += (300+((100 * Math.cos(time*1))) - this.position.x)/10; 
        this.position.y += (200+((100 * Math.sin(time*1))) - this.position.y)/10;
        this.currentEmitter.update(frameID, this.position.x, this.position.y);
        this.boss.position.x = this.position.x; //sets boss' position to be rendered at
        this.boss.position.y = this.position.y;
    }

    moveWavey(time, frameID, amplifier, frequency){
        this.position.x += (300+((100 * Math.cos(time*0.5))) - this.position.x)/10;
        this.position.y += (200+((amplifier * Math.sin(time*frequency))) - this.position.y)/10;
        this.boss.position.x = this.position.x; //sets boss' position to be rendered at
        this.boss.position.y = this.position.y;
        this.currentEmitter.update(frameID, this.position.x, this.position.y);
    }

    moveTangent(time, frameID){
        this.position.x += (300+((100 * Math.tan(time*0.5))) - this.position.x)/5;
        this.boss.position.x = this.position.x; //sets boss' position to be rendered at
        this.boss.position.y = this.position.y;
        this.currentEmitter.update(frameID, this.position.x, this.position.y);
    }

    moveOverPlayer(time, frameID, player, speed){
        this.position.x += (((player.position.x - 50*Math.cos(time)) % 600) - this.position.x)/speed; 
        this.position.y += (200+((25 * Math.sin(time*2))) - this.position.y)/10;
        this.currentEmitter.update(frameID, this.position.x, this.position.y);
        this.boss.position.x = this.position.x; //sets boss' position to be rendered at
        this.boss.position.y = this.position.y;
    }

    reset(){
        this.boss = new Circle(0, 200, 50, 20, "rgba()", "rgba()");
        this.maxHealth = 450;
        this.health = this.maxHealth;
        this.breakTime;
        this.bulletResistance = 2.0;
        this.position = {
            x: 300,
            y: 200
        }
        this.bossID = 0; //set to the boss you want it to start on 0=boss1, 1=boss2 etc.
        //cirno
        this.boss1 = { //THEME: CIRCLE PULSES 

            attackArray: [ 
                [1.5, 180, 0.05, 12, 0.4, 0, 0, 9, "rgba(127, 127, 50)", 9], //4, 30, 0.55, 4, -0.4, 0.5, -0.8, 10, "rgba(0, 100, 150)", "rgba(186, 241, 255)"
                [2, 180, 0.1, 4, 0, -0.1, 0.2, 20, "rgba(50, 127, 50)", 20],
                [2, 180, 0.1, 10, 0.1, 0, 1, 10, "rgba(111, 45, 122)", 10],
                [2, 180, 0.125, 8, 0.05, 0.1, -0.2, 7, "rgba(127, 127, 50)", 100], 
                [3, 180, 0.125, 6, 0.5, 1, -2, 15, "rgba(50, 127, 50)", 30]
            ],

        }
        //fhana
        this.boss2 = { //THEME: SPINNING BULLETS

            attackArray: [
                [14, 180, 0.5, 2, -0.7, 1.1, -1, 9, "rgba(50, 127, 127)", 9],
                [10, 60, -0.55, 3, -0.4, 0.5, -0.8, 10, "rgba(0, 100, 150)", 10],
                [7, 180, 0.11, 4, -0.7, 1.1, -1, 9, "rgba(127, 127, 50)", 9],
                [5, 90, null, 5, 0.5, 0, 0, 8, "rgba(0, 100, 150, 1)", 350],
                [null, null, -0.2, 10, 25, 0, 0, 15, "rgba(0, 100, 150)", 10],
            ],

        }

        this.boss3 = { //THEME: HAIL OF BULLETS!

            attackArray: [
                [3.5, 180, -0.2, 8, 0.25, 0, 0, 5, "rgba(0, 100, 150)", 350], 
                [6, 180, 0.15, 7, 0.2, 0, 0, 9, "rgba(127, 127, 50)", 9], 
                [null, 90, -0.5, 4, 0.5, -0.5, 0, 9, "rgba(66, 12, 100)", 9],
                [3, 180, 0.11, 8, 0, 0, 0, 9, "rgba(127, 127, 50)", 9],
                [10, 180, 0.11, 3, -0.7, 1.1, -1, 9, "rgba(127, 127, 50)", 9]
            ],

        }

        this.boss4 = { //THEME: REVERSE ATTACKS

            attackArray: [
                [2.5, 180, 0.055, 3, 0.55, -0.285, 0.06, 8, "rgba(0, 200, 250)", 350],
                []
            ]

        }

        this.currentEmitter = new Emitter();
        this.attackID = -1;
        this.attackIndex = 0;
        this.currentEmitter.purge();

        for (let i = 0; i < this.currentEmitter.bulletArray.length; i++){
            this.currentEmitter.bulletArray[i].remove = true;
        }
    }

}