function drawLines(ctx, pts) {
    ctx.moveTo(pts[0], pts[1]);
    for(i=2;i<pts.length-1;i+=2) ctx.lineTo(pts[i], pts[i+1]);
}

function drawCurve(ctx, ptsa, tension, isClosed, numOfSegments, showPoints) {

  showPoints  = showPoints ? showPoints : false;

  ctx.beginPath();

  drawLines(ctx, getCurvePoints(ptsa, tension, isClosed, numOfSegments));

  if (showPoints) {
    ctx.stroke();
    ctx.beginPath();
    for(var i=0;i<ptsa.length-1;i+=2)
    ctx.rect(ptsa[i] - 2, ptsa[i+1] - 2, 4, 4);
  }
}

function getCurvePoints(pts, tension, isClosed, numOfSegments) {

  // use input value if provided, or use a default value
  tension = (typeof tension != 'undefined') ? tension : 0.5;
  isClosed = isClosed ? isClosed : false;
  numOfSegments = numOfSegments ? numOfSegments : 16;

  var _pts = [], res = [],    // clone array
  x, y,           // our x,y coords
  t1x, t2x, t1y, t2y, // tension vectors
  c1, c2, c3, c4,     // cardinal points
  st, t, i;       // steps based on num. of segments

  // clone array so we don't change the original
  //
  _pts = pts.slice(0);

  // The algorithm require a previous and next point to the actual point array.
  // Check if we will draw closed or open curve.
  // If closed, copy end points to beginning and first points to end
  // If open, duplicate first points to befinning, end points to end
  if (isClosed) {
    _pts.unshift(pts[pts.length - 1]);
    _pts.unshift(pts[pts.length - 2]);
    _pts.unshift(pts[pts.length - 1]);
    _pts.unshift(pts[pts.length - 2]);
    _pts.push(pts[0]);
    _pts.push(pts[1]);
  }
  else {
    _pts.unshift(pts[1]);   //copy 1. point and insert at beginning
    _pts.unshift(pts[0]);
    _pts.push(pts[pts.length - 2]); //copy last point and append
    _pts.push(pts[pts.length - 1]);
  }

  // ok, lets start..

  // 1. loop goes through point array
  // 2. loop goes through each segment between the 2 pts + 1e point before and after
  for (i=2; i < (_pts.length - 4); i+=2) {
    for (t=0; t <= numOfSegments; t++) {

      // calc tension vectors
      t1x = (_pts[i+2] - _pts[i-2]) * tension;
      t2x = (_pts[i+4] - _pts[i]) * tension;

      t1y = (_pts[i+3] - _pts[i-1]) * tension;
      t2y = (_pts[i+5] - _pts[i+1]) * tension;

      // calc step
      st = t / numOfSegments;

      // calc cardinals
      c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1;
      c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
      c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st;
      c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);

      // calc x and y cords with common control vectors
      x = c1 * _pts[i]    + c2 * _pts[i+2] + c3 * t1x + c4 * t2x;
      y = c1 * _pts[i+1]  + c2 * _pts[i+3] + c3 * t1y + c4 * t2y;

      //store points in array
      res.push(x);
      res.push(y);

    }
  }

  return res;
}

var Player = function Player() {
  var playerImage = new Image();

  playerImage.src = './assets/pony-sprites.png';

  playerImage.onload = function() {
  };

  this.loaded = false;
  this.img = playerImage;
  this.width = 44;
  this.height = 37;
  this.frame = 0;
  this.tickCount = 0;
  this.position = 180;
  this.frames = [
    { x: 194, y: 152 },
    { x: 242, y: 152 },
    { x: 287, y: 152 },
    { x: 335, y: 152 },
    { x: 385, y: 152 },
  ];
  this.trail = [];
};

Player.prototype.render = function render(ctx, freeze) {
  if (!freeze) {
    this.trail.unshift({
      y: this.position,
      rotation: this.rotation
    });
  }

  this.drawTrail(ctx);

  // save the unrotated context of the canvas so we can restore it later
  // the alternative is to untranslate & unrotate after drawing
  ctx.save();

  // move to the center of the image
  ctx.translate(60 + this.width / 2, this.position + this.height / 2);

  // rotate the canvas to the specified degrees
  ctx.rotate(this.rotation * Math.PI / 180);

  ctx.drawImage(
    this.img,
    this.frames[this.frame].x,
    this.frames[this.frame].y,
    this.width,
    this.height,
    0 - this.width / 2,
    0 - this.height / 2,
    this.width,
    this.height
  );

  ctx.restore();

  if (freeze) {
    return;
  }

  this.tickCount++;

  if (this.tickCount < 7) {
    return;
  }

  this.tickCount = 0;
  this.frame++;
  if (this.frame > 4) {
    this.frame = 0;
  }
};

Player.prototype.drawTrail = function(ctx) {
  var _this = this;
  var lineWidth = 3;
  var points = this.trail.reduce((carry, item, index) => {
    return index % 20 === 0 ? carry : carry.concat([80 - index, item.y + _this.height / 2]);
  }, []);

  console.log(points);

  var grad = ctx.createLinearGradient(0, 0, 400, 400);
  grad.addColorStop(0, "red");
  grad.addColorStop(1, "green");

  ctx.strokeStyle = grad;
  ctx.lineWidth = 50;

  drawCurve(ctx, points);
  ctx.stroke();
  /*
  this.trail.forEach(function(item, index) {
    ctx.save();
    // move to the center of the image
    ctx.translate((60 - index) + _this.width / 2, item.y + _this.height / 2);

    // rotate the canvas to the specified degrees
    ctx.rotate(item.rotation * Math.PI / 180);

    ctx.globalAlpha = 1 - index / 100;

    // purple
    ctx.fillStyle = '#59198c';
    ctx.fillRect(0, -15, lineWidth, 5);
    // blue
    ctx.fillStyle = '#3685f6';
    ctx.fillRect(0, -10, lineWidth, 5);
    // green
    ctx.fillStyle = '#7ff550';
    ctx.fillRect(0, -5, lineWidth, 5);
    // yellow
    ctx.fillStyle = '#fdffa8';
    ctx.fillRect(0, 0, lineWidth, 5);
    // orange
    ctx.fillStyle = '#ea682d';
    ctx.fillRect(0, 5, lineWidth, 5);
    // red
    ctx.fillStyle = '#eb4338';
    ctx.fillRect(0, 10, lineWidth, 5);

    ctx.restore();
  });
  */
  ctx.globalAlpha = 1;

  this.trail.slice(0, 80);
};

Player.prototype.update = function update(velocity, position) {
   this.rotation = Math.min(velocity / 10 * 90, 90);
   this.position = position;
};

Player.prototype.getBoundingBox = function getBoundingBox() {
  return {
    top: this.position,
    right: this.width + 60,
    bottom: this.position + this.height,
    left: 60
  };
};
