export default class Bullet{ //exports the class for use in game.js

    constructor(spawnX, spawnY, gradient, polarity, theta, speed, deltaSpeed, deltaDSpeed, radius, fillColour, border){ //constructs object with initial coords on spawn point

        this.speed = speed; //speed coefficient 
        this.deltaSpeed = deltaSpeed;
        this.deltaDSpeed = deltaDSpeed;
        this.radius = radius; //bullet radius
        this.deltaX = 0; //change in x over time
        this.verticalLim = 100000000; //some big number near infinity (for dealing with infinite gradient)
        this.polarity = polarity; //bullet going up or down?
        this.gradient = gradient; //the gradient of the bullet that's calculated from the desired angle
        this.theta = theta; //the desired angle of the bullet
        this.fillColour = fillColour;
        this.strokeColour;
        this.remove = false; //if true the bullet is removed from the array to save memory (this is used in garbage collection)
        this.position = { //self explanatory
            x: spawnX,
            y: spawnY
        }
        this.original = {
            x: 0,
            y: 0
        }
        this.deltaPos;
        this.border = border;
        this.fillArraySplit = this.fillColour.split('(').join(',').split(')').join(',').split(',');
        this.fillArraySplit.splice(0, 1);
        this.fillArraySplit.splice(4, 1);
        this.colourGlide = {
            r: parseInt(this.fillArraySplit[0]),
            g: parseInt(this.fillArraySplit[1]),
            b: parseInt(this.fillArraySplit[2]),
            deltaColour: 2.5
        };
        if ((this.fillArraySplit.length > 3)&&(this.fillArraySplit[3] != "")){this.alpha = this.fillArraySplit[3]}else{this.alpha = 1;};
    }
    
    draw(ctx){ //draw the bullet
        try{
            ctx.beginPath(); //begins a vector path
            ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); //shapes and locates the path
            ctx.fillStyle = this.fillColour;//ctx.fillStyle = 'rgba('+this.position.x/(600/255)+', '+(255-this.position.y/(800/255))+', '+(255-this.deltaX*(255/this.speed))+', 1)'; //colour of inside circle
            ctx.fill(); //draws filled circle
            ctx.lineWidth = 5; //width of outline
            ctx.strokeStyle = this.strokeColour; //ctx.strokeStyle = 'rgba('+(255-this.position.x/(600/255))+', '+(this.position.y/(800/255))+', '+(255-this.deltaX*(255/this.speed))+', 1)'; //colour of outline
            ctx.stroke(); //draws outline 
        }catch(e){
            //bullet already been deleted
        }
    }

    update(deltaTime){
        try{
            let interceptY = (this.position.y - (this.position.x * this.gradient)); //calculated the y intercept based off of the original coords the bullet is initialised with
            this.deltaX = (this.polarity * this.speed) * Math.cos(this.theta);    //(Math.sqrt(Math.pow(this.speed, 2) - Math.pow(gradient, 2))) ||| ((Math.abs(Math.pow(this.speed, 2) - Math.pow(this.gradient, 2))))

            if (!deltaTime) return;

            if (Math.abs(this.gradient) < this.verticalLim){ //this if/else statement handles exceptions where the bullet is being shot directly up or down, as the gradient is near infinite and cannot be worked with
                this.position.x += (this.deltaX * deltaTime);
                this.position.y = (this.gradient * this.position.x) + interceptY;
            }else{ //if its moving vertically, the only thing that changes is its y position
                this.position.y += (this.speed * this.polarity * deltaTime);
            }

            this.speed += (this.deltaSpeed/1000) * deltaTime;
            this.deltaSpeed += (this.deltaDSpeed/1000) * deltaTime;

        if ((this.position.x < 0 - this.border)||(this.position.x > 600 + this.border)||(this.position.y < 0 - this.border)||(this.position.y > 800 + this.border)){
            this.remove = true;
        }

        //colour management

            this.colourGlide.r += Math.pow(this.colourGlide.deltaColour, 1.7) * (deltaTime/16.7) * Math.abs(this.speed);
            this.colourGlide.g += Math.pow(this.colourGlide.deltaColour, 1.7) * (deltaTime/16.7) * Math.abs(this.speed);
            this.colourGlide.b += Math.pow(this.colourGlide.deltaColour, 1.7)  * (deltaTime/16.7) * Math.abs(this.speed);
            this.fillColour = "rgba("+this.colourGlide.r+","+this.colourGlide.g+","+this.colourGlide.b+","+this.alpha+")";
            this.strokeColour = "rgba("+this.colourGlide.r*2+","+this.colourGlide.g*2+","+this.colourGlide.b*2+","+this.alpha+")";
        }catch(e){
            //bullet already been deleted
        }

    }
}