export const isUserExist = (username: string): boolean => {
  return db.players.some((player) => player.name === username);
};

export default db
