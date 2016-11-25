var Background = function Background() {
  var img = new Image();
  img.src = '/assets/sky.png';
  this.img = img;
  this.x = 0;
  this.height = 109;
  this.width = 276;
};

Background.prototype.update = function update() {
  this.x -= 2;
  if (this.x <= 0 - this.width) {
    this.x = 0;
  }
};

Background.prototype.render = function render(ctx) {
  var pattern = ctx.createPattern(this.img, 'repeat-x');

  // Fill the background in with sky blue
  ctx.fillStyle = '#4ec0ca';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();

  ctx.translate(this.x, ctx.canvas.height - this.height);
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, ctx.canvas.width, this.height);

  ctx.restore();
};
