var shapeOptions = ['rect', 'ellipse', 'equilateral', 'hexa', 'octa'], rotationOptions = [3,4,6,8,12];

var main_canvas , canvasSize = 1, canvasSelector, drawingMode = 'wallpaper';

var bigHex = [
                [280, 200], [280, 280], [200, 280], [200, 200],
                [280, 120], [360, 200], [360, 280], [280, 360],
                [200, 360], [120, 280], [120, 200], [200, 120],
                [280,40], [360, 120],[440, 200], [440, 280],
                [360, 360], [280,440],[200,440], [120, 360],
                [40, 280], [40, 200], [120, 120], [200, 40]
            ];

var curRandomSeed;

//landscape related variables
var currentHour = 0, lastMillis = 0, dayNumber = 0;

//landscape images 
var city, trees, stars = [];

function changeRandomSeed() {
	dayNumber = 0;
	curRandomSeed = curRandomSeed + 1;
}

function setup () {
    curRandomSeed = int(focusedRandom(0, 100));
    //set up the canvas
    main_canvas = createCanvas(960, 500);
    main_canvas.parent('canvas-container');

    canvasSelector = createSelect();
    canvasSelector.option(1);
    canvasSelector.option(2);
    canvasSelector.option(3);
    canvasSelector.value(1);
    canvasSelector.parent('canvas-selector-holder');
    canvasSelector.changed(changeCanvasSize);

	//build the stars array used to draw the stars in the night sky for landscape mode
	var numOfStars = random(100, 300);
	var x = 0, y = 0;
	for(var i=0; i<numOfStars; i ++){
		x = random(5, 955);
		y  = random(5, 135);
		stars[i] = [x, y];
	}
	
	//load images
	//retrieved from: https://openclipart.org/detail/205276/futuristic-island-city
	city = loadImage("city.png"); 
	//retrieved from: https://openclipart.org/detail/3719/iram-alien-tree
	trees = loadImage("trees.png"); 
	
    changeMode();
    //set up some of the global options for p5.js
    colorMode(HSB);
    rectMode(CENTER);
	imageMode(CENTER);
}



function draw () {
    if(drawingMode === 'wallpaper'){
        noFill();
		
        drawPattern();
    }
    else if(drawingMode === 'landscape'){
		//change current hour and day number when required
        if(millis() > (lastMillis + 1000)){
            lastMillis = millis();
            if(currentHour == 23){
                currentHour = 0;
				dayNumber++;
            }
            else {
                currentHour++;
            }
        }
		
        noiseSeed(curRandomSeed);
        strokeWeight(1);
		//scale the drawing based on the canvas size
		if(canvasSize == 2){
			scale(2);
		}
		else if(canvasSize == 3){
			scale(3);
		}
		
        drawLandscape();
    }
}

//change random seed and redraw
function mousePressed() {
    changeRandomSeed();
    clear();
    background(0);
    redraw();
}

//resizes the canvas when the value of the canvas selector is changed 
function changeCanvasSize(){    
	canvasSize = canvasSelector.value();
	if(canvasSize == 2){
		main_canvas = resizeCanvas(1920, 1000);
	}
	else if(canvasSize == 3){
		main_canvas = resizeCanvas(2880, 1500);
	}
	else {
		main_canvas = resizeCanvas(960, 500);
	}
	clear();
	background(0);
	redraw();
}

//changes the mode - triggered by the space bar
function changeMode(){
    if(drawingMode === 'wallpaper'){
        noLoop();
    }
    else if(drawingMode === 'landscape'){
        loop();
    }
    clear();
    background(0);
    redraw();
}

//array of hue ranges used for selecting colours in the wallpaper mode
var hueRanges = [
                    [-20, 20, 0],
                    [21, 60, 40],
                    [61, 100, 80],
                    [101, 140, 120],
                    [141, 180, 160],
                    [181, 220, 200],
                    [221, 260, 240],
                    [261, 300, 280],
                    [301, 340, 320]
                ];

//draws the wallpaper pattern
function drawPattern(){
    var colour = "", xAxis = 0, yAxis = 0;
    hueRanges = shuffleArray(hueRanges);
    background(0);
    //iniitial translation to get the pattern started in the place
    translate(-480, -310);
    //loop through the y axis
    while(yAxis < canvasSize){
        //loop through the x axis
        while(xAxis < canvasSize){
            //this loop is used to draw a hexagon shaped collection of glyphs for every array in the hueRanges array
            for(var hueIterator = 0; hueIterator <= 8; hueIterator++){
                //find the values of fromColour and toColour for this iteration
                var h = focusedRandom(hueRanges[hueIterator][0], hueRanges[hueIterator][1], 10, hueRanges[hueIterator][2]);
                var fromColour = color(h, 100, 100);
                var toPointer = hueIterator + 6;
                if(toPointer > 8){
                    toPointer = toPointer - 9;
                }
                h = focusedRandom(hueRanges[toPointer][0], hueRanges[toPointer][1], 10, hueRanges[toPointer][2]);
                var toColour = color(h, 100, 100);

                var lerpAmount = 0.25;

                //loop through the positions of the bigHex array
                for (var pos = 0; pos < bigHex.length; pos++) {
                    //translate to the co-ordinates where the glyph will be drawn
                    translate(bigHex[pos][0], bigHex[pos][1]);
                    //set the shape, number of rotations and colour
                    shape = random(shapeOptions);
                    numOfRotations = random(rotationOptions);
                    colour = lerpColor(fromColour, toColour, lerpAmount);

                    drawGlyph(colour, numOfRotations, shape);

                    //change the lerpAmount at certain points of the iteration
                    if(pos == 3){
                        lerpAmount = 0.5;
                    }
                    if(pos == 11){
                        lerpAmount = 1;
                    }
                    //reset the translation from the beginnig of the loop
                    translate(-bigHex[pos][0], -bigHex[pos][1]);
                }

                //draw the hexagon outline that groups all the glyphs together
                for (var adjuster = -2; adjuster <= 2; adjuster++) {
                    drawHexOutline(colour, adjuster * 2);
                }

                //translations required to draw the next iteration in the right place
                translate(480, 0);
                if(hueIterator == 2 || hueIterator == 5){
                    translate(-1200, 320);
                    if(hueIterator == 5){
                        translate(-480, 0);
                    }
                }
            }
            //translations required to draw the next iteration in the right place
            translate(0, -640);
            xAxis++;
        }
        //translations required to draw the next iteration in the right place
        if(canvasSize == 2){
            translate(-3120, 960);
        }
        if(canvasSize == 3){
            translate(-4080, 960);
        }
        xAxis = 0;
        yAxis++;
    }
}

//glyphs used to create the wallpaper patterns
function drawGlyph(colour, numOfRotations, shape){
    //this is where the glyph is created
    strokeWeight(0.3);
    for (var i = 0; i < (numOfRotations * 2); i ++) {
        //the shape is draw five times with different levels of opacity to create interesting textures
        for (var j = 0; j <=5; j++) {
            stroke(colour);
            //call the function as detemined by the variable shape
            //rect and ellipse are built in p5.js
            //tri,hexa & octa are defined in this file
            window[shape](0, 20, 20 + (j*3), 20 + (j*3));
        }
        rotate(PI/numOfRotations);
    }
}

//draws the lines that connects the hexagons together
function drawHexOutline(colour, adjuster = 0){
    //draw the hexagon outline that groups all the glyphs together
    beginShape();
    strokeWeight(2);
    colour._array[3] = 1 - (0.2 * abs(adjuster));
    stroke(colour);
    var xPos, yPos;
    for (var pos = 12; pos < bigHex.length; pos++) {
        var xPos = bigHex[pos][0];
        var yPos = bigHex[pos][1];
        if(xPos > 240){
            xPos = xPos + adjuster;
        }
        else {
            xPos = xPos - adjuster;   
        }
        if(yPos > 240){
            yPos = yPos + adjuster;
        }
        else {
            yPos = yPos - adjuster;   
        }
        vertex(xPos, yPos);
    }
    endShape(CLOSE);
}

//used to keep track of the noise values for each landscape tile
var noiseTracker = [], noiseTracker2 = [];

//loads values into the noiseTracker arrays so they can be used for neighbour based comparisons
function createNoiseTrackerArray(){
	var xLimit = 11;
	for(var y=0; y<=15; y++){
		noiseTracker[y] = [];
		noiseTracker2[y] = [];
        for(var x=0; x<=xLimit; x++){
			var noiseValue = noise(x, y);
			if(y == 0 || y == 15){
				noiseValue = 0.5;
			}
			noiseTracker[y][x] = noiseValue;
			noiseTracker2[y][x] = noise(x * y);
		}
		if((y % 2) == 0){
            xLimit = 12;
        }
        else {
            xLimit = 11;
        }
	}
}

//draws the landscape
function drawLandscape() {
    //sky
    var dayFrom = color(216, 100, 62);
    var nightFrom = color(240, 63,  6);
	var dayTo = color(212, 42, 98);
    var nightTo = color(108, 39, 85);
    
    if(currentHour > 6 && currentHour < 18){
		//day time 
        var fromColour = dayFrom;
		var toColour = dayTo;
		//dusk 
		if(currentHour > 12  && currentHour < 18){
			fromColour = lerpColor(dayFrom, nightFrom, (0.1 * (currentHour -12)));
			toColour = lerpColor(dayTo, nightTo, (0.1 * (currentHour -12)));
		}
    }
    else {
		//night time
        var fromColour = nightFrom;
		var toColour = nightTo;
		//dawn
		if(currentHour > 0  && currentHour < 7){
			fromColour = lerpColor(nightFrom, dayFrom, (0.1 * currentHour));
			toColour = lerpColor(nightTo, dayTo, (0.1 * currentHour));
		}
    }
	
	drawSky(0,0,960, 160, fromColour, toColour);
	if(currentHour <= 6 || currentHour >= 18){
		drawStars();
	}
	
	
	createNoiseTrackerArray();
	
    stroke(189, 64, 95);
    translate(40, 120);
    var xLimit = 11;
    for(var y=0; y<=15; y++){
        for(var x=0; x<=xLimit; x++){
            drawLandscapeTile(noiseTracker[y][x], x, y);
            translate(80, 0);
        }
        if((y % 2) == 0){
            xLimit = 12;
        }
        else {
            xLimit = 11;
        }
        translate(-1000, 20);
    }
}

//draws the invidual landscape tile
function drawLandscapeTile(v, x, y){
    var top, sides, nearWater = false;
	var v2 = noiseTracker2[y][x];
    if (v < 0.2) {
        top = color(184, 100, 98);
        sides = color(215, 56, 60);
        translate(0, 10);
    }
    else if (v < 0.75) {
        top = color(255, 74, 43);
		sides = color(215, 56, 60);
    }
    else {
        top = color(120, 100, 70);
		sides = color(276, 66, 62);
        translate(0, -40);
    }


    //regular cube
    if (v < 0.75) {
        fill(top);
        //top
        quad(0, 20, 40, 40, 0, 60, -40, 40);
        fill(sides);
        //left side
        quad(-40, 40, 0, 60, 0, 100, -40, 80);
        //right side
        quad(40, 40, 0, 60, 0, 100, 40, 80);
		
		nearWater = isThereWaterNearby(x, y);
		if(v > 0.19){	
			if(nearWater && v2 > 0.5){
				image(city, 0, 30, 50, 50);
			}
			else if(v2 > 0.7){
				//calculations to give the trees varying sizes and allow to grow each day
				var treeSize = ((v2 * 100) - 50) + (dayNumber * 5);
				if(treeSize > 50){
					treeSize = 50;
				}
				image(trees, 0, 30, treeSize, treeSize);
			}
		}
		
    }
    //mountain
    else {
        fill(317, 97, 80);
		//left side
        quad(0, 20, 0, 60, 0, 100, -40, 80);
		fill(sides);
        //right side
        quad(0, 20, 0, 60, 0, 100, 40, 80);
        fill(top);
    }



    //reset any translations
    if (v < 0.2) {
        translate(0, -10);
    }
    else if (v < 0.75) {
        //do nothing
    }
    else {
        translate(0, 40);
    }
}

//draws the sky
function drawSky(x, y, w, h, c1, c2) {
	noFill();
	for (var i = y; i <= y+h; i++) {
	  var inter = map(i, y, y+h, 0, 1);
	  var c = lerpColor(c1, c2, inter);
	  stroke(c);
	  line(x, i, x+w, i);
	}
} 

//draws the stars when it is nightime
function drawStars(){
	for(var i=0; i<stars.length; i++){
		stroke(0, 0 , 100);
		//dusk
		if(currentHour > 17  && currentHour < 20){
			stroke(0, 0 , 100, (0.1 * (currentHour - 15)));
		}
		//dawn
		if(currentHour > 0  && currentHour < 7){
			stroke(0, 0 , 100, 1 - (0.15 * currentHour));
		}
		ellipse(stars[i][0], stars[i][1] , 2, 2);
	}
}


//checks to see if any of the four tiles connected to the current tile are a water tile
function isThereWaterNearby(x, y){
	var tileA = 1, tileB = 1, tileC = 1, tileD = 1, posXShift = 1, negXShift = 1;
	if((y % 2) != 0){
		posXShift = 0;	
	}
	else {
		negXShift = 0;
	}
	if(y > 0){
		tileA = noiseTracker[y-1][x-negXShift];
		tileB = noiseTracker[y-1][x+posXShift];
	}
	if(y < 15){
		tileC = noiseTracker[y+1][x-negXShift];
		tileD = noiseTracker[y+1][x+posXShift];
	}
	if (tileA  < 0.2 || tileB  < 0.2 || tileC  < 0.2 || tileD  < 0.2) {
		return true;
	}
	return false;
}

/*
 * function to draw an equilateral triangle with a set width
 * based on x, y co-oridinates that are the center of the triangle
 * @param {Number} x        - x-coordinate that is at the center of triangle
 * @param {Number} y      	- y-coordinate that is at the center of triangle
 * @param {Number} width    - radius of the hexagon
 */
function equilateral(x, y, width) {
  var x1 = x - (width/2);
  var y1 = y + (width/2);
  var x2 = x;
  var y2 = y - (width/2);
  var x3 = x + (width/2);
  var y3 = y + (width/2);
  triangle(x1,y1,x2,y2,x3,y3);
}

/*
 * function to draw a hexagon shape
 * adapted from: https://p5js.org/examples/form-regular-polygon.html
 * @param {Number} x        - x-coordinate of the hexagon
 * @param {Number} y      - y-coordinate of the hexagon
 * @param {Number} radius   - radius of the hexagon
 */
function hexa(x, y, radius) {
    radius = radius / 2;
    angleMode(RADIANS);
    var angle = TWO_PI / 6;
    beginShape();
    for (var a = TWO_PI/12; a < TWO_PI + TWO_PI/12; a += angle) {
    var sx = x + cos(a) * radius;
    var sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

/*
 * function to draw a octagon shape
 * adapted from: https://p5js.org/examples/form-regular-polygon.html
 * @param {Number} x        - x-coordinate of the octagon
 * @param {Number} y      - y-coordinate of the octagon
 * @param {Number} radius   - radius of the octagon
 */
function octa(x, y, radius) {
    radius = radius / 2;
    angleMode(RADIANS);
    var angle = TWO_PI / 8;
    beginShape();
    for (var a = TWO_PI/16; a < TWO_PI + TWO_PI/16; a += angle) {
    var sx = x + cos(a) * radius;
    var sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}


/*
 * shuffles an array so that its elements are in a random order
 * thanks to stackoverflow: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param  {Array} array        - array to shuffle
 * @return {Array} array        - array after it has been shuffled
 */
function shuffleArray(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


function keyTyped() {
  if (key == '!') {
    saveBlocksImages();
  }
  else if (key == ' ') {
    if(drawingMode === 'wallpaper'){
        drawingMode = 'landscape';
    }
    else if(drawingMode === 'landscape'){
        drawingMode = 'wallpaper';
    }
	changeMode();
  }
}
