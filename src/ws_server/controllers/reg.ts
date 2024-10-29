import { playersDB } from '../data/playersDB';
import { roomsDB } from '../data/roomsDB';
import { connectionsDB } from '../data/connectionsDB';

export enum ResponseDataMessage {
  InvalidCredentials = 'Invalid name or password',
  InvalidPassword = 'Invalid password',
  PlayerExists = 'Player already exists',
}

export const reg = (data: any, connectionId: any) => {
  const {
    name,
    password
  } = data as unknown as any

  if (!playersDB.validateCredentials(name, password)) {
    connectionsDB.sendData(
      playersDB.getInvalidPlayerData(name, ResponseDataMessage.InvalidCredentials),
      connectionId
    )
    return
  }

  if (connectionsDB.getConnectionByPlayerName(name)) {
    connectionsDB.sendData(
      playersDB.getInvalidPlayerData(name, ResponseDataMessage.PlayerExists),
      connectionId
    )
    return
  }

  const player = playersDB.usePlayer(name, password, connectionId)
  if (!player.error) connectionsDB.addConnectionPlayer(connectionId, player);

  connectionsDB.sendData(
    playersDB.getPlayerData(player),
    player.connectionId,
  )
  connectionsDB.sendData(roomsDB.getUpdateRoomData());
  connectionsDB.sendData( playersDB.getWinners());
}
