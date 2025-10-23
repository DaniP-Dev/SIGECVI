const API_BASE = 'https://api.jsonbin.io/v3';

function getHeaders({ masterKey, binKey, contentType = 'application/json' } = {}) {
  const headers = {
    'Content-Type': contentType,
  };

  if (masterKey) headers['X-Master-Key'] = masterKey;
  if (binKey) headers['X-Access-Key'] = binKey;

  return headers;
}

export async function readBin(binId, { masterKey, binKey } = {}) {
  const url = `${API_BASE}/b/${binId}/latest`;
  console.log('[readBin] URL:', url);
  console.log('[readBin] masterKey present:', !!masterKey);
  
  const res = await fetch(url, { headers: getHeaders({ masterKey, binKey }) });
  
  console.log('[readBin] Response status:', res.status, res.statusText);
  
  if (!res.ok) {
    const text = await res.text();
    console.log('[readBin] Error response:', text);
    const err = new Error(`jsonbin read error: ${res.status} ${res.statusText} - ${text}`);
    err.status = res.status;
    throw err;
  }
  const body = await res.json();
  console.log('[readBin] Record received, items count:', Array.isArray(body.record) ? body.record.length : 'not-array');
  // v3 returns { record: ... }
  return body.record;
}

export async function createBin(data, { masterKey, binKey } = {}) {
  const url = `${API_BASE}/b`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders({ masterKey, binKey }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`jsonbin create error: ${res.status} ${res.statusText} - ${text}`);
    err.status = res.status;
    throw err;
  }
  const body = await res.json();
  return body;
}

export async function updateBin(binId, data, { masterKey, binKey } = {}) {
  const url = `${API_BASE}/b/${binId}`;
  console.log('[updateBin] URL:', url);
  console.log('[updateBin] masterKey present:', !!masterKey);
  console.log('[updateBin] Data to send:', JSON.stringify(data).substring(0, 100));
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: getHeaders({ masterKey, binKey }),
    body: JSON.stringify(data),
  });
  
  console.log('[updateBin] Response status:', res.status, res.statusText);
  
  if (!res.ok) {
    const text = await res.text();
    console.log('[updateBin] Error response:', text);
    const err = new Error(`jsonbin update error: ${res.status} ${res.statusText} - ${text}`);
    err.status = res.status;
    throw err;
  }
  
  const body = await res.json();
  console.log('[updateBin] Success response:', body);
  return body.record || body;
}

export default { readBin, createBin, updateBin };
