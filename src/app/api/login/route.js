import { NextResponse } from 'next/server';
import { readBin } from '../../../lib/jsonbin';

const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const USERS_BIN_ID = process.env.JSONBIN_USERS_BIN_ID; // bin id that stores users

// Simple contract:
// GET: returns the users array from the users bin (no passwords returned)
// POST: { email, password } -> validates against stored users and returns 200 + user

export async function GET() {
	try {
		const record = await readBin(USERS_BIN_ID, { masterKey: MASTER_KEY });
		const users = Array.isArray(record) ? record : record?.users || [];
		const safe = users.map(u => ({ email: u.email, name: u.name || null }));
		return NextResponse.json({ users: safe });
	} catch (err) {
		return NextResponse.json({ error: String(err) }, { status: err.status || 500 });
	}
}

export async function POST(request) {
	try {
		const { email, password } = await request.json();
		if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 });

		const record = await readBin(USERS_BIN_ID, { masterKey: MASTER_KEY });
		const users = Array.isArray(record) ? record : record?.users || [];

		const found = users.find(u => u.email === email && u.password === password);
		if (!found) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });

		// Return minimal user object (do not include password)
		const user = { email: found.email, name: found.name || null };
		return NextResponse.json({ user });
	} catch (err) {
		return NextResponse.json({ error: String(err) }, { status: err.status || 500 });
	}
}
