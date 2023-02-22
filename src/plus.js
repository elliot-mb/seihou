import Text from "./text.js"
export default class Plus{

    // this class produces an effect around the player when they get graze 

    constructor(startX, startY, value, size, fadeSpeed, score){

        this.position = {
            x: startX,
            y: startY-15
        }
        this.speed = 100;
        this.textStyle = new Text(0, 0, `${size}px Source Sans Pro`, "rgba(255, 255, 255, 1)", "center");
        this.value = value;
        this.deltaX;
        this.existenceTime = 0;
        this.remove = false;
        this.size = size;
        this.fadeSpeed = fadeSpeed;
        this.score = score;
    }

    update(deltaTime, player){

        if(this.score){
            if(this.existenceTime > 500){
                this.position.x += Math.pow((player.position.x-this.position.x)/(1751/(this.existenceTime/(100-(this.existenceTime/17.5)))),1);
                this.position.y += Math.pow((player.position.y-this.position.y)/(1751/(this.existenceTime/(100-(this.existenceTime/17.5)))),1);  
            }
        }else{
            this.position.y -= this.speed/Math.pow(this.existenceTime+10, 1);
            this.textStyle.colour = "rgba(255, "+(255/(this.existenceTime/this.fadeSpeed))+","+(255/(this.existenceTime/this.fadeSpeed))+","+(1/(this.existenceTime/this.fadeSpeed))+")";
        }
        
        this.textStyle.position.x = this.position.x;
        this.textStyle.position.y = this.position.y;
        if(this.score){
            this.textStyle.font = `${Math.round(this.size+(1750-this.existenceTime)/30)}px Source Sans Pro`;
        }else{
            this.textStyle.font = `${Math.round(this.size+(750-this.existenceTime)/50)}px Source Sans Pro`;
        };

        this.existenceTime += deltaTime;

        let disanceToPlayer = Math.sqrt(Math.pow(player.position.x-this.position.x,2)+Math.pow(player.position.y-this.position.y,2));

        if((this.existenceTime >= 750) || (player.invicible) || (player.lives == 0)){ //longer than 10kms, or 10s
            if(!this.score){
                this.removeProperties();
            }else if((this.existenceTime >= 1750)||(disanceToPlayer<=10)){
                this.removeProperties();
            }
        }
    }

    draw(ctx){
        
        this.textStyle.draw(ctx, "+"+Math.round(this.value));

    }

    removeProperties(){
        delete this.position.x;
        delete this.position.y;
        delete this.angle;
        delete this.gradient;
        delete this.speed;
        delete this.radius;
        delete this.deltaX;
        delete this.existenceTime;
        delete this.glideSpeed;
        delete this.score;
        this.remove = true;
    }
}