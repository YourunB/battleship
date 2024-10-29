import WebSocket from 'ws'

export const sendResponse = (clients: WebSocket[], handlerData: any, id = 0): void => {
  const { type, data } = handlerData
  clients.forEach(client => {
    if (client?.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data: JSON.stringify(data), id }))
      console.log(`-> : ${type}: ${JSON.stringify(data)}`)
    }
  })
}
