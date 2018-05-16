var Game = 
{
	create: function() {
		
		//Setup gameplay variables here
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
		canShoot = false;
		hurtTime = 0;
		//gameplay-related vars end

		//background
		back = game.add.tileSprite(0, 0, 1080, 1920,'starfield');
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

		//makes enemies
		enemies = game.add.group();
		enemies.enableBody = true;
		enemies.physicsBodyType = Phaser.Physics.ARCADE;

	    for (var i = 0; i < 40; i++)
	    { 
	        var e = enemies.create(0, 0, 'enemy');
	        e.name = 'enemy' + i;
    		//e.scale.setTo(0.2,0.2);
			e.anchor.setTo(0.5, 0.5);
	        e.exists = false;
	        e.visible = false;
	    }

		//make a bar on the bottom of the screen to despawn offscreen enemies
		screenBottomBar = game.add.sprite(0, game.world.height+25, "preloaderBar");
		screenBottomBar.width = 3*game.world.width;
		game.physics.enable(screenBottomBar, Phaser.Physics.ARCADE);

		//These coord offsets are probably all wrong once we get real sprites
		//UI

		scoreString = 'Score: ';
		scoreText = game.add.text(5,5, scoreString + score, {font: '16px Arial', fill:'#fff'});
		//lives
	    lifeCounter = game.add.text(sprite.width , game.world.height - sprite.height+11, 'X ' + lives, { font: '16px Arial', fill: '#fff'});
		lifeCount = game.add.sprite(5, game.world.height - sprite.height+9, 'sprite');
	    lifeCount.scale.setTo(0.6,0.6);
	    //pause button
	    pauseButton = game.add.button(game.world.width-25, 5, 'pause', this.pauseFunct);
	    pauseButton.scale.setTo(0.6,0.6);
	    //shooting toggle
	    shootToggle = game.add.button(game.world.width-50, 5, 'pause', 
	    	function(){canShoot = !canShoot; console.log("canShoot = "+ canShoot)});
	    shootToggle.scale.setTo(0.6,0.6);
	    shootToggle.tint = 0xff0000;
	},
	update: function() {
	    back.tilePosition.y += 2;
		if (game.time.now > spawnTime) this.makeEnemy();

		scoreText.text = scoreString + score;
		lifeCounter.text = "X " + lives;
		this.fireBullet();

	    //collision tests//function(){console.log("wtf");}
	    game.physics.arcade.overlap(screenBottomBar, enemies,this.enemyOffScreen, null);
	},
	makeEnemy: function() {
		var x = game.rnd.integerInRange(0, game.world.width);
		var xspeed = game.rnd.integerInRange(-100, 100);
		var yspeed = game.rnd.integerInRange(150, 300);
		this.spawnEnemy(x, -10, xspeed, yspeed);
	},
	spawnEnemy: function(x, y, xspeed, yspeed) {
        enemy = enemies.getFirstExists(false);
        if (enemy)
        {
            enemy.reset(x, y);
            enemy.body.velocity.x = xspeed;
            enemy.body.velocity.y = yspeed;
            spawnTime = game.time.now +200;
        }
	},
	enemyOffScreen: function(bar, enemy){
		resetFunct(enemy);
	},
	pauseFunct: function() {
		console.log("game.paused = " + !game.paused);
		if(game.paused){
		    menu.destroy();
			sprite.inputEnabled = true;
			game.paused = false;
			return;
		}
		sprite.inputEnabled = false;
		game.paused = true;
		menu = game.add.sprite(game.world.width/3, game.world.height/2, 'logo');
		menu.setAnchor(0.5, 0.5);
	},
	fireBullet: function() {
		if (!canShoot) return;
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
console.log(object.name+" just reset");
object.kill();
}