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

// DELETE: remove a visit by its timestamp
export async function DELETE(request) {
	try {
		const { visitId } = await request.json();
		console.log('[SERVER DELETE /api/visits] visitId to delete:', visitId);

		if (!visitId) {
			return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 });
		}

		const record = await readBin(VISITS_BIN_ID, { masterKey: MASTER_KEY });
		const visits = Array.isArray(record) ? record : record?.visits || [];

		const updatedVisits = visits.filter(v => v.timestamp !== visitId);

		if (updatedVisits.length === visits.length) {
			console.log('[SERVER DELETE /api/visits] Visit not found with ID:', visitId);
			return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
		}

		const updatedData = Array.isArray(record) ? updatedVisits : { ...record, visits: updatedVisits };
		
		await updateBin(VISITS_BIN_ID, updatedData, { masterKey: MASTER_KEY });
		console.log('[SERVER DELETE /api/visits] Visit deleted successfully');

		return NextResponse.json({ message: 'Visit deleted successfully', allVisits: updatedData }, { status: 200 });

	} catch (err) {
		console.error('[SERVER DELETE /api/visits] ERROR:', err);
		return NextResponse.json({ error: String(err) }, { status: 500 });
	}
}

