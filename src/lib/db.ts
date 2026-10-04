import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

let globalDb: DatabaseSync | null = null;

export function getDatabase(targetPath?: string): DatabaseSync {
  if (targetPath === ":memory:") {
    const memDb = new DatabaseSync(":memory:");
    initSchema(memDb);
    return memDb;
  }

  if (globalDb) return globalDb;

  const isVercel = !!process.env.VERCEL;
  const dbDir = isVercel ? "/tmp" : path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbFilePath = targetPath || path.join(dbDir, "stoic-body.sqlite");
  globalDb = new DatabaseSync(dbFilePath);
  initSchema(globalDb);
  seedInitialData(globalDb);

  return globalDb;
}

export function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      current_weight REAL NOT NULL,
      target_weight REAL NOT NULL,
      height_inches REAL,
      diet_archetype TEXT DEFAULT 'OMAD',
      protein_target_g REAL DEFAULT 140,
      calorie_target_kcal REAL DEFAULT 1800,
      fasting_window_hours REAL DEFAULT 23,
      eating_window_hours REAL DEFAULT 1,
      current_level INTEGER DEFAULT 1,
      total_xp INTEGER DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      streak_multiplier REAL DEFAULT 1.0,
      daily_xp_target INTEGER DEFAULT 2500,
      is_founder_mode INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT CHECK(category IN ('Health', 'Business', 'Academic', 'Personal', 'Family')),
      target_date DATE,
      priority TEXT CHECK(priority IN ('P1', 'P2', 'P3')),
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      goal_id TEXT REFERENCES goals(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      order_index INTEGER,
      xp_reward INTEGER DEFAULT 1000,
      is_completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      milestone_id TEXT REFERENCES milestones(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      buffer_minutes INTEGER DEFAULT 15,
      difficulty_tier INTEGER DEFAULT 2 CHECK(difficulty_tier BETWEEN 1 AND 5),
      base_xp INTEGER DEFAULT 250,
      energy_level TEXT CHECK(energy_level IN ('High', 'Medium', 'Low')),
      scheduled_start DATETIME,
      scheduled_end DATETIME,
      is_completed INTEGER DEFAULT 0,
      is_minimum_viable INTEGER DEFAULT 0,
      recurring_rule TEXT,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      modality TEXT CHECK(modality IN ('Calisthenics', 'Boxing', 'Cardio', 'CheerStunting', 'Lifting')),
      duration_minutes INTEGER,
      difficulty_tier INTEGER DEFAULT 3 CHECK(difficulty_tier BETWEEN 1 AND 5),
      base_xp INTEGER DEFAULT 750,
      rpe INTEGER CHECK(rpe BETWEEN 1 AND 10),
      notes TEXT,
      started_at DATETIME,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS workout_sets (
      id TEXT PRIMARY KEY,
      session_id TEXT REFERENCES workout_sessions(id) ON DELETE CASCADE,
      exercise_name TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      target_reps INTEGER,
      actual_reps INTEGER,
      weight_lbs REAL DEFAULT 0,
      is_completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty_tier INTEGER DEFAULT 4 CHECK(difficulty_tier BETWEEN 1 AND 5),
      steps_json TEXT NOT NULL,
      xp_reward INTEGER DEFAULT 3500,
      is_completed INTEGER DEFAULT 0,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS xp_transactions (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      attribute TEXT CHECK(attribute IN ('Strength', 'Endurance', 'Discipline', 'Knowledge', 'Recovery')),
      difficulty_tier INTEGER DEFAULT 1 CHECK(difficulty_tier BETWEEN 1 AND 5),
      base_xp INTEGER NOT NULL,
      multiplier REAL DEFAULT 1.0,
      combo_streak INTEGER DEFAULT 0,
      final_xp INTEGER NOT NULL,
      is_reversed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function seedInitialData(db: DatabaseSync) {
  // Check if founder exists
  const existingFounder = db
    .prepare("SELECT id FROM users WHERE id = 'founder'")
    .get();

  if (!existingFounder) {
    db.prepare(`
      INSERT INTO users (id, name, age, current_weight, target_weight, height_inches, diet_archetype, protein_target_g, calorie_target_kcal, current_level, total_xp, streak_days, daily_xp_target, is_founder_mode)
      VALUES ('founder', 'Stoic Founder', 33, 170, 155, 68, 'OMAD', 140, 1800, 12, 26450, 14, 2500, 1)
    `).run();

    // Morning Anchors
    db.prepare(`
      INSERT INTO tasks (id, title, duration_minutes, buffer_minutes, difficulty_tier, base_xp, energy_level, is_completed, recurring_rule)
      VALUES 
        ('t1', 'Hydrate: 24oz Water + Electrolytes (Sodium, Potassium, Magnesium)', 10, 15, 1, 100, 'Low', 0, 'DAILY'),
        ('t2', 'Morning Calisthenics Core Burnout + 6-Rnd Boxing Intervals', 45, 15, 3, 750, 'High', 0, 'DAILY'),
        ('t3', '20-Minute Incline Treadmill Walk (Zone 2)', 20, 15, 2, 300, 'Medium', 0, 'DAILY'),
        ('t4', 'Stoic Business Consulting: Client Acquisition & Fiverr Delivery', 120, 24, 4, 1500, 'High', 0, 'WEEKDAYS'),
        ('t5', 'DBA Doctoral Research: Assignment Resubmission & Writing', 90, 18, 3, 750, 'High', 0, 'WEEKDAYS'),
        ('t6', 'Ultron Self-Hosted LLM Config & Skill Indexing', 60, 15, 3, 750, 'Medium', 0, 'WEEKDAYS')
    `).run();

    // Quests
    db.prepare(`
      INSERT INTO quests (id, title, category, description, difficulty_tier, steps_json, xp_reward)
      VALUES 
        ('q1', '2015 Ford Mustang V6 3.7L DIY Oil Change', 'Makerspace', 'Solo oil change: Motorcraft FL-500S filter, 6.0 qts 5W-20, 15mm bolt, torque to 19 lb-ft.', 5, '["Acquire 6 qts 5W-20 & FL-500S", "Jack car securely on stands", "Drain 15mm oil pan bolt", "Spin off filter & lube fresh gasket", "Torque & refill 6 qts", "Reset oil life indicator"]', 3500),
        ('q2', 'Precision TV Wall-Mount Installation', 'Home', 'Mount flat screen TV securely to wall studs with heavy-duty lag bolts.', 4, '["Locate wood studs with stud finder", "Level bracket on wall", "Pre-drill pilot holes", "Lag bolt bracket firmly", "Hang TV and secure safety locks"]', 1500),
        ('q3', 'Cheerleading Flyer Partner Stunt Coaching', 'Family', 'Teach daughter flyer base fundamentals, balance lock, and confident dismount catch.', 4, '["Explain wrist locks under foot arches", "Practice chest-up elbow lock posture", "Execute partner elevator to chest level", "Practice controlled sponge catch"]', 1500)
    `).run();
  }
}
