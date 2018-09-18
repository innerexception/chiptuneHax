import Phaser from 'phaser'
import WebFont from 'webfontloader'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {
    // this.fontsReady = false
    this.add.text(100, 100, 'loading fonts...')

    this.load.image('loaderBg', './res/images/loader-bg.png')
    this.load.image('loaderBar', './res/images/loader-bar.png')
    this.load.image('background', './res/images/cyberpunk-street.png')

    this.load.atlas('sprites', 
        'res/images/sprites.png',
        'res/images/sprites.json'
    );

    // WebFont.load({
    //   google: {
    //     families: ['Bangers']
    //   },
    //   active: this.fontsLoaded
    // })
  }

  update () {
    // if (this.fontsReady) {
      this.scene.start('GameScene')
    // }
  }

  fontsLoaded = () => {
    this.fontsReady = true
  }
}
