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
    x:40,
    y:37
  },
  {
    asset: 'pink',
    x:700,
    y:37
  },
  {
    asset: 'blue',
    x:40,
    y:530
  },
  {
    asset: 'black',
    x:700,
    y:530
  }
]

export const gridHeight = 14
export const gridWidth = 14