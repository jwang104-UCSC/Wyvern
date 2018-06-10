var Settings = 
{
	create: function() 
	{	
		that = this;
		resetAllConfirm = false;
		resetScoreConfirm = false;

		game.add.sprite(-375, 0, 'settings-bg');

		var titleText = game.add.bitmapText(game.world.width*0.5, game.world.height*0.1, 'titleFont', "SETTINGS", 40);
		titleText.tint = 0xFFFFF;
		titleText.anchor.setTo(0.5,0.5);
		this.displayButtons();
	},

	displayButtons: function()
	{
		muteButton  = createButton("Toggle Mute", 9, game.world.width*0.5, game.world.height*0.5, 
								140, 30, function(){soundControl()});
		titleButton = createButton("Title Screen", 9, game.world.width*0.5, game.world.height*0.8, 
								160, 30, function(){game.state.start('MainMenu')});
		seedButton  = createButton("Seed Settings", 9, game.world.width*0.5, game.world.height*0.6, 
								180, 30, function(){removeButton(muteButton); removeButton(titleButton); removeButton(seedButton); 
									removeButton(moreButton); that.seedSettings();});
		moreButton  = createButton("Data Settings", 9, game.world.width*0.5, game.world.height*0.7, 
								180, 30, function(){if (typeof input != 'undefined') input.kill(); removeButton(muteButton); removeButton(titleButton); removeButton(seedButton); 
									removeButton(moreButton); that.advancedSettings(resetAllConfirm, resetScoreConfirm);});
	},

	seedSettings: function()
	{
		//Seed input box
		input = game.add.inputField(30, game.world.height*0.4, {
			width: 140,
		});
		input.setText("  TYPE SEED HERE");
		setSeed    = createButton("Set Seed", 9, game.world.width*0.5, game.world.height*0.6, 
								100, 30, function(){if (input.value != "Type seed here") Cookies.set("seed", input.value)});
		removeSeed = createButton("Clear Seed", 9, game.world.width*0.5, game.world.height*0.7, 
								120, 30, function(){Cookies.remove("seed")});
		backButton = createButton("Back", 9, game.world.width*0.5, game.world.height*0.8, 
								80, 30, function(){input.kill(); removeButton(setSeed); removeButton(removeSeed); removeButton(backButton); that.displayButtons();});
	},

	advancedSettings: function(resetAllConfirm, resetScoreConfirm)
	{
		scoreReset = createButton("Reset Highscore", 9, game.world.width*0.5, game.world.height*0.6, 
								190, 30, function(){
									if (!resetScoreConfirm)
									{
										scoreReset[1].text = "Are you sure?";
										resetScoreConfirm = true;
									}
									else
									{	
										//Reset highscore
										Cookies.remove("highscore");
										textRise("HIGHSCORE\n   RESET!", game.world.width*0.5, game.world.centerY*0.6);
										console.log("Highscore Reset");
										resetScoreConfirm = false;
										scoreReset[1].text = "Reset Highscore";
									}
								});
		allReset   = createButton("Reset ALL", 9, game.world.width*0.5, game.world.height*0.7, 
								160, 30, function(){
									if (!resetAllConfirm)
									{
										allReset[1].text = "Are you sure?";
										resetAllConfirm = true;
									}
									else
									{	
										//Reset all cookies in a loop
										var tempCookie = Cookies.get();
										var cookiesLength = Object.keys(tempCookie).length;
										for (var i = 0; i < cookiesLength; i++)
										{
											Cookies.remove(Object.keys(tempCookie)[i]);
										}
										textRise("EVERYTHING\n    RESET!", game.world.width*0.5, game.world.centerY*0.6);
										console.log("Cookies reset");
										resetAllConfirm = false;
										allReset[1].text = "Reset ALL";
									}
								});
		backButton = createButton("Back", 9, game.world.width*0.5, game.world.height*0.8, 
								80, 30, function(){removeButton(scoreReset); removeButton(allReset); removeButton(backButton); that.displayButtons();});
	}
}

//Simple mute control 
function soundControl()
{
	if(game.sound.mute)
	{
		game.sound.mute = false;
		return;
	}
	game.sound.mute = true;
}