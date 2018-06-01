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
						80, 30, function(){Shop.shieldPlus()});
		returnButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.6, 
								160, 30, function(){game.state.start('MainMenu')});
	},

	//Copy paste upgrade functions
	livesPlus: function()
	{	
		textRise("Lives Increased!", game.world.centerX, game.world.centerY*0.5);
		tempLives = parseInt(Cookies.get("lives"));
		Cookies.set('lives', tempLives++); //add lives to cookie
	},

	spreadPlus: function()
	{
		//shotSpread++;
		textRise("Spread Increased!", game.world.centerX, game.world.centerY*0.7);
	},

	shieldPlus: function()
	{
		//shotSpread++;
		textRise("Shield Power Increased!", game.world.centerX, game.world.centerY*0.9);
	}
}
function textRise(string, x, y){
	var rise = game.add.text(x, y, string, {font:"px Verdana", fill:"#0", align:"center"});
	game.time.events.add(700, function(){game.add.tween(rise).to({y: 0, alpha: 0}, 1000, Phaser.Easing.Linear.None, true)}, this);
}