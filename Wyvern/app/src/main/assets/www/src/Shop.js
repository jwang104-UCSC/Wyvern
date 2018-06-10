var Shop = 
{
	create: function()
	{
		this.cookiesSetup();
		this.generalDisplay();
		this.livesDisplay(tempLives);
		this.shieldDisplay(tempShield);
		this.spreadDisplay(tempSpread);
		this.creditsDisplay();
	},

	//Get the cookies necessary for the shop
	cookiesSetup: function()
	{
		//Load in all the cookies
		tempLives  = parseInt(Cookies.get("bonus lives"));
		tempShield = parseInt(Cookies.get("bonus shield"));
		tempSpread = parseInt(Cookies.get("bonus spread"));
		credits    = parseInt(Cookies.get("credits"));

		//Check if the cookies exist
		if (isNaN(tempLives)) tempLives = 0;
		if (isNaN(tempShield)) tempShield = 0;
		if (isNaN(tempSpread)) tempSpread = 0;
		if (isNaN(credits)) credits = 0;
	},

	//Handles mostly static sprite and text displays
	generalDisplay: function()
	{
		//Shop title text
		var shopText = game.add.bitmapText(game.world.width*0.6, game.world.height*0.15, 'titleFont', "UPGRADE", 30);
		shopText.tint = 0xFFFFF;
		shopText.anchor.setTo(0.5, 0.5);

		//Add in general sprites
		game.add.sprite(game.world.width*0.7, game.world.height*0.45, 'shield');
		bullet1 = game.add.sprite(game.world.width*0.775, game.world.height*0.7, 'fireball');
		wyvern  = game.add.sprite(game.world.width*0.665, game.world.height*0.25, 'dragon');
		bullet1.scale.setTo(0.01);
		wyvern.scale.setTo(0.3);

		//Check if bullet sprites need to be added according to spread upgrades
		if (tempSpread == 1)
		{
			bullet1.kill();
			bullet1 = game.add.sprite(game.world.width*0.75, game.world.height*0.7, 'fireball');
			bullet2 = game.add.sprite(game.world.width*0.80, game.world.height*0.7, 'fireball');
			bullet1.scale.setTo(0.01);
			bullet2.scale.setTo(0.01);
		}
		else if (tempSpread == 2)
		{
			bullet2 = game.add.sprite(game.world.width*0.825, game.world.height*0.7, 'fireball');
			bullet3 = game.add.sprite(game.world.width*0.725, game.world.height*0.7, 'fireball');
			bullet2.scale.setTo(0.01);
			bullet3.scale.setTo(0.01);
		}

		//Prices of upgrades
		var costLives  = game.add.bitmapText(game.world.width*0.05, game.world.height*0.355, 
			'buttonStyle', "Cost:\n\n2000 Credits", 8);
		var costShield = game.add.bitmapText(game.world.width*0.05, game.world.height*0.555, 
			'buttonStyle', "Cost:\n\n5000 Credits", 8);
		var costSpread = game.add.bitmapText(game.world.width*0.05, game.world.height*0.755, 
			'buttonStyle', "Cost:\n\n10000 Credits", 8);

		//Add buttons
		var upgradeLives  = createButton("Lives", 10, game.world.width*0.25, game.world.height*0.3, 
						80, 30, function(){Shop.livesPlus()});
		var upgradeShield = createButton("Shield", 10, game.world.width*0.25, game.world.height*0.5, 
						80, 30, function(){Shop.shieldPlus()});
		var upgradeSpread = createButton("Spread", 10, game.world.width*0.25, game.world.height*0.7, 
						80, 30, function(){Shop.spreadPlus()});
		var titleButton   = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.925, 
								160, 30, function(){game.state.start('MainMenu')});
	},

	//Used to update credits display
	creditsDisplay: function()
	{
		//Extra "" added so 0 appears
		creditsText = game.add.bitmapText(game.world.width*0.03, game.world.height*0.025, 'buttonStyle', "Credits:" + credits, 10);
		creditsText.tint = 0x00FFFF;
	},

	//C-pasted displays for upgrade maximums
	livesDisplay: function(tempLives)
	{
		if (tempLives < 10) 
		{
			livesMax = game.add.bitmapText(game.world.width*0.7, game.world.height*0.38, 
				'buttonStyle', "0" + tempLives + "/20", 6);
		}
		else
		{
			livesMax = game.add.bitmapText(game.world.width*0.7, game.world.height*0.38, 
				'buttonStyle', tempLives + "/20", 6);
			if (tempLives == 20)
			{
				livesMax.tint = 0xFF0000;
			}
		}
	},

	shieldDisplay: function(tempShield)
	{
		shieldMax = game.add.bitmapText(game.world.width*0.7, game.world.height*0.58, 
			'buttonStyle', "0" + tempShield/1000 + "/08", 6);
		if (tempShield == 8000)
		{
			shieldMax.tint = 0xFF0000;
		}
	},

	spreadDisplay: function(tempSpread)
	{
		spreadMax = game.add.bitmapText(game.world.width*0.7, game.world.height*0.75, 
			'buttonStyle', "0" + (tempSpread + 1) + "/03", 6);
		if (tempSpread == 2)
		{
			spreadMax.tint = 0xFF0000;
		}
	},

	//C-pasted upgrade functions
	livesPlus: function()
	{	
		//Check for maximum upgrades and sufficient credits
		if (tempLives < 20)
		{
			if (credits >= 2000)
			{
				credits -= 2000;
				Cookies.set('credits', credits); 
				Cookies.set('bonus lives', ++tempLives); 
				textRise("    Lives\nUpgraded!", game.world.width*0.5, game.world.centerY*0.6);

				//Update everything
				creditsText.kill();
				livesMax.kill();
				this.creditsDisplay();
				this.livesDisplay(tempLives);

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

	shieldPlus: function()
	{
		if (tempShield < 8000)
		{
			if (credits >= 5000)
			{
				credits -= 5000;
				tempShield += 1000;
				Cookies.set('credits', credits); 
				Cookies.set('bonus shield', tempShield); 
				textRise("   Shield\nUpgraded!", game.world.width*0.5, game.world.centerY*0.6);

				creditsText.kill();
				shieldMax.kill();
				this.creditsDisplay();
				this.shieldDisplay(tempShield);

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
	},

	spreadPlus: function()
	{
		if (tempSpread < 2)
		{
			if (credits >= 10000)
			{
				credits -= 10000;
				Cookies.set('bonus spread', ++tempSpread);
				Cookies.set('credits', credits); 
				//Bullet display eye candy
				if (tempSpread == 1) 
				{
					textRise("Double Shot\n  Acquired!", game.world.width*0.5, game.world.centerY*0.6);
					bullet1.kill();
					bullet1 = game.add.sprite(game.world.width*0.75, game.world.height*0.7, 'fireball');
					bullet2 = game.add.sprite(game.world.width*0.80, game.world.height*0.7, 'fireball');
					bullet1.scale.setTo(0.01);
					bullet2.scale.setTo(0.01);
				}
				else 
				{
					textRise("Triple Shot\n Acquired!", game.world.width*0.5, game.world.centerY*0.6);
					bullet1.kill();
					bullet2.kill();
					bullet1 = game.add.sprite(game.world.width*0.775, game.world.height*0.7, 'fireball');
					bullet2 = game.add.sprite(game.world.width*0.825, game.world.height*0.7, 'fireball');
					bullet3 = game.add.sprite(game.world.width*0.725, game.world.height*0.7, 'fireball');
					bullet1.scale.setTo(0.01);
					bullet2.scale.setTo(0.01);
					bullet3.scale.setTo(0.01);
				}

				creditsText.kill();
				spreadMax.kill();
				this.creditsDisplay();
				this.spreadDisplay(tempSpread);
				
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
	}
}

//Rising text implementation
function textRise(string, x, y)
{
	var text = game.add.bitmapText(x, y, 'bubbleFont', string, 20);
	text.tint = 0xFFFFFF;
	text.anchor.setTo(0.5, 0.5);
	game.time.events.add(700, function(){
		game.add.tween(text).to({y: 0, alpha: 0}, 1000, Phaser.Easing.Linear.None, true)}, this);
}