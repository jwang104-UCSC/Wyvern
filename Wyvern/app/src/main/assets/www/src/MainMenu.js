var MainMenu = 
{
	create: function() 
	{
		//game.sound.stopAll();
		game.add.sprite(-100, -240, 'mainMenu-bg');

		//Add custom font for title text
		gameTitle1 = game.add.bitmapText(game.world.width*0.425, game.world.height*0.125, 'titleFont', "WYVERN'S", 35);
		gameTitle2 = game.add.bitmapText(game.world.width*0.425, game.world.height*0.25, 'titleFont', "WRATH", 35);
		gameTitle1.anchor.set(0.5,0);
		gameTitle2.anchor.set(0.5,0);

		// Gives the title its green glow
		gameTitle1.tint = gameTitle2.tint = 0xFFFFF;

		// Make it rotate and stuff
		gameTitle1.angle = (2 + Math.random()*5)*(Math.random() > 0.5 ? 1 : -1);
		var titleTween1 = this.add.tween(gameTitle1);
		titleTween1.to(
			{angle: -gameTitle1.angle}, 
			5000 + Math.random()*5000, Phaser.Easing.Linear.None, true, 0, 1000, true);

		gameTitle2.angle = (2 + Math.random()*5)*(Math.random() > 0.5 ? 1 : -1);
		var titleTween2 = this.add.tween(gameTitle2);
		titleTween2.to(
			{angle: -gameTitle2.angle},
			5000 + Math.random()*5000, Phaser.Easing.Linear.None, true, 0, 1000, true);

		//Create the title screen buttons
		startButton    = createButton("Start Game", 10, game.world.width*0.4, game.world.height*0.725, 
								140, 30, function(){game.state.start('Hub')}); //Changed from tutorial placeholder
		settingsButton = createButton("Settings", 10, game.world.width*0.325, game.world.height*0.825, 
								110, 30, function(){game.state.start('Settings')});
		shopButton     = createButton("Shop", 10, game.world.width*0.225, game.world.height*0.925, 
								70, 30, function(){game.state.start('Shop')});
	}
}

function createButton(string,fontsize,x,y,w,h,callback)
{
	var button1 = game.add.button(x,y,'button',callback,this,2,1,0);

	//Add SFX to buttons
	var fx = game.add.audio('buttonSFX', 0.2);  //tone down the sound because it's too noisy by default
	button1.onDownSound = (fx);

	button1.anchor.setTo(0.5,0.5);
	button1.width = w;
	button1.height = h;
	var txt =game.add.bitmapText(button1.x, button1.y, 'buttonStyle', string, fontsize);
	txt.tint = 0; //make the text black
	//var txt = game.add.text(button1.x,button1.y,string,{font:fontsize+"px Arial", fill: "#f",align:"center"});
	txt.anchor.setTo(0.5,0.5);
	return {"0":button1,"1":txt};
}

function removeButton(object)
{
	object[0].kill();
	object[1].kill();
}