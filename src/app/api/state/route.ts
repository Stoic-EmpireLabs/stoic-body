import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = getDatabase();
    const user = db.prepare("SELECT * FROM users WHERE id = 'founder'").get();
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY scheduled_start ASC").all();
    const quests = db.prepare("SELECT * FROM quests").all();
    const xpTransactions = db
      .prepare("SELECT * FROM xp_transactions ORDER BY created_at DESC LIMIT 20")
      .all();

    return NextResponse.json({
      success: true,
      user,
      tasks,
      quests,
      xpTransactions,
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
    const db = getDatabase();
    const body = await request.json();
    const { action, taskId, isCompleted, xpAmount, label, attribute } = body;

    if (action === "TOGGLE_TASK" && taskId) {
      db.prepare("UPDATE tasks SET is_completed = ? WHERE id = ?").run(
        isCompleted ? 1 : 0,
        taskId
      );
      return NextResponse.json({ success: true, taskId, isCompleted });
    }

    if (action === "ADD_XP" && xpAmount) {
      db.prepare(`
        INSERT INTO xp_transactions (id, source_type, source_id, attribute, base_xp, final_xp)
        VALUES (?, 'TASK', ?, ?, ?, ?)
      `).run(
        `tx-${Date.now()}`,
        label || "Manual Award",
        attribute || "Discipline",
        xpAmount,
        xpAmount
      );
      return NextResponse.json({ success: true, xpAwarded: xpAmount });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
