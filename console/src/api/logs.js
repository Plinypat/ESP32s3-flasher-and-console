import client from './client.js';

export const getLogs = (deviceId, params = {}) =>
  client.get(`/logs/${deviceId}`, { params }).then(r => r.data);
