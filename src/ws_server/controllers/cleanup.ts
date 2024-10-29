import { MsgType } from '../data/playersDB'
import { gamesDB } from '../data/gamesDB'
import { connectionsDB } from '../data/connectionsDB'
import { playersDB } from '../data/playersDB'
import { roomsDB } from '../data/roomsDB'

export const cleanup = (connectionId: any, closeCode: number) => {
  const user = connectionsDB.getConnection(connectionId)?.player! as any
  if (!user) return;

  const game = gamesDB.getGameByPlayer(user.index!)

  if (game) {
    if (closeCode === 1001) {
      const opponent = game.players.find(({ index }: any) => index !== user.index)!
      playersDB.setPlayerWin(opponent.index)
      connectionsDB.sendData(
        { type: MsgType.Finish, data: { winPlayer: opponent.index } },
        opponent.connectionId,
      )
      connectionsDB.sendData(playersDB.getWinners());
    }

    gamesDB.closeGame(game.gameId);
  }

  roomsDB.closeRoomsWithPlayer(user);
  connectionsDB.removeConnection(connectionId);
  playersDB.terminateConnection(connectionId);
  connectionsDB.sendData(roomsDB.getUpdateRoomData());
}
