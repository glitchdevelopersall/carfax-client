import fetch from 'node-fetch';

(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: 'test' })
    });
    console.log('status', res.status);
    const data = await res.json().catch(() => null);
    console.log(data);
  } catch (e) {
    console.error(e);
  }
})();