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
  const url = `${API_BASE}/b/${binId}`;
  const res = await fetch(url, { headers: getHeaders({ masterKey, binKey }) });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`jsonbin read error: ${res.status} ${res.statusText} - ${text}`);
    err.status = res.status;
    throw err;
  }
  const body = await res.json();
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
  const res = await fetch(url, {
    method: 'PUT',
    headers: getHeaders({ masterKey, binKey }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`jsonbin update error: ${res.status} ${res.statusText} - ${text}`);
    err.status = res.status;
    throw err;
  }
  const body = await res.json();
  return body.record || body;
}

export default { readBin, createBin, updateBin };
