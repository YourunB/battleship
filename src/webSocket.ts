import WebSocket from 'ws';

export type TPlayer = {
  name: string;
  index: number;
};

export default class PlayerWebSocket extends WebSocket {
  private roomPlayer: TPlayer = <TPlayer> {};

  set player(data: TPlayer) {
    this.roomPlayer = data;
  }
  get player(): TPlayer {
    return this.roomPlayer;
  }
}
