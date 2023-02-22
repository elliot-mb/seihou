import Text from "./src/text.js"
export default class Menu{

    constructor(GAME_WIDTH, GAME_HEIGHT, version){

        this.viewport = {
            x: GAME_WIDTH,
            y: GAME_HEIGHT
        }
        this.colourOverlay = {
            r: 0,
            g: 0,
            b: 0
        }
        this.version = version;
        this.titleStyle = new Text(500, 300, "300px Source Sans Pro", "white", "center");
        this.subtitleStyle = new Text(500, 400, "50px Source Sans Pro", 'rgb(255, 249, 251)', "center");
        this.bonusStyle = new Text(500, 400, "50px Source Sans Pro", "#fcd1a4", "left");
        this.grazeStyle = new Text(500, 400, "50px Source Sans Pro", "#fcf8a4", "left");
        this.timeStyle = new Text(500, 400, "50px Source Sans Pro", "#b1fca4", "left");
        this.finalScoreStyle = new Text(500, 400, "50px Source Sans Pro", "#a4fcf3", "left");
        this.buttonStyle = new Text(500, 715, "45px Source Sans Pro", "white", "center");
        this.versionStyle = new Text(990, 790, "20px Source Sans Pro", "white", "right");
        this.textScale = 1;
        this.backgroundColour;
        this.numEmitters = 3;
        this.backgroundEmitters = [];
        this.animate = 0;
        this.offset = 0;
        this.deathScreen = false;
        this.slide = 1;
    }

    update(ui, timestamp){

        if (this.animate == -1){
            this.offset -= this.slide;
            ui.scoreVal /= 1.1;
            this.slide *= 1.1;
        }else if (this.animate == 1){
            this.offset -= this.offset/10;
        }
        if ((this.offset <= -this.viewport.x) || (this.offset >= this.viewport.x)){ //reset values in here when game restarts
            ui.gameRunning = true;
            ui.scoreVal = 0;
            ui.graze = 0;
            ui.score = 0;
        }
        if (this.deathScreen){
            this.floatyText(timestamp, (this.viewport.x*0.04)+this.offset*2, 150*this.textScale, 1000, 1500, 5*this.textScale, this.textScale, [this.titleStyle], 100);
            this.floatyText(timestamp+1000, (this.viewport.x*0.04)+this.offset*2, 0.3*this.viewport.y, 450, 750, 4*this.textScale, this.textScale, [this.subtitleStyle]);
            this.floatyText(timestamp+1500, (this.viewport.x*0.04)+this.offset*2, 0.4*this.viewport.y, 450, 750, 4*this.textScale, this.textScale, [this.bonusStyle]);
            this.floatyText(timestamp+2000, (this.viewport.x*0.04)+this.offset*2, 0.5*this.viewport.y, 450, 750, 4*this.textScale, this.textScale, [this.grazeStyle]);
            this.floatyText(timestamp+2500, (this.viewport.x*0.04)+this.offset*2, 0.6*this.viewport.y, 450, 750, 4*this.textScale, this.textScale, [this.timeStyle]);
            this.floatyText(timestamp+3000, (this.viewport.x*0.04)+this.offset*2, 0.7*this.viewport.y, 450, 750, 6*this.textScale, this.textScale, [this.finalScoreStyle]);
            this.floatyText(timestamp+3500, (this.viewport.x*0.04)+this.offset*2, this.viewport.y/1.069, 500, 1, 5*this.textScale, 0, [this.buttonStyle]);
        }else{
            
            this.floatyText(timestamp, (this.viewport.x/2)+this.offset*2, (this.viewport.y/2), 1050, 755, 25*this.textScale, 10*this.textScale, [this.titleStyle, this.subtitleStyle], 100*this.textScale);
            this.floatyText(timestamp+540, (this.viewport.x*0.5)+this.offset*2, this.viewport.y/1.069, 500, 1, 7*this.textScale, 0, [this.buttonStyle]);
        }
        this.rainbow(timestamp);
    }

    rainbow(ts){
        let n = (ts/100)%100;
        this.colourOverlay.r = Math.round((Math.pow(((1.45*n)-40), 2)/5.5)-10*((1.45*n)-40));
        this.colourOverlay.g = Math.round(18*((1.9*n)-10)-(Math.pow(((1.9*n)-10),2)/6)); 
        this.colourOverlay.b = Math.round(10.5*((1.9*n)-65)-(Math.pow(((1.9*n)-65),2)/11.5));
    }

    isResized(canvas, scaler){ //method called from game class when window resized 
        this.viewport = {
            x: canvas.width,
            y: canvas.height
        }
        this.versionStyle.position.x = this.viewport.x-10;
        this.versionStyle.position.y = this.viewport.y-10;

        this.textScale = scaler/1030;

        this.subtitleStyle.font = `${50*this.textScale}px Source Sans Pro`, 
        this.bonusStyle.font = `${50*this.textScale}px Source Sans Pro`, 
        this.grazeStyle.font = `${50*this.textScale}px Source Sans Pro`,
        this.timeStyle.font = `${50*this.textScale}px Source Sans Pro`,
        this.finalScoreStyle.font = `${50*this.textScale}px Source Sans Pro`;
        this.buttonStyle.font = `${45*this.textScale}px Source Sans Pro`;
        this.versionStyle.font = `${30*this.textScale}px Source Sans Pro`;
    }

    draw(ctx, timestamp, ui){
        if (this.deathScreen){
            this.titleStyle.font = `${125*this.textScale}px Source Sans Pro`;
            this.subtitleStyle.alignment = 'left';
            this.subtitleStyle.colour = '#fca4a4'
            this.titleStyle.alignment = 'left';
            this.buttonStyle.alignment = 'left';
            ctx.fillStyle = "rgba(100,100,100,1)"
            ctx.fillRect(0,0,this.viewport.x,this.viewport.y);
            ctx.fillStyle = `rgba(${this.colourOverlay.r},${this.colourOverlay.g},${this.colourOverlay.b}, 0.25)`
            ctx.fillRect(0,this.viewport.y/1.182,this.offset+this.viewport.x,this.viewport.y);
            ctx.fillStyle = "rgba(187, 10, 33, 1)";
            ctx.fillRect(0,0,this.offset+this.viewport.x,this.viewport.y/1.182);
            this.drawDeath(ctx, ui);
        }else{
            this.titleStyle.font = `${300*this.textScale}px Source Sans Pro`;
            this.subtitleStyle.alignment = 'center';
            this.subtitleStyle.colour = 'rgb(255, 249, 251)'
            this.titleStyle.alignment = 'center';
            this.buttonStyle.alignment = 'center';
            ctx.fillStyle = "rgba(100,100,100,1)"
            ctx.fillRect(0,0,this.viewport.x,this.viewport.y);
            ctx.fillStyle = "rgba(187, 10, 33, 1)"
            ctx.fillRect(0,this.viewport.y/1.182,this.offset+this.viewport.x,this.viewport.y);
            ctx.fillStyle = `rgba(${this.colourOverlay.r},${this.colourOverlay.g},${this.colourOverlay.b}, 0.25)`;
            ctx.fillRect(0,0,this.offset+this.viewport.x,this.viewport.y/1.182);
            this.drawTitles(ctx);
        }
    }

    floatyText(timestamp, xOffset, yOffset, xFrequency, yFrequency, xAmplitude, yAmplitude, objectArray, lineSpacing){
        if(objectArray[0]){
            objectArray[0].position.x = xOffset+(Math.sin(timestamp/xFrequency)*xAmplitude);
            objectArray[0].position.y = yOffset+(Math.cos(timestamp/yFrequency)*yAmplitude);
            for (let i = 1; i < objectArray.length; i++){
                objectArray[i].position.x = objectArray[0].position.x;
                objectArray[i].position.y = objectArray[0].position.y+lineSpacing;
            }
        }else{
            //console.log(objectArray);
        }
    }

    drawTitles(ctx){
        //this.titleStyle.draw(ctx, "西方");
        this.subtitleStyle.draw(ctx, `SeiHou - the JavaScript bullet hell`);
        this.buttonStyle.draw(ctx, "Z to start | C for endless | V for scoreboard");
        this.versionStyle.draw(ctx, `game by elliotsemicolon on github, ${this.version}`); //VERSION
    }

    drawDeath(ctx, ui){
        this.titleStyle.draw(ctx, "Game Over");
        this.subtitleStyle.draw(ctx, "Raw Score: "+Math.round(ui.scoreVal/(ui.time/5000)));
        this.grazeStyle.draw(ctx, 'Graze: '+ui.graze);
        this.timeStyle.draw(ctx, 'Time: '+Math.round(ui.time/100));
        this.bonusStyle.draw(ctx, 'Boss Bonus: '+ui.bonus);
        this.finalScoreStyle.draw(ctx, 'Final Score: '+Math.round(ui.scoreDisplay));
        if(ui.endless){
            this.buttonStyle.draw(ctx, "C to try again | Z for campaign");
        }else{
            this.buttonStyle.draw(ctx, "Z to try again | C for endless");
        }

    }

    reset(){
        if (this.offset <= -500){
            this.deathScreen = true;
            this.offset = this.viewport.x;
            this.animate = 1;
            this.slide = 1;
        }
    }

}