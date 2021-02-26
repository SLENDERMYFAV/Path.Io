let GameState = {
    init: function () {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        this.scale.pageAlignHorizontally = true
        this.scale.pageAlignVertically = true
        this.game.physics.startSystem(Phaser.Physics.ARCADE)

        //Set the games background colour
        this.game.stage.backgroundColor = '#FFF'
        let myBitmap = this.game.add.bitmapData(this.game.width, this.game.height)
        bgColor = myBitmap.context.createLinearGradient(0, 0, 0, 500)
        this.generateGradients()
        myBitmap.context.fillStyle = bgColor
        myBitmap.context.fillRect(0, 0, this.game.width, this.game.height)

        let bitmapSprite = this.game.add.sprite(0, 0, myBitmap)
        bitmapSprite.alpha = 0
        this.game.add.tween(bitmapSprite).to({ alpha: 1 }, 1000).start()
    },
    preload: function () {
        this.load.image("arm", "assets/images/arm.png")
        this.load.image("target", "assets/images/target.png")
        this.load.image("ball", "assets/images/ball.png")
        this.load.image("gameover", "assets/images/gameover.png")
        this.load.bitmapFont("font", "assets/images/font.png", "assets/font/font.fnt")
        
    },
    create: function () {
        this.scorePoints()
        this.scoreText= this.game.add.bitmapText(game.width/2, game.height-90, "font", "SCORE: "+ this.score, 60)
        this.scoreText.anchor.setTo(0.5, 0.5)
        console.log(this.score)
        this.saveRotationSpeed = gameOptions.rotationSpeed
        this.rotationDirection= Phaser.Math.between(0, 1)
        this.targetArray= []
        this.steps= 0
        this.destroy = false

        this.gameGroup= this.add.group()
        this.ballGroup= this.game.add.group()
        this.targetGroup= this.game.add.group()
        this.gameGroup.add(this.targetGroup)
        this.gameGroup.add(this.ballGroup)
       
        this.arm = game.add.sprite(game.width/2, game.height/4*2.7, "arm")
        this.arm.anchor.setTo(0, 0.5)
        this.arm.tint= gameOptions.tintColor
        this.ballGroup.add(this.arm)

        this.balls= [this.game.add.sprite(game.width/2, game.height/4*2.7, "ball"),
        this.game.add.sprite(game.width/2, game.height/2, "ball")]

        this.balls[0].tint= gameOptions.tintColor
        this.balls[1].tint= gameOptions.tintColor
        this.balls[0].anchor.setTo(0.5)
        this.balls[1].anchor.setTo(0.5)
        this.ballGroup.add(this.balls[0])
        this.ballGroup.add(this.balls[1])

        this.rotationAngle= 0
        this.rotatingBall= 1

        let target= this.game.add.sprite(0, 0, "target")
        target.anchor.setTo(0.5, 0.5)
        target.x= this.balls[0].x
        target.y= this.balls[0].y
        this.targetGroup.add(target)
        this.targetArray.push(target)
        game.input.onDown.add(this.changeBall, this)
        for(let i= 0; i< gameOptions.visibleTargets; i++){
            this.addTarget()
        }
    },

    update: function () {
        let distanceFromTarget= this.balls[this.rotatingBall].position.distance(this.targetArray[1].position)
        if(distanceFromTarget > 90 && this.destroy && this.steps > gameOptions.visibleTargets){
            this.gameOver()
        }
        if(distanceFromTarget < 40 && !this.destroy){
            this.destroy= true
        }

        this.rotationAngle= (this.rotationAngle+this.saveRotationSpeed*(this.rotationDirection*2-1))%360
        this.arm.angle= this.rotationAngle+90
        this.balls[this.rotatingBall].x = this.balls[1 - this.rotatingBall].x - gameOptions.ballDistance * Math.sin(Phaser.Math.degToRad(this.rotationAngle))
        this.balls[this.rotatingBall].y = this.balls[1 - this.rotatingBall].y + gameOptions.ballDistance * Math.cos(Phaser.Math.degToRad(this.rotationAngle))
        let distanceX= this.balls[1-this.rotatingBall].worldPosition.x-game.width/2
        let distanceY= this.balls[1-this.rotatingBall].worldPosition.y-game.height/4*2.7
        this.gameGroup.x= Phaser.Math.linearInterpolation([this.gameGroup.x, this.gameGroup.x-distanceX], 0.05)
        this.gameGroup.y= Phaser.Math.linearInterpolation([this.gameGroup.y, this.gameGroup.y-distanceY], 0.05)
    },

    generateGradients: function () {
        let colorArr = [
            { top: "#334d50", bottom: "#cbcaa5" }, // 0
            { top: "#00d2ff", bottom: "#928dab" }, // 1
            { top: "#2193b0", bottom: "#6dd5ed" }, // 2
            { top: "#373B44", bottom: "#4286f4" }, // 3
            { top: "#000000", bottom: "#434343" }, // 4 
            { top: "#8E2DE2", bottom: "#4A00E0" }, // 5
            { top: "#00b09b", bottom: "#96c93d" }, // 6
            { top: "#3C3B3F", bottom: "#605C3C" }, // 7
            { top: "#360033", bottom: "#0b8793" }, // 8
            { top: "#654ea3", bottom: "#eaafc8" }, // 9
            { top: "#6190E8", bottom: "#A7BFE8" }, // 10
            { top: "#00c6ff", bottom: "#0072ff" }, // 11
            { top: "#7F00FF", bottom: "#E100FF" }, // 12
            { top: "#ad5389", bottom: "#3c1053" }, // 13
            { top: "#a8c0ff", bottom: "#3f2b96" }, // 14
            { top: "#36D1DC", bottom: "#5B86E5" }, // 15
            { top: "#20002c", bottom: "#cbb4d4" }, // 16
            { top: "#44A08D", bottom: "#093637" }, // 17
            { top: "#4568DC", bottom: "#B06AB3" }, // 18
            { top: "#E8CBC0", bottom: "#636FA4" }, // 19
            { top: "#DCE35B", bottom: "#45B649" }, // 20
        ]
        let index = colorArr[Phaser.Math.between(0, colorArr.length - 1)]
        this.color1 = index.top
        this.color2 = index.bottom
        bgColor.addColorStop(0, this.color1)
        bgColor.addColorStop(1, this.color2)
    },

    addTarget: function(){
        this.steps++
        startX= this.targetArray[this.targetArray.length-1].x
        startY= this.targetArray[this.targetArray.length-1].y
        let target= this.game.add.sprite(0, 0, "target")
        let randomAngle= Phaser.Math.between(gameOptions.angleRange[0]+90, gameOptions.angleRange[1]+90)
        target.anchor.setTo(0.5, 0.5)
        target.x= startX+gameOptions.ballDistance*Math.sin(Phaser.Math.degToRad(randomAngle))
        target.y= startY+gameOptions.ballDistance*Math.cos(Phaser.Math.degToRad(randomAngle))
        target.alpha= 1-this.targetArray.length*(1/7)
        let style= {font: 'bold 32px Arial', fill: "#"+gameOptions.tintColor.toString(), align: 'center'}
        let stepText= game.add.text(0, 0, this.steps.toString(), style)
        stepText.anchor.setTo(0.5, 0.5)
        target.addChild(stepText)
        this.targetGroup.add(target)
        this.targetArray.push(target)
    },

    changeBall: function(){
        this.destroy= false
        let distanceFromTarget= this.balls[this.rotatingBall].position.distance(this.targetArray[1].position)
        if(distanceFromTarget < 20){
            this.rotationDirection= Phaser.Math.between(0, 1)
            let destroyTween= this.game.add.tween(this.targetArray[0]).to({alpha: 0}, 500, Phaser.Easing.Cubic.In, true)
            destroyTween.onComplete.add(function(e){
                e.destroy()
            })
            this.targetArray.shift()
            this.arm.position= this.balls[this.rotatingBall].position
            this.rotatingBall= 1-this.rotatingBall
            this.rotationAngle= this.balls[1-this.rotatingBall].position.angle(this.balls[this.rotatingBall].position, true)-90
            this.arm.angle= this.rotationAngle+90
            for(let i= 0; i < this.targetArray.length; i++){
                this.targetArray[i].alpha+= 1/7
            }
            this.addTarget()
            this.score++
            console.log(this.score)
        }
        else{
            this.gameOver()
        }
        
    },

    gameOver: function () {
        this.saveRotationSpeed = 0
        this.arm.destroy()

        let gameOverTween = game.add.tween(this.balls[1 - this.rotatingBall]).to({ alpha: 0 }, 1000, Phaser.Easing.Cubic.Out, true)
        gameOverTween.onComplete.add(function () {
            this.gameover = this.game.add.sprite(game.width / 2, game.height / 2, "gameover")
            this.gameover.anchor.setTo(0.5, 0.5)
            this.gameover.alpha = 0.7
            this.gameover.inputEnabled = true
            this.gameover.events.onInputDown.add(this.restartGame, this)

            this.gameoverText = this.game.add.bitmapText(game.width / 2, game.height / 3, "font", "GAME OVER", 60)
            this.gameoverText.anchor.setTo(0.5, 0.5)

            this.restartText = this.game.add.bitmapText(game.width / 2, game.height / 2, "font", "TAP TO RESTART", 40)
            this.restartText.anchor.setTo(0.5, 0.5)

            game.world.bringToTop(this.gameover)
            game.world.bringToTop(this.gameoverText)
            game.world.bringToTop(this.restartText)
        }, this)
    },
    
    restartGame: function(){
        this.game.state.start("GameState")
    },

    scorePoints: function () {
        let localValue = localStorage.getItem(gameOptions.localStorageName)
        if (localValue === null || localValue === NaN) {
            localStorage.setItem(gameOptions.localStorageName, 0)
        }
        else {
            this.score = localStorage.getItem(gameOptions.localStorageName)
        }
    },
}

let gameOptions= {
    ballDistance: 150,
    rotationSpeed: 3,
    angleRange: [25, 165],
    visibleTargets: 10,
    tintColor: 0x000000,
    localStorageName: 'SCORE'
}

let game = new Phaser.Game(640, 960, Phaser.CANVAS)
game.state.add('GameState', GameState)
game.state.start('GameState')
