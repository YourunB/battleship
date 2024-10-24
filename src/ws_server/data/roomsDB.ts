import { randomUUID } from 'node:crypto'

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
}

export const roomsDB = new Rooms()
