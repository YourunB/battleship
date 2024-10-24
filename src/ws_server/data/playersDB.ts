import { randomUUID } from 'node:crypto'

enum ResponseDataMessage {
  InvalidCredentials = 'Invalid name or password',
  InvalidPassword = 'Invalid password',
  PlayerExists = 'Player already exists',
}

export enum MsgType {
  Reg = 'reg',
  AddUserToRoom = 'add_user_to_room',
  AddShips = 'add_ships',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
  Turn = 'turn',
  SinglePlay = 'single_play',
  StartGame = 'start_game',
  Finish = 'finish',
  UpdateWinners = 'update_winners',
  UpdateRoom = 'update_room',
  CreateRoom = 'create_room',
  CreateGame = 'create_game',
}

enum PlayerType {
  Player = 'player',
  Bot = 'bot',
}

type Player = {
  connectionId?: number | string
  index: number | string
  name: string
  password: string
  error: boolean
  errorText: string
  wins: number
  type: PlayerType
}

export class Players {
  private players: any[]

  constructor () {
    this.players = []
  }

  createPlayer (type: any, connectionId: number | string, name?: string, password?: string): any {
    return {
      connectionId,
      index: randomUUID(),
      name: name || '',
      password: password || '',
      error: false,
      errorText: '',
      wins: 0,
      type,
    }
  }

  terminateConnection (connectionId: number | string) {
    const player = this.players.find(player => player.connectionId === connectionId)
    if (player) {
      player.connectionId = undefined
    }
  }

  validateCredentials (name: string, password: string) {
    return Boolean(
      name && typeof name === 'string' &&
      password && typeof password === 'string'
    )
  }

  usePlayer (name: string, password: string, connectionId: number | string): any {
    const player = this.players.find(player => player.name === name)
    return player
      ? this.logInPlayer(player, password, connectionId)
      : this.registerPlayer(name, password, connectionId)
  }

  registerPlayer (name: string, password: string, connectionId: number | string): any {
    const player = this.createPlayer(PlayerType.Player, connectionId, name, password)
    this.players.push(player)
    return player
  }

  logInPlayer (player: Player, password: string, connectionId: number | string): Player {
    if (player.password === password) {
      player.error = false
      player.errorText = ''
      player.connectionId = connectionId
    } else {
      player.error = true
      player.errorText = ResponseDataMessage.InvalidPassword
    }
    return player
  }

  setPlayerWin (index: number | string) {
    const player = this.players.find(player => player.index === index)
    if (player) {
      player.wins += 1
    }
  }

  getPlayerData (player: Player): any {
    const { index, name, error, errorText } = player
    return {
      type: MsgType.Reg,
      data: { index, name, error, errorText }
    }
  }

  getWinners (): any {
    return {
      type: MsgType.UpdateWinners,
      data: this.players
        .filter(({ wins }) => wins > 0)
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 10)
        .map(({ name, wins }) => ({ name, wins }))
    }
  }

  getInvalidPlayerData (name: string, reason: ResponseDataMessage): any {
    return {
      type: MsgType.Reg,
      data: { name, index: -1, error: true, errorText: reason },
    }
  }
}

export const playersDB = new Players()
