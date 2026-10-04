import confetti from "canvas-confetti";

/**
 * Fires a Brilliant-style celebratory confetti burst.
 * Safe for SSR and client execution.
 */
export function fireBrilliantConfetti() {
  if (typeof window === "undefined") return;

  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#F59E0B", "#EF4444", "#FFFFFF", "#10B981", "#8B5CF6"],
    });
  } catch (e) {
    // Graceful fallback if canvas is restricted
  }
}

/**
 * Fires an intense milestone celebration burst (for course completion or daily target).
 */
export function fireMilestoneConfetti() {
  if (typeof window === "undefined") return;

  try {
    const end = Date.now() + 1000;
    const colors = ["#F59E0B", "#EF4444", "#FFFFFF", "#10B981"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {}
}
