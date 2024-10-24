import { randomUUID } from 'node:crypto'

enum MsgType {
  Reg = 'reg',
  CreateGame = 'create_game',
  CreateRoom = 'create_room',
  UpdateRoom = 'update_room',
  AddUserToRoom = 'add_user_to_room',
  AddShips = 'add_ships',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
  SinglePlay = 'single_play',
  StartGame = 'start_game',
  Turn = 'turn',
  Finish = 'finish',
  UpdateWinners = 'update_winners',
}

enum AttackStatus {
  Miss = 'miss',
  Killed = 'killed',
  Shot = 'shot',
}

enum PlayerType {
  Player = 'player',
  Bot = 'bot',
}


export class Games {
  private games: any[]

  constructor () {
    this.games = []
  }

  createGame (roomId: number, createId?: boolean) {
    const gameId = createId ? randomUUID() : roomId
    const game: any = {
      gameId,
      players: [],
      roomId: roomId,
      currentPlayerId: null,
    }
    this.games.push(game)
    return game
  }

  closeGame (gameId: string | number) {
    const index = this.games.findIndex(game => game.gameId === gameId)
    this.games.splice(index, 1)
  }

  getGame (gameId: string | number) {
    return this.games.find((game) => game.gameId === gameId)
  }

  getGameByPlayer (indexPlayer: string | number) {
    return this.games.find(({ players }) => players.some(({ index }: any) => index === indexPlayer))
  }

  getCurrentPlayer (gameId: string | number) {
    const game = this.getGame(gameId)!
    return game.players.find(({ index }: any) => index === game.currentPlayerId)?.player
  }

  getGamePlayers (gameId: string | number) {
    const game = this.getGame(gameId)!
    const player = game.players.find((player: any) => player.index === game.currentPlayerId)!
    const enemy = game.players.find((player: any) => player.index !== game.currentPlayerId)!
    return { player, enemy }
  }

  setGamePlayers (gameId: string | number, players: any[]) {
    const game = this.getGame(gameId)!
    const gamePlayers: any[] = players.map(player => ({
      player,
      connectionId: player.connectionId!,
      index: player.index,
      ships: [],
      hits: [],
    }))
    game.players.push(...gamePlayers)
  }

  addPlayerShips (gameId: string | number, indexPlayer: any, ships: any[]) {
    const game = this.getGame(gameId)!
    const player = game.players.find(({ index }: any) => index === indexPlayer)!
    player.ships = ships
  }

  canStartGame (gameId: string | number) {
    const game = this.getGame(gameId)!
    return game.players.every(({ ships }: any) => ships.length)
  }

  playerHasHit (player: any, x: number, y: number) {
    return player.hits.some((hit: any) => hit.x === x && hit.y === y)
  }

  getShipCoords (ship: any) {
    return new Array(ship.length).fill(null)
      .map((_, i) => ship.direction
        ? [ship.position.x, ship.position.y + i]
        : [ship.position.x + i, ship.position.y]
      )
  }

  getHitsAroundShip = (player: any, ship: any): any[] => {
    const shipCoords = this.getShipCoords(ship)
    const getHitsAround = (coords: number[][]) => {
      return coords
        .map(([x, y]) => {
          return [
            [x - 1, y - 1], [x - 1, y], [x - 1, y + 1],
            [x, y - 1], [x, y], [x, y + 1],
            [x + 1, y - 1], [x + 1, y], [x + 1, y + 1],
          ]
        })
        .flat()
        .filter(([x, y]) => x >= 0 && x <= 9 && y >= 0 && y <= 9)
        .filter(([x, y]) => !coords.some(([posX, posY]) => posX === x && posY === y))
    }

    const hits = getHitsAround(shipCoords)
    return hits
      .filter(([x, y]: any) => !this.playerHasHit(player, x, y))
      .map(([x, y]: any) => ({ x, y }))
  }

  isShipKilled = (player: any, ship: any) => {
    return this.getShipCoords(ship).every(([x, y]) => this.playerHasHit(player, x, y))
  }

  hitPlayerShip (player: any, x: number, y: number) {
    const ship = player.ships.find((ship: any) => {
      return this.getShipCoords(ship).some(([shipX, shipY]) => shipX === x && shipY === y)
    })

    if (!ship) {
      return { ship: null, status: AttackStatus.Miss }
    }

    const hasKilled = this.isShipKilled(player, ship)
    return { ship, status: hasKilled ? AttackStatus.Killed : AttackStatus.Shot }
  }

  attack (gameId: any, x: number, y: number) {
    const game = this.getGame(gameId)!
    const { player, enemy } = this.getGamePlayers(gameId)!

    const hasAlreadyHit = this.playerHasHit(enemy, x, y)

    if (hasAlreadyHit) {
      game.currentPlayerId = enemy.index
      const { status } = this.hitPlayerShip(enemy, x, y)

      return game.players
        .filter(({ player }: any) => player.type !== PlayerType.Bot)
        .map(({ connectionId }: any) => ({
          type: MsgType.Attack,
          data: {
            currentPlayer: player.index,
            position: { x, y },
            status: status === AttackStatus.Killed ? AttackStatus.Shot : AttackStatus.Miss,
          } as any,
          connectionId,
        }))
    }

    enemy.hits.push({ x, y })

    const { ship, status } = this.hitPlayerShip(enemy, x, y)

    const hitsAround = status === AttackStatus.Killed
      ? this.getHitsAroundShip(enemy, ship!)
      : []

    const hitsShipKilled = status === AttackStatus.Killed
      ? this.getShipCoords(ship!).filter(([shipX, shipY]) => shipX !== x || shipY !== y).map(([x, y]) => ({ x, y }))
      : []

    enemy.hits.push(...hitsAround)

    if (status === AttackStatus.Miss) {
      game.currentPlayerId = enemy.index
    }

    const hitResponse = game.players
      .filter(({ player }: any) => player.type !== PlayerType.Bot)
      .map(({ connectionId }: any) => ({
        type: MsgType.Attack,
        data: {
          currentPlayer: player.index,
          position: { x, y },
          status,
        } as any,
        connectionId,
      }))

    const hitsShipKilledResponse = hitsShipKilled.map(({ x, y }) => {
      return game.players
        .filter(({ player }: any) => player.type !== PlayerType.Bot)
        .map(({ connectionId }: any) => ({
          type: MsgType.Attack,
          data: {
            currentPlayer: player.index,
            position: { x, y },
            status: AttackStatus.Killed,
          } as any,
          connectionId,
        }))
    }).flat()

    const hitsAroundResponse = hitsAround.map(({ x, y }) => {
      return game.players
        .filter(({ player }: any) => player.type !== PlayerType.Bot)
        .map(({ connectionId }: any) => ({
          type: MsgType.Attack,
          data: {
            currentPlayer: player.index,
            position: { x, y },
            status: AttackStatus.Miss,
          } as any,
          connectionId,
        }))
    }).flat()

    return [...hitResponse, ...hitsShipKilledResponse, ...hitsAroundResponse]
  }

  isGameOver (gameId: string | number) {
    const { enemy } = this.getGamePlayers(gameId)!
    return enemy.ships.every((ship: any) => this.isShipKilled(enemy, ship))
  }

  getGameData (gameId: string | number) {
    const game = this.getGame(gameId)!
    return game.players
      .filter(({ player }: any) => player.type !== PlayerType.Bot)
      .map(({ connectionId, index }: any) => ({
        type: MsgType.CreateGame,
        data: {
          idGame: gameId,
          idPlayer: index,
        } as any,
        connectionId,
      }))
  }

  getStartGameData (gameId: string | number) {
    const game = this.getGame(gameId)!
    game.currentPlayerId = game.players[0].index
    return game.players
      .filter(({ player }: any) => player.type !== PlayerType.Bot)
      .map(({ connectionId, ships, index }: any) => ({
        type: MsgType.StartGame,
        data: {
          currentPlayerIndex: index,
          ships,
        } as any,
        connectionId,
      }))
  }

  getTurnData (gameId: string | number) {
    const game = this.getGame(gameId)!
    return game.players
      .filter(({ player }: any) => player.type !== PlayerType.Bot)
      .map(({ connectionId }: any) => ({
        type: MsgType.Turn,
        data: { currentPlayer: game.currentPlayerId } as any,
        connectionId,
      }))
  }

  getFinishGameData (gameId: string | number) {
    const game = this.getGame(gameId)!
    return game.players
      .filter(({ player }: any) => player.type !== PlayerType.Bot)
      .map(({ connectionId }: any) => ({
        type: MsgType.Finish,
        data: { winPlayer: game.currentPlayerId } as any,
        connectionId,
      }))
  }
}

export const gamesDB = new Games()
