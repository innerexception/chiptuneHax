/* globals __DEV__ */
import Phaser from 'phaser'
import {icons, gridWidth, gridHeight} from '../config'

export default class extends Phaser.Scene {
    constructor () {
        super({ key: 'GameScene' })
    }
    init () {}
    preload () {}
  
    create () {

        this.background = this.add.image(400,0,'background')
        this.background.scaleX=2
        this.background.scaleY=2

        this.icons = icons.map((icon)=>this.createIcon(icon))

        this.grid = new Array(gridWidth).fill().map((row, x) => {
            return new Array(gridHeight).fill().map((col, y) => {
                var sx = 140 + (x * 38)
                var sy = 50 + (y * 38) //we use this y as the final position for the animation later
                let asset = getRandomAssetName()
                let image = this.add.image(sx, 0, 'sprites', asset+'Inactive')
                image.setData('y', sy);
                image.setData('asset', asset)
                return image
            })
        })
        this.matched = []

        this.seedGrid()

        this.playerColor = this.grid[0][0].getData('asset');
        this.particles = this.add.particles('sprites');
        this.emitters = {}
        icons.map((icon) => {
            this.createEmitter(icon.asset)
        })

        this.moves = 20
        this.revealGrid()
        this.allowClick = true

        // this.mushroom = new Mushroom({
        //   scene: this,
        //   x: 400,
        //   y: 300,
        //   asset: 'mushroom'
        // })

        // this.add.existing(this.mushroom)
        // this.add.text(100, 100, 'Phaser 3 - ES6 - Webpack ', {
        //   font: '64px Bangers',
        //   fill: '#7744ff'
        // })
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

        for (var y = gridWidth-1; y >= 0; y--)
        {
            for (var x = 0; x < gridHeight; x++)
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

        // this.tweens.add({
        //     targets: [ this.text1, this.text2 ],
        //     alpha: 1,
        //     ease: 'Power3',
        //     delay: i
        // });

        // i += 500;

        // var movesTween = this.tweens.addCounter({
        //     from: 0,
        //     to: 25,
        //     ease: 'Power1',
        //     onUpdate: function (tween, targets, text)
        //     {
        //         text.setText(Phaser.Utils.String.Pad(tween.getValue().toFixed(), 2, '0', 1));
        //     },
        //     onUpdateParams: [ this.text2 ],
        //     delay: i
        // });

        // i += 500;

        this.tweens.add({
            targets: [ this.arrow ],
            alpha: 1,
            ease: 'Power3',
            delay: i
        });

        this.grid[0][0].setFrame(this.grid[0][0].getData('asset')+'Active')

        this.time.delayedCall(i, this.startInputEvents, [], this);
    }

    startInputEvents= () => 
    {
        // this.input.on('gameobjectover', this.onIconOver, this);
        // this.input.on('gameobjectout', this.onIconOut, this);
        this.input.on('gameobjectdown', this.onIconDown, this);

        // this.input.keyboard.on('keydown_X', function () {

        //     this.moves--;
        //     this.text2.setText(Phaser.Utils.String.Pad(this.moves, 2, '0', 1));

        // }, this);
    }

    stopInputEvents= () =>
    {
        // this.input.off('gameobjectover', this.onIconOver);
        // this.input.off('gameobjectout', this.onIconOut);
        this.input.off('gameobjectdown', this.onIconDown);
    }

    onIconOver = (pointer, gameObject) =>{
        //Do a thing when mouse is over gameObject

    }

    onIconDown = (pointer, gameObject) =>
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

            this.moves--;

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
            var x = Phaser.Math.Between(0, gridWidth-1)
            var y = Phaser.Math.Between(0, gridHeight-1)
            this.performHack(this.grid[x][y].getData('asset'), getRandomAssetName(), x, y)
        }
        this.matched.forEach((match) => {
            match.setFrame(match.getData('asset')+'Inactive')
        })
    }

    performHack = (originAsset, targetAsset, x, y) =>
    {
        const block = this.grid[x][y]
        const currentBlockAsset = block.getData('asset');

        if(currentBlockAsset !== originAsset || originAsset === targetAsset){
            if(originAsset === targetAsset){
                if (this.matched.indexOf(block) === -1)
                {
                    this.matched.push(block);
                }
            }
            return
        } 

        if (this.matched.indexOf(block) === -1)
        {
            this.matched.push(block);
        }

        //Want to make all blocks that match the origin texture into the target texture
        block.setData('asset', targetAsset)
        if (x > 0)
        {
            this.performHack(originAsset, targetAsset, x - 1, y);
        }

        if (x < gridWidth-1)
        {
            this.performHack(originAsset, targetAsset, x + 1, y);
        }

        if (y > 0)
        {
            this.performHack(originAsset, targetAsset, x, y - 1);
        }

        if (y < gridHeight-1)
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

        this.time.delayedCall(t, () => {

            this.allowClick = true;

            if (this.checkWon())
            {
                this.gameWon();
            }
            else if (this.moves === 0)
            {
                this.gameLost();
            }

        }, [], this);
    }

    checkWon= () =>
    {
        var topLeft = this.grid[0][0].getData('asset');

        for (var x = 0; x < 14; x++)
        {
            for (var y = 0; y < 14; y++)
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
        this.stopInputEvents();
        this.time.delayedCall(2000, this.boom, [], this);
    }
    gameLost= () =>
    {
        this.stopInputEvents();
        this.time.delayedCall(2000, this.boom, [], this);
    }

    boom=() =>
    {
        var color = Phaser.Math.RND.pick(icons).asset;

        this.emitters[color].explode(8, Phaser.Math.Between(128, 672), Phaser.Math.Between(28, 572))

        color = Phaser.Math.RND.pick(icons).asset;

        this.emitters[color].explode(8, Phaser.Math.Between(128, 672), Phaser.Math.Between(28, 572))

        this.time.delayedCall(100, this.boom, [], this);
    }

  createIcon = ({asset, x, y}) => this.add.image(x, y, 'sprites', asset+'Active').setOrigin(0).setInteractive().setData('asset', asset);
}

const getRandomAssetName = () => {
  return icons[Phaser.Math.Between(0,3)].asset;
}