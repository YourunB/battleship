import WebSocket from 'ws'
import { IncomingMessage } from 'node:http'
import { cleanup } from './cleanup'
import { MsgType } from '../data/playersDB';
import { createRoom } from './createRoom'
import { reg } from './reg'
import { addUserToRoom } from './addUserToRoom'
import { addShips } from './addShips'
import { attack } from './attack'
import { randomAttack } from './randomAttack'
import { singlePlay } from './singlePlay'
import { parseRequestMsg } from '../helpers/parseRequest';
import { connectionsDB } from '../data/connectionsDB';

export const connectionHandler = (ws: WebSocket, request: IncomingMessage) => {
  console.log(`WS Socket connection open. Origin: ${request.headers.origin}`)

  const wsMessageHandler = (
    { type, data }: any,
    connectionId: any,
    request: IncomingMessage,
  ) => {
    switch (type) {
      case MsgType.Reg: return reg(data, connectionId)
      case MsgType.CreateRoom: return createRoom(connectionId)
      case MsgType.AddUserToRoom: return addUserToRoom(data, connectionId)
      case MsgType.AddShips: return addShips(data)
      case MsgType.Attack: return attack(data)
      case MsgType.RandomAttack: return randomAttack(data)
      case MsgType.SinglePlay: return singlePlay(connectionId)
      default: return console.log(`WS ERROR: Socket error. Origin ${request.headers.origin}. Error message: unknown message type ${type}`) 
    }
  }

  const { id } = connectionsDB.addConnection(ws)

  ws.on('message', (message: string) => {
    try {
      const msg = parseRequestMsg(message)
      console.log(`-> : ${msg.type} : ${JSON.stringify(msg.data)}`)
      wsMessageHandler(msg, id, request)
    } catch (err) {
      console.log(`WS ERROR. Internal Socket error. Origin: ${request.headers.origin}`)
      ws.close()
    }
  })

  ws.on('error', (error) => {
    console.log(`WS ERROR. Socket error. Origin: ${request.headers.origin}. Error message: ${error.message}`)
    ws.close()
  })

  ws.on('close', (code) => {
    cleanup(id, code)
    console.log(`WS Socket connection close. Origin: ${request.headers.origin}`)
  })
}

export const errorHandler = (port: number, error: Error) => {
  console.log(`WS SERVER ERROR. Server error on port ${port}. Error message: ${error.message}`)
}

export const closeHandler = (wss: WebSocket.Server, port: number) => {
  wss.clients.forEach(client => {
    if (client?.readyState === WebSocket.OPEN) {
      client.close()
    }
  })
  console.log(`WS SERVER. Close on port ${port}`)
}
