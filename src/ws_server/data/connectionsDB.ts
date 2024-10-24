import WebSocket from 'ws';
import { randomUUID } from 'node:crypto';
import { serverResponse } from '../helpers/serverResponse';

interface Connection {
  ws: WebSocket;
  id: string;
  player?: { name: string };
}

export class Connections {
  private connections: Connection[];

  constructor() {
    this.connections = [];
  }

  addConnection(ws: WebSocket): Connection {
    const newConnection: Connection = {
      ws,
      id: randomUUID(),
    };

    this.connections.push(newConnection);
    return newConnection;
  }

  removeConnection(connectionId: string): void {
    const index = this.connections.findIndex(({ id }) => id === connectionId);
    if (index !== -1) {
      this.connections.splice(index, 1);
    }
  }

  addConnectionPlayer(id: string, user: string): boolean {
    const connection = this.getConnection(id);

    if (connection) {
      connection.player = { name: user };
      return true;
    }
    return false;
  }

  getConnections(): Connection[] {
    return this.connections;
  }

  getConnection(id: string): Connection | undefined {
    return this.connections.find((el) => el.id === id);
  }

  getConnectionByPlayerName(name: string): Connection | undefined {
    return this.connections.find(({ player }) => player?.name === name);
  }

  sendData(data: any, connectionId?: string): void {
    const client = connectionId ? this.getConnection(connectionId) : null;
    const clients = connectionId
      ? (client ? [client.ws] : [])
      : this.getConnections().map(({ ws }) => ws);
      
    serverResponse(clients, data);
  }
}

export const connectionsDB = new Connections();
