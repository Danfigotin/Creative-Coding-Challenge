// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/153-interactive-sketchrnn.html
// https://youtu.be/ZCXkvwLxBrA
// https://editor.p5js.org/codingtrain/sketches/hcumr-aua

let sketchRNN;
let currentStroke;
let x, y;
let nextPen = 'down';
let seedPath = [];
let seedPoints = [];
let personDrawing = false;

function preload() {
  sketchRNN = ml5.sketchRNN('cat');
}

function startDrawing() {
  personDrawing = true;
  x = mouseX;
  y = mouseY;

}

function sketchRNNStart() {
  personDrawing = false;

  // Perform RDP Line Simplication
  const rdpPoints = [];
  const total = seedPoints.length;
  const start = seedPoints[0];
  const end = seedPoints[total - 1];
  rdpPoints.push(start);
  rdp(0, total - 1, seedPoints, rdpPoints);
  rdpPoints.push(end);
  
  // Drawing simplified path
  background(255);
  stroke(0);
  strokeWeight(4);
  beginShape();
  noFill();
  for (let v of rdpPoints) {
    vertex(v.x, v.y); 
  }
  endShape();
  
  x = rdpPoints[rdpPoints.length-1].x;
  y = rdpPoints[rdpPoints.length-1].y;
  
  
  seedPath = [];
  // Converting to SketchRNN states
  for (let i = 1; i < rdpPoints.length; i++) {
    let strokePath = {
      dx: rdpPoints[i].x - rdpPoints[i-1].x,
      dy: rdpPoints[i].y - rdpPoints[i-1].y,
      pen: 'down'
    }
    //line(x, y, x + strokePath.dx, y + strokePath.dy);
    //x += strokePath.dx;
    //y += strokePath.dy;
    seedPath.push(strokePath);
  }
  
  // ^^ seedPath == start generating after collecting all points from user. It's what you are starting the machine model with. It's an array. the seed path tels the sketch...
  // ...model where you left off (what was you rlast point) so the sktch RNN know where to start
  
  
  sketchRNN.generate(seedPath, gotStrokePath);
}

function setup() {
  let canvas = createCanvas(400, 400);
  canvas.mousePressed(startDrawing);
  canvas.mouseReleased(sketchRNNStart);
  // x = width / 2;
  // y = height / 2;
  background(255);
  //sketchRNN.generate(gotStrokePath);
  console.log('model loaded');
}


function gotStrokePath(error, strokePath) {
  //console.error(error);
  //console.log(strokePath);
  currentStroke = strokePath;
}

function draw() {
  stroke(0);
  strokeWeight(4);


  if (personDrawing) {
    // let strokePath = {
    //   dx: mouseX - pmouseX,
    //   dy: mouseY - pmouseY,
    //   pen: 'down'
    // }
    // line(x, y, x + strokePath.dx, y + strokePath.dy);
    // x += strokePath.dx;
    // y += strokePath.dy;
    // seedPath.push(strokePath);

    line(mouseX, mouseY, pmouseX, pmouseY); //Creating a line (pmouse = previous mouse position so it saves the starting point of the line)
    seedPoints.push(createVector(mouseX, mouseY)); //ADDING TO SEEDPOINTS! STARTING FROM WHERE THE USER LEFT OFF, NEW POINTS ARE ADDED TO THE ARRAY.///
                                                   //THESE POINTS ARE FROM TAKEN FROM THE SKETCH RNN MODEL (which is vector) -------- Go to line 55
  }

  if (currentStroke) {

    if (nextPen == 'end') {
      sketchRNN.reset(); //RESET THE MODEL
      sketchRNNStart(); //TO DRAW A NEW VERSION
      currentStroke = null; //TIME FOR NEW STROKE
      nextPen = 'down'; //DOWN MEANS NEXT PEN START DRAWING (RNN = next pen)
      return;
//IF YOU WANT TO DRAW IT ONCE---------------------DELETE EVERYTHING HERE ^^ AND ADD noLoop(); return;
    }

    if (nextPen == 'down') { //IF RNN IS DRAWING
      line(x, y, x + currentStroke.dx, y + currentStroke.dy); //ADD ON TO THE WHERE THE CURRENT STROKE (WHICH IS NOW THE PREVIOUS) ONE ENDED
    }
    x += currentStroke.dx; //ADDING TO THE X POSITION -- dx = a change in x (vector)
    y += currentStroke.dy; // ADDING TO THE Y POSITION -- dy = a change in y (vector)
    nextPen = currentStroke.pen; //MAKE THE RNN THE CURRENT STROKE
    currentStroke = null; 
    sketchRNN.generate(gotStrokePath); //CALLING FUNCTION IN LINE 85 - which essentially gives the next path, the next vector until the drawing is complete

  }


}
