var Shop = 
{
	create: function()
	{
		game.add.sprite(0, 0, 'screen-bg');

		//Custom green text
		var txt = game.add.bitmapText(game.world.width*0.5, game.world.height*0.1, 'titleFont', "UPGRADES", 40);
		txt.tint = 0xFFFFF;
		txt.anchor.setTo(0.5,0.5);

		upgradeLives  = createButton("Lives", 10, game.world.width*0.3, game.world.height*0.3, 
						80, 30, function(){Shop.livesPlus()});
		upgradeSpread = createButton("Spread", 10, game.world.width*0.3, game.world.height*0.4, 
						80, 30, function(){Shop.spreadPlus()});
		upgradeShield = createButton("Shield", 10, game.world.width*0.3, game.world.height*0.5, 
						80, 30, function(){Shop.spreadPlus()});
		returnButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.6, 
								160, 30, function(){game.state.start('MainMenu')});
	},

	//Copy paste upgrade functions
	livesPlus: function()
	{
		update = game.add.text(game.world.centerX, game.world.centerY*0.5,
						"Lives Increased!", {font:"px Verdana", fill:"#0", align:"center"});
		game.time.events.add(1000, function(){game.add.tween(update).to({y: 0, alpha: 0}, 1500, Phaser.Easing.Linear.None, true)}, this);
		Cookies.set("lives", parseInt(Cookies.get("lives"))++); //add lives to cookie
	},

	spreadPlus: function()
	{
		shotSpread++;
		update2 = game.add.text(game.world.centerX, game.world.centerY*0.5,
						"Spread Increased!", {font:"px Verdana", fill:"#0", align:"center"});
		game.time.events.add(1000, function(){game.add.tween(update2).to({y: 0, alpha: 0}, 1500, Phaser.Easing.Linear.None, true)}, this);
	}
}