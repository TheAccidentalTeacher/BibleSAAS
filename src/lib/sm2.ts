/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Original paper: Wozniak (1990)
 * Quality scale: 0–5
 *   0–2 = failed (reset repetitions)
 *   3 = barely passed (just good enough)
 *   4 = correct, some hesitation
 *   5 = perfect recall
 *
 * We map our 3 buttons:
 *   Hard      → quality 2  (failed — restarts interval)
 *   Got It    → quality 4  (correct with hesitation)
 *   Nailed It → quality 5  (perfect recall)
 *
 * Mastery threshold: interval >= 21 days AND repetitions >= 3.
 */

export interface SM2Result {
  ease: number;       // new ease factor (EF), min 1.3
  interval: number;   // days until next review
  reps: number;       // repetitions (resets on fail)
  mastered: boolean;  // true if interval >= 21 AND reps >= 3
  nextReview: string; // ISO date string (YYYY-MM-DD) of next review
}

/**
 * Calculate next SM-2 values.
 * @param ease      Current ease factor (EF), default 2.5
 * @param interval  Current interval in days
 * @param reps      Current consecutive correct repetitions
 * @param quality   Rating quality 0–5
 */
export function calcSM2(
  ease: number,
  interval: number,
  reps: number,
  quality: number
): SM2Result {
  // Update ease factor — SM-2 formula
  let newEase = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEase < 1.3) newEase = 1.3;

  let newReps: number;
  let newInterval: number;

  if (quality < 3) {
    // Failed — reset repetition count, restart interval
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = reps + 1;
    if (reps === 0) {
      newInterval = 1;
    } else if (reps === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEase);
    }
  }

  const mastered = newInterval >= 21 && newReps >= 3;

  // Calculate next review date
  const next = new Date();
  next.setDate(next.getDate() + newInterval);
  const nextReview = next.toISOString().split("T")[0]!;

  return {
    ease: Math.round(newEase * 100) / 100,
    interval: newInterval,
    reps: newReps,
    mastered,
    nextReview,
  };
}

/** Maps UI button label to SM-2 quality score */
export const QUALITY_MAP = {
  hard: 2,
  got_it: 4,
  nailed_it: 5,
} as const;

export type RatingKey = keyof typeof QUALITY_MAP;
