import client from './client.js';

export const getFirmwareVersions = () => client.get('/ota/versions').then(r => r.data);

export const uploadFirmware = (file, version, releaseNotes, setLatest) => {
  const form = new FormData();
  form.append('firmware', file);
  form.append('version', version);
  if (releaseNotes) form.append('release_notes', releaseNotes);
  form.append('set_latest', setLatest ? 'true' : 'false');
  return client.post('/ota/upload', form).then(r => r.data);
};
