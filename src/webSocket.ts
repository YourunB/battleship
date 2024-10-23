import WebSocket from 'ws';

export default class PlayerWebSocket extends WebSocket {
  private roomPlayer = {};

  set player(data) {
    this.roomPlayer = data;
  }
  get player() {
    return this.roomPlayer;
  }
}
