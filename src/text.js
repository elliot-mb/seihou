export default class Text{//exports the class for use in game.js

    constructor(x, y, font, colour, alignment){
        
        this.position = {
            x: x,
            y: y
        }
        this.font = font;
        this.colour = colour;
        this.alignment = alignment;
    }

    draw(ctx, text){
        
        ctx.font = this.font;
        ctx.fillStyle = this.colour;
        ctx.textAlign = this.alignment;
        ctx.fillText(text, this.position.x, this.position.y);

    }
} 