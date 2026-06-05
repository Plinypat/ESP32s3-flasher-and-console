import client from './client.js';

export const getAgents = () => client.get('/agents').then(r => r.data);
export const getAgent = (id) => client.get(`/agents/${id}`).then(r => r.data);
export const createAgent = (data) => client.post('/agents', data).then(r => r.data);
export const updateAgent = (id, data) => client.put(`/agents/${id}`, data).then(r => r.data);
export const deleteAgent = (id) => client.delete(`/agents/${id}`).then(r => r.data);
