var Coin = function Coin(dY, dX) {
  var image = new Image();

  image.src = './assets/coin-sprites.png';

  this.loaded = false;
  this.img = image;
  this.width = 20;
  this.height = 20;
  this.frame = 0;
  this.tickCount = 0;
  this.frames = [
    { x: 6, y: 134 },
    { x: 6, y: 166 },
    { x: 6, y: 198 },
    { x: 6, y: 230 },
  ];
  this.dY = dY;
  this.dX = dX;
};

Coin.prototype.render = function render(ctx) {
  ctx.drawImage(
    this.img,
    this.frames[this.frame].x,
    this.frames[this.frame].y,
    this.width,
    this.height,
    this.dX,
    this.dY,
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
  if (this.frame >= this.frames.length) {
    this.frame = 0;
  }
};

Coin.prototype.update = function update(speed) {
   this.dX -= speed;
};

Coin.prototype.getBoundingBox = function getBoundingBox() {
  return {
    top: this.dY,
    right: this.dX + this.width,
    bottom: this.dY + this.height,
    left: this.dX
  };
};
