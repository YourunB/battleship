import { WebSocketServer } from 'ws'
import { parseRequestMsg } from './helpers/parseRequest';

export const createServerWSS = () => {
  const port = parseInt(process.env.WS_PORT!, 10) || 3000;

  const wss = new WebSocketServer(
    { port: port, clientTracking: true },
    () => { console.log(`${'WS SERVER: '} started on port ${port}.`) },
  )

  wss.on('connection', (ws, request) => {
    console.log(`${'WS:'} socket connection open. Origin: ${request.headers.origin}.`)

    ws.on('message', (message: string) => {
      try {
        const msg = parseRequestMsg(message)
        console.log(`<- : ${msg.type}: ${JSON.stringify(msg.data)}`)
      } catch (err) {
        console.log(`${'WS:'} ${'ERROR'} - internal Socket error. Origin: ${request.headers.origin}.`);
        ws.close()
      }
    })
  })

  wss.on('error', (error) => {
    console.log(`${'WS SERVER:'} ${'ERROR'} - server error on port ${port}. Error: ${error.message}.`);
  })

  wss.on('close', () => {
    wss.clients.forEach((client: any) => {
      if (client?.readyState === WebSocket.OPEN) {
        client.close()
      }
    })
    console.log(`${'WS SERVER:'} close on port ${port}.`)
  })

  return wss
}

