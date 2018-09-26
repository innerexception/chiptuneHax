import Phaser from 'phaser'

export default {
  type: Phaser.AUTO,
  parent: 'content',
  backgroundColor: '#000',
  width: 800,
  height: 600,
  localStorageName: 'phaseres6webpack'
}

export const icons = [
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