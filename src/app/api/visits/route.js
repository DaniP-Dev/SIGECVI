import { NextResponse } from 'next/server';
import { readBin, updateBin } from '../../../lib/jsonbin';

const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const VISITS_BIN_ID = process.env.JSONBIN_VISITS_BIN_ID;

// GET: return visits array
export async function GET() {
	try {
		const record = await readBin(VISITS_BIN_ID, { masterKey: MASTER_KEY });
		const visits = Array.isArray(record) ? record : record?.visits || [];
		return NextResponse.json({ visits });
	} catch (err) {
		return NextResponse.json({ error: String(err) }, { status: err.status || 500 });
	}
}

// POST: append a visit { user, meta?... }
export async function POST(request) {
	try {
		const payload = await request.json();
		const record = await readBin(VISITS_BIN_ID, { masterKey: MASTER_KEY });
		const visits = Array.isArray(record) ? record : record?.visits || [];
		const visit = { ...payload, timestamp: new Date().toISOString() };
		const updated = Array.isArray(record) ? [...visits, visit] : { ...record, visits: [...visits, visit] };

		// If the bin is an array we update with the array, otherwise update with the object
		await updateBin(VISITS_BIN_ID, updated, { masterKey: MASTER_KEY });
		return NextResponse.json({ visit }, { status: 201 });
	} catch (err) {
		return NextResponse.json({ error: String(err) }, { status: err.status || 500 });
	}
}

