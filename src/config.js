import Phaser from 'phaser'

export default {
  type: Phaser.AUTO,
  parent: 'content',
  backgroundColor: '#000',
  width: 800,
  height: 600,
  localStorageName: 'phaseres6webpack'
}

const easyIcons = [
  {
    asset: 'orange',
    x:56,
    y:53
  },
  {
    asset: 'pink',
    x:716,
    y:53
  },
  {
    asset: 'blue',
    x:56,
    y:546
  },
  {
    asset: 'black',
    x:716,
    y:546
  }
]

export const gridHeight = 14
export const gridWidth = 14

export const images = [
  {name:'loaderBg', path: './res/images/loader-bg.png'},
  {name:'loaderBar', path: './res/images/loader-bar.png'},
  {name:'background', path: './res/images/cyberpunk-street.png'},
  {name: 'retry', path:'./res/images/retry.png'},
  {name: 'next', path:'./res/images/next.jpg'}
]

export const audio = [
  {name: 'bass_1', paths: ['./res/sound/bass_1.mp3', './res/sound/bass_1.ogg']},
  {name: 'precussion_1', paths: ['./res/sound/precussion_1.mp3', './res/sound/precussion_1.ogg']},
  {name: 'rhythm_1', paths: ['./res/sound/rhythm_1.mp3', './res/sound/rhythm_1.ogg']},
  {name: 'hack_click', paths: ['./res/sound/hack_click.mp3', './res/sound/hack_click.ogg']},
]

export const levels = [
  {
    width: 14,
    height: 14,
    tileScale: 1, 
    time: 45,
    icons: easyIcons,
    levelNumber:0
  },
  {
    width: 20,
    height: 12,
    tileScale: 0.8, 
    time: 30,
    icons: easyIcons,
    levelNumber:1
  },
  {
    width: 10,
    height: 20,
    tileScale: 0.7, 
    time: 20,
    icons: easyIcons,
    levelNumber:2
  },
  {
    width: 30,
    height: 30,
    tileScale: 0.5, 
    time: 20,
    icons: easyIcons,
    levelNumber:2
  }
]