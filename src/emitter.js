import Bullet from "/src/bullet.js";
import Plus from "/src/plus.js";
export default class Emitter{

    constructor(fireRate, range, deltaAngle, numberShotPairs, linear, square, cube, radius, fillColour, border){ //bulletArray, 2, 180, frameID*6*(0), 2

        this.bulletCount = 0;
        this.fireRate = fireRate;
        this.range = range;
        this.deltaAngle = deltaAngle;
        this.numberShotPairs = numberShotPairs; 
        this.linear = linear; //linear term coeff for the bullet equation (v0.4.2)
        this.square = square; //square term coeff for the bullet equation (v0.4.2)
        this.cube = cube; //cube term for coeff  the bullet equation (v0.4.2)
        console.log(linear, square, cube);
        this.radius = radius;
        this.bulletArray = [];
        this.fillColour = fillColour;
        this.border = border;
        this.multiplierRadius = 15; //how close the player has to be to a bullet to gain multiplier
        this.distance = 0;
        this.graze = false;
        this.fps = 0;
        if(this.border == undefined){this.border = 10;};
        this.plusArray = [];
        this.endless;
        this.playArea = {};
        this.justFired = false;
    }

    update(frameID, entityX, entityY, time){

        if ((frameID % Math.round(this.fps/this.fireRate)) == 0){
            let i;
            let angle;
            let gradient;
            for (i = 0; i < this.numberShotPairs; i++){
                angle = ((i*(this.range/this.numberShotPairs)+((this.deltaAngle*6*frameID) % 360))/180) * Math.PI; //divides up the input angle range into equal chunks and works them out in radians
                gradient = Math.tan(angle) //converts that number of radians to a gradient 
                this.bulletArray.push(new Bullet(entityX, entityY, gradient, 1, angle, this.linear, this.square, this.cube, this.radius, this.fillColour, this.border, this.playArea, this.playArea.scaler, time*100)); //creates an object going 'up' (polarity '1') with all the desired properties  
                this.bulletArray.push(new Bullet(entityX, entityY, gradient, -1, angle, this.linear, this.square, this.cube, this.radius, this.fillColour, this.border, this.playArea, this.playArea.scaler, time*100)); //creates an object going 'down' (polarity '-1') with all the desired properties
                this.bulletCount += 2;
            }
        }

    }

    isResized(scaler, margin){ //object undefined for player's emitter
        this.playArea = {
            x: margin,
            y: 0,
            width: scaler*0.75,
            height: scaler,
            scaler: scaler/938
        }
        let i;
        for(i = 0; i < this.bulletArray.length; i++){
            this.bulletArray[i].playArea = this.playArea;
            this.bulletArray[i].isResized(this.playArea.scaler);
        }
    }

    playerShootUpdate(frameID, entityX, entityY, time){

        if (((time*100 % 10/this.fireRate) <= 0.5)&&(this.justFired == false)){
            this.justFired = true;
            let i;
            let angle;
            let gradient;
            for (i = 0; i < this.numberShotPairs; i++){
                angle = ((90-((this.range/this.numberShotPairs)*Math.floor(this.numberShotPairs/2))+(i*(this.range/this.numberShotPairs)))/180) * Math.PI;
                gradient = (Math.tan(angle));
                this.bulletArray.push(new Bullet(entityX, entityY, gradient, -1, angle, this.linear, 0, 0, this.radius, this.fillColour, this.border, this.playArea, this.playArea.scaler, time*100));
            }

        }else if ((time*100 % 10/this.fireRate) >= (10/this.fireRate-0.5)){
            console.log(10/this.fireRate);
            console.log(time*100);
            this.justFired = false;
        }

        console.log(this.justFired);

    }

    draw(ctx, deltaTime, time){

        let i;
        for (i = 0; i < (this.bulletArray.length); i++){
            this.bulletArray[i].update(deltaTime, this.endless, time*100); 
            this.bulletArray[i].draw(ctx); 
        }
    }

    dump(){

        let i;
        for (i = 0; i < (this.bulletArray.length); i++){ //checks if a bullet is dead and splices it from the array to save memory
        
            if (this.bulletArray[i].remove){
                this.bulletArray.splice(i, 1);
            }
        }
    }

    collisionCheck(object){
        try{
            let count = 0;
            for (let i = 0; i < (this.bulletArray.length); i++){
            
                this.distance = Math.sqrt(Math.pow((this.bulletArray[i].position.x - object.position.x), 2) + Math.pow((this.bulletArray[i].position.y - object.position.y), 2));
    
                if (this.distance < (object.radius + this.bulletArray[i].radius)){
                    count++;
                }
            }
            return count;
        }catch(e){
            //bullet already been deleted
        }
    }

    grazeCheck(object){
        try{
            let i;
            for (i = 0; i < (this.bulletArray.length); i++){
            
                this.distance = Math.sqrt(Math.pow((this.bulletArray[i].position.x - object.position.x), 2) + Math.pow((this.bulletArray[i].position.y - object.position.y), 2));
    
                if(this.distance <= (this.multiplierRadius*this.playArea.height/938 + object.radius + this.bulletArray[i].radius)){ 
                    //console.log(this.multiplierRadius*this.playArea.height/938);
                    return true;

                }
            }
        }catch(e){
            //when a bullet's properties are removed, there is a phase where their properties are referenced, but dont exist, thus error handling is needed
        }
    }
    
    purge(addPoints){
        for (let i = 0; i < (this.bulletArray.length); i++){ //checks if a bullet is dead and splices it from the array to save memory
            if(addPoints){this.plusArray.push(new Plus(this.bulletArray[i].position.x, this.bulletArray[i].position.y, 100, this.playArea.height/300, 100, true));} 
            this.bulletArray[i].remove = true;
            this.bulletArray.splice(i, 1);
        }
    }
    
    purgeHandle(deltaTime, player, ctx, ui){
        for (let i = 0; i < this.plusArray.length-1; i++){

                if (this.plusArray[i].remove){
                    this.plusArray.splice(i, 1);
                    ui.scoreVal += 100;
                }else if(this.plusArray[i]){
                    this.plusArray[i].update(deltaTime, player);
                    this.plusArray[i].draw(ctx);
                }
        }
    }

    purgePlus(){
        for (let i = 0; i < this.plusArray.length-1; i++){
            this.plusArray.splice(i, 1);
        }
    }
}