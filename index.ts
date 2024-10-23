import WebSocket from 'ws'
import { createServerHTTP } from './src/http_server'
import { createServerWSS } from './src/ws_server'
import { onProcessClose } from './src/ws_server/helpers/onProcessClose';

const serverHTTP = createServerHTTP()
const serverWS = createServerWSS()

onProcessClose(() => {
  serverWS.clients.forEach(client => {
    if (client?.readyState === WebSocket.OPEN) {
      client.close()
    }
  })
  serverWS.close()
  serverHTTP.close()
})
