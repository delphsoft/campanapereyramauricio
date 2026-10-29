const ALLOWED = new Set(['voluntario', 'capitan', 'info', 'otro']);
const BARRIOS = new Set([
  'Industrial / Cocca / Altos / Los Prados',
  'Calera Central / Los Paraísos',
  'Cuesta Colorada',
  'Stöcklin',
  'Casco norte',
  'Dumesnil',
  'El Diquecito / Casa Bamba',
  'Otro'
]);

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return {};
}

function clean(s, n) {
  return String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });

  const b = readBody(req);
  if (b.company) return res.status(200).json({ ok: true });

  const nombre = clean(b.nombre, 80);
  const barrio = clean(b.barrio, 80);
  const whatsapp = clean(b.whatsapp, 24).replace(/[^\d+]/g, '');
  const problema = clean(b.problema, 40);
  const rol = clean(b.rol, 20);
  const mensaje = clean(b.mensaje, 500);
  const consentimiento = b.consentimiento === true || b.consentimiento === 'true';

  if (nombre.length < 2) return res.status(400).json({ ok: false, error: 'nombre' });
  if (!BARRIOS.has(barrio) && barrio.length < 2) return res.status(400).json({ ok: false, error: 'barrio' });
  if (!ALLOWED.has(rol)) return res.status(400).json({ ok: false, error: 'rol' });
  if (!consentimiento) return res.status(400).json({ ok: false, error: 'consentimiento' });

  const to = process.env.CAMPANA_TO_EMAIL;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CAMPANA_FROM_EMAIL || 'Campaña Pereyra <hola@pymestudio.com.ar>';

  if (!to || !key) {
    return res.status(503).json({
      ok: false,
      error: 'unconfigured',
      message: 'El formulario todavía no tiene correo de destino. Usá WhatsApp o pedile el contacto al equipo.'
    });
  }

  const text = [
    'Nuevo contacto · Campaña Pereyra 2027',
    'Nombre: ' + nombre,
    'Barrio: ' + barrio,
    'WhatsApp: ' + (whatsapp || '—'),
    'Cómo se suma: ' + rol,
    'Problema: ' + (problema || '—'),
    'Mensaje: ' + (mensaje || '—')
  ].join('\n');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: from,
      to: [to],
      subject: 'Sumate · ' + nombre + ' · ' + barrio,
      text: text
    })
  });

  if (!r.ok) {
    const err = await r.text();
    console.error('resend', err.slice(0, 200));
    return res.status(502).json({ ok: false, error: 'mail' });
  }

  return res.status(200).json({ ok: true });
};
