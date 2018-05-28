var Settings = 
{
	create: function() 
	{
		game.add.sprite(0, 0, 'screen-bg');

		var txt = game.add.bitmapText(game.world.width*0.5, game.world.height*0.1, 'titleFont', "SETTINGS", 40);
		txt.tint = 0xFFFFF;
		txt.anchor.setTo(0.5,0.5);

		scoreReset   = createButton("Reset Highscore", 10, game.world.width*0.5, game.world.height*0.5, 
								200, 30, function(){Cookies.remove("highscore")});
		muteButton   = createButton("Mute Sound", 10, game.world.width*0.5, game.world.height*0.6, 
								140, 30, function(){soundControl()});
		returnButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.7, 
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