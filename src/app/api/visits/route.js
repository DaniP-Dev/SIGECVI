import { NextResponse } from 'next/server';
import { readBin, updateBin } from '../../../lib/jsonbin';

const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const VISITS_BIN_ID = process.env.JSONBIN_VISITS_BIN_ID;

// GET: return visits array
export async function GET() {
	try {
		console.log('[SERVER GET /api/visits] Fetching visits from bin:', VISITS_BIN_ID);
		const record = await readBin(VISITS_BIN_ID, { masterKey: MASTER_KEY });
		console.log('[SERVER GET /api/visits] Record received:', record);
		const visits = Array.isArray(record) ? record : record?.visits || [];
		console.log('[SERVER GET /api/visits] Visits to return:', visits);
		return NextResponse.json({ visits });
	} catch (err) {
		console.error('[SERVER GET /api/visits] Error:', err);
		return NextResponse.json({ error: String(err) }, { status: err.status || 500 });
	}
}

// POST: append a visit { user, meta?... }
export async function POST(request) {
	try {
		const payload = await request.json();
		console.log('[SERVER POST /api/visits] Payload received:', payload);
		
		if (!payload) {
			console.error('[SERVER POST /api/visits] Payload is empty!');
			return NextResponse.json({ error: 'Payload is empty' }, { status: 400 });
		}
		
		// Pequeña pausa para asegurar que JSONBin sincronizó el último cambio
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const record = await readBin(VISITS_BIN_ID, { masterKey: MASTER_KEY });
		console.log('[SERVER POST /api/visits] Current bin record:', record);
		
		const visits = Array.isArray(record) ? record : record?.visits || [];
		const timestamp = new Date().toISOString();
		const visit = { ...payload, timestamp };
		console.log('[SERVER POST /api/visits] New visit object:', visit);
		
		const updated = Array.isArray(record) ? [...visits, visit] : { ...record, visits: [...visits, visit] };
		console.log('[SERVER POST /api/visits] Updated data to send:', updated);

		// If the bin is an array we update with the array, otherwise update with the object
		const result = await updateBin(VISITS_BIN_ID, updated, { masterKey: MASTER_KEY });
		console.log('[SERVER POST /api/visits] UpdateBin result:', result);
		
		// Devolver el array actualizado, no solo el visit individual
		console.log('[SERVER POST /api/visits] SUCCESS - Returning all visits');
		return NextResponse.json({ visit, allVisits: updated }, { status: 201 });
	} catch (err) {
		console.error('[SERVER POST /api/visits] ERROR:', err);
		console.error('[SERVER POST /api/visits] ERROR Stack:', err.stack);
		return NextResponse.json({ error: String(err) }, { status: err.status || 500 });
	}
}

