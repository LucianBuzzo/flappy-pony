var canvas = document.querySelector('canvas');
var context2d = canvas.getContext('2d');
var debugmode = false;

canvas.width = window.innerWidth;

var bigScore = new BigScore();

var states = Object.freeze({
  SplashScreen: 0,
  GameScreen: 1,
  ScoreScreen: 2
});

var currentstate;

var gravity = 0.2;
var velocity = 0;
var position = 180;
var rotation = 0;
var jump = -4.6;
var flyArea = 480;

var score = 0;
var highscore = 0;

var coins = [];

var replayclickable = false;

//  sounds
var volume = 30;
var soundJump = new buzz.sound('assets/sounds/sfx_wing.ogg');
var soundScore = new buzz.sound('assets/sounds/sfx_point.ogg');
var soundHit = new buzz.sound('assets/sounds/sfx_hit.ogg');
var soundDie = new buzz.sound('assets/sounds/sfx_die.ogg');
var soundSwoosh = new buzz.sound('assets/sounds/sfx_swooshing.ogg');
buzz.all().setVolume(volume);

//  loops
var loopGameloop;
var loopCoinLoop;

$(document).ready(function() {
  if (window.location.search === '?debug') {
    debugmode = true;
  }

  //  get the highscore
  var savedscore = getCookie('highscore');
  if (savedscore !== '') {
    highscore = parseInt(savedscore, 10);
  }

  //  start with the splash screen
  showSplash();
});

var getCookie = function getCookie(cname) {
  var name = cname + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

var setCookie = function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toGMTString();
  document.cookie = cname + '=' + cvalue + '; ' + expires;
};

var showSplash = function showSplash() {
  currentstate = states.SplashScreen;

  //  set the defaults (again)
  velocity = 0;
  position = 180;
  rotation = 0;
  score = 0;

  soundSwoosh.stop();
  soundSwoosh.play();

  //  clear out all the coins if there are any
  coins = [];

  //  make everything animated again
  $('.animated').css('animation-play-state', 'running');
  $('.animated').css('-webkit-animation-play-state', 'running');

  //  fade in the splash
  $('#splash').transition({ opacity: 1 }, 2000, 'ease');
};

var startGame = function startGame() {
  currentstate = states.GameScreen;

  // fade out the splash
  $('#splash').stop();
  $('#splash').transition({ opacity: 0 }, 500, 'ease');

  // update the big score
  setBigScore();

  // debug mode?
  if (debugmode) {
    //  show the bounding boxes
    $('.boundingbox').show();
  }

  // start up our loops
  // 60 times a second
  var updaterate = 1000.0 / 60.0;

  clearInterval(loopGameloop);
  clearInterval(loopCoinLoop);

  loopGameloop = setInterval(gameloop, updaterate);
  loopCoinLoop = setInterval(updateCoins, 1400);

  // jump from the start!
  playerJump();
};

var intersectRect = function intersectRect(r1, r2) {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
};

var player = new Player();
var background = new Background();

function gameloop() {
  // Wipe canvas ready for redraw
  context2d.clearRect(0, 0, canvas.width, canvas.height);

  // Check if player has crashed into the ground
  if (currentstate === 2) {
    background.render(context2d);
    player.render(context2d, true);
    coins.forEach(coin => {
      coin.render(context2d);
    });
    return;
  }

  // Check if we're on the splash screen or not;
  if (currentstate === 0) {
    background.update();
    background.render(context2d);

    player.update(0, 180);
    player.render(context2d);

    return;
  }

  // update the player speed/position
  velocity += gravity;
  position += velocity;

  background.update();
  background.render(context2d);

  player.update(velocity, position);
  player.render(context2d);

  coins.forEach(coin => {
    coin.update();
    coin.render(context2d);
  });

  bigScore.render(context2d);


  var origwidth = player.width;
  var origheight = player.height;

  var boxwidth = origwidth - Math.sin(Math.abs(rotation) / 90 * 8);
  var boxheight = origheight;
  var boxleft = (player.width - boxwidth) / 2 + 60;
  var boxtop = (player.height - boxheight) / 2 + player.position;
  var boundingbox;

  // if we're in debug mode, draw the bounding box
  if (debugmode) {
    boundingbox = $('#playerbox');
    boundingbox.css('left', boxleft);
    boundingbox.css('top', boxtop);
    boundingbox.css('height', boxheight);
    boundingbox.css('width', boxwidth);
  }

  // did we hit the ground?
  if (player.position + player.height >= flyArea) {
    playerDead();
    return;
  }

  // have they tried to escape through the ceiling? :o
  if (boxtop <= 20) {
    position = 20;
  }

  // we can't go any further without a pipe
  if (!coins[0]) {
    return;
  }

  // determine the bounding box of the next pipes inner area
  var nextcoin = coins.find(c => c.dX > boxleft - 20);

  var coinWidth = nextcoin.width;
  var coinHeight = nextcoin.height;
  var coinTop = nextcoin.dY;
  var coinLeft = nextcoin.dX;

  if (debugmode) {
    boundingbox = $('#pipebox');
    boundingbox.css('left', coinLeft);
    boundingbox.css('top', coinTop);
    boundingbox.css('height', coinHeight);
    boundingbox.css('width', coinWidth);
  }

  var coinBB = nextcoin.getBoundingBox();
  var playerBB = player.getBoundingBox();

  if (intersectRect(playerBB, coinBB)) {
    console.log('GRABBED A COIN!');

    coins.splice(0, 1);

    // and score a point
    playerScore();

    return;
  }
}

// Handle space bar
$(document).keydown(function(e) {
  // space bar!
  if (e.keyCode === 32) {
    // in ScoreScreen, hitting space should click the 'replay' button. else it's just a regular spacebar hit
    if (currentstate === states.ScoreScreen) {
      $('#replay').click();
    } else {
      screenClick();
    }
  }
});

var screenClick = function screenClick() {
  if (currentstate === states.GameScreen) {
    playerJump();
  } else if (currentstate === states.SplashScreen) {
    startGame();
  }
};

// Handle mouse down OR touch start
if ('ontouchstart' in window) {
  $(document).on('touchstart', screenClick);
} else {
  $(document).on('mousedown', screenClick);
}

var playerJump = function playerJump() {
  velocity = jump;
  // play jump sound
  soundJump.stop();
  soundJump.play();
};

var setBigScore = function setBigScore() {
  bigScore.update(score);
};

var setSmallScore = function setSmallScore() {
  var elemscore = $('#currentscore');
  elemscore.empty();

  var digits = score.toString().split('');
  for (var i = 0; i < digits.length; i++) {
    elemscore.append('<img src="assets/font_small_' + digits[i] + '.png" alt="' + digits[i] + '">');
  }
};

var setHighScore = function setHighScore() {
  var elemscore = $('#highscore');
  elemscore.empty();

  var digits = highscore.toString().split('');
  for (var i = 0; i < digits.length; i++) {
    elemscore.append('<img src="assets/font_small_' + digits[i] + '.png" alt="' + digits[i] + '">');
  }
};

var setMedal = function setMedal() {
  var elemmedal = $('#medal');
  var medal = '';
  elemmedal.empty();

  if (score < 10) {
    // signal that no medal has been won
    return false;
  }

  if (score >= 10) {
    medal = 'bronze';
  }
  if (score >= 20) {
    medal = 'silver';
  }
  if (score >= 30) {
    medal = 'gold';
  }
  if (score >= 40) {
    medal = 'platinum';
  }

  elemmedal.append('<img src="assets/medal_' + medal + '.png" alt="' + medal + '">');

  // signal that a medal has been won
  return true;
};

var playerDead = function playerDead() {
  // stop animating everything!
  $('.animated').css('animation-play-state', 'paused');
  $('.animated').css('-webkit-animation-play-state', 'paused');

  // it's time to change states. as of now we're considered ScoreScreen to disable left click/flying
  currentstate = states.ScoreScreen;

  // destroy our gameloops
  clearInterval(loopCoinLoop);
  loopCoinLoop = null;

  // mobile browsers don't support buzz bindOnce event
  if (isIncompatible.any()) {
    // skip right to showing score
    showScore();
  } else {
    // play the hit sound (then the dead sound) and then show score
    soundHit.play().bindOnce('ended', function() {
      soundDie.play().bindOnce('ended', function() {
        showScore();
      });
    });
  }
};

var showScore = function showScore() {
  // unhide us
  $('#scoreboard').css('display', 'block');

  // remove the big score
  setBigScore(true);

  // have they beaten their high score?
  if (score > highscore) {
    // yeah!
    highscore = score;
    // save it!
    setCookie('highscore', highscore, 999);
  }

  // update the scoreboard
  setSmallScore();
  setHighScore();
  var wonmedal = setMedal();

  // SWOOSH!
  soundSwoosh.stop();
  soundSwoosh.play();

  // show the scoreboard
  // move it down so we can slide it up
  $('#scoreboard').css({ y: '40px', opacity: 0 });
  $('#replay').css({ y: '40px', opacity: 0 });
  $('#scoreboard').transition({ y: '0px', opacity: 1 }, 600, 'ease', function() {
    // When the animation is done, animate in the replay button and SWOOSH!
    soundSwoosh.stop();
    soundSwoosh.play();
    $('#replay').transition({ y: '0px', opacity: 1}, 600, 'ease');

    // also animate in the MEDAL! WOO!
    if (wonmedal) {
      $('#medal').css({ scale: 2, opacity: 0 });
      $('#medal').transition({ opacity: 1, scale: 1 }, 1200, 'ease');
    }
  });

  // make the replay button clickable
  replayclickable = true;
};

$('#replay').click(function() {
  // make sure we can only click once
  if (!replayclickable) {
    return;
  } else {
    replayclickable = false;
  }
  // SWOOSH!
  soundSwoosh.stop();
  soundSwoosh.play();

  // fade out the scoreboard
  $('#scoreboard').transition({ y: '-40px', opacity: 0}, 1000, 'ease', function() {
    // when that's done, display us back to nothing
    $('#scoreboard').css('display', 'none');

    // start the game over!
    showSplash();
  });
});

var playerScore = function playerScore() {
   score += 1;
   // play score sound
   soundScore.stop();
   soundScore.play();
   setBigScore();
};

var updateCoins = function updateCoins() {
  var topheight = Math.floor(Math.random() * (flyArea - 80)) + 20;
  coins = coins.filter(c => c.dX > -20);
  coins.push(new Coin(topheight, canvas.width));
};

var isIncompatible = {
  Android: function() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Safari: function() {
    return navigator.userAgent.match(/OS X.*Safari/) && !navigator.userAgent.match(/Chrome/);
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function() {
    return isIncompatible.Android() || isIncompatible.BlackBerry() || isIncompatible.iOS() || isIncompatible.Opera() || isIncompatible.Safari() || isIncompatible.Windows();
  }
};

var updaterate = 1000.0 / 60.0;
loopGameloop = setInterval(gameloop, updaterate);

