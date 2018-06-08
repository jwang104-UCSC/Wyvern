var Shop = 
{
	create: function()
	{
		game.add.sprite(-300, 0, 'shop-bg');

		//Custom green text
		var txt = game.add.bitmapText(game.world.width*0.5, game.world.height*0.1, 'titleFont', "UPGRADES", 40);
		txt.tint = 0xFFFFF;
		txt.anchor.setTo(0.5,0.5);

		upgradeLives  = createButton("Lives", 10, game.world.width*0.3, game.world.height*0.6, 
						80, 30, function(){Shop.livesPlus()});
		upgradeSpread = createButton("Spread", 10, game.world.width*0.3, game.world.height*0.7, 
						80, 30, function(){Shop.spreadPlus()});
		upgradeShield = createButton("Shield", 10, game.world.width*0.7, game.world.height*0.6, 
						80, 30, function(){Shop.shieldPlus()});
		returnButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.9, 
								160, 30, function(){game.state.start('MainMenu')});
	},

	//Copy paste upgrade functions
	livesPlus: function()
	{	
		tempLives = parseInt(Cookies.get("bonus lives"));
		if(isNaN(tempLives))
			tempLives = 0;
		if (tempLives < 20)
		{
			textRise("      Life\n Increased!", game.world.centerX*0.15, game.world.centerY*0.6);
			Cookies.set('bonus lives', ++tempLives); 
			console.log("Bonus Lives: ", tempLives);
		}
		else
		{
			textRise("    Fully\nupgraded!", game.world.centerX*0.3, game.world.centerY*0.6);
		}
	},

	spreadPlus: function()
	{
		tempSpread = parseInt(Cookies.get("bonus spread"));
		if(isNaN(tempSpread))
			tempSpread = 0;
		if (tempSpread < 2)
		{
			textRise("Shot Spread\n Increased!", game.world.centerX*0.15, game.world.centerY*0.6);
			Cookies.set('bonus spread', ++tempSpread); 
			console.log("Bonus Spread: ", tempSpread);
		}
		else
		{
			textRise("    Fully\nupgraded!", game.world.centerX*0.3, game.world.centerY*0.6);
		}
	},

	shieldPlus: function()
	{
		tempShield = parseInt(Cookies.get("bonus shield"));
		if(isNaN(tempShield))
			tempShield = 0;
		if (tempShield < 3000)
		{
			tempShield += 10000;
			textRise("Shield\n Increased!", game.world.centerX*0.15, game.world.centerY*0.6);
			Cookies.set('bonus shield', tempShield); 
			console.log("Bonus Shielding Duration: ", tempShield);
		}
		else
		{
			textRise("    Fully\nupgraded!", game.world.centerX*0.3, game.world.centerY*0.6);
		}
	}
}
function textRise(string, x, y){
	var texts = game.add.bitmapText(x, y, 'xsa', string, 25);
	texts.tint = 0xFFFFFF;
	//var rise = game.add.text(x, y, string, {font:"px Verdana", fill:"#0", align:"center"});
	game.time.events.add(700, function(){game.add.tween(texts).to({y: 0, alpha: 0}, 1000, Phaser.Easing.Linear.None, true)}, this);
}