export default class Image{ 
    constructor(imageData){
        this.image = imageData;
        this.sx = 0; //picks the top left corner of the image 
        this.sy = 0; //
        this.sWidth = imageData.width;  //drags the crop box to the bottom right of the image 
        this.sHeight = imageData.height;//(shows the whole image)
        
    } 

    update(controller){ //method called only by player image
        if (controller.dir.left == 1){
            //set player image to sliding left 
            this.sx = 667;
            this.sy = 0;
        }else if(controller.dir.right == 1){
            //set player image sliding right 
            this.sx = 667*2;
            this.sy = 0;
        }else{
            this.sx = this.sy = 0;
            this.sWidth = this.sHeight = 667; //spritesheet for the player (images[4]) is made from 667 pixel boxes
        }
    }

}