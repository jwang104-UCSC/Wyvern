var Hub = 
{
	create: function() 
	{
		game.add.sprite(-100, -240, 'mainMenu-bg');

		//Add custom font for title text
		var txt = game.add.bitmapText(game.world.width*0.5, game.world.height*0.1, 'titleFont', "LEVEL", 40);
		var txt2 = game.add.bitmapText(game.world.width*0.5, game.world.height*0.225, 'titleFont', "SELECT", 40);
		txt.tint = txt2.tint = 0xFFFFF;
		txt.anchor.setTo(0.5,0.5);
		txt2.anchor.setTo(0.5,0.5);
	    lv1 = {
	    	"level":1,
	    	"bgm":"cosmosBGM",
	    	"makeEnemy%": 0.5,
	    	"Enemy Type 1": "meteors",
	    	"Enemy Type 2":"eyes",
	    	"spawnDelay": 200,
	    	"enemyToughness":2,
	    	"score":0,
	    	"lives":3
		};
	    lv2 = {
	    	"level":2,
	    	"bgm":"gunsBGM",
	    	"makeEnemy%": 0.7,
	    	"Enemy Type 1": "meteors",
	    	"Enemy Type 2":"meteors",
	    	"spawnDelay": 150,
	    	"enemyToughness":1,
	    	"score":0,
	    	"lives":3
	    };
	    //placeholder, good luck lol
	    lv3 = {
	    	"level":3,
	    	"bgm":"gunsBGM",
	    	"makeEnemy%": 0.7,
	    	"Enemy Type 1": "meteors",
	    	"Enemy Type 2":"meteors",
	    	"spawnDelay": 20,
	    	"enemyToughness":0,
	    	"score":0,
	    	"lives":3
	    };
		Level1 = createButton("Level 1", 10, game.world.width*0.4, game.world.height*0.4, 
								140, 30, function(){
									levelSettings = lv1;
									game.state.start('Game');
									});
		Level2 = createButton("Level 2", 10, game.world.width*0.6, game.world.height*0.55, 
								140, 30, function(){
									levelSettings = lv2;
									game.state.start('Game');
									});
		Level3 = createButton("Level 3", 10, game.world.width*0.4, game.world.height*0.7, 
								140, 30, function(){
									levelSettings = lv2;
									game.state.start('Game');
									});

		returnButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.9, 
						160, 30, function(){game.state.start('MainMenu')});
	}
}