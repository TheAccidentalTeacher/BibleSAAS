"use server";

import { createAdminClient } from "@/lib/supabase/server";

type GiftSetupState = {
  error?: string;
  success?: string;
} | null;

/**
 * Server action for gift setup form submission.
 * Verifies the gift token and updates the profile with the gift description.
 *
 * In Phase 4, this will:
 *   - Look up the profile with gifted_by matching the token
 *   - Store the description in the profile
 *   - Create a birthday letter message (if provided)
 *   - Mark the gift as set up
 */
export async function submitGiftSetup(
  _prevState: GiftSetupState | null,
  formData: FormData
): Promise<GiftSetupState> {
  const description = formData.get("description")?.toString().trim();
  const birthdayLetter = formData.get("birthday_letter")?.toString().trim();

  if (!description) {
    return { error: "Please describe the person you're gifting this to." };
  }

  if (description.length < 20) {
    return {
      error:
        "Please share a bit more about them — even a few sentences helps Charles a lot.",
    };
  }

  // TODO (Phase 4): look up the gift token, find the profile,
  // store gifted_message, and handle birthday letter delivery.
  // For now, return success.
  void birthdayLetter; // Used in Phase 4

  // Using admin client because we're modifying another user's profile row
  void createAdminClient; // Will be used in Phase 4

  return {
    success:
      "Gift set up! When they sign in for the first time, Charles will greet them personally.",
  };
}
