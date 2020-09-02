export default class Controller{ //exports the class for use in game.js

    constructor(){ //constructs all the data needed  
        this.dir = { //object holds members 
            left: 0,
            up: 0,
            right: 0,
            down: 0
        }
        this.firing = 0;
        this.selectCampaign = 0;
        this.selectEndless = 0;
        this.pause = 0;
    }

    checkKey(key, polarity){  //takes keycode for switch case, and polarity is either 1 or 0
        switch(key){
            case 37: //keycode for left
                this.dir.left = polarity; //sets the respective direction to either 1 on 0 depending on whether the key is pressed
                break;
            case 38: //keycode for up
                this.dir.up = polarity; //"
                break;
            case 39: //keycode for right
                this.dir.right = polarity; //"
                break;
            case 40: //keycode for down
                this.dir.down = polarity; //"
                break;
            case 65: //keycode for A
                this.dir.left = polarity; //sets the respective direction to either 1 on 0 depending on whether the key is pressed
                break;
            case 87: //keycode for W
                this.dir.up = polarity; //"
                break;
            case 68: //keycode for D
                this.dir.right = polarity; //"
                break;
            case 83: //keycode for S
                this.dir.down = polarity; //"
                break;
            case 88: //keycode for x
                this.firing = polarity;
                break;
            case 90: //z
                this.selectCampaign = polarity;
                break;
            case 67: //c
                this.selectEndless = polarity;
                break;
            case 80: //p
                this.pause = polarity;
                break;
            default:
                return;
        }
    }
}