var Player = function Player() {
  var playerImage = new Image();

  playerImage.src = '/assets/pony-sprites.png';

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
};

Player.prototype.render = function render(ctx) {
  // save the unrotated context of the canvas so we can restore it later
  // the alternative is to untranslate & unrotate after drawing
  ctx.save();

  // move to the center of the canvas
  // ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

  ctx.translate(60 + this.width / 2, this.position + this.height / 2);

  // rotate the canvas to the specified degrees
  ctx.rotate(this.rotation * Math.PI / 180);

  ctx.drawImage(
    this.img,
    this.frames[this.frame].x,
    this.frames[this.frame].y,
    this.width,
    this.height,
    0,
    0,
    this.width,
    this.height
  );

  ctx.restore();

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

Player.prototype.update = function render(velocity, position) {
   this.rotation = Math.min(velocity / 10 * 90, 90);
   this.position = position;
};
