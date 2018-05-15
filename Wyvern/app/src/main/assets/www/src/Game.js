var Game = 
{
	create: function() {
		
		//Setup gameplay numbers here
		shootRateMultiplier = 1;
		baseShotSpeed = -200;
		shotSpeedMultiplier = 1;
		shotSpread = 1;

		iFrames = 0.5;
		lives =5;
		score = 0;

		spawnTime = 0;
		bulletTime = 0;
		firingTime = 0;
		hurtTime = 0;
		//gameplay-related numbers end



		//background
		game.add.sprite(0, 0, 'screen-bg');
		//makes bullets
	 	bullets = game.add.group();
	    bullets.enableBody = true;
	    bullets.physicsBodyType = Phaser.Physics.ARCADE;

	    for (var i = 0; i < 1000; i++)
	    { 
	        var b = bullets.create(0, 0, 'bullet');
	        b.name = 'bullet' + i;
	        b.anchor.setTo(0.5,0.5);
	        b.exists = false;
	        b.visible = false;
	        b.checkWorldBounds = true;
	        b.events.onOutOfBounds.add(resetFunct, this);
	    }

		//player
		sprite = game.add.sprite(game.world.centerX, game.world.centerY*1.8, 'sprite');
		sprite.anchor.setTo(0.5, 0.5);
		sprite.inputEnabled = true;
		sprite.input.enableDrag(true);
		game.physics.enable(sprite, Phaser.Physics.ARCADE);
		sprite.body.collideWorldBounds = true;

		//These coord offsets are probably all wrong once we get real sprites
		//UI
		scoreString = 'Score: ';
		scoreText = game.add.text(5,5, scoreString + score, {font: '16px Arial', fill:'#fff'});
		//lives
	    lifeCounter = game.add.text(sprite.width , game.world.height - sprite.height+11, 'X ' + lives, { font: '16px Arial', fill: '#fff'});
		lifeCount = game.add.sprite(5, game.world.height - sprite.height+9, 'sprite');
	    lifeCount.scale.setTo(0.6,0.6);
	},
	update: function() {
		scoreText.text = scoreString + score;
		lifeCounter.text = "X " + lives;
		this.fireBullet();
	},
	fireBullet: function() {
    	if (game.time.now > bulletTime) {
    		shootDelay = 150 / shootRateMultiplier;
            for (var i = 0; i < shotSpread; i++) {
                var bullet = bullets.getFirstExists(false);
                if (bullet) {
                    bullet.reset(sprite.x, sprite.y);
                    var spreadAngle = 90/shotSpread;
                    //decide how many bullets to shoot on each side
                    var k = Math.floor(shotSpread/2); 
                    var angle = k*spreadAngle - i*spreadAngle;
                    game.physics.arcade.velocityFromAngle(angle-90, 10+40*shotSpread, bullet.body.velocity);
                    bullet.body.velocity.y = baseShotSpeed * shotSpeedMultiplier;
                }
            }
        	bulletTime = game.time.now + shootDelay;
        }
	}
};
function resetFunct(object){
//console.log(object.name+" just reset");
object.kill();
}