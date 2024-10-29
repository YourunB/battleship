import { connectionsDB } from '../data/connectionsDB';
import { gamesDB } from '../data/gamesDB';

export const addShips = (data: any) => {
  const {
    gameId,
    indexPlayer,
    ships
  } = data as unknown as any

  gamesDB.addPlayerShips(gameId, indexPlayer, ships)
  if (!gamesDB.canStartGame(gameId)) return;

  gamesDB.getStartGameData(gameId).forEach(({ type, data, connectionId }: any) => {
    connectionsDB.sendData({ type, data }, connectionId)
  })
  gamesDB.getTurnData(gameId).forEach(({ type, data, connectionId }: any) => {
    connectionsDB.sendData({ type, data }, connectionId)
  })
}
