import Text from "/src/text.js"
export default class Menu{

    constructor(GAME_WIDTH, GAME_HEIGHT){

        this.gameDim = {
            width: GAME_WIDTH,
            height: GAME_HEIGHT
        }
        this.titleStyle = new Text(500, 300, "300px Open Sans", "white", "center");
        this.subtitle = new Text(500, 400, "50px Open Sans", "white", "center");
        this.buttonStyle = new Text(500, 715, "50px Open Sans", "white", "center");
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
        if ((this.offset <= -1000) || (this.offset >= 1000)){
            ui.gameRunning = true;
            ui.scoreVal = 0;
        }
        this.floatyText(timestamp);
    }

    draw(ctx, timestamp, ui){
        if (this.deathScreen){
            this.titleStyle.font = "150px Open Sans";
            ctx.fillStyle = "rgba(25,0,0,1)"
            ctx.fillRect(0,0,this.gameDim.width,this.gameDim.height);
            ctx.fillStyle = "rgba(155, 50, 40, 1)"
            ctx.fillRect(this.offset,0,this.gameDim.width,this.gameDim.height-200);
            ctx.fillStyle = "rgba("+(255*Math.abs(Math.sin((timestamp/5000)+timestamp/500)))/2+","+(255*Math.abs(Math.cos((timestamp/5000)+60)))/5+","+(255*Math.abs(Math.sin((timestamp/5000)+120)))/5+", 0.5)";
            ctx.fillRect(this.offset,this.gameDim.height-200,this.gameDim.width,this.gameDim.height);
            this.drawDeath(ctx, ui);
        }else{
            this.titleStyle.font = "300px Open Sans";
            ctx.fillStyle = "rgba(25,0,0,1)"
            ctx.fillRect(0,0,this.gameDim.width,this.gameDim.height);
            ctx.fillStyle = "rgba(155, 50, 40, 1)"
            ctx.fillRect(0,this.gameDim.height-200,this.offset+this.gameDim.width,this.gameDim.height);
            ctx.fillStyle = "rgba("+255*(1+(Math.sin((timestamp/1000)+60)/2))+","+255*(1+(Math.sin((timestamp/500)+120)/2))+","+255*(1+(Math.sin((timestamp/250)+240)/2))+", 0.25)";
            ctx.fillRect(0,0,this.offset+this.gameDim.width,this.gameDim.height-200);
            this.drawTitles(ctx);
        }
    }

    floatyText(timestamp){
        if (this.deathScreen){
            this.titleStyle.position.x = (this.offset*2)+500+(Math.sin(timestamp/1000)*2);
            this.titleStyle.position.y = 300+(Math.cos(timestamp/1500)*2);
            this.subtitle.position.x = this.titleStyle.position.x;
            this.subtitle.position.y = 100+this.titleStyle.position.y;
            this.buttonStyle.position.x = (this.offset*2)+500+(Math.cos((timestamp/1000)+90)*2);
        }else{
            this.titleStyle.position.x = (this.offset*2)+500+(Math.sin(timestamp/500)*20);
            this.titleStyle.position.y = 360+(Math.cos(timestamp/700)*20);
            this.subtitle.position.x = this.titleStyle.position.x;
            this.subtitle.position.y = 100+this.titleStyle.position.y;
            this.buttonStyle.position.x = (this.offset*2)+500+(Math.cos((timestamp/500)+90)*10);
        }
    }

    drawTitles(ctx){
        this.titleStyle.draw(ctx, "西方");
        this.subtitle.draw(ctx, "SeiHou - JavaScript TouHou");
        this.buttonStyle.draw(ctx, "‘z’ to start");
        this.versionStyle.draw(ctx, "v0.2.3"); //VERSION
    }

    drawDeath(ctx, ui){
        this.titleStyle.draw(ctx, "Game Over");
        this.subtitle.draw(ctx, "Score: "+Math.round(ui.scoreVal));
        this.buttonStyle.draw(ctx, "‘z’ to try again");
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