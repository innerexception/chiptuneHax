/* globals __DEV__ */
import Phaser from 'phaser'
import {levels, audio} from '../config'

export default class extends Phaser.Scene {
    constructor () {
        super({ key: 'GameScene' })
    }
    init () {}
    preload () {}
  
    create () {

        this.level = {...levels[0]}
        this.timeSecs = this.level.time
        this.matched = []
        this.background = this.add.image(400,0,'background')
        this.background.scaleX=2
        this.background.scaleY=2

        this.sounds = {}
        audio.forEach((audio) => this.sounds[audio.name] = this.sound.add(audio.name))
        this.sounds.bass_1.play({loop: true})
        // TODO: loops play out of sync, mp3 export of wav file changes the duration
        // this.sounds.rhythm_1.play({loop: true, delay: this.sounds.bass_1.duration*2})
        // this.sounds[1].play({loop: true, delay: this.sounds[0].duration})

        this.icons = this.level.icons.map((icon)=>this.createIcon(icon))
        this.timerTimeText = this.add.text(740, 30, '00', {
            font:'32px Bangers',
            fill: '#ff0000'
        }).setAlpha(0).setDepth(10)
        this.retryButton = this.add.image(400, 300, 'retry').setAlpha(0).setInteractive().setDepth(10)
        this.retryButton.scaleX=0.5
        this.retryButton.scaleY=0.5
        this.retryButton.on('pointerdown', this.onResetLevel)
        this.nextButton = this.add.image(400, 300, 'next').setAlpha(0).setInteractive().setDepth(10)
        this.nextButton.scaleX=0.3
        this.nextButton.scaleY=0.3
        this.nextButton.on('pointerdown', this.onLoadNextLevel)

        this.initNewGrid()

        this.playerColor = this.grid[0][0].getData('asset')
        this.particles = this.add.particles('sprites')
        this.emitters = {}
        this.level.icons.map((icon) => {
            this.createEmitter(icon.asset)
        })
        
        // this.mushroom = new Mushroom({
        //   scene: this,
        //   x: 400,
        //   y: 300,
        //   asset: 'mushroom'
        // })

        // this.add.existing(this.mushroom)
    }

    initNewGrid = () => {
        this.grid=new Array(this.level.width).fill().map((row, x) => {
            return new Array(this.level.height).fill().map((col, y) => {
                var sx = 140 + (x * (38*this.level.tileScale))
                var sy = 50 + (y * (38*this.level.tileScale)) //we use this y as the final position for the animation later
                let asset = getRandomAssetName(this.level)
                let image = this.add.image(sx, -10, 'sprites', asset+'Inactive')
                image.setData('y', sy);
                image.scaleX=this.level.tileScale
                image.scaleY=this.level.tileScale
                image.setData('asset', asset)
                return image
            })
        })
        this.seedGrid()
    }
        

    revealGrid = () =>
    {
        this.tweens.add({
            targets: this.grid[0][0],
            scaleX: '+=0.2',
            scaleY: '+=0.2',
            ease: 'Sine.easeInOut',
            duration: 900,
            yoyo: true,
            repeat: -1
        });

        this.tweens.add({
            targets: this.background,
            y: 300,
            ease: 'Power3'
        });

        var i = 800;

        for (var y = this.level.height-1; y >= 0; y--)
        {
            for (var x = 0; x < this.level.width; x++)
            {
                var block = this.grid[x][y];

                this.tweens.add({

                    targets: block,

                    y: block.getData('y'),

                    ease: 'Power3',
                    duration: 800,
                    delay: i

                });

                i += 20;
            }
        }

        i -= 1000;

        //  Icons
        this.icons.forEach((icon) => {
            this.tweens.add({
                targets: [ icon ],
                x: icon.x,
                ease: 'Power3',
                delay: i
            });
        })
        
        //  Text

        this.tweens.add({
            targets: [ this.timerTimeText ],
            alpha: 1,
            ease: 'Power3',
            delay: i
        });

        i += 500;

        this.tweens.addCounter({
            from: 0,
            to: this.level.time,
            ease: 'Power1',
            onUpdate: function (tween, targets, text)
    {
                text.setText(Phaser.Utils.String.Pad(tween.getValue().toFixed(), 2, '0', 1));
            },
            onUpdateParams: [ this.timerTimeText ],
            delay: i
        });

        this.grid[0][0].setFrame(this.grid[0][0].getData('asset')+'Active')

        this.time.delayedCall(i+1000, ()=> {this.timer = this.time.addEvent({ delay: 1000, repeat: this.timeSecs, callback: this.onTick })}, [], this);
    }

    onIconOver = (gameObject) =>{
        gameObject.tween = this.tweens.add({
        targets: gameObject,
        scaleX: '+=0.2',
        scaleY: '+=0.2',
        ease: 'Sine.easeInOut',
        duration: 50,
        })
    }

    onIconOut = (gameObject) =>{
        //Do a thing when mouse is over gameObject
        if (gameObject.tween != undefined){
          gameObject.tween.stop(0);
          gameObject.tween = this.tweens.add({
            targets: gameObject,
            scaleX: '1',
            scaleY: '1',
            duration: 1,
          })
        }
    }

    onIconDown = (gameObject) =>
    {
        if (!this.allowClick)
        {
            return;
        }

        var icon = gameObject;

        var clickedAsset = icon.getData('asset');

        //  Clicked color must not match the current 0,0 color
        if (clickedAsset === this.currentColor)
        {
            return;
        }

        var originAsset = this.grid[0][0].getData('asset');

        if (originAsset !== clickedAsset)
        {
            this.currentColor = clickedAsset;

            this.matched = [];

            this.performHack(originAsset, clickedAsset, 0, 0);

            if (this.matched.length > 0)
            {
                this.resolveHack();
            }
        }
    }

    createEmitter= (asset) =>
    {
        this.emitters[asset] = this.particles.createEmitter({
            frame: asset+'Active',
            lifespan: 1000,
            speed: { min: 300, max: 400 },
            alpha: { start: 1, end: 0 },
            scale: { start: 0.5, end: 0 },
            rotate: { start: 0, end: 360, ease: 'Power2' },
            blendMode: 'ADD',
            on: false
        });
    }

    seedGrid = () => {
        for (var i = 0; i < 8; i++)
        {
            var x = Phaser.Math.Between(2, this.level.width-1)
            var y = Phaser.Math.Between(2, this.level.height-1)
            this.performHack(this.grid[x][y].getData('asset'), getRandomAssetName(this.level), x, y)
        }
        this.matched.forEach((match) => {
            match.setFrame(match.getData('asset')+'Inactive')
        })
        this.matched = []
        this.performHack(this.grid[0][0].getData('asset'), this.grid[0][0].getData('asset'), 0, 0)
        this.matched.forEach((match) => {
            match.setFrame(match.getData('asset')+'Active')
        })
        this.revealGrid()
        this.allowClick = true
    }

    performHack = (originAsset, targetAsset, x, y) =>
    {
        const block = this.grid[x][y]
        const currentBlockAsset = block.getData('asset');

        if((currentBlockAsset !== originAsset && currentBlockAsset !== targetAsset) || this.matched.indexOf(block) !== -1){
            return
        } 

        this.sounds.hack_click.play()

        this.matched.push(block);
        
        //Want to make all blocks that match the origin texture into the target texture
        block.setData('asset', targetAsset)
        if (x > 0)
        {
            this.performHack(originAsset, targetAsset, x - 1, y);
        }

        if (x < this.level.width-1)
        {
            this.performHack(originAsset, targetAsset, x + 1, y);
        }

        if (y > 0)
        {
            this.performHack(originAsset, targetAsset, x, y - 1);
        }

        if (y < this.level.height-1)
        {
            this.performHack(originAsset, targetAsset, x, y + 1);
        }
        return
        
    }

    resolveHack = () =>
    {
        //Want to fire emitters in a nice order
        this.matched.sort((a, b) => {

            var aDistance = Phaser.Math.Distance.Between(a.x, a.y, 166, 66);
            var bDistance = Phaser.Math.Distance.Between(b.x, b.y, 166, 66);

            return aDistance - bDistance;

        });

        //  Swap the sprites

        var t = 0;
        var inc = (this.matched.length > 98) ? 6 : 12;

        this.allowClick = false;

        this.matched.forEach((block) => {
          var asset = block.getData('asset');

          var emitter = this.emitters[asset];

          this.time.delayedCall(t, (block, newAsset, emitter) => {

              block.setFrame(newAsset+'Active');

              emitter.explode(6, block.x, block.y);
              
          }, [ block, asset, emitter ]);

          t += inc;
        })
        this.allowClick = true
    }

    checkWon= () =>
    {
        var topLeft = this.grid[0][0].getData('asset');

        for (var x = 0; x < this.level.width; x++)
        {
            for (var y = 0; y < this.level.height; y++)
            {
                if (this.grid[x][y].getData('asset') !== topLeft)
                {
                    return false;
                }
            }
        }

        return true;
    }

    gameWon= () =>
    {
        this.exploding = true
        this.time.delayedCall(2000, this.boom, [], this);
        this.tweens.add({
            targets: [ this.nextButton ],
            alpha: 1,
            ease: 'Power3',
            delay: 1000
        });
    }

    onLoadNextLevel = () => {
        
        this.time.delayedCall(this.clearGrid(), ()=>{
            this.grid.forEach((row) => {
                row.forEach((block) => {
                    block.destroy()
                })
            })
            this.level = {...levels[this.level.levelNumber+1]}
            this.initNewGrid()
            this.nextButton.setAlpha(0)
            this.timeSecs = this.level.time
        }, [], this)
    }

    gameLost= () =>
    {
        this.exploding = true
        this.time.delayedCall(2000, this.boom, [], this)
        this.tweens.add({
            targets: [ this.retryButton ],
            alpha: 1,
            ease: 'Power3',
            delay: 1000
        });
    }

    onResetLevel = () => {
        this.time.delayedCall(this.clearGrid(), ()=>{
            this.grid.forEach((row) => {
                row.forEach((block) => {
                    block.destroy()
                })
            })
            this.initNewGrid()
            this.retryButton.setAlpha(0)
            this.timeSecs = this.level.time
        }, [], this)
    }

    clearGrid = () => {
        this.exploding = false
        this.matched = []
        let i=10
        this.grid.forEach((row) => {
            row.forEach((block) => {
                this.tweens.add({
                    targets: block,

                    scaleX: 0,
                    scaleY: 0,

                    ease: 'Power3',
                    duration: 800,
                    delay: i
                });
                i += 10;
            })
        })
        return i;
    }

    boom=() =>
    {
        var color = Phaser.Math.RND.pick(this.level.icons).asset;

        this.emitters[color].explode(8, Phaser.Math.Between(128, 672), Phaser.Math.Between(28, 572))

        color = Phaser.Math.RND.pick(this.level.icons).asset;

        this.emitters[color].explode(8, Phaser.Math.Between(128, 672), Phaser.Math.Between(28, 572))

        if(this.exploding) this.time.delayedCall(100, this.boom, [], this);
    }

    onTick = () => {
        if (this.checkWon())
        {
            this.timer.paused=true
            this.gameWon();
        }
        else if (this.timeSecs <= 0)
        {
            this.timer.paused=true
            this.gameLost();
        }
        this.timerTimeText.setText(this.timeSecs)
        this.timeSecs--
    }

    createIcon = ({asset, x, y}) => {
        const icon = this.add.image(x, y, 'sprites', asset+'Active')
                                            .setOrigin(0.5)
                                            .setInteractive()
                                            .setData('asset', asset)
        icon.on('pointerdown', ()=>this.onIconDown(icon))
            .on('pointerout', ()=>this.onIconOut(icon))
            .on('pointerover', ()=>this.onIconOver(icon))
        return icon
    }
}

const getRandomAssetName = (level) => {
  return level.icons[Phaser.Math.Between(0,3)].asset;
}