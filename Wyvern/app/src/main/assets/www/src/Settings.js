var Settings = 
{
	create: function() 
	{	
		that = this;
		game.add.sprite(0, 0, 'screen-bg');

		var txt = game.add.bitmapText(game.world.width*0.5, game.world.height*0.1, 'titleFont', "SETTINGS", 40);
		txt.tint = 0xFFFFF;
		txt.anchor.setTo(0.5,0.5);

		input = game.add.inputField(30, game.world.height*0.3, {
			width: 140,
		});
		input.setText("Type seed here");

		setSeed   = createButton("Set Custom Seed", 10, game.world.width*0.5, game.world.height*0.4, 
								200, 30, function(){if (input.value != "Type seed here")Cookies.set("seed", input.value)});
		removeSeed   = createButton("Clear Custom Seed", 9, game.world.width*0.5, game.world.height*0.5, 
								200, 30, function(){Cookies.remove("seed")});
		scoreReset   = createButton("Reset Highscore", 10, game.world.width*0.5, game.world.height*0.6, 
								200, 30, function(){Cookies.remove("highscore")});
		muteButton   = createButton("Toggle Mute", 10, game.world.width*0.5, game.world.height*0.7, 
								140, 30, function(){soundControl()});
		returnButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.95, 
								160, 30, function(){game.state.start('MainMenu')});
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