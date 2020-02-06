import Text from "/src/text.js"
export default class Plus{

    // this class produces an effect around the player when they get graze 

    constructor(startX, startY, value, size, fadeSpeed){

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
    }

    update(deltaTime, player){

        this.textStyle.position.x = this.position.x;
        this.textStyle.position.y = this.position.y;
        this.textStyle.font = (this.size+(1000-this.existenceTime)/50)+"px Open Sans";
        this.textStyle.colour = "rgba(255, "+(255/(this.existenceTime/this.fadeSpeed))+","+(255/(this.existenceTime/this.fadeSpeed))+","+(1/(this.existenceTime/this.fadeSpeed))+")";

        this.position.y -= this.speed * deltaTime/1000 * this.existenceTime/10;
        this.existenceTime += deltaTime;

        if ((this.existenceTime >= 750) || (player.invicible) || (player.lives == 0)){ //longer than 10kms, or 10s
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
            this.remove = true;
        }
    }

    draw(ctx){

        this.textStyle.draw(ctx, "+"+Math.round(this.value));

    }

}