import { roomsDB } from "../data/roomsDB"
import { connectionsDB } from "../data/connectionsDB"
import { gamesDB } from "../data/gamesDB"

export const addUserToRoom = (data: any, connectionId: any) => {
  const { indexRoom } = data as unknown as any
  const player = connectionsDB.getConnection(connectionId)?.player

  if (!player) return;
  const room = roomsDB.addRoomUser(indexRoom, player)
  if (!room) return;
  if (room.roomUsers.length < 2) return;

  const game = gamesDB.createGame(room.roomId)
  gamesDB.setGamePlayers(game.gameId, room.roomUsers)
  roomsDB.closeRoomsWithPlayer(player)
  connectionsDB.sendData(roomsDB.getUpdateRoomData());

  gamesDB.getGameData(game.gameId)
    .map(({ type, data, connectionId }: any) => {
      connectionsDB.sendData({ type, data }, connectionId)
    })
}
