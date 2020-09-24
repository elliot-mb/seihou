export default class Circle{

    constructor(x, y, radius, outlineWidth, colour1, colour2){

        this.position ={
            x: x,
            y: y
        }
        this.radius = radius;
        this.outlineWidth = outlineWidth;
        this.fillColour = colour1;
        this.strokeColour = colour2;

    }

    draw(ctx){

        try{
            ctx.beginPath(); 
            ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
            ctx.fillStyle = this.fillColour;
            ctx.fill(); 
            ctx.lineWidth = this.outlineWidth; 
            ctx.strokeStyle = this.strokeColour; 
            ctx.stroke();
        }catch(e){
            console.log(`bad radius!, ${e}`);
        }


    }

}