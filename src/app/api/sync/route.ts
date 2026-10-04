import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { validateSyncPayload, generateDataHash } from "@/lib/sync";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const passkey = searchParams.get("passkey");

    if (passkey !== "SOVEREIGN-FOUNDER-2026") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid Sovereign Passkey" },
        { status: 401 }
      );
    }

    const db = getDatabase();
    const user = db.prepare("SELECT * FROM users WHERE id = 'founder'").get();
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY scheduled_start ASC").all();
    const quests = db.prepare("SELECT * FROM quests").all();
    const xpTransactions = db
      .prepare("SELECT * FROM xp_transactions ORDER BY created_at DESC LIMIT 50")
      .all();

    const snapshot = {
      user,
      tasks,
      quests,
      xpTransactions,
      syncedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      snapshot,
      dataHash: generateDataHash(snapshot),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateSyncPayload(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { syncId, deviceId, totalXp, timestamp, payload } = body;
    const db = getDatabase();

    // Update founder total XP if newer/higher
    if (typeof totalXp === "number") {
      db.prepare(`
        UPDATE users 
        SET total_xp = MAX(total_xp, ?)
        WHERE id = 'founder'
      `).run(totalXp);
    }

    const receipt = {
      syncId,
      deviceId,
      receivedAt: new Date().toISOString(),
      status: "APPLIED",
      serverTimestamp: timestamp,
      clientHash: body.dataHash,
    };

    return NextResponse.json({
      success: true,
      receipt,
      message: "Sync applied cleanly to Sovereign Node",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
