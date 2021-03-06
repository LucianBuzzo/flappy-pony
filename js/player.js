var Player = function Player(pony) {
  if (!pony) {
    pony = 'RD';
  }
  var playerImage = new Image();

  playerImage.src = './assets/pony-sprites.png';

  playerImage.onload = function() {
  };

  var RDframes = [
    { x: 194, y: 152 },
    { x: 242, y: 152 },
    { x: 287, y: 152 },
    { x: 335, y: 152 },
    { x: 385, y: 152 },
  ];

  var DDframes = [
    { x: 530, y: 293 },
    { x: 578, y: 293 },
    { x: 623, y: 293 },
    { x: 671, y: 293 },
    { x: 721, y: 293 },
  ];

  this.loaded = false;
  this.img = playerImage;
  this.width = 44;
  this.height = pony === 'RD' ? 37 : 45;
  this.frame = 0;
  this.tickCount = 0;
  this.position = 180;
  this.frames = pony === 'RD' ? RDframes : DDframes;
};

Player.prototype.render = function render(ctx, freeze) {

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
