//fireRate, range, deltaAngle, numberShotPairs, offset, linear, square, cube, radius, fillColour, border
/* 
8364026514990541 
*/ 
const input = new InputLoop();
const nodeName = await input.question('Enter the label for the node:');


let seed = "8364026514990541";

let threeDigits = /\w{3}/g;
let radius = seed.match(/([12]\w|\w)/g)[1];

console.log(`attack seed ${seed}`);
let fireRate = parseInt(seed.match(/([0-2][0-9]|\w)/g)[0]);

if(radius < 10){let range = seed.match(/([0-1]?[0-7][0-9]|\w{2})/g)[0];}else{let range = 180;}

let deltaAngle = seed.match(/\w{2}/g)[3]/100;
let numberShotPairs = Math.round(seed.match(/[0-2]?[0-9]/g)[0]/(1+(this.currentEmitter.fireRate/10)));
let offset = 0;
let linear = (seed.match(threeDigits)[0]/100) * Math.pow(-1, seed.match(/\w/g)[seed.match(/[0-8]/g)[0]]); //negative first three seed digits to the power of the first digit'th digit

let polarity = Math.pow(-1, seed.match(/\w/g)[seed.match(/[0-8]/g)[1]]);
let square = (seed.match(threeDigits)[1]/10000) * polarity;
let cube = (seed.match(threeDigits)[2]/10000000) * -polarity;

//this.currentEmitter.radius = seed.match(/[0-2]\w/g)[1];
let fillColour = `rgba(${(seed.match(/[0-2]?\w{2}/g)[0])%255},${(seed.match(/[0-2]?\w{2}/g)[1])%255},${(seed.match(/[0-2]?\w{2}/g)[2])%255},1)`;
let border = 0;

console.log(fireRate, range, deltaAngle, numberShotPairs, offset, linear, square, cube, radius, fillColour, border);