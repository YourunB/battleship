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

  const start = gamesDB.getStartGameData(gameId);
  start.forEach(({ type, data, connectionId }: any) => connectionsDB.sendData({ type, data }, connectionId));

  const turn = gamesDB.getTurnData(gameId);
  turn.forEach(({ type, data, connectionId }: any) => connectionsDB.sendData({ type, data }, connectionId));
}
