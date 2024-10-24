import WebSocket from 'ws'

export const serverResponse = (clients: WebSocket[], handlerData: any, id = 0): void => {
  const {
    type,
    data
  } = handlerData

  clients.map(client => {
    if (client?.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data: JSON.stringify(data), id }))
      console.log(`-> : ${type}: ${JSON.stringify(data)}`)
    }
  })
}
