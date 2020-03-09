import BossHandler from "/src/bosshandler.js"
import Emitter from "/src/emitter.js"
import Circle from "/src/circle.js"
export default class RandomHandler{

    constructor(){

        this.currentEmitter = new Emitter();
        this.position={
            x: 0,
            y: 0
        };
        this.circle = new Circle();

    }

    update(){

        this.circle.position.x = this.position.x;
        this.circle.position.y = this.position.y;
        this.currentEmitter.update();

    }

    draw(ctx){

        this.currentEmitter.draw(ctx);
        this.currentEmitter.draw(ctx);

    }

    randomizeEmitter(){

        this.currentEmitter.fireRate = (Math.random()+1)*10;
        this.currentEmitter.range = (Math.random()+1)*180;
        this.currentEmitter.deltaAngle = Math.random()-0.5;
        this.currentEmitter.numberShotPairs = (Math.random()+1)*16;
        this.currentEmitter.speed = (Math.random()+0.25);
        this.currentEmitter.deltaSpeed = (Math.random()-0.5)*2;
        this.currentEmitter.deltaDSpeed = (Math.random()-0.5)*2;
        this.currentEmitter.radius = (Math.random()+1)*20;
        this.currentEmitter.fillColour = "rgba("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+")";
        this.currentEmitter.border = (Math.random()+1)*20;

    }

}