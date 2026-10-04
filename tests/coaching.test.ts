import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTHENTICATED_STOIC_QUOTES,
  getRandomQuote,
  generateCoachingDialogue,
  CoachingContext,
  CoachingTone,
} from "../src/lib/coaching";

test("Stoic Body — Historical Quotations & Authenticity", () => {
  // Verify all quotes have authentic author and verifiable citation
  assert.ok(AUTHENTICATED_STOIC_QUOTES.length >= 8);

  for (const quote of AUTHENTICATED_STOIC_QUOTES) {
    assert.ok(quote.text.length > 20, "Quote text must be substantive");
    assert.ok(
      ["Marcus Aurelius", "Seneca", "Epictetus", "Musonius Rufus"].includes(quote.author),
      `Author must be verified classical Stoic, got: ${quote.author}`
    );
    assert.ok(quote.work.length > 3, "Source work must be specified");
    assert.ok(quote.citation.length > 2, "Exact citation (book/chapter) must be provided");
    assert.ok(quote.category, "Category must be specified");
  }

  const randomQuote = getRandomQuote();
  assert.ok(randomQuote.text);
  assert.ok(randomQuote.author);
});

test("Stoic Body — Multi-Tone Coaching Engine", () => {
  const context: CoachingContext = {
    founderName: "Stoic",
    currentLevel: 12,
    streakDays: 14,
    pendingTaskCount: 3,
    completedTaskCount: 2,
    weightLbs: 170,
    targetWeightLbs: 155,
    isFatigued: false,
    dietType: "23:1 OMAD",
  };

  // 1. Grill-Me Tone (Socratic Interrogation & Zero Tolerance for Excuses)
  const grillMe = generateCoachingDialogue(context, "grill_me");
  assert.equal(grillMe.tone, "grill_me");
  assert.ok(grillMe.headline.length > 5);
  assert.ok(grillMe.content.includes("14") || grillMe.content.includes("pending") || grillMe.content.includes("170"));
  assert.ok(grillMe.actionPrompt.length > 5);

  // 2. Direct Centurion Tone (Military Discipline & Tactical Execution)
  const centurion = generateCoachingDialogue(context, "direct_centurion");
  assert.equal(centurion.tone, "direct_centurion");
  assert.ok(centurion.headline.includes("Centurion") || centurion.headline.includes("Order") || centurion.headline.includes("Execute"));

  // 3. Philosophical Stoic Tone (Virtue, Reason, Dichotomy of Control)
  const stoic = generateCoachingDialogue(context, "philosophical_stoic");
  assert.equal(stoic.tone, "philosophical_stoic");
  assert.ok(stoic.content.length > 30);
  assert.ok(stoic.quote.text.length > 10);
});
