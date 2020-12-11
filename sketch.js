
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

    line(mouseX, mouseY, pmouseX, pmouseY);
    seedPoints.push(createVector(mouseX, mouseY));
  }

  if (currentStroke) {

    if (nextPen == 'end') {
      sketchRNN.reset();
      sketchRNNStart();
      currentStroke = null;
      nextPen = 'down';
      return;
    }

    if (nextPen == 'down') {
      line(x, y, x + currentStroke.dx, y + currentStroke.dy);
    }
    x += currentStroke.dx;
    y += currentStroke.dy;
    nextPen = currentStroke.pen;
    currentStroke = null;
    sketchRNN.generate(gotStrokePath);

  }


}
