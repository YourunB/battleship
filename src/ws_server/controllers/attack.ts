import { randomAttack } from './randomAttack'
import { gamesDB } from '../data/gamesDB'
import { connectionsDB } from '../data/connectionsDB'
import { playersDB } from '../data/playersDB'

export enum PlayerType {
  Player = 'player',
  Bot = 'bot',
}
export const attack = (data: any) => {
  const {
    gameId,
    indexPlayer, 
    x,
    y
  } = data as unknown as any

  const { index } = gamesDB.getCurrentPlayer(gameId)!
  if (indexPlayer !== index) return;

  const attackResult = gamesDB.attack(gameId, x, y)
  attackResult.forEach(({ type, data, connectionId } : any) => {
    connectionsDB.sendData({ type, data }, connectionId);
  })

  if (gamesDB.isGameOver(gameId)) {
    gamesDB.getFinishGameData(gameId).forEach(({ type, data, connectionId }: any) => {
      connectionsDB.sendData({ type, data }, connectionId);
    })

    const winner = gamesDB.getCurrentPlayer(gameId)!
    playersDB.setPlayerWin(winner.index)
    gamesDB.closeGame(gameId)
    connectionsDB.sendData(playersDB.getWinners());
  } else {
    gamesDB.getTurnData(gameId).forEach(({ type, data, connectionId }: any) => {
      connectionsDB.sendData({ type, data }, connectionId)
    })

    const {player} = gamesDB.getGamePlayers(gameId)
    if (player.player.type !== PlayerType.Bot) return;

    setTimeout(() => {
      randomAttack({ gameId, indexPlayer: player.index })
    }, 1500)
  }
}
