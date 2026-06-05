import React, { useEffect, useState } from 'react';
import { getFirmwareVersions, uploadFirmware } from '../api/firmware.js';

export default function Firmware() {
  const [versions, setVersions] = useState([]);
  const [file, setFile] = useState(null);
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [setLatest, setSetLatest] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => getFirmwareVersions().then(setVersions);
  useEffect(() => { load(); }, []);

  async function upload(e) {
    e.preventDefault();
    if (!file || !version) return;
    setUploading(true);
    setMsg(null);
    try {
      await uploadFirmware(file, version, notes, setLatest);
      setMsg('Uploaded successfully');
      setFile(null);
      setVersion('');
      setNotes('');
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Firmware</h2>

      <form onSubmit={upload} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 mb-8">
        <h3 className="font-semibold text-gray-800">Upload New Firmware</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Version (e.g. 1.0.5)</label>
          <input value={version} onChange={e => setVersion(e.target.value)} required placeholder="1.0.0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Firmware .bin file</label>
          <input type="file" accept=".bin" onChange={e => setFile(e.target.files[0])} required
            className="w-full text-sm text-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Release Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={setLatest} onChange={e => setSetLatest(e.target.checked)} />
          Set as latest (devices will update to this version)
        </label>
        {msg && <p className={`text-sm ${msg.includes('fail') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
        <button type="submit" disabled={uploading}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg text-sm disabled:opacity-50">
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      <h3 className="font-semibold text-gray-800 mb-3">Version History</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Version</th>
              <th className="px-5 py-3 text-left">Notes</th>
              <th className="px-5 py-3 text-left">Uploaded</th>
              <th className="px-5 py-3 text-left">Latest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {versions.map(v => (
              <tr key={v.id}>
                <td className="px-5 py-3 font-mono font-medium">{v.version}</td>
                <td className="px-5 py-3 text-gray-500">{v.release_notes || '—'}</td>
                <td className="px-5 py-3 text-gray-400">{new Date(v.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  {v.is_latest && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Latest</span>}
                </td>
              </tr>
            ))}
            {!versions.length && <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No firmware uploaded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
