import { randomUUID } from 'node:crypto'
import { MsgType } from './playersDB' 

export class Rooms {
  private rooms: any[]

  constructor () {
    this.rooms = []
  }

  createRoom (player: any) {
    const playerHasRoom = this.rooms.some(
      ({ roomUsers }) => roomUsers.some(({ index }: any) => index === player.index)
    )
    if (playerHasRoom) { return false }
    const room: any = {
      roomId: randomUUID(),
      roomUsers: [],
    }

    this.rooms.push(room)
    return room
  }

  addRoomUser (roomId: string | number, player: any) {
    const room = this.rooms.find(room => room.roomId === roomId)
    if (!room ||
      room.roomUsers.length === 2 ||
      room.roomUsers.some(({ index }: any) => index === player.index)
    ) {
      return false
    }

    room.roomUsers.push(player)
    return room
  }

  getUpdateRoomData (): any {
    return {
      type: MsgType.UpdateRoom,
      data: this.rooms
        .filter(({ roomUsers }) => roomUsers.length < 2)
        .map(({ roomId, roomUsers }) => ({
          roomId,
          roomUsers: roomUsers.map(({ name, index }: any) => ({ name, index }))
        })) as any
    }
  }

  closeRoom (roomId: string | number) {
    const index = this.rooms.findIndex(room => room.roomId === roomId)
    this.rooms.splice(index, 1)
  }

  closeRoomsWithPlayer (player: any) {
    const rooms = this.rooms.filter(({ roomUsers }) => roomUsers.some(({ index }: any) => index === player.index))
    rooms.forEach(room => {
      this.closeRoom(room.roomId)
    })
  }
}

export const roomsDB = new Rooms()
