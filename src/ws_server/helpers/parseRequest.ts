import { ParsedRequestData, MsgType, Message } from '../types'

export const parseRequestMsg = (message: string) => {
  const msg = JSON.parse(message)

  const { type, id, data } = msg as { type: MsgType, id: number, data: string }

  const parsedData: ParsedRequestData = data ? JSON.parse(data) : ''

  return { type, id, data: parsedData } as Message
}
