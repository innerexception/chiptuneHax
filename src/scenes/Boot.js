import Phaser from 'phaser'
import WebFont from 'webfontloader'
import { images, audio } from '../config'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {
    // this.fontsReady = false
    this.add.text(100, 100, 'loading fonts...')

    images.forEach((image) => {
        this.load.image(image.name, image.path)
    })

    this.load.atlas('sprites', 
        'res/images/sprites.png',
        'res/images/sprites.json'
    )

    audio.forEach((audio) => {
      this.load.audio(audio.name, audio.paths)
    })
    
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
