var MainMenu = 
{
	create: function(){
		game.add.sprite(0, 0, 'screen-bg');
		gameTitle = game.add.sprite(game.world.width*0.5, game.world.height*0.1, 'title');
		gameTitle.anchor.set(0.5,0);
		// startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button-start',
		// 	function(){game.state.start('Howto')}, this, 2, 0, 1);
		// settingsButton = game.add.button(game.world.width*0.5, game.world.height*0.7, 'button-start',
  //           			function(){game.state.start('Howto')}, this, 2, 0, 1);
		// startButton.anchor.set(0.5,0);
		// settingsButton.anchor.set(0.5,0);
		startButton = createButton("Start Game", 15, game.world.width*0.5, game.world.height*0.5, 80,30,function(){game.state.start('Howto')});
		settingsButton = createButton("Settings", 15, game.world.width*0.5, game.world.height*0.7, 80,30,function(){game.state.start('Howto')});
		createButton("idk", 15, game.world.width*0.5, game.world.height*0.9, 80,30,function(){game.state.start('Howto')});
		createButton("yo dawg", 15, game.world.width*0.2, game.world.height*0.1, 80,30,function(){game.state.start('Howto')});
		createButton("i herd", 15, game.world.width*0.2, game.world.height*0.2, 80,30,function(){game.state.start('Howto')});
		createButton("u liek", 15, game.world.width*0.2, game.world.height*0.3, 80,30,function(){game.state.start('Howto')});
		createButton("buttons", 15, game.world.width*0.2, game.world.height*0.4, 80,30,function(){game.state.start('Howto')});
		createButton("so i put", 15, game.world.width*0.6, game.world.height*0.1, 80,30,function(){game.state.start('Howto')});
		createButton("buttons", 15, game.world.width*0.6, game.world.height*0.2, 80,30,function(){game.state.start('Howto')});
		createButton("so you can", 15, game.world.width*0.6, game.world.height*0.3, 80,30,function(){game.state.start('Howto')});
		createButton("buttons", 15, game.world.width*0.6, game.world.height*0.4, 80,30,function(){game.state.start('Howto')});
			
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
function removeButton(object){
	object[0].kill();
	object[1].kill();
}
