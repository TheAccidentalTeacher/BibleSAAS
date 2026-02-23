/**
 * POST /api/audio/tts
 *
 * Proxies to Google Cloud Text-to-Speech API.
 * Returns base64-encoded MP3 for a single verse (or any short text).
 *
 * Body:  { text: string, voice_id?: string }
 * Reply: { audioContent: string }  (base64 MP3)
 *
 * Supported voice_id values (Google Neural2 — high quality):
 *   en-US-Neural2-D  — Deep American male (default)
 *   en-US-Neural2-J  — Warm American male
 *   en-US-Neural2-A  — American female
 *   en-GB-Neural2-B  — British male
 *   en-GB-Neural2-D  — Rich British male
 *   en-GB-Neural2-F  — British female
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";

const SUPPORTED_VOICES = new Set([
  "en-US-Neural2-A",
  "en-US-Neural2-D",
  "en-US-Neural2-J",
  "en-GB-Neural2-B",
  "en-GB-Neural2-D",
  "en-GB-Neural2-F",
]);

const DEFAULT_VOICE = "en-US-Neural2-D";

function languageFromVoiceId(voiceId: string): string {
  // e.g. "en-US-Neural2-D" → "en-US"
  const parts = voiceId.split("-");
  return parts.slice(0, 2).join("-");
}

export async function POST(req: NextRequest) {
  // Auth required — no anonymous TTS
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey || apiKey === "your-google-tts-api-key-here") {
    return NextResponse.json(
      { error: "Google TTS API key not configured. Add GOOGLE_TTS_API_KEY to environment variables." },
      { status: 503 }
    );
  }

  let body: { text?: string; voice_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text || text.length > 5000) {
    return NextResponse.json({ error: "text must be 1–5000 characters" }, { status: 400 });
  }

  const voiceId = SUPPORTED_VOICES.has(body.voice_id ?? "") ? body.voice_id! : DEFAULT_VOICE;
  const languageCode = languageFromVoiceId(voiceId);

  const payload = {
    input: { text },
    voice: { languageCode, name: voiceId },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 0.95,     // slightly slower than natural for comprehension
      pitch: 0.0,
    },
  };

  try {
    const res = await fetch(`${GOOGLE_TTS_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[tts] Google API error:", res.status, errBody);
      return NextResponse.json(
        { error: `Google TTS error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json() as { audioContent: string };
    return NextResponse.json({ audioContent: data.audioContent });
  } catch (err) {
    console.error("[tts] Fetch error:", err);
    return NextResponse.json({ error: "TTS service unavailable" }, { status: 503 });
  }
}
