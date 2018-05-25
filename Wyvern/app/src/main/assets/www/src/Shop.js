var Shop = 
{
	create: function()
	{
		game.add.sprite(0, 0, 'screen-bg');
		startButton   = createButton("Start Game", 15, game.world.width*0.5, game.world.height*0.5, 
						80, 30, function(){game.state.start('Howto')});
		upgradeLives  = createButton("Lives", 15, game.world.width*0.5, game.world.height*0.7, 
						80, 30, function(){Shop.livesPlus()});
		upgradeSpread = createButton("Spread", 15, game.world.width*0.5, game.world.height*0.9, 
						80, 30, function(){Shop.spreadPlus()});
	},

	//Copy paste upgrade functions
	livesPlus: function()
	{
		lives++;
		update = game.add.text(game.world.centerX, game.world.centerY*0.5,
						"Lives Increased!", {font:"px Verdana", fill:"#0", align:"center"});
		game.time.events.add(1000, function(){game.add.tween(update).to({y: 0}, 1500, Phaser.Easing.Linear.None, true); 
						game.add.tween(update).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);}, this);
	},

	spreadPlus: function()
	{
		shotSpread++;
		update2 = game.add.text(game.world.centerX, game.world.centerY*0.5,
						"Spread Increased!", {font:"px Verdana", fill:"#0", align:"center"});
		game.time.events.add(1000, function(){game.add.tween(update2).to({y: 0}, 1500, Phaser.Easing.Linear.None, true); 
						game.add.tween(update2).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);}, this);
	}
}