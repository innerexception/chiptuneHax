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

    this.matched.forEach((match) => {
      let asset = match.getData('newAsset')+'Active';
      match.setFrame(asset);
      match.setData('asset', asset)
    })

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

      for (var y = 13; y >= 0; y--)
      {
          for (var x = 0; x < 14; x++)
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

    onIconDown = (pointer, gameObject) =>
    {
        if (!this.allowClick)
        {
            return;
        }

        var icon = gameObject;

        var asset = icon.getData('asset');

        //  Valid color?
        if (asset === this.currentColor)
        {
            return;
        }

        var oldAsset = this.grid[0][0].getData('asset');

        if (oldAsset !== asset)
        {
            this.currentColor = asset;

            this.matched = [];

            this.moves--;

            this.performHack(oldAsset, asset, 0, 0);

            if (this.matched.length > 0)
            {
                this.resolveHack();
            }
        }
    }

  createEmitter= (asset) =>
  {
      this.emitters[asset] = this.particles.createEmitter({
          frame: asset,
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
        var x = Phaser.Math.Between(0, 13)
        var y = Phaser.Math.Between(0, 13)

        var oldAsset = this.grid[x][y].getData('asset')
        var newAsset = getRandomAssetName()

        this.performHack(oldAsset, newAsset, x, y)
    }
  }

  performHack = (oldAsset, newAsset, x, y) =>
    {
        if (oldAsset === newAsset || this.grid[x][y].getData('asset') !== oldAsset)
        {
            return;
        }

        this.grid[x][y].setData('newAsset', newAsset)

        if (this.matched.indexOf(this.grid[x][y]) === -1)
        {
            this.matched.push(this.grid[x][y])
        }
        else return;

        if (x > 0)
        {
            this.performHack(oldAsset, newAsset, x - 1, y);
        }

        if (x < 13)
        {
            this.performHack(oldAsset, newAsset, x + 1, y);
        }

        if (y > 0)
        {
            this.performHack(oldAsset, newAsset, x, y - 1);
        }

        if (y < 13)
        {
            this.performHack(oldAsset, newAsset, x, y + 1);
        }
    }

    resolveHack = () =>
    {
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
          var newAsset = block.getData('newAsset');
          var asset = block.getData('asset');

          var emitter = this.emitters[asset];

          this.time.delayedCall(t, function (block, newAsset) {

              block.setFrame(newAsset);

              emitter.explode(6, block.x, block.y);
              
          }, [ block, newAsset, emitter ]);

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

  createIcon = ({asset, x, y}) => this.add.image(x, y, 'sprites', asset+'Active').setOrigin(0).setInteractive().setData('asset', asset);
}

const getRandomAssetName = () => {
  return icons[Phaser.Math.Between(0,3)].asset;
}