export const parseRequestMsg = (message: string) => {
  const msg = JSON.parse(message);
  const {
    type,
    id,
    data
  } = msg as { type: any, id: number, data: string }
  const parsedData: any = data ? JSON.parse(data) : '';

  return { type, id, data: parsedData } as any;
}
