const BigScore = function bigscore() {
  this.digits = ['0'];
  this.numberImages = [];
};

BigScore.prototype.render = function render(ctx) {
  this.numberImages.forEach((image, index) => {
    ctx.drawImage(
      image,
      150 + 26 * index,
      20
    );
  });
};

BigScore.prototype.update = function render(score) {
  this.digits = score.toString().split('');
  this.numberImages = [];

  this.digits.forEach((digit) => {
    var image = new Image();
    image.src = '/assets/font_big_' + digit + '.png';
    this.numberImages.push(image);
  });
};
