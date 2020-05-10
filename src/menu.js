import Text from "/src/text.js"
export default class Menu{

    constructor(GAME_WIDTH, GAME_HEIGHT){

        this.gameDim = {
            width: GAME_WIDTH,
            height: GAME_HEIGHT
        }
        this.titleStyle = new Text(500, 300, "300px Open Sans", "white", "center");
        this.subtitleStyle = new Text(500, 400, "50px Open Sans", '#fca4a4', "center");
        this.bonusStyle = new Text(500, 400, "50px Open Sans", "#fcd1a4", "left");
        this.grazeStyle = new Text(500, 400, "50px Open Sans", "#fcf8a4", "left");
        this.timeStyle = new Text(500, 400, "50px Open Sans", "#b1fca4", "left");
        this.finalScoreStyle = new Text(500, 400, "50px Open Sans", "#a4fcf3", "left");
        this.buttonStyle = new Text(500, 715, "45px Open Sans", "white", "center");
        this.versionStyle = new Text(990, 790, "20px Open Sans", "white", "right");
        
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
        if ((this.offset <= -1000) || (this.offset >= 1000)){ //reset values in here when game restarts
            ui.gameRunning = true;
            ui.scoreVal = 0;
            ui.graze = 0;
            ui.score = 0;
        }
        if (this.deathScreen){
            this.floatyText(timestamp, 500+this.offset*2, 150, 1000, 1500, 2, 2, [this.titleStyle], 100);
            this.floatyText(timestamp+1000, 200+this.offset*2, 250, 450, 750, 4, 1, [this.subtitleStyle]);
            this.floatyText(timestamp+1500, 200+this.offset*2, 325, 450, 750, 4, 1, [this.bonusStyle]);
            this.floatyText(timestamp+2000, 200+this.offset*2, 400, 450, 750, 4, 1, [this.grazeStyle]);
            this.floatyText(timestamp+2500, 200+this.offset*2, 475, 450, 750, 4, 1, [this.timeStyle]);
            this.floatyText(timestamp+3000, 200+this.offset*2, 550, 450, 750, 6, 1, [this.finalScoreStyle]);
            this.floatyText(timestamp+3500, 500+this.offset*2, 715, 500, 1, 2, 0, [this.buttonStyle]);
        }else{
            this.floatyText(timestamp, 500+this.offset*2, 360, 1000, 700, 20, 20, [this.titleStyle, this.subtitleStyle], 100);
            this.floatyText(timestamp+4500, 500+this.offset*2, 715, 500, 1, 10, 0, [this.buttonStyle]);
        }
    }

    draw(ctx, timestamp, ui){
        if (this.deathScreen){
            this.titleStyle.font = "125px Open Sans";
            this.subtitleStyle.alignment = 'left';
            ctx.fillStyle = "rgba(25,0,0,1)"
            ctx.fillRect(0,0,this.gameDim.width,this.gameDim.height);
            ctx.fillStyle = "rgba(155, 50, 40, 1)"
            ctx.fillRect(this.offset,0,this.gameDim.width,this.gameDim.height-200);
            ctx.fillStyle = "rgba("+(255*Math.abs(Math.sin((timestamp/5000)+timestamp/500)))/2+","+(255*Math.abs(Math.cos((timestamp/5000)+60)))/5+","+(255*Math.abs(Math.sin((timestamp/5000)+120)))/5+", 0.5)";
            ctx.fillRect(this.offset,this.gameDim.height-200,this.gameDim.width,this.gameDim.height);
            this.drawDeath(ctx, ui);
        }else{
            this.titleStyle.font = "300px Open Sans";
            this.subtitleStyle.alignment = 'center';
            ctx.fillStyle = "rgba(25,0,0,1)"
            ctx.fillRect(0,0,this.gameDim.width,this.gameDim.height);
            ctx.fillStyle = "rgba(155, 50, 40, 1)"
            ctx.fillRect(0,this.gameDim.height-200,this.offset+this.gameDim.width,this.gameDim.height);
            ctx.fillStyle = "rgba("+255*(1+(Math.sin((timestamp/1000)+60)/2))+","+255*(1+(Math.sin((timestamp/500)+120)/2))+","+255*(1+(Math.sin((timestamp/250)+240)/2))+", 0.25)";
            ctx.fillRect(0,0,this.offset+this.gameDim.width,this.gameDim.height-200);
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
        this.titleStyle.draw(ctx, "西方");
        this.subtitleStyle.draw(ctx, "SeiHou - the JavaScript bullet hell");
        this.buttonStyle.draw(ctx, "Z to start | C for endless | V for scoreboard");
        this.versionStyle.draw(ctx, "v0.3.5"); //VERSION
    }

    drawDeath(ctx, ui){
        this.titleStyle.draw(ctx, "Game Over");
        this.subtitleStyle.draw(ctx, "Score "+Math.round(ui.scoreVal/(ui.time/5000)));
        this.grazeStyle.draw(ctx, 'Graze '+ui.graze);
        this.timeStyle.draw(ctx, 'Time '+Math.round(ui.time/100));
        this.bonusStyle.draw(ctx, 'Boss Bonus '+ui.bonus);
        this.finalScoreStyle.draw(ctx, 'Final score '+Math.round(ui.scoreDisplay));
        if(ui.endless){
            this.buttonStyle.draw(ctx, "C to try again | Z for campaign");
        }else{
            this.buttonStyle.draw(ctx, "Z to try again | C for endless");
        }

    }

    reset(){
        if (this.offset <= -500){
            this.deathScreen = true;
            this.offset = 999;
            this.animate = 1;
            this.slide = 1;
        }
    }

}