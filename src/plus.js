import Text from "/src/text.js"
export default class Plus{

    // this class produces an effect around the player when they get graze 

    constructor(startX, startY, value, size, fadeSpeed, score){

        this.position = {
            x: startX,
            y: startY-15
        }
        this.speed = 2;
        this.textStyle = new Text(0, 0, "10px Open Sans", "rgba(255, 255, 255, 1)", "center");
        this.value = value;
        this.deltaX;
        this.existenceTime = 0;
        this.remove = false;
        this.size = size;
        this.fadeSpeed = fadeSpeed;
        this.score = score;
        this.scoreLocation = {
            x: 625, 
            y: 70
        };
    }

    update(deltaTime, player){

        if(this.score){
            this.position.x += Math.pow((this.scoreLocation.x-this.position.x)/(7500/Math.pow(this.existenceTime, 0.85)), 1);
            this.position.y += Math.pow((this.scoreLocation.y-this.position.y)/(7500/Math.pow(this.existenceTime, 0.85)), 1);
        }else{
            this.position.y -= this.speed * deltaTime/1000 * this.existenceTime/10;
            this.textStyle.colour = "rgba(255, "+(255/(this.existenceTime/this.fadeSpeed))+","+(255/(this.existenceTime/this.fadeSpeed))+","+(1/(this.existenceTime/this.fadeSpeed))+")";
        }
        
        this.textStyle.position.x = this.position.x;
        this.textStyle.position.y = this.position.y;
        this.textStyle.font = (this.size+(1750-this.existenceTime)/50)+"px Open Sans";
        this.existenceTime += deltaTime;

        if((this.existenceTime >= 750) || (player.invicible) || (player.lives == 0)){ //longer than 10kms, or 10s
            if(!this.score){
                this.remove();
            }else if(this.existenceTime >= 1750){
                this.remove();
            }
        }
    }

    draw(ctx){

        this.textStyle.draw(ctx, "+"+Math.round(this.value));

    }

    remove(){
        delete this.position.x;
        delete this.position.y;
        delete this.angle;
        delete this.gradient;
        delete this.speed;
        delete this.textStyle;
        delete this.radius;
        delete this.value;
        delete this.deltaX;
        delete this.existenceTime;
        delete this.scoreLocation.x;
        delete this.scoreLocation.y;
        delete this.glideSpeed;
        delete this.score;
        this.remove = true;
    }
}