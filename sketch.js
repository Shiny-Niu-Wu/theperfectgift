/*
Based on code from p5.js
beginContour() reference
createGraphics() reference

and

Posenet code from Daniel Shiffman Hour of Code
https://www.youtube.com/watch?v=EA3-k9mnLHs&feature=youtu.be
createGraphics https://editor.p5js.org/codingtrain/sketches/7RN7GFD-Y
*/

let extraCanvas;

let ads = {
  fake: [],
  real: [],
  comment: []
};
let index;
let textAd;

let video;

let poseNet;

let noseX = 0;
let noseY = 0;
let eyeLeftX = 0;
let eyeLeftY = 0;
let faceD;

let closeButton;
let toBeClosed = false;

function preload() {
  closeButton = loadImage('closeButton.png');

  for (let i = 0; i < 3; i++) {
    ads.fake[i] = loadImage('fake/fake_' + 1 + '.png');
    ads.real[i] = loadImage('real/real_' + 1 + '.png');
    ads.comment[i] = loadImage('comment/comment_' + 1 + '.png');
  }

  textAd = loadImage('text_ad-1.png');
}

function setup() {
  createCanvas(ads.real[0].width, ads.real[0].height);

  noStroke();

  console.log(ads.real[0].width, ads.real[0].height);

  //capture webcam
  //should be able to choose other cameras when connected to computer
  video = createCapture(VIDEO);
  video.size(ads.real[0].width, ads.real[0].height);

  //to avoid double image
  video.hide();

  //loading ml5
  poseNet = ml5.poseNet(video, modelReady);

  // Listen to new 'pose' events
  poseNet.on('pose', getPoses);

  //IMPORTANT: the canvas size has to be identical to the image size
  extraCanvas = createGraphics(ads.real[0].width, ads.real[0].height);
  extraCanvas.clear();

  //setting the first image randomly
  index = Math.floor(Math.random() * ads.real.length);

  extraCanvas.pixelDensity(1);
  pixelDensity(1);
}

function getPoses(poses) {
  //console.log(poses);

  //poses is an array

  if (poses.length > 0) {
    let nX = poses[0].pose.keypoints[0].position.x;
    let nY = poses[0].pose.keypoints[0].position.y;
    let eLX = poses[0].pose.keypoints[1].position.x;
    let eLY = poses[0].pose.keypoints[1].position.y;

    //to have a smoother transition, like the line object in maxmsp
    noseX = lerp(noseX, nX, 0.5);
    noseY = lerp(noseY, nY, 0.5);
    eyeLeftX = lerp(noseX, eLX, 0.5);
    eyeLeftY = lerp(noseY, eLY, 0.5);
  }
}

//define modelReady and call that function
function modelReady() {
  console.log('model ready');
}

function draw() {
  faceD = dist(noseX, noseY, eyeLeftX, eyeLeftY);
  //console.log(faceD);

  image(ads.fake[index], 0, 0);
  let textReveal = map(faceD, 25, faceD + 20, 0, 255);
  push();
  tint(255, textReveal);
  image(ads.comment[index], 0, 0);
  pop();

  //click on the X button to change the ad
  push();
  if (mouseX > ads.real[0].width - 50 && mouseY < 50) {
    toBeClosed = true;
    tint(255, 255);
  } else {
    tint(255, 150);
    toBeClosed = false;
  }
  image(closeButton, ads.real[0].width - 50, 0, 50, 50);
  pop();

  //revealing the real ad
  push();
  trackViewerShape();
  pop();
}

function mousePressed() {
  if (toBeClosed) {
    index = Math.floor(Math.random() * ads.real.length);
  }
}

function trackViewerShape() {

  //this will prevent drawing the shape continuously
  extraCanvas.clear();

  let size = int(faceD * 1.5);
  //console.log(size);

  //extraCanvas was an empty graphics
  extraCanvas.loadPixels();
  //load pixels of current advertisement image
  ads.real[index].loadPixels();
  // console.log(noseY);


  //distance will always be a circle of countless points at an identiical distance
  for (let y = int(noseY) - size; y < int(noseY) + size; y++) {
    for (let x = int(noseX) - size; x < int(noseX) + size; x++) {
      let pIndex = (y * ads.real[index].width + x) * 4;
      let d = dist(noseX, noseY, x, y);
      if (d < size) {
        extraCanvas.pixels[pIndex] = ads.real[index].pixels[pIndex];
        extraCanvas.pixels[pIndex + 1] = ads.real[index].pixels[pIndex + 1];
        extraCanvas.pixels[pIndex + 2] = ads.real[index].pixels[pIndex + 2];
        extraCanvas.pixels[pIndex + 3] = ads.real[index].pixels[pIndex + 3];
      }
    }
  }

  ads.real[index].updatePixels();
  extraCanvas.updatePixels();

  push();
  translate(ads.real[0].width, 0);
  scale(-1, 1);
  image(extraCanvas, 0, 0);
  pop();
}
