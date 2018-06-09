var Shop = 
{
	create: function()
	{
		game.add.sprite(-300, 0, 'shop-bg');

		//Shop title text
		var shopText = game.add.bitmapText(game.world.width*0.5, game.world.height*0.1, 'titleFont', "UPGRADES", 40);
		shopText.tint = 0xFFFFF;
		shopText.anchor.setTo(0.5, 0.5);

		//Display credits
		credits = parseInt(Cookies.get("credits"));
		this.creditsDisplay();

		//Add buttons
		var upgradeLives  = createButton("Lives", 10, game.world.width*0.3, game.world.height*0.6, 
						80, 30, function(){Shop.livesPlus()});
		var upgradeShield = createButton("Shield", 10, game.world.width*0.7, game.world.height*0.6, 
						80, 30, function(){Shop.shieldPlus()});
		var upgradeSpread = createButton("Spread", 10, game.world.width*0.5, game.world.height*0.7, 
						80, 30, function(){Shop.spreadPlus()});
		var returnButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.9, 
								160, 30, function(){game.state.start('MainMenu')});
	},

	//Used to update credits display
	creditsDisplay: function()
	{
		//Extra "" added so 0 appears
		creditsText = game.add.bitmapText(game.world.width*0.3, game.world.height*0.3, 'buttonStyle', "Credits:\n\n" + credits, 10);
		creditsText.anchor.setTo(0.5, 0.5);
	},

	//C-pasted upgrade functions
	livesPlus: function()
	{	
		tempLives = parseInt(Cookies.get("bonus lives"));

		//Check for maximum upgrades and sufficient credits
		if (tempLives < 20)
		{
			if(credits >= 1000)
			{
				credits -= 1000;
				Cookies.set('bonus lives', ++tempLives); 
				textRise("     Lives\n Increased!", game.world.width*0.5, game.world.centerY*0.6);

				creditsText.kill();
				this.creditsDisplay();

				console.log("", credits);
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
			if(credits >= 1000)
			{
				credits -= 1000;
				Cookies.set('bonus spread', ++tempSpread); 
				textRise("Shot Spread\n Increased!", game.world.width*0.5, game.world.centerY*0.6);

				creditsText.kill();
				this.creditsDisplay();
				
				console.log("", credits);
				console.log("Bonus Spread: ", tempSpread);
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

	shieldPlus: function()
	{
		tempShield = parseInt(Cookies.get("bonus shield"));
		if (tempShield < 8000)
		{
			if(credits >= 1000)
			{
				credits -= 1000;
				tempShield += 1000;
				Cookies.set('bonus shield', tempShield); 
				textRise("     Lives\n Increased!", game.world.width*0.5, game.world.centerY*0.6);

				creditsText.kill();
				this.creditsDisplay();

				console.log("", credits);
				console.log("Bonus Shielding Time: ", tempShield);
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
	}
}

//Rising text implementation
function textRise(string, x, y)
{
	var text = game.add.bitmapText(x, y, 'bubbleFont', string, 25);
	text.tint = 0xFFFFFF;
	text.anchor.setTo(0.5, 0.5);
	game.time.events.add(700, function(){
		game.add.tween(text).to({y: 0, alpha: 0}, 1000, Phaser.Easing.Linear.None, true)}, this);
}