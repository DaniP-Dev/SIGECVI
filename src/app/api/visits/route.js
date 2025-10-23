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
	console.log('========== [POST START] ==========');
	try {
		const payload = await request.json();
		console.log('[POST] Payload:', JSON.stringify(payload).substring(0, 100));
		
		if (!payload) {
			console.log('[POST] ❌ Payload is empty!');
			return NextResponse.json({ error: 'Payload is empty' }, { status: 400 });
		}
		
		console.log('[POST] ⏳ Waiting 100ms...');
		await new Promise(resolve => setTimeout(resolve, 100));
		
		console.log('[POST] 📖 Reading bin...');
		let record;
		try {
			record = await readBin(VISITS_BIN_ID, { masterKey: MASTER_KEY });
			console.log('[POST] ✅ readBin success. Record type:', Array.isArray(record) ? 'ARRAY' : 'OBJECT');
		} catch (readErr) {
			console.log('[POST] ❌ readBin failed:', readErr.message);
			throw readErr;
		}
		
		const visits = Array.isArray(record) ? record : record?.visits || [];
		console.log('[POST] Current visits count:', visits.length);
		
		const timestamp = new Date().toISOString();
		const visit = { ...payload, timestamp };
		console.log('[POST] New visit created with timestamp:', timestamp);
		
		const updated = Array.isArray(record) ? [...visits, visit] : { ...record, visits: [...visits, visit] };
		console.log('[POST] Updated data ready. New visits count:', updated.length || updated.visits?.length);

		console.log('[POST] 💾 Updating bin...');
		try {
			const result = await updateBin(VISITS_BIN_ID, updated, { masterKey: MASTER_KEY });
			console.log('[POST] ✅ updateBin success');
		} catch (updateErr) {
			console.log('[POST] ❌ updateBin failed:', updateErr.message);
			throw updateErr;
		}
		
		console.log('[POST] ✅ SUCCESS - Returning all visits');
		console.log('========== [POST END - SUCCESS] ==========');
		return NextResponse.json({ visit, allVisits: updated }, { status: 201 });
	} catch (err) {
		console.log('[POST] ❌ CAUGHT ERROR:', err.message);
		console.log('[POST] Error stack:', err.stack?.substring(0, 200));
		console.log('========== [POST END - ERROR] ==========');
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

