var Background = function Background() {
  var img1 = new Image();
  var img2 = new Image();
  var img3 = new Image();
  img1.src = './assets/background/background.png';
  img2.src = './assets/background/treeline.png';
  img3.src = './assets/background/foreground.png';
  this.images = [
    { x: 0, src: img1 },
    { x: 0, src: img2 },
    { x: 0, src: img3 }
  ];
  this.x = 0;
  this.height = 600;
  this.width = 960;
};

Background.prototype.update = function update() {
  var len = this.images.length;
  var width = this.width;
  this.images = this.images.map(function(item, index) {
    item.x -= 1 / len * (index + 1);
    if (item.x <= 0 - width) {
      item.x = 0;
    }

    return item;
  });

};

Background.prototype.render = function render(ctx) {
  // Fill the background in with sky blue
  ctx.fillStyle = '#4ec0ca';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  var _this = this;
  this.images.forEach(function(item) {
    var pattern = ctx.createPattern(item.src, 'repeat-x');

    ctx.save();

    ctx.translate(item.x, 0);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, ctx.canvas.width + _this.width, _this.height);

    ctx.restore();
  });
};
