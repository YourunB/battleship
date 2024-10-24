import { roomsDB } from "../data/roomsDB"
import { connectionsDB } from "../data/connectionsDB"

export const createRoom = (connectionId: any) => {
  const player = connectionsDB.getConnection(connectionId)!.player!
  const room = roomsDB.createRoom(player)
  
  if (!room) return;

  roomsDB.addRoomUser(room.roomId, player)

  connectionsDB.sendData(
    roomsDB.getUpdateRoomData()
  )
}
