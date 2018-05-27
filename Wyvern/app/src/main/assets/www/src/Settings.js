var Settings = 
{
	create: function() 
	{
		game.add.sprite(0, 0, 'screen-bg');
		gameTitle = game.add.sprite(game.world.width*0.5, game.world.height*0.1, 'title');
		gameTitle.anchor.set(0.5,0);

		scoreReset = createButton("Reset Highscore", 15, game.world.width*0.3, game.world.height*0.5, 
								120, 30, function(){Cookies.remove("highscore")});
		startButton    = createButton("Start Game", 15, game.world.width*0.5, game.world.height*0.9, 
								80, 30, function(){game.state.start('Howto')});
	}
}

function createButton(string,fontsize,x,y,w,h,callback)
{
	var button1 = game.add.button(x,y,'button',callback,this,2,1,0);
	button1.anchor.setTo(0.5,0.5);
	button1.width = w;
	button1.height = h;
	var txt = game.add.text(button1.x,button1.y,string,{font:fontsize+"px Arial", fill: "#f",align:"center"});
	txt.anchor.setTo(0.5,0.5);
	return {"0":button1,"1":txt};
}

function removeButton(object)
{
	object[0].kill();
	object[1].kill();
}
