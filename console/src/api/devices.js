import client from './client.js';

export const getDevices = () => client.get('/devices').then(r => r.data);
export const createDevice = (data) => client.post('/devices', data).then(r => r.data);
export const updateDevice = (id, data) => client.put(`/devices/${id}`, data).then(r => r.data);
export const deleteDevice = (id) => client.delete(`/devices/${id}`).then(r => r.data);
