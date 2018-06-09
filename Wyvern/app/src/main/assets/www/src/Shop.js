var Shop = 
{
	create: function()
	{
		game.add.sprite(-300, 0, 'shop-bg');

		//Custom green text
		var shopText = game.add.bitmapText(game.world.width*0.5, game.world.height*0.1, 'titleFont', "UPGRADES", 40);
		shopText.tint = 0xFFFFF;
		shopText.anchor.setTo(0.5, 0.5);
		currencyTracker = parseInt(Cookies.get("currency"));

		//Extra "" added so 0 appears
		currencyText = game.add.bitmapText(game.world.width*0.5, game.world.height*0.3, 'buttonStyle', "" + currencyTracker, 20);
		currencyText.anchor.setTo(0.5, 0.5);

		var upgradeLives  = createButton("Lives", 10, game.world.width*0.3, game.world.height*0.6, 
						80, 30, function(){Shop.livesPlus()});
		var upgradeSpread = createButton("Spread", 10, game.world.width*0.3, game.world.height*0.7, 
						80, 30, function(){Shop.spreadPlus()});
		var upgradeShield = createButton("Shield", 10, game.world.width*0.7, game.world.height*0.6, 
						80, 30, function(){Shop.shieldPlus()});
		var returnButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.9, 
								160, 30, function(){game.state.start('MainMenu')});
	},

	//Copy paste upgrade functions
	livesPlus: function()
	{	
		tempLives = parseInt(Cookies.get("bonus lives"));
		if (tempLives < 20)
		{
			if(currencyTracker >= 1000)
			{
				textRise("     Lives\n Increased!", game.world.width*0.5, game.world.centerY*0.6);
				Cookies.set('bonus lives', ++tempLives); 
				currencyTracker -= 1000;
				currencyText.kill();
				currencyText = game.add.bitmapText(game.world.width*0.5, game.world.height*0.3, 'buttonStyle', currencyTracker, 20);
				currencyText.anchor.setTo(0.5, 0.5);
				console.log("", currencyTracker);
				console.log("Bonus Lives: ", tempLives);
			}
			else
			{
				textRise("Insufficient\n   Credits", game.world.width*0.5, game.world.centerY*0.6);
			}
		}
		else
		{
			textRise("    Fully\nupgraded!", game.world.width*0.5, game.world.centerY*0.6);
		}
	},

	spreadPlus: function()
	{
		tempSpread = parseInt(Cookies.get("bonus spread"));
		if (tempSpread < 2)
		{
			textRise("Shot Spread\n  Upgraded!", game.world.width*0.5, game.world.centerY*0.6);
			Cookies.set('bonus spread', ++tempSpread); 
			console.log("Bonus Spread: ", tempSpread);
		}
		else
		{
			textRise("    Fully\nupgraded!", game.world.width*0.5, game.world.centerY*0.6);
		}
	},

	shieldPlus: function()
	{
		tempShield = parseInt(Cookies.get("bonus shield"));
		if (tempShield < 3000)
		{
			tempShield += 1000;
			textRise("    Shield\n Upgraded!", game.world.width*0.5, game.world.centerY*0.6);
			Cookies.set('bonus shield', tempShield); 
			console.log("Bonus Shielding Duration: ", tempShield);
		}
		else
		{
			textRise("    Fully\nupgraded!", game.world.width*0.5, game.world.centerY*0.6);
		}
	}
}
function textRise(string, x, y){
	var text = game.add.bitmapText(x, y, 'xsa', string, 25);
	text.tint = 0xFFFFFF;
	text.anchor.setTo(0.5, 0.5);
	game.time.events.add(700, function(){game.add.tween(text).to({y: 0, alpha: 0}, 1000, Phaser.Easing.Linear.None, true)}, this);
}