var loadImage = function(img) {
  return new Promise(function(resolve) {
    img.onload = function() {
      return resolve(img);
    };
  });
};

var Background = function Background(ctx) {
  var img1 = new Image();
  var img2 = new Image();
  var img3 = new Image();
  img1.src = './assets/background/background.png';
  img2.src = './assets/background/treeline.png';
  img3.src = './assets/background/foreground.png';
  var _this = this;
  this.images = [];
  Promise.map([img1, img2, img3], loadImage)
  .then(function(images) {
    _this.images = images.map(function(img) {
      return {
        pattern: ctx.createPattern(img, 'repeat-x'),
        src: img,
        x: 0,
      };
    });
  });

  this.x = 0;
  this.height = 600;
  this.width = 960;
};

Background.prototype.update = function update(speed) {
  var len = this.images.length;
  var width = this.width;
  this.images = this.images.map(function(item, index) {
    item.x -= speed / len * (index + 1);
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
    ctx.save();

    ctx.translate(item.x, 0);
    ctx.fillStyle = item.pattern;
    ctx.fillRect(0, 0, ctx.canvas.width + _this.width, _this.height);

    ctx.restore();
  });
};
