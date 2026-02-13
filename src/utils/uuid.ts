import { v4 as uuidv4 } from 'uuid';

export const getUserUUID = (): string => {
  let uuid = localStorage.getItem('user_uuid');
  if (!uuid) {
    uuid = uuidv4();
    localStorage.setItem('user_uuid', uuid);
  }
  return uuid;
}
