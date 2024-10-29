import { gamesDB } from '../data/gamesDB'
import { attack } from './attack'

export const getRandomAttackCoords = (enemy: any): any => {
  const fieldIds = new Array(100).fill(null).map((_, idx) => idx)

  let idx = Math.round(Math.random() * (fieldIds.length - 1))
  let y = Math.floor(fieldIds[idx] / 10)
  let x = fieldIds[idx] - y * 10
  fieldIds.splice(idx, 1)

  while (gamesDB.playerHasHit(enemy, x, y) && fieldIds.length) {
    idx = Math.round(Math.random() * (fieldIds.length - 1))
    y = Math.floor(fieldIds[idx] / 10)
    x = fieldIds[idx] - y * 10
    fieldIds.splice(idx, 1)
  }

  return { x, y };
}

export const randomAttack = (data: any) => {
  const { gameId, indexPlayer } = data as unknown as any
  const { index } = gamesDB.getCurrentPlayer(gameId)!

  if (indexPlayer !== index) return;

  const { enemy } = gamesDB.getGamePlayers(gameId)
  const { x, y } = getRandomAttackCoords(enemy)

  attack({ gameId, indexPlayer, x, y })
}
