# Bible Study App � Project Notes

## Overview
A mobile-first, AI-powered **personalized study Bible platform** (also accessible on desktop), hosted on Vercel.
Uses the English Standard Version (ESV) of the Bible.
Users study chapter by chapter with AI-generated questions, deep commentary, cross-references, highlights, journaling, and a fully personalized experience.

**Direction:** Build for personal use first (father + son � Tim), architect for commercial release. Tim is the first real user and his profile (aspiring chef, specific interests) will drive the personalization model that future users will also benefit from.

**Bigger vision:** Not just a Bible app � a *personalized living study Bible* where the AI layer knows who you are and tailors everything � commentary, questions, connections � to your life, interests, and history with the text.

---

## Commercial Vision � The SaaS Model

**Core concept:** A single web platform (Vercel) where every user's login creates their own personalized "edition" of the Bible. Same Scripture, radically different experience based on who you are. Tim's instance looks like Tim's Bible. A nurse's looks like a nurse's Bible. The personalization engine is the product.

**Why no App Store:**
- No 30% revenue cut to Apple or Google
- No App Store review process or content restrictions
- PWA handles home screen installation on both iOS and Android
- Faster iteration � deploy updates instantly without App Store approval
- Users access via browser or installed PWA � feels native enough

**Revenue model options (to brainstorm deeply):**
- **Tiered subscriptions:** Free (basic reading), Standard (AI questions + journal), Premium (full personalization engine, all commentary layers, TSK, Spurgeon, audio)
- **A la carte feature unlocks:** Buy the Chef Layer, buy the Spurgeon Layer, buy the TSK cross-reference engine � pick what matters to you
- **One-time lifetime purchase:** Appeals to users who hate subscriptions
- **"Your Edition" premium:** Highest tier � full AI profile, personalized commentary, exportable personalized study Bible PDF
- **Gifting:** Father buys Tim a personalized edition � that's a real product people would give

**The "personalized edition" framing:**
Every user doesn't just get an account � they get *their Bible*. On signup they go through an onboarding flow that seeds their AI profile. From that moment, Claude knows who they are and everything is filtered through that lens. The platform is one codebase; the experience is a thousand different books.

---

## User Archetypes � The Personalization Spectrum

This is the heart of what makes this product different. The AI doesn't just add a name to the top of the screen � it fundamentally rewrites how the text is approached, what questions are asked, what connections are surfaced, what tone is used, and how the UI itself feels. These archetypes are real people, not market segments.

---

### TIM � The First User. The Reason This Exists.

**Who he is:**
- 15 years old (Gen Z, born ~2011)
- Aspiring chef � this isn't a hobby, it's an identity
- **3-sport athlete:** cross country, basketball, and track � discipline, endurance, team, competition, the body as instrument
- Son of the developer � this app is a digital act of love from his father
- Grew up with YouTube, Reels, TikTok � learns visually, learns by watching people DO things
- Short-form native � he can focus deeply but it has to be earned
- Probably skeptical of anything that feels like homework or church obligation
- Identity is still forming � who am I, what do I believe, where do I fit
- A kid who already lives inside discipline and endurance (training) and creativity (kitchen) � the Bible has enormous things to say to both

**What his experience needs to feel like:**
- His � not his dad's. Not a church curriculum. HIS Bible.
- Visually engaging from the first screen � not walls of text
- Questions that actually connect to his life: kitchen, training, school, friendships, identity, worth, purpose
- Short entry points � he can go deep if he wants but doesn't have to
- The chef lens is always on: every passage filtered for food, craft, hospitality, creativity, the dignity of physical work
- The athlete lens is equally on: endurance, discipline, suffering that produces, team, winning and losing well
- Gaming-adjacent engagement: streaks feel like a game, not a guilt trip. Achievements unlock. Progress is visual.
- Sharing should go to where he actually lives � not email. Probably copy-to-clipboard for pasting wherever.
- Journal prompts need to be conversational: "What would you have done?" not "Identify the homiletical principle."
- AI tone for Tim: peer-level, curious, never preachy, occasionally surprising

**Additional athletic passage connections for Tim:**
- 1 Corinthians 9:24-27: "Run in such a way as to get the prize" � Paul uses a runner's metaphor. Tim *is* a runner.
- Hebrews 12:1-2: "Run with endurance the race set before us" � cross country theology
- Philippians 4:13: "I can do all things through him who strengthens me" � every locker room has this verse; what does it actually mean?
- 2 Timothy 4:7: "I have fought the good fight, I have finished the race" � finishing well
- Isaiah 40:31: "They shall run and not be weary" � this lands differently after mile 8 of a cross country race

**What his experience needs to feel like:**
- His � not his dad's. Not a church curriculum. HIS Bible.
- Visually engaging from the first screen � not walls of text
- Questions that actually connect to his life: kitchen, school, friendships, identity, worth, purpose
- Short entry points � he can go deep if he wants but doesn't have to
- The chef lens is always on: every passage filtered for food, craft, hospitality, creativity, the dignity of physical work
- Gaming-adjacent engagement: streaks feel like a game, not a guilt trip. Achievements unlock. Progress is visual.
- Sharing should go to where he actually lives � not email. Probably copy-to-clipboard for pasting wherever.
- Journal prompts need to be conversational: "What would you have done?" not "Identify the homiletical principle."
- AI tone for Tim: peer-level, curious, never preachy, occasionally surprising

**Passages that will hit different for Tim:**
- Genesis 18: Abraham's meal for three strangers � ancient hospitality, what he served, how he cooked it, why it mattered
- Exodus 16: Manna � what did it taste like? ("like wafers made with honey" � Exodus 16:31). Was collecting it meditative? What did God teach through food provision?
- Leviticus 2-3: Grain and fellowship offerings � these are *recipes*. Flour, oil, salt, fire. A chef reads this completely differently.
- 1 Kings 17: The widow's last flour and oil � feeding someone when you have nothing left
- John 6: Feeding 5,000 � logistics of feeding a crowd. What would Tim do with 5 loaves and 2 fish?
- John 21: Jesus cooking fish on the beach for his disciples after the resurrection � the risen Lord of the universe made breakfast. Why does that matter?
- Luke 15: The prodigal son's father kills the fattened calf � a celebration feast as the language of reconciliation

**Tim's AI system prompt seeds:**
```
Tim is 15 years old. He is an aspiring chef and a 3-sport athlete (cross country, basketball, track).
He thinks in flavors, textures, craft, endurance, and teamwork.
Connect this passage to food, cooking, hospitality, athletics, discipline, or physical creativity wherever genuine.
Ask questions that are honest about real life at 15 � identity, belonging, purpose, doubt, competition, calling.
Never be preachy. Be curious. Be real. Keep application questions grounded in his actual world.
His journal entries may be short. That's fine. Ask one question so good he has to answer it.
His father built this app for him. That relationship is sacred. Honor it.
```

**The birthday feature � LOCKED IN:**
On Tim's birthday, the day's study includes a note woven in by Claude � not a notification banner, not a popup. Something found inside the text itself. Claude knows his age, knows what he's been reading, knows what themes have been surfacing in his journals. It writes something to him. His father can also pre-write a birthday message that surfaces that day � a letter from dad, delivered through the Bible. This is the most personal thing the app does. It exists because a father is building this for his son.

---

### ARCHETYPE 2 � The 45-Year-Old SAHM (Stay-at-Home Mom)

**Who she is:**
- Reading at 5am before the kids wake up � 20 minutes, maybe 30 on a good day
- Has read the Bible before but wants to go deeper
- Life context: marriage, parenting, household, community, probably exhausted
- Wants to feel seen and not alone in the text
- Devotional instinct � she wants something she can carry into her day

**What her experience needs:**
- Quiet, warm, unhurried UI � nothing urgent or gamified
- Questions that connect to *her life*: patience, sacrifice, provision, motherhood, identity beyond roles
- Commentary that surfaces women in Scripture as full human beings, not footnotes
- Short enough to finish but substantial enough to matter
- Passage connections to parenting, hospitality, community
- AI tone: warm, substantive, quietly encouraging � not saccharine
- Sharing: probably email or SMS to a friend or her husband

---

### ARCHETYPE 3 � The 87-Year-Old Prayer Warrior

**Who she is:**
- Has read the Bible cover to cover multiple times
- Prayer is her primary mode � she reads to pray, not just to understand
- Deep familiarity with the text means she wants depth, not explanation
- Hymn connections matter to her � she hears Psalm 23 and thinks of a specific hymn
- Probably has physical limitations � font size matters enormously, navigation must be simple
- Time is not a constraint � she may sit with one verse for 20 minutes

**What her experience needs:**
- Large font, high contrast, minimal UI clutter � accessibility first
- No streaks or gamification � that's irrelevant to her
- Spurgeon and Matthew Henry front and center
- "Pray this passage" mode � prompts to turn every verse into prayer
- Connections to classic hymns (public domain � another dataset to consider)
- AI tone: reverent, deep, historically rich � she wants scholarship, not simplification
- Her journal entries are probably prayers � the journal should feel like a prayer journal
- Cross-references and TSK are features she'll actually use

---

### ARCHETYPE 4 � The Skeptical Seeker (Gen Z / Millennial)

**Who they are:**
- Maybe not a Christian yet, or newly curious
- Came to the app through a friend or gift
- Suspicious of anything that feels like church propaganda
- Asks hard questions and wants honest answers, not pat ones
- Probably uses the free tier first

**What their experience needs:**
- No assumed belief � questions that honor genuine doubt
- Historical and archaeological context front and center � they want to know this is real
- AI tone: intellectually honest, never defensive, genuinely curious alongside them
- Word studies matter � they want to know what the text *actually* says in Greek
- Cross-Reference Bingo might be the feature that hooks them � it feels like exploration not obligation

---

### ARCHETYPE 5 � The Seminary Student / Serious Scholar

**Who they are:**
- Wants every tool: Greek/Hebrew, morphology, BDB, Thayer's, multiple translations
- Cross-references and TSK are essential
- Wants to export structured notes for papers or teaching
- Calvin, Matthew Henry, and commentary variety matter
- May use this to prep sermons or lessons

**What their experience needs:**
- Power-user mode � all the lexical tools front and center
- Side-by-side translation comparison
- Structured export (notes, quotes, references)
- AI as a research partner, not a shepherd

---

### ARCHETYPE 6 � The New Believer

**Who they are:**
- Maybe just started following Jesus, or just started reading the Bible seriously
- Everything is new � doesn't know the stories, the structure, the context
- Can feel overwhelmed or lost
- Needs scaffolding and encouragement

**What their experience needs:**
- "What's happening here" context before every chapter � no assumed knowledge
- Simple, clear questions � not intimidating
- Celebration of small wins � reading Genesis 1 for the first time *should* feel like an achievement
- AI tone: friendly guide, patient, celebratory
- Chronological reading plan as the default recommendation

---

### The Personalization Engine � Cross-Cutting Concerns

**Onboarding questionnaire seeds the profile:**
- Name, age range, occupation/role
- Interests (multi-select + freeform): cooking, athletics, art, medicine, law, parenting, music, outdoors, history, etc.
- Faith background: new believer, lifelong Christian, skeptic/curious, returning after time away
- Reading goal: devotional, deep study, read through the whole Bible, follow a plan
- Tone preference: scholarly, devotional, conversational, challenging
- Time available: 10 min / 20 min / 30+ min per session
- Specific connections they want: history, archaeology, science, culture, personal application

**The profile grows over time:**
- AI reads journal entries and infers what resonates � if Tim keeps writing about provision and identity, that gets weighted
- Highlight patterns reveal what arrests attention
- Reading pace and completion rates inform how questions are pitched
- User can manually update their profile any time

**What gets passed to Claude per request:**
- Full user profile summary (concise � token budget matters)
- Current passage reference and cached text
- User's reading history on related passages (brief)
- Any prior journal entries on this chapter (for returning visits)
- The specific generation task (questions / commentary / word study / chef lens / etc.)

**The creative leap � AI-inferred personalization:**
- After 30 chapters of journal entries, Claude can *know* Tim in a way the questionnaire never could
- "Tim consistently engages with themes of worth and vocation. He struggles with application but asks sharp observational questions. His entries often mention his dad."
- This becomes part of the system prompt automatically � a living portrait
- This is the real moat. No other app does this.

---

## Decisions Made

### 1. ESV Licensing � NEEDS REVISIT
- Initially personal use; now targeting commercial release
- **Must contact Crossway** for a commercial license before launching publicly
- Free API (api.esv.org) fine for development and personal use phase
- **Fallback plan:** Launch with a public domain translation (KJV/WEB), add ESV as licensed tier later
- Cache all passage text in DB to minimize API calls at scale

### 2. Questions Model � RESOLVED
- **Hybrid AI-generated + cached**
- Question framework: Observation ? Interpretation ? Application (OIA pattern)
- AI generates questions once per chapter on first access, result cached in DB
- No regeneration cost per session

### 3. Users � REVISED
- **Multi-user with authentication** (Supabase Auth)
- Build starts with personal use (father + son) but schema supports many users from day one
- Per-user: journal entries, reading progress, streaks, reading plan selection
- No painful auth retrofit later

### 4. Reading Order / Navigation Modes � RESOLVED
- Book-by-book (default)
- Chronological year plan
- Topical (future � complex, deprioritized)
- Single book selection
- All modes coexist as selectable "plans"

### 5. Study Experience � RESOLVED
- Passage displayed **in-app** (via ESV API)
- **Questions shown before reading** (to guide focus)
- **Questions shown again after reading** (for reflection/response)
- Users **save journal answers** per chapter
- **Solo study only** � no community layer

---

## Open Decisions

### A. AI Provider � RESOLVED
- **Anthropic Claude Sonnet 4.5** (claude-sonnet-4-5 or latest � confirm exact API model string at runtime)
- OpenAI key kept as fallback
- Keys stored in `.env.local` only

### B. Database � RESOLVED
- **Supabase** (Postgres)
- Stores: cached AI questions per chapter, journal entries, reading progress/streaks

### C. Journal Entry Structure � RESOLVED
- Per-question response fields (one text area per OIA question)
- Plus an open "additional notes" field per chapter

### D. Progress Tracking � RESOLVED
- Chapter checkmark (studied)
- **Streak tracking** included from the start

### E. Mobile UX � REVISED
- **Strategy: No App Store.** Pure web SaaS on Vercel. PWA for home screen installation on iOS and Android.
- Keeps 100% revenue (no 30% Apple/Google cut)
- No App Store review process or content restrictions
- PWA gives installable, near-native feel on both platforms
- Background audio is the one real PWA limitation � acceptable tradeoff

### Phase Model � CLARIFIED
- **Phases are small and fast** � not "Phase 1: personal use" vs "Phase 2: commercial." Phases are 1-hour coding increments with Claude Opus 4.
- Expect a dozen or more phases to get to a working personal-use app.
- Commercial features (Stripe, etc.) are additional phases on top, not a separate project.
- Each phase should produce something that runs and is usable.
- **Coding model: Claude Opus 4** (confirm exact model string before first coding session).

---

## Tech Stack

### Phase 1 (Personal / Development)
- **Frontend / Framework:** Next.js (App Router)
- **Hosting:** Vercel
- **Auth:** Supabase Auth
- **Bible Text:** ESV API (api.esv.org) � free tier during dev; passage text cached in DB
- **AI (questions/commentary/onboarding):** Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5`) via `@anthropic-ai/sdk`
- **Database:** Supabase (Postgres)
- **PWA:** next-pwa or built-in Next.js PWA support
- **Email delivery:** Resend (Next.js-native, simple API, free tier sufficient for personal use)

### Phase 2 (Commercial Release)
- **Distribution:** Same Vercel web app � no App Store, no Google Play
- **Bible Text:** Commercial ESV license from Crossway (or public domain fallback)
- **Payments:** Stripe � tiered subscriptions + a la carte feature unlocks
- **Backend:** Same Next.js API routes / Supabase � no change
- **AI:** Switch to lower-cost Claude model (Haiku or equivalent) for question generation at scale
- **PWA:** Remains the mobile delivery method � users install from browser

---

## Major Feature Threads (Deep Brainstorm Needed)

### THREAD 1 � Personalization Engine
- Every user gets a profile with interests, occupation, life stage, theological background
- Tim's profile: aspiring chef, [father's son], personal history with the text
- AI uses this profile as context when generating: questions, commentary, connections, application prompts
- "Personalized study Bible" � same passage, different experience per user
- Could offer a onboarding flow: "Tell us about yourself" to seed the profile
- Profile evolves over time � AI can learn from journal entries what resonates
- **Big question:** How deep does personalization go? Per-chapter? Per-question? Per-commentary paragraph?
- **Potential commercial angle:** Each user gets their own "edition" of the Bible with their name on it

### THREAD 2 � Progress Map & Visual Bible Journey
- Not a simple checklist � a rich visual experience
- Ideas to brainstorm:
  - Interactive map of the ancient Near East � chapters/events pinned geographically
  - Timeline view � place chapters in historical chronology with world history context
  - "Books of the Bible" grid � color-coded by completion, genre, testament
  - Archaeological layer � photos, artifacts, sites connected to passages
  - A "you are here" in the grand narrative of Scripture
  - Personal stats: chapters read, words read, streak, highlights made, notes written
- This could become a major differentiator � no other app does this well

### THREAD 3 � Cross-References + TSK (Treasury of Scripture Knowledge)
- TSK is public domain � ~500,000 cross-references, the most comprehensive ever compiled
- Standard ESV cross-references built in (from API)
- TSK layered on top as a deeper research mode
- **Cross-Reference Bingo** � built-in feature:
  - Start at a random (or chosen) verse
  - Follow cross-references across the Bible like a trail
  - Track the path, see where you end up
  - Shareable "bingo card" of the trail taken
  - Could be a daily feature ("Today's trail starts at...")
- TSK data needs to be imported, parsed, stored in Supabase (one-time import)

### THREAD 4 � Commentary Layer
- Claude generates a contextual intro paragraph per chapter (historical, literary, theological)
- **Personalized connections** � using user profile, Claude finds relevant links:
  - **Tim (chef):** food in the Bible, ancient cooking methods, ingredients, hospitality customs, food laws (Leviticus suddenly gets interesting), the Last Supper as a meal, feeding of the 5,000 as a catering event
  - Future users: athlete, teacher, parent, lawyer, etc. � all get different connections
- **Spurgeon integration:**
  - "Morning and Evening" and "Treasury of David" and sermons are all public domain
  - Index Spurgeon's writings by passage reference
  - Surface relevant Spurgeon quotes/excerpts inline per chapter
  - Could be toggled on/off as a "Spurgeon layer"
- **Archaeological/historical layer:**
  - Connect passages to known archaeological discoveries
  - Photos, site descriptions, artifact references
  - Could pull from public domain sources or curated dataset
- Commentary layers are toggleable � user can turn on/off: Spurgeon, food connections, archaeology, etc.

### THREAD 5 � Sharing & Messaging
- Share a highlight + note via:
  - SMS (using device native share sheet on mobile)
  - Email
  - Copy to clipboard
  - Internal messaging between users (for father/son dynamic � could be a "send to Dad" button)
- Internal messaging is a big feature � essentially a Bible study discussion thread between two people tied to specific verses
- "Send this verse to Tim" with your note attached
- Could expand to small group use commercially

### THREAD 6 � Audio
- ESV has an audio Bible API
- Must-have for commute/workout listening
- Synced highlighting � highlight while audio plays (like karaoke)
- Background playback (PWA limitation � another reason for Expo Phase 2)
- Playback speed control

---

## Reading Experience Features

### Highlighting
- Multiple colors (yellow, green, blue, pink � standard 4)
- Stored as position references against cached passage text (character offsets)
- DB table: `highlights` � user_id, book, chapter, start_offset, end_offset, color, note
- Tap highlight to view/edit inline note

### Annotations
- **Unified with highlights** � a note is an optional field on a highlight
- Two levels: macro (chapter journal / OIA questions) and micro (inline highlight notes)
- Inline indicator icon when a highlight has a note attached

### Typography & Display
- **Font size control** � quick +/- or slider, persisted per user profile
- **Dark mode from day one** � quick toggle, persisted per user profile
- Consider sepia mode as a third option (easy on eyes for long reading)

---

## Open Commercial Decisions

### F. Monetization Model � IN ARCHITECTURE, DEFERRED
- **Stripe** for payments/subscriptions � will be built into the architecture now, activated at commercial launch
- Model TBD (one-time, freemium, or subscription) � decide before launch
- No Stripe integration needed during Phase 1 personal use

### G. ESV Commercial License � OPEN
- Contact Crossway at crossway.org before any public launch
- Have public-domain fallback (KJV/WEB) ready

### H. AI Cost Model at Scale � PARTIALLY RESOLVED
- **Phase 1 (family only):** Claude Sonnet 4.5 � quality over cost, negligible usage
- **Phase 2 (commercial):** Switch to a cheaper/faster model (Haiku or equivalent) for question generation at scale
- Generate once per chapter, cache forever � cost scales with unique chapters not users
- Migration is a one-line model string change

---

## AI Model
- **All generation (questions, commentary, onboarding, chat):** `claude-sonnet-4-5` (Claude Sonnet 4.5)
- **Commercial phase:** Switch to Haiku-tier model for cost � one-line model string change
- **Coding sessions:** Claude Opus 4
- **See:** [charles-persona.md](charles-persona.md) � the theological persona that shapes all AI generation

---

## AI Model Strategy
- **All generation (questions, commentary, onboarding, chat):** `claude-sonnet-4-5` (Claude Sonnet 4.5) � family phase
- **Brainstorming/planning sessions:** Claude Sonnet 4.5 (you're talking to it now)
- **Coding:** Claude Opus 4 (most capable � justified for a labor of love)
- **Commercial phase:** Downgrade generation to Haiku-tier � one-line model string change
- **Long-term:** Costs scale with unique chapter generations, not user count � very favorable economics

---

## Session Log

### 2026-02-18
- Initial brainstorm session
- Identified ESV licensing as first critical constraint
- Outlined three priority decisions: licensing path, questions model, accounts vs. local
- All major decisions resolved � personal use, hybrid AI questions, journaling, in-app reading, solo study
- AI provider: Anthropic (Claude Sonnet 4.5), with OpenAI as fallback
- Database: Supabase with Auth (multi-user from day one)
- Journal: per-question response fields + open notes field per chapter
- Progress: chapter checkmark + streaks
- **Pivoted to SaaS web platform** � no App Store ever, PWA only, Vercel hosted, 100% revenue retained
- Personalization engine is the core product � same Bible, radically different experience per user
- Feature tiers + a la carte purchasing to be designed
- Tim is first user; his profile seeds the personalization model � chef AND 3-sport athlete (XC, basketball, track)
- ESV licensing must be resolved before public launch
- Six major feature threads identified; expanded to 31 brainstorm sessions
- **Charles persona created** � modern voice, no archaic language, dynamic, sarcastic when warranted. Spurgeon's fire + MacArthur's spine + Ladd's Kingdom framework. See [charles-persona.md](charles-persona.md)
- New sessions added: Psalms as their own category, Lament mode, Canonical shape/typology, Sermon notes, Community of the Book, Catechism integration, Tim's arc over time

> **API keys stored in `.env.local` only � never commit that file.**

---

## Brainstorm Plan � Iterative Sessions

> Sessions can be added, removed, or reordered as the project evolves. Mark each DONE when resolved.

### The Conversational Onboarding Concept � LOCKED IN

**No forms. No questionnaires. A conversation.**

When a new user signs up, they don't see a form. They see a single prompt from Claude:

> *"Before we get started � tell me a little about yourself. I want to make sure this Bible feels like yours."*

Claude then listens, asks maybe two or three natural follow-up questions, and silently builds the profile from what they share. The user never sees fields being filled. They just feel heard.

**Why this is architecturally important:**
- The same conversation engine is reused throughout the app (freeform chat per passage, word study explanation, etc.)
- The profile isn't a static snapshot � it's the first chapter of an ongoing conversation
- The tone Claude uses in onboarding sets the tone for the entire app experience

**How it plays out per archetype:**

*Tim (15, chef):*
> Claude: "Tell me a little about yourself."
> Tim: "I'm 15, I want to be a chef someday."
> Claude: "That's cool � like fine dining or more like your own place? And is this your first time really reading the Bible or have you done it before?"
> Tim: "Both maybe. I've read some but not really studied it."
> Claude builds: age=15, occupation_goal=chef, faith_stage=familiar_not_deep, interests=[food, cooking, creativity]

*Prayer Warrior (87):*
> Claude: "Tell me a little about yourself."
> Her: "I've been reading this Book for 60 years. I just want to go deeper."
> Claude: "Sixty years � you know this text. Are you looking to pray through it, study it more academically, or something else?"
> Her: "Pray it. I want to pray every word."
> Claude builds: age_range=elderly, faith_stage=mature, primary_mode=prayer, tone=reverent, gamification=off, accessibility=large_font

*Skeptical Seeker:*
> Claude: "Tell me a little about yourself."
> Him: "Honestly I don't even know if I believe this. A friend gave me this app."
> Claude: "That's a completely fair place to start. What made you open it today?"
> Claude builds: faith_stage=skeptic/curious, tone=honest_not_preachy, default_layers=archaeology+history, no_assumed_belief=true

*New Believer:*
> Claude: "Tell me a little about yourself."
> Her: "I just became a Christian like two months ago. I don't really know where to start."
> Claude: "Two months in � that's exciting. Do you want me to help you find your footing, or do you already have a sense of where you want to begin?"
> Claude builds: faith_stage=new_believer, reading_plan=chronological, scaffolding=high, tone=friendly_guide, celebrate_milestones=true

**Technical implementation:**
- Onboarding is a short Claude API call with a structured extraction prompt
- Claude's job: have a warm natural exchange, then output a JSON profile object silently
- The conversation is 3-5 exchanges max � enough to feel real, not so much it's a commitment
- User can update their profile any time via a "Tell Claude more about yourself" chat in settings
- Profile evolves automatically as journal entries accumulate (separate background process)

**The opening line varies slightly by context � and the gifted flow is different:**
- **Gifted account (dad sets up for Tim):** Setup flow asks dad: *"Tell me about the person you're giving this to. Tell me as much as you want."* No word limit. No fields. Dad writes it. Claude reads it and builds the profile seed. The more dad shares, the richer Tim's first experience. The birthday letter is written here too � waiting for its day.
- Dad's seeded greeting when Tim first opens it: *"Your dad set this up for you. He told me about you. Let's see what this Book has to say."*
- Self-signup: "Before we get started � tell me a little about yourself."
- Returning user who wants to update: "It's been a while � anything changed since we last talked?"

---

### SESSION 1 � User Profile Schema \& Personalization Architecture � IN PROGRESS

**Extraction method: Option B** � Guided conversation with hidden structure. Claude knows what fields it needs but asks naturally, doesn't repeat what's already been given, and follows the conversational thread rather than a script.

**Profile visibility:** Transparent but buried a few steps. User can see "here's what I know about you" and edit it � but it's not the first thing they see. A settings area: "Your Profile" or "What Charles knows about you."

**Gifted account letter:** User's choice. Setup flow asks the giver: *"Would you like Tim to be able to read what you wrote about him someday?"* If yes, it's stored as a letter that can be revealed � on his birthday, or when he turns a certain age, or whenever dad decides. If no, it stays as background profile data only.

#### Category 1 � Identity Anchors (DETAILED)
- **Name + Nickname:** Both available. Charles uses the preferred name. "Tim" vs "Timothy" vs "T" � matters to a 15-year-old.
- **Age / Life Stage:** Not a form field. Inferred conversationally, but Claude is prompted to gently draw this out because younger users will under-share. Life stage options to surface as gentle prompts if needed:
  - Kid/Student (middle school)
  - High schooler
  - College / young adult
  - Young professional
  - Parent of young kids
  - Midlife
  - Empty nester / grandparent
  - Retired
  - Senior adult
  - "I'd rather not say" always available
- **Vocation / Calling:** Multiple � people contain multitudes. Tim is a chef *and* an athlete *and* a student. Options include freeform + suggested tags. Also: "I'm still figuring that out" is a completely valid answer and Charles treats it as such � actually *that* answer opens up rich territory.
- **Key Relationships:** Who are they reading with or for? Parent, spouse, child, friend, small group, alone. Family sharing mode: a family unit can link accounts, share reading plans, see each other's progress (opt-in, per-member). Accountability partnerships. This is the seed of the small group commercial feature.

#### Category 2 � Faith Posture (DETAILED)
- **Faith stage:** Conversationally extracted � never asked bluntly. Charles listens for signals.
  - New believer / just started
  - Growing, been at this a while
  - Mature, deep roots
  - Skeptical / curious / not sure
  - Returning after time away
  - "It's complicated" � Charles just says "fair enough" and calibrates from what comes next
- **Church background:** Shapes vocabulary and assumptions. Not a judgment.
- **Theological depth:** Spectrum from "just help me understand what I'm reading" to "I want the Greek." Charles infers and adjusts.

#### Family Sharing & Privacy Model � RESOLVED
- **Everything is private by default.** Journal entries, highlights, annotations, reading progress � all personal.
- **Sharing is always opt-in, always granular.** User chooses: share this highlight, share my progress, share this journal entry. Not a blanket setting.
- Family unit: linked accounts can share a reading plan and see each other's completion progress � but only if both members opt in individually.
- Internal messaging (verse/highlight sends) is initiated by the sender, not exposed automatically.
- No family member ever sees another's journal unless the writer explicitly shares that specific entry.
- This model scales to small groups and commercial use identically.

#### "Just Read" Mode � RESOLVED
- Tim (or anyone) taps "Just Read" on the home screen or chapter screen.
- Charles adjusts his approach: no pre-reading study questions front and center, lighter touch.
- But questions don't disappear � they're available, just collapsed or minimal. Reading without any engagement option is too passive; the questions are still there if he wants them.
- Journal is still accessible.
- Charles's commentary is still present but shorter � a single orienting sentence rather than a paragraph.
- Essentially: reduced friction, not zero engagement. The text is still doing its work.
- **Goals are changeable day by day.** Not locked at onboarding. The home screen can have a "what are you here for today?" soft prompt � devotional warmth, deep study, just read, I need something specific.
- **Primary goal types:** Devotional / Deep study / Read through the whole Bible / Follow a plan / One book / Hard season
- **Time budget:** 10 / 20 / 30+ min � shapes question depth and commentary length
- **Cadence:** Daily / Few times a week / Whenever
- **Reminders / Delivery options:**
  - Push notification at a chosen time (PWA, limited on iOS)
  - SMS reminder (via Twilio or similar)
  - Email reminder
  - **Email the day's reading** � actual passage + questions delivered to inbox. Day 1 feature. Email service: Resend (simple, Next.js-native). Format: passage text, 2-3 pre-reading questions, Charles's context note, "Open in app" button.
  - All reminders optional, user-configured, off by default

#### Category 4 � Personalization Seeds (DETAILED)
- **Interests:** Multi-select + freeform. Starter tags: cooking, athletics, medicine, law, parenting, music, visual art, history, science, outdoors, business, teaching, military, farming, engineering. Room to add freely. This list grows with the product.
- **Current life context:** Opt-in only. User chooses to "give an update" � not prompted automatically. A button: "Tell Charles what's going on in your life right now." This feeds into the living portrait.
- **Critical guardrail:** This app is NOT a counselor. If a user's update contains language suggesting crisis, self-harm, grief, or serious mental health need � Charles acknowledges it warmly, does not engage as a therapist, and gently points to appropriate resources. The app stays in its lane. Charles says: "I'm a Bible study tool, not a counselor � but God's Word has met people in exactly this place before. Let's find that together." Then gets out of the clinical territory.
- **Tone:** Dynamic. Charles infers it from the conversation and from journal entry patterns over time. User can also set a preference but it's not mandatory.

#### Category 5 � Feature Defaults (DETAILED)
Set by inferred archetype at onboarding, fully adjustable any time:
- Spurgeon layer: on/off
- Gamification (streaks, XP, achievements): on/off � off by default for older archetypes
- Lament mode availability: always available, never pushed
- Commentary depth: brief / standard / deep
- Font size: standard / large / extra large
- Color theme: light / dark / sepia
- Highlight colors: all on by default
- Notification preferences: all off by default

#### Token Strategy � RESOLVED
- **Tim / personal phase:** Wide open. Generous context. No token optimization. The profile, the passage, the living portrait, prior journal entries on this chapter � all of it goes in. This is a labor of love, not a cost center.
- **Commercial / scale phase:** Switch to Haiku-tier model + compressed prompts. One-line model change. But that's future-Charles's problem.
- **System prompt structure (three layers):**
  - Layer 1 � Static persona (~400 tokens): Charles's voice, theology, banned phrases, counselor guardrail
  - Layer 2 � Full living portrait (~500-800 tokens for Tim): not a compressed paragraph � a rich, specific description. Gets regenerated every 5-8 journal entries. As detailed as it needs to be.
  - Layer 3 � Session context: passage text, book/chapter, reading mode, any prior journal on this chapter, any recent "life update" the user gave
- **Total per call for Tim:** ~2,000-3,000 tokens of context. Fine. Worth it.

#### Auth � RESOLVED
- **Both magic links AND username/password.** User chooses at signup.
- Magic links: lower friction, great for mobile, no password to forget � default recommendation
- Username/password: for users who want it, commercial standard
- Supabase Auth handles both natively

#### Tone & Energy � RESOLVED
- **This app is NOT a quiet contemplation app by default.** Theology is fun, engaging, and edifying. Charles has energy. The UI has life.
- Quiet/contemplative mode exists (lament mode, Just Read mode) but it's a gear the user shifts into, not the default setting.
- The home screen should feel like opening something you're excited about, not entering a library.
- Charles's default register: engaged, curious, occasionally surprising. The text is the most interesting book ever written and Charles acts like it.

#### Onboarding Conversation � FINAL SPEC
- Natural, back-and-forth, no pressure to be brief
- User can ramble, circle back, change their mind � Claude follows the thread
- Not 3-5 exchanges � **as long as it needs to be.** If Tim wants to talk for 10 exchanges, great. More profile data, better experience.
- No "completing onboarding" progress bar. No "Step 2 of 4." Just a conversation.
- When Claude has enough to work with, it finds a natural moment to close: *"Alright � I think I've got a good sense of you. Let's get started."*
- Extraction call fires silently after the conversation ends
- Profile is available immediately for the first chapter

#### SESSION 1 � COMPLETE ?



### SESSION 2 � Supabase Schema Design ? COMPLETE
Design every table before a line of code is written. **Full schema documented in `sql/` folder (files 01�11).**

**Tables designed (22+ tables across 11 files):**
- `sql/01-core-auth-profiles.md` � profiles, profile_interests, user_life_updates, family_units, family_members
- `sql/02-reading-plans.md` � reading_plans, plan_chapters, user_reading_plans
- `sql/03-bible-content.md` � chapters (ESV text cache), questions (OIA bank), personalized_content (AI-generated, keyed to user+chapter, profile_hash for stale detection)
- `sql/04-journal.md` � journal_entries, journal_answers
- `sql/05-highlights-bookmarks.md` � highlights (6 colors + inline annotations), bookmarks, messages (AI chat threads per passage)
- `sql/06-progress-gamification.md` � streaks, achievements, user_achievements, memory_verses (SM-2 spaced repetition), prayer_journal
- `sql/07-source-data.md` � tsk_references, spurgeon_index, catechism_entries, typology_connections, bible_dictionary_entries, commentary_entries, hymn_index
- `sql/08-word-study.md` � strongs_lexicon, morphology_data, word_occurrences
- `sql/09-geography-archaeology.md` � geographic_locations, passage_locations, archaeological_sites
- `sql/10-notifications-settings.md` � notification_settings, user_display_settings, feature_toggles
- `sql/11-extensibility.md` � cross_reference_trails, trail_steps, audio_progress, integrations, onboarding_conversations

**Design principles applied:** UUIDs everywhere, `meta jsonb` extensibility on all tables, profile_hash for AI content cache invalidation, RLS on all user tables, soft deletes on precious data, subscription_tier hooks for commercial gating.

### SESSION 3 � AI Prompt Architecture ? COMPLETE

#### 4 Distinct Prompt Call Types

1. **Content Generation** � fires once per `(user � chapter)`, result cached in `personalized_content`. Generates intro hook, life-connections, all 5 OIA questions, closing. Single call, one context window. Stale when `profile_hash` changes.
2. **Answer Response** � fires when user submits an OIA answer. Charles reads the user's response and replies. NOT cached. Length and depth mirror the user's answer � a one-liner gets a short reply; a genuinely thoughtful answer earns a full engagement.
3. **Chat** � Session 18's freeform "ask me anything about this passage." Stateful. Pulls message thread from `messages` table. Always `claude-sonnet-4-5`.
4. **Living Portrait Regeneration** � background job, fires every **5-8 journal entries**. Reads recent entries + existing portrait + full profile ? produces richer updated portrait. Writes both `living_portrait` (text, for prompt injection) and `living_portrait_json` (structured, for app display).

#### Profile Briefing � How Charles Knows Who He's Talking To
- **Primary:** Option C � `living_portrait` text injected directly into the system prompt as the user description block. Already written in natural language, already in Charles's register.
- **Fallback:** Option B � server-side rendered template from profile fields, used when portrait hasn't been generated yet (new users).
- **Portrait must be very robust** � not a summary paragraph. A multi-section document covering: who this person is, their identity lenses (chef, athlete), faith journey, observed study patterns, current life season, inferred tone preferences, family context, notable things they've said or noticed. The `living_portrait_json` stores these sections structurally; `living_portrait` is the rendered prompt string.
- Target length: 500-800 tokens for Tim. Enough that Claude genuinely knows this person.

#### OIA Question Model � Model B: Fully AI-Generated, All 5 Questions
- All 5 questions generated by Claude per `(user � chapter)`. No bank. No curation. Fully personalized.
- **Observation is the cornerstone.** Good interpretation is impossible without exhaustive observation. The OIA method demands you know what the text *says* before you ask what it *means*. Rushing to interpretation is the most common Bible study failure.
- Observe questions must surface: vocabulary analysis, word order and grammatical choices, sentence/paragraph structure and patterns, historical and cultural context, identification of literary devices, who/what/when/where/why of every claim in the passage.
- **Question distribution: 3 Observe, 1 Interpret, 1 Apply** � deliberately front-weighted toward observation.
- All 5 generated in a single call for thematic coherence. The questions should feel like a unified progression, not 5 independent thoughts.

#### JSON Response Contract
```json
{
  "intro": "Charles's opening hook for this chapter (2-4 sentences)",
  "connections": [
    {
      "type": "life | athletic | season | historical",
      "label": "short display label � 'In the Kitchen' / 'On the Course'",
      "text": "2-3 sentences connecting this passage to user's life"
    }
  ],
  "questions": [
    {
      "oia_type": "observe | interpret | apply",
      "text": "the question",
      "answer_prompt": "short coaching hint shown below the question to guide user's thinking"
    }
  ],
  "closing": "Charles's sign-off (1-2 sentences)"
}
```
Questions array is ordered: 3 Observe ? 1 Interpret ? 1 Apply. `answer_prompt` is the gentle nudge visible beneath each question � not the answer, just a thinking frame.

#### Counselor Guardrail � Final Language
> *"If the user expresses suicidal ideation, self-harm, abuse, or any crisis language, respond with genuine warmth, provide the 988 Suicide & Crisis Lifeline (call or text 988, US), and if the user may be outside the US note that local crisis resources are available. Do not attempt to counsel. Do not engage the theological angle. Express care, give the resources, stop. For grief, anxiety, depression, or hard seasons � engage pastorally and Scripturally with warmth. Do not diagnose, prescribe, or provide clinical guidance. You are a theological companion, not a therapist."*
- Safety resources always given � no softening, no exceptions.

#### Token Strategy
- **Tim:** `claude-sonnet-4-5`, one call, all 5 questions, full context � no compromise.
- **Commercial users at scale:** `claude-haiku` for content generation (same prompt architecture, cheaper model). Answer response and chat always stay on Sonnet � those are real-time interactions that can't afford to feel cheap.
- Content generation is the only call that can be downtiered. Everything else is live.

### SESSION 4 � Progress Map & Visual Bible Journey ? COMPLETE

**No AI image generation anywhere in this feature.** Sacred text + AI inconsistency = wrong tool. All visuals are SVG, CSS, typography, and designed iconography.

#### Six Active Concepts (concept 5 � AI chapter illustrations � cut)

**1. Fog of War Map** (always on � the core geographic view)
- The ancient Near East map starts completely black/fogged
- Every passage read that mentions a location lights up that region from darkness
- Cities appear, roads emerge, coastlines glow in as you read the passages that mention them
- By the time you've read the whole Bible, the entire world is illuminated � a world you personally unveiled
- Tap any revealed location ? key events there, dictionary entry, what you've read set there
- Archaeological layer toggle: pins appear at excavated sites with brief description + Scripture connection
- Tech: Custom SVG map, CSS masking layer, driven by `geographic_locations` + `passage_locations` tables. No API cost.

**2. Cinematic Universe � Bible as Phases**
- The 66 books are organized into Phases (not generic genres � narrative phases of the one story):
  - Phase 1: Origins (Pentateuch)
  - Phase 2: The Kingdom Era (History books)
  - Phase 3: Wisdom & Worship (Poetry)
  - Phase 4: The Warning Arc (Major + Minor Prophets)
  - Phase 5: The Main Event (Four Gospels)
  - Phase 6: The Church Unleashed (Acts + Epistles)
  - Phase 7: The Finale (Revelation)
- Each book has a **Criterion Collection-style typographic poster**: bold color field, massive title type, one SVG geometric symbol. Designed once, never generated. Genesis = black field, "IN THE BEGINNING," circle of light. Exodus = deep blue, gold type, flame SVG. Revelation = dark red, white type, lamb silhouette.
- Unread books: desaturated/dim poster. Completing a book: poster comes alive, gold border, title card drop animation (Lottie or CSS keyframe).
- Completing a Phase triggers a "Phase Complete" moment + Charles drops a phase-level insight.
- "Now Reading: Mark" badge treatment.

**3. Character Collection**
- 3,237+ named people in the Bible. Every first mention = card earned.
- **No AI portraits. No faces.** Cards are heraldic: character name in large display type, role, era, key verse, and a **calling symbol** (SVG icon): crown for kings, scroll for prophets, fishing net for apostles, flame for Spirit-filled, sword for warriors, harp for musicians, measuring line for builders, etc.
- Rarity tiers (vocabulary TBD � see below): tiered by narrative significance, card border and icon treatment scales up accordingly.
- Special "Athlete of Faith" badge: David, Elijah (outran a chariot), Paul (runner metaphors), Samson, Jonathan. Tim's collection surfaces these first.
- Cards filterable by: testament, era, role, tribe/nation, rarity.
- Character data sourced from public domain Bible dictionaries (Easton's, Smith's, ISBE) � already in `bible_dictionary_entries` table.

**4. Identity-Adaptive Visual Themes** � DAY 1 FEATURE
- Same data layer, radically different visual presentation based on user identity. Selected during onboarding or changed in settings. Non-default themes as premium unlock.
  - **Tim (chef + runner):** Books Grid = race course with mile markers. Completion % = runner silhouette moving down the course. Finishing a book = split time drop.
  - **SAHM:** Home with many rooms. Books = rooms filling with warm light. House grows wings as she reads. Foundation = Creation, Rooftop view = Revelation.
  - **Scholar:** Floor-to-ceiling library. Unread books = blank spines. Read books = titled, annotated spines that look lived-in.
  - **Prayer Warrior:** Garden path winding through blooming landscape. Motion is slow, peaceful, not urgent.
  - **Seeker/Skeptic:** 66-piece puzzle assembling from outside in. Shape of the puzzle = a cross. Each piece snapping = a book complete.
- Additional themes can be added post-launch without DB changes (pure frontend).

**6. Living Constellation Sky** (alternate ambient view � not the default)
- 66 books as stars. Brightness = % of book read. Color = section (blue = Law, gold = Poetry, red = Prophecy, white = Gospels).
- Finishing a book: star pulses, constellation forms � visible shape from biblical imagery.
- Full sky when all 66 books read = stunning. The 87-year-old Prayer Warrior lives here.
- Tech: Canvas or lightweight Three.js. Star positions are fixed (designed). Constellation paths are SVG overlay. No API cost.

**7. Skill Tree**
- Nodes represent books/passages. Root = Genesis. Reading unlocks adjacent nodes.
- Lateral unlocks: reading the Tabernacle chapters (Ex 25-40) unlocks a "Architecture of Holiness" theology node. Reading Isaiah 53 unlocks "Suffering Servant" typology node. Reading Romans 3-5 unlocks "Doctrine of Justification" mastery node.
- Node color codes: Blue = narrative unlock, Gold = theological concept unlock, Green = cross-reference unlock, Red = hard passage ("you've earned the tools now").
- Makes the Bible's dependency structure visible and turns prerequisite reading into reward rather than obstacle.
- Tim gets this immediately � it's a tech tree.

#### Open Question: Rarity Tier Vocabulary
- Standard gaming language (Common/Rare/Epic/Legendary/Mythic) � familiar but possibly jarring in a Bible context
- Alternative: Servant / Faithful / Mighty / Renowned / Eternal � maps to biblical honor language
- Need a decision before UI is built. Leaning toward **Faithful / Renowned / Mighty / Eternal** with Christ as a separate "The Word" tier.

#### Personal Stats Dashboard
Accessible from the progress screen � secondary panel. Chapters read / % of Bible, current + longest streak, study time, most active book, memory verses mastered, journal count, questions answered.

### SESSION 5 � TSK + Cross-Reference Bingo ? COMPLETE

#### What the TSK is
~500K cross-reference pairs. Every verse linked to every other verse it echoes, quotes, fulfills, or illuminates. It is the Bible's internal dialogue across 1,500 years of writing. Stored in `tsk_references` (07), indexed both directions. Pre-computed density stats in `tsk_verse_stats` for gutter display.

#### The Four Trail Modes

1. **Daily Trail** � **Two per day, morning and evening**, mirroring Spurgeon's Morning & Evening rhythm. AI-selected based on what the reading community is currently in (majority reading plan position). Starting verse changes at midnight. Community stat shown: "Today 847 people started at Isaiah 53:5. The longest trail reached 34 verses." Wordle energy � daily, shared, creates conversation.

2. **Thread the Needle** � **Launch feature.** Given two verses that seem unconnected, find the shortest TSK path between them. Speed + fewest hops = score. Puzzles curated by us. Hard and delightful simultaneously for Scholar and competitive Tim archetypes.

3. **Free Exploration Trail** � On any reading screen, tap the cross-reference icon on any verse. Slide-up panel shows TSK references grouped by type (quotation, echo, fulfillment, parallel). Tap any to jump. Tap "Add to Trail" to keep building. Persistent trail pill at bottom of screen shows step count. Seminary students disappear into this for two hours.

4. **Canonical Constellation Visualization** � At trail completion, verses are rendered as a D3.js force-directed graph: nodes = verses, edges = TSK connections. SVG cached to `cross_reference_trails.svg_cache`. Completed trails become named constellations in the user's Session 4 night sky. "The Isaiah-Romans Trail."

#### The Thread System (replaces "Bingo" framing)
- Each book has **12 canonical threads** � recurring themes the TSK reveals (atonement, covenant, the name of God, rest, exile, etc.) stored in `thread_definitions`.
- When a trail touches all instances of a thread across both testaments � user has **"Pulled a Thread."**
- Pull all 12 threads in a book = Thread Complete. Book tile on Cinematic Universe screen gains a woven pattern overlay � literally showing threads traced.
- Long-term structure for what would otherwise be random exploration. Always something specific to hunt: "I'm two verses short of pulling the 'Rest' thread through Hebrews."

#### Reading Screen UI
- **Reference density gutter**: thin vertical bar beside verse numbers. Density tier drives display: none (0 refs) = nothing, low (1-5) = subtle dot, medium (6-15) = small badge, high (16+) = glowing badge. **On by default, toggleable in display settings.** Teaches readers that some verses are more cosmically connected without them doing anything.
- **Cross-reference panel**: slide-up on verse tap. TSK refs grouped by type. "Add to Trail" button.
- **Active trail pill**: persistent at reading screen bottom when trail in progress.

#### Sharing
- Completed trail generates a **shareable SVG constellation** (D3 render ? SVG export ? PNG). No AI generation � purely data-driven geometry.
- Share via: copy link (opens app to read-only trail view via `share_token`), or download/share PNG constellation image.
- Trail constellation shared to Instagram/SMS = free marketing. The art is yours, generated from your reading.

#### Tech Decisions
- **Graph visualization:** D3.js force-directed graph
- **TSK density:** Pre-computed at import time into `tsk_verse_stats` (not runtime aggregation)
- **Daily trail selection:** AI call at midnight using Sonnet � one call per day for the whole platform, trivially cheap
- **Trail storage:** `cross_reference_trails` + `trail_steps` (file 11), expanded with `trail_type`, `share_token`, `svg_cache`, `step_count`, `daily_trail_id`

### SESSION 6 � Commentary Layers Deep Dive ? COMPLETE

#### The Sources
| Source | Coverage | Vibe | Default for |
|---|---|---|---|
| **Charles (AI)** | Every chapter, personalized | Always on � the primary voice | Everyone |
| **Spurgeon � Morning & Evening** | Verse-anchored daily devotional | Warm, pastoral, alive | Most archetypes |
| **Spurgeon � Treasury of David** | Psalms only | Exhaustive, devotional | Psalms chapters |
| **Spurgeon � Sermons** | 3,500+ indexed by text | Rhetorical, convicting | Scholar, mature |
| **Matthew Henry** | Full Bible, verse-by-verse | Thorough, pastoral, verbose | Scholar, Prayer Warrior |
| **John Calvin** | Most of NT + some OT | Precise, exegetical, Reformed | Scholar only |
| **Adam Clarke** | Full Bible, philological | Dense, word-level, technical | Scholar only |

#### Three-Tier Layer Architecture
**Tier 1 � Charles (always on, always personalized)**
Default commentary for every user. Weaves historical background, literary observation, theological weight, and personal lens connections. Can cite historical commentators inline: *"Matthew Henry called this 'the hinge of the whole epistle' � and he wasn't wrong."* Charles synthesizes; scholars are his sources.

**Tier 2 � Spurgeon Card (semi-surface, one tap to expand)**
Special treatment � not buried in a deep menu. Surfaced as a card because:
- His prose is the most readable of any 1800s commentator � still alive, not academic
- Morning & Evening links directly to the two-trails-per-day rhythm from Session 5
- Treasury of David makes the Psalms section uniquely rich
- Charles's own theological DNA is Spurgeon � quoting him feels natural

**Spurgeon Card placement:**
- Morning slot ? **top of chapter view**, before verse 1, as devotional framing
- Evening slot ? **bottom of chapter view**, after the chapter text, as reflection
- Mirrors the Morning & Evening structure literally

**Tier 3 � Commentary Vault (intentional one-tap to open)**
Matthew Henry, Calvin, Clarke live behind a "Commentary" button. Opens as a **tabbed panel** � one scholar at a time, not a mixed feed. Their voices are distinct enough that mixing them is confusing.
Access is not hidden � just not in the way. The SAHM at 5am doesn't need Calvin on Romans 9.

#### Archaeological Note (always shown, no toggle)
When a chapter is set in a location with site data, a brief note (1-2 sentences from `archaeological_sites`) appears inline between Charles's intro and verse 1. Always shown. Always brief. Always grounding. "Modern excavations at Tell es-Sultan confirm Jericho as one of the oldest inhabited cities on earth � 10,000 years of continuous habitation. This is the road Jesus walked."

#### Toggle Defaults by Archetype
| Layer | Tim | SAHM | Prayer Warrior | Skeptic | Scholar | New Believer |
|---|---|---|---|---|---|---|
| Charles | ? | ? | ? | ? | ? | ? |
| Spurgeon Card | ? | ? | ? | ? | ? | ? |
| Matthew Henry | ? | ? | ? | ? | ? | ? |
| Calvin | ? | ? | ? | ? | ? | ? |
| Adam Clarke | ? | ? | ? | ? | ? | ? |
| Word Note (see below) | ? | ? | ? | ? | ? | ? |
| Archaeological pins | ? | ? | ? | ? | ? | ? |

#### The Word Note � Tim's Version of Adam Clarke
Tim doesn't get the full Adam Clarke vault (homework). He gets a **Word Note**: one key word per chapter, synthesized to one punchy sentence. **On by default for Tim and Scholar; off for others.**

**Full pipeline:**
1. Strong's number identified for the key word of the chapter
2. `strongs_lexicon` � original word, transliteration, morphology, full definition
3. `commentary_entries` (Clarke) � Clarke's philological note on that specific word, if it exists
4. Charles synthesizes all of it into one sentence the user actually wants to read

Example: *"The word translated 'endurance' is* hupomone *� it literally means to remain under a heavy load and not collapse."*

This is Clarke's insight without Clarke's density. Tapping the Word Note chip expands to show the full `strongs_lexicon` entry and the Clarke source note for users who want to go deeper.

`word_note` jsonb shape in `personalized_content`:
```
{
  strongs_number, original_word, transliteration,
  morphology, short_def,
  clarke_note (raw Clarke source if exists),
  charles_synthesis (the one punchy sentence)
}
```

#### The Lens Mandate
Charles is **required** to connect every chapter to the user's active identity lenses (`profile_interests`). For Tim: chef lens + athlete lens, every chapter, no exceptions.

**When a genuine connection exists** ? he makes it, fully.

**When no obvious connection exists** ? he does NOT just name the gap and move on. He reaches into the **Creative Fallback System**, tried in priority order:

1. **Archaeological Surprise** � something physically excavated that makes the text real. *"Archaeologists found a first-century bema seat in Corinth matching Acts 18:12 exactly. Paul stood on that stone."* Pulls from `archaeological_sites`. First choice when data exists.
2. **Geography Drop** � one physical fact about the location that reframes everything. *"The Negev gets less than 8 inches of rain per year. When this text says they were 'thirsting' � that's not a metaphor. That's Tuesday."* Pulls from `geographic_locations`.
3. **Historical Frame** � what was happening in the world when this was written that changes the text. *"Paul wrote this during Nero's reign � a man who lit Christians on fire to light his garden parties. When Paul says 'suffering,' he's not being abstract."* Charles generates from training knowledge.
4. **Cultural Key** � a first-century or ANE social/legal/religious custom modern readers miss that unlocks the passage. *"In first-century Jewish culture, 'firstborn' wasn't birth order � it was a legal designation carrying double inheritance rights. Everything in this chapter turns on that."*
5. **Charles's Wildcard** � last resort, often the most interesting. Typology, intertextual resonance, structural pattern, or a linguistic observation no one expects. Announced: *"There's no running in this chapter and nobody's cooking anything. But here's what most people miss entirely..."*

**The rule:** categories tried in order, first with real data for this chapter wins. Charles never announces which category he's using � it just reads as him being genuinely interesting.

For other users, lenses come from `profile_interests` � extensible. Nurse gets healing lens. Lawyer gets justice/covenant lens. Engineer gets structure/design lens.

#### Charles Quoting Commentators � Option B (direct quotes)
All sources are public domain � zero copyright risk. Charles receives the 3-5 most relevant Spurgeon/Henry passages for the chapter in his context window and decides whether to quote verbatim or paraphrase. Direct Spurgeon quotes inside a Charles response are *exactly* the experience: the historical voice and the modern voice in conversation.

#### Caching
- Charles/personalized_content: generated once, cached until `profile_hash` changes (Session 3)
- Historical commentary text: static DB reads � zero generation cost
- Spurgeon card: single query on `spurgeon_index` by `(book, chapter)` � free at read time
- Word Note: generated as part of content generation call � stored in `personalized_content.word_note`

### SESSION 7 � Sharing & Internal Messaging ? COMPLETE

#### External Sharing � Five Content Types

| Content | SMS | Clipboard | Download PNG | Internal |
|---|---|---|---|---|
| Verse / passage | ? | ? | ? | ? |
| Highlight + annotation | ? | ? | ? | ? |
| Journal answer | � | ? | � | ? |
| Trail constellation | � | ? (link) | ? | ? |
| Streak card | ? | � | ? | � |

Journal answers: no one-tap SMS � too personal, too easy to blast accidentally. Copy-to-clipboard only for external; full internal sharing. Trail constellation: share token generates a read-only deep-link (`/trail/[share_token]`) + downloadable SVG/PNG. Streak card: styled SVG card, "Day 47 in the Word," option to include a verse from that day. No native social API integrations � download PNG + open app is the standard flow.

All external shares logged in `shared_content` table with `share_token`, `view_count`, `expires_at`. Public token reads handled at API layer via service role.

#### Internal Messaging � The Verse Thread

Every message is **anchored to a specific verse**. Not a general chat � a conversation that lives permanently inside Scripture.

**The mechanic:**
- From any verse on the reading screen, tap the verse menu ? "Send to [family member]"
- Composer opens: verse quoted at top (locked), message body below (1,000 character limit)
- Both directions: Tim can initiate a thread just as easily as Dad can � and should be. "Dad, look at verse 4. This is what you always say."
- Reply threading: `parent_id` on messages supports nested replies

**The reading screen indicator:**
A **colored flame** appears in the verse gutter when a family thread message exists on that verse. Color = family unit accent color. Private � only visible to unit members. Tapping the flame opens the thread inline.

**Over time:** The family thread becomes a living record � Dad's note on Romans 8:28 when Tim was going through something hard, Tim's reply three days later. That exchange lives permanently anchored to that verse, surfaced every time either of them reads Romans 8. This is the birthday letter mechanic's ongoing sibling. The letter is a one-time gift. The verse thread builds over years.

#### Read Receipts
- Simple "seen" indicator. Dad knows when Tim has read his message.
- Tim (or any user) can disable read receipts in settings (`read_receipts_visible` on `family_members`).
- Stored as jsonb on `verse_thread_messages.read_by`: `{"user_uuid": "iso_timestamp"}`. Null = unseen.
- Teenagers deserve some privacy. The toggle is visible and easy.

#### Charles Nudge (opt-in, off by default)
When a verse thread message goes unanswered for 7+ days, Charles can optionally send a gentle notification: *"Tim hasn't replied to your note on Romans 8:28. He might still be thinking about it."*
- Off by default (`charles_nudge_enabled` on `notification_settings`)
- **User is shown this option explicitly** during settings discovery � not buried. It feels faintly manipulative until you need it, and then you're grateful.

#### Small Groups � Day-1 Architecture, Post-Launch Activation
`family_units` and `family_members` already support any user grouping. Groups need: group size limit, `leader` role with broadcast ability, group discovery/join flow. Data model is essentially already built. Ship family thread day 1. Open groups in the first major post-launch update.

#### Notification Delivery (Verse Thread)
1. **Push** � fires immediately on new message if enabled
2. **Email via Resend** � fallback ensuring nothing is missed. Template: *"Your dad left you a note on Romans 8:28."* ? deep-link tap opens app directly to that verse with thread visible
3. Deep-link routing required from day 1: `/read/[book]/[chapter]?verse=[v]&thread=open` � must be in routing architecture from the start

### SESSION 8 � Audio Layer ? COMPLETE

#### Source: ESV Audio API
`api.esv.org/v3/passage/audio/` � MP3 per chapter, professional narration (Max McLean). Same licensing situation as text API � negotiate before commercial launch. Cached to **Supabase Storage** keyed by `(book, chapter, translation)` on first fetch. One API call per chapter ever, then zero cost.

#### The Three Player States
**State 1 � Expanded player:** Book/chapter title, current verse reference (live-updating), play/pause, 15s skip back/forward, scrubber, speed selector (0.75x / 1x / 1.25x / 1.5x / 2x), read-along toggle.

**State 2 � Mini player (persistent):** Pill bar above bottom navigation when user leaves reading screen during playback. Label, play/pause, thin progress bar. Tap to expand. Standard mobile audio pattern � users already know it.

**State 3 � Background playback:** Media Session API (`navigator.mediaSession`) � sets lock screen controls, keeps audio alive on iOS Safari 15+ and modern Android. Required for Tim to run with the app playing.

#### Verse Timestamp Alignment � Option B (Automated Forced Alignment)
ESV audio provides no per-verse timestamps. We generate them at import time using a forced aligner (`aeneas` or `gentle`) � audio file + text transcript ? verse-level timestamps automatically. Run once per chapter. Output stored in `chapter_audio_timestamps` table as `{verse, start_seconds}` array.

At playback: app watches audio `currentTime`, fires verse-highlight events when timestamp thresholds pass. Current verse gets a **warm amber background highlight** (transient � distinct from user's manual highlights, disappears on pause). Text auto-scrolls to keep highlighted verse visible.

#### Read-Along
- **On by default when screen is visible, auto-off when screen locks** (no point highlighting verses user can't see)
- Amber highlight color � warm, unambiguous, doesn't clash with any of the 6 user highlight colors
- Smooth fade transition between verses

#### Playback Position Persistence
`audio_progress` table (file 11) stores `position_seconds` per `(user, book, chapter)`. On return to a chapter: 'Resume from 3:42' prompt � user taps to resume or restart. Not auto-resume (some users want to restart).

#### Auto-Advance (Running Mode � Tim's use case)
Tim runs 45-minute cross country miles. He queues a chapter, pockets the phone, runs. When the chapter ends, the next chapter in his reading plan auto-queues with a 3-second 'Up next: Mark 2' card.
- **Opt-in, but actively prompted** after the first chapter ends: 'Want to auto-advance? Turn it on in settings.' One prompt, never asked again.
- Speed preference saved per user (`audio_progress.meta` initially).

#### Progress Credit for Audio
- Listening to a chapter = **full reading plan credit**. Hearing the Word is reading the Word. No second-class citizenship for audio users.
- `user_reading_plans.current_day` advances. Streak fires. Achievements eligible.
- **Character cards unlock on audio** � if Tim hears Bartimaeus mentioned in Mark 10 while running, Bartimaeus's card unlocks. Audio triggers the same completion event pipeline as text reading.

#### What We Don't Build
- No TTS generation � ESV professional narration is better than any TTS
- No multi-voice dramatic reading � too complex, not worth it at launch
- No audio for historical commentaries � Matthew Henry read aloud is genuinely unpleasant

### SESSION 9  Monetization & Feature Tier Design [COMPLETE ]

#### Tier Structure

| Tier | Name | Price | Who It Is For |
|---|---|---|---|
| Free | Reader | Free | Curious newcomers |
| Standard | Disciple | $4.99/mo or $44.99/yr | Most users |
| Premium | Scholar | $9.99/mo or $89.99/yr | Deep word study, all visual themes |
| Your Edition | Living Bible | $19.99/mo or $179.99/yr | Full AI personalization, super-premium |

#### Feature Tier Access
- **Free**: Reading, basic highlights, daily trail (view only), Charles "From the Vault" only
- **Standard**: Live Charles generation (Haiku), OIA questions, commentary layers, cross-reference trails,
  word study, character cards, all gamification, verse threads, sharing
- **Premium**: Everything in Standard + full word study vault, all visual identity themes (non-default),
  theological tradition picker for Charles, D3 constellation export
- **Your Edition**: Everything in Premium + full AI personalization suite (see below)

#### "From the Vault"  Canned Charles Responses
- Pre-written library entries, NOT newly AI-generated
- Visual treatment: warm parchment background (#F5ECD7 range), "FROM THE VAULT" badge in small caps,
  serif quote style, thin decorative rule, wax-seal SVG icon
- No loading spinner  instant render (pre-fetched)
- Free users: vault only  their entire Charles experience
- Paid users: live generation PLUS vault gems surfaced occasionally as curator picks
  (featured quality_tier entries, swipeable/dismissible)
- Populated from Spurgeon public domain data (already imported) + hand-authored entries
- Table: charles_vault_entries (companion_slug, book, chapter, content_type, quality_tier)

#### A La Carte Add-Ons
- **Unlock Charles**  add live Charles generation to free tier: $1.99/mo
- **Buy a Companion**  pre-built theologian companions, $2.99 each (one-time):
  Augustine, Wesley, Luther, Calvin, Tozer + more over time
  Each companion has its own theological DNA, style notes, heraldic SVG icon
  Companion writes in their own voice but knows the user (same living portrait injection)
- **Persona Builder**  create a custom theologian companion: included in Your Edition
  OR available as $4.99/mo standalone add-on
  Config: tradition, communication style, source theologians, custom name
- Charles theological tradition picker (Charles only, adjust his doctrinal lean): Standard+

#### Companion System Architecture
- Default companion = Charles (seeded, no purchase required)
- active_companion_id on profiles  any owned companion can be set as primary
- Weekly Letter uses active companion  if you own Wesley, Wesley writes it
- companion_definitions table: slug, display_name, tagline, theological_dna[], tradition,
  style_notes, is_default, is_custom, price_usd, stripe_product_id, icon_svg
- user_companions table: tracks purchases, custom_config jsonb for persona builder output

#### Gifting Mechanic
- One-time gift purchase (buy a year of any tier for someone)
- Schema already in place: gifted_by, gifted_message, gifted_reveal_at on profiles
- Gift buyer selects tier + duration, writes a letter, optionally sets a reveal date
- Stripe checkout creates subscription, sets gifted_ fields on recipient profile

#### Your Edition  Super-Premium Features
1. **Annual Year in Review**  generated each January, emailed as PDF, stored for re-access
   Sections: opening, chapters read, top themes, key insights, blind spots, streak story, charles letter
   Table: year_in_review (content_json, pdf_url, email_sent_at)
2. **Weekly Letter from Charles**  personalized Monday email written about that week of study
   Opt-in, stored for in-app inbox re-read; uses active companion
   Table: weekly_charles_letters (companion_id, week_start, subject_line, body_html)
3. **Theological Fingerprint**  doctrinal and thematic profile mapped over time
   theological_fingerprint jsonb on profiles: {traditions: {reformed: 0.8}, themes: {grace: 94}, ...}
   Computed by background job every 5-8 sessions alongside portrait regeneration
4. **Study DNA Dashboard**  reading patterns, favorite themes, blind spots, velocity
   study_dna jsonb on profiles: {total_chapters, streak_best, favorite_book, blind_spots, ...}
5. **Voice Notes in Journal**  dictate entries, AI (Whisper) transcribes + links to passage
   Fields on journal_entries: voice_note_url, voice_note_duration_seconds, voice_note_transcript
6. **Unlimited Companion Personas**  all purchased companions active, persona builder included

#### Stripe Integration Plan
- stripe_customer_id (UNIQUE) + stripe_subscription_id on profiles table
- Stripe Products: one per tier + one per purchasable companion
- Stripe Checkout for new subscriptions and companion purchases
- Stripe webhooks: customer.subscription.updated / deleted -> update subscription_tier + expires_at
- Gift flow: Stripe Checkout -> webhook creates subscription on recipient profile
- user_companions.stripe_payment_id tracks individual companion purchases
- Activate at commercial launch; schema is in place from day one

#### Schema Changes (Session 9)
- profiles: + stripe_customer_id, stripe_subscription_id, active_companion_id,
  theological_fingerprint jsonb, study_dna jsonb, fingerprint_updated_at
- journal_entries: + voice_note_url, voice_note_duration_seconds, voice_note_transcript,
  voice_note_transcribed_at
- NEW: companion_definitions, user_companions, charles_vault_entries (file 11)
- NEW: year_in_review, weekly_charles_letters (file 11)
### SESSION 10  Screen-by-Screen UX Flow [COMPLETE]

#### Navigation Structure
- 5-tab bottom navigation: Read / Journey / Trails / Library / Profile
- Persistent mini audio player bar sits ABOVE the bottom nav when audio is active
- No hamburger menu  everything is reachable from the 5 tabs + in-screen actions

#### Routes (Next.js App Router)

```
/ ................................ redirect -> /dashboard (auth) or /onboarding (new)
/onboarding ...................... conversational onboarding (Charles-led, hidden extraction)
/dashboard ....................... home dashboard (bottom nav: Read tab)
/read/[book]/[chapter] ........... reading screen
  ?verse=[v]&thread=open ......... deep link: opens verse thread panel
/journey ......................... journey screen (opens to profile default view)
  /journey/map ................... fog of war map
  /journey/phases ................ cinematic universe / criterion phases
  /journey/skill-tree ............ skill tree
  /journey/constellation ......... star constellation sky
  /journey/stats ................. statistics dashboard
/trails .......................... trails home
  /trails/daily .................. today morning + evening daily trails
  /trails/[id] ................... trail detail: D3 force-directed constellation
  /trails/new ..................... start free exploration trail
/library ......................... library home
  /library/search ................ global search (verses, words, topics)
  /library/commentary ............ commentary vault browser
  /library/word-study/[strongs] .. Strong-s entry + BDB/Thayer detail
  /library/dictionary/[slug] ..... Easton-s / Smith-s / ISBE entry
  /library/characters ............ character card collection / gallery
  /library/catechism ............. Westminster + Heidelberg browser
  /library/hymns ................. hymn index
/profile ......................... profile screen
  /profile/journal ............... journal history (all sessions, searchable)
  /profile/companions ............ companion card collection + store
  /profile/letters ............... weekly Charles letters inbox
  /profile/year-in-review ........ year in review documents
  /profile/family ................ family unit + verse thread members
  /profile/settings .............. all preferences / toggles
  /profile/upgrade ............... subscription tiers + gift flow
  /profile/fingerprint ........... theological fingerprint + study DNA (Your Edition)
```

#### Overlays and Sheets (not full-page routes)
These render over the current route without navigation:
- **Charles Card**  floats up from bottom 2s after passage loads (dismissible, re-summonable)
- **Mini Audio Player**  persistent bar above bottom nav, always visible when audio active
- **Audio Expanded Player**  full-screen sheet, swipe-down to collapse to mini
- **Verse Thread Panel**  slides in from right edge (deep-link or tap flame icon in verse margin)
- **OIA Question Sheet**  slides up from bottom CTA at end of chapter, or tap study button
- **Cross-Reference Bottom Sheet**  tapping a TSK ref opens a quick-read bottom sheet
- **Word Note Popover**  long-press any word -> compact popover with Charles synthesis +
  Strong-s gloss + tap to expand to full /library/word-study/[strongs] page
- **Character Card Modal**  unlocked card reveals with rarity animation, tap to inspect
- **Share Sheet**  shareable preview card + native share + copy link
- **Vault Badge Tooltip**  first time user sees FROM THE VAULT badge, brief explanation overlay

#### Screen Detail: Dashboard (/dashboard)
- Big top card: quick-resume (last chapter, book art, progress bar)
- Daily trail pair: morning slot + evening slot (time-aware: shows morning card AM, evening PM)
- Streak counter + current plan progress ring
- "Recently unlocked" character card teaser (if applicable, last 48h)
- Unread verse thread indicator (badge on family members avatars)
- "Letter from Charles" banner if weekly letter arrived and unread (Your Edition)
- Bottom nav visible; mini audio player bar if session is active

#### Screen Detail: Reading Screen (/read/[book]/[chapter])
Layout (top to bottom):
1. Top bar: book + chapter title / chapter picker arrow / bookmark icon / share icon
2. Translation pill (tap to switch) + Just Read mode toggle
3. Chapter text  verse numbers inline, flame icon in margin for verses with threads
   TSK density indicator (dot or subtle color pulse) on heavily cross-referenced verses
4. Charles Floating Card  slides up from bottom after 2s
   Free: FROM THE VAULT parchment treatment, instant (pre-fetched)
   Paid: live generated intro; if vault gem is also high-quality, shown below as "curator pick"
   Dismiss button (X) + re-summon via Charles avatar button in bottom-right corner
5. End of chapter: OIA Study button (primary CTA) + audio play button
6. Scrolling continues into Spurgeon Card (morning at top, evening at bottom)
7. Commentary Vault tab strip (Matthew Henry / Calvin / Clarke / etc.) below Spurgeon Card

Long-press any word -> Word Note popover
Tap verse number -> verse-level actions: highlight / bookmark / share / start thread / copy
Tap flame icon -> opens Verse Thread Panel overlay
Tap TSK dot -> opens Cross-Reference Bottom Sheet

#### Screen Detail: OIA Study Session (sheet over reading screen)
1. Chapter context banner (book + chapter)
2. 3 Observe questions + answer fields
3. 1 Interpret question + answer field
4. 1 Apply question + answer field
5. Submit -> Charles responds to each answer inline (animated, one by one)
6. After all responses: streak update animation, optional character card unlock reveal
7. "Just Read" shortcut skips all questions, marks chapter complete, fires progress

#### Screen Detail: Journey (/journey)
- Opens to profile-default view (fog map / phases / skill tree / constellation / stats)
- View switcher: 5 icon buttons in a horizontal pill at top
- Each view transitions in with a short animation (CSS)
- All views share the same "recently read" context highlight (last 7 days glows)

#### Screen Detail: Trails (/trails)
- Top section: today-s daily trails (morning + evening cards)
- Middle section: user-s saved/active trails grid
- FAB: "Pull a Thread" (canonical thread picker) + "Explore Free" + "Thread the Needle"
- Trail card shows: origin verse, step count, last active, share status, difficulty ring

#### Screen Detail: Trail Detail (/trails/[id])
- Full-screen D3 force-directed graph (constellation mode)
- Bottom drawer: current step-s verse text + nav (prev/next step)
- Tap a node -> zooms in, shows verse snippet, option to keep exploring or end trail
- Share button -> generates SVG snapshot, opens share sheet

#### Screen Detail: Companions (/profile/companions)
- Owned companions displayed as card grid (heraldic SVG icons)
- Active companion highlighted with crown/ring indicator
- "Meet More" section below: purchasable companion cards (store)
- Companion card: display name, tradition, tagline, price, "Add" button -> Stripe Checkout
- "Build Your Own" card at end (Persona Builder  Your Edition or add-on)

#### Screen Detail: Upgrade (/profile/upgrade)
- 4 tier cards: Reader / Disciple / Scholar / Living Bible
- Current tier indicated; upgrade CTA per card
- "Give as a Gift" toggle: switches flow to gift purchase (recipient email, letter, reveal date)
- � la carte add-ons listed below tier cards
- Stripe Checkout for all purchase flows

#### Key UX Principles Locked
- Mobile-first; all sheets + overlays use swipe-to-dismiss gesture
- Charles is never blocking  always dismissible, always re-summonable
- Audio is never intrusive  mini player stays at bottom, chapter text fully scrollable
- Vault entries render instantly (no loading state ever for free users)
- Verse threads are ambient  flame icon in margin, not a separate inbox
- Deep links work from day 1  /read/[book]/[chapter]?verse=[v]&thread=open is live
### SESSION 11  Typography, Theming & Design Language [COMPLETE]

#### Core Aesthetic: Modern Editorial
Dark-first. Confident white space. Type is the hero. Strong structural grid.
Criterion-poster DNA: chapter titles feel like titles, not labels.
Parchment/texture appears ONLY in the Vault treatment (Session 9  never on base UI).
No gradients on text. No drop shadows on type. Nothing that looks like a church bulletin.

#### Typeface System

**Bible Reading Text**  user-choosable (stored in user_display_settings.bible_reading_font):
  eb_garamond   : EB Garamond  classical, feels like a 500-year-old book (default)
  lora          : Lora  warmer, slightly modern, high readability
  merriweather  : Merriweather  screen-optimized, neutral and sturdy
  literata      : Literata  purpose-built for long-form reading
  system_serif  : System default serif (fallback / accessibility)

**UI Chrome**  Inter (variable font, 400/500/600/700)
  Navigation labels, buttons, settings, all non-Bible text

**Display / Chapter Numbers**  Barlow Condensed (700 weight)
  Book titles on Journey Phases posters, big chapter numerals, stat numbers
  This is the Criterion-poster voice  bold, condensed, unapologetic

**Vault Treatment Only**  reading font switches to EB Garamond regardless of user setting
  Vault has its own parchment surface (#F5ECD7), sepia text (#3D2B1F), never overridden

#### Type Scale
  --text-display    : Barlow Condensed 700, 4872px (phase posters, stat heroes)
  --text-chapter    : reading font, 22px, weight 600
  --text-body       : reading font, 1720px (user font-size setting), line-height 1.75
  --text-ui         : Inter 400, 15px
  --text-label      : Inter 500, 12px, letter-spacing 0.08em, uppercase
  --text-verse-num  : Inter 400, 11px, --color-text-tertiary
  --text-ref        : Roboto Mono 400, 10px (TSK refs, Strong-s numbers)

#### Color System  Dark-First

CSS custom properties on `html[data-theme]`. Dark is the default attribute.

**Default theme (pre-identity-theme-selection):**
  --color-bg         : #0F0F0F
  --color-surface    : #1A1A1A
  --color-surface-2  : #242424  (modals, popovers, raised cards)
  --color-border     : #2E2E2E
  --color-text-1     : #F0EDE6  (slightly warm white -- not pure)
  --color-text-2     : #9A9490
  --color-text-3     : #5C5956
  --color-accent     : #C8A96E  (warm gold)
  --color-accent-dim : #8C7040

**Light mode overlay** (user-toggleable on any theme):
  --color-bg         : #FAFAF8
  --color-surface    : #FFFFFF
  --color-border     : #E8E4DE
  --color-text-1     : #1A1816
  --color-text-2     : #6B6560
  Accent tones darkened ~15% for contrast on light; parchment Vault stays identical

#### Identity Themes  Full Palette Swap (Premium unlock)

Applied as `html[data-theme="runner"]` etc. All CSS custom properties override.
Default theme ships for free. Non-default themes: Premium tier unlock.
Tim-s archetype = runner; runner theme is his day-1 default.

| Theme   | Base BG   | Surface   | Accent    | Text-1    | Mood |
|---------|-----------|-----------|-----------|-----------|------|
| runner  | #0D0D0F   | #141418   | #E85D2F   | #F4F0EC   | Night run, embers, velocity |
| home    | #0F0E0A   | #1C1A14   | #D4A853   | #F5EFE0   | Morning light, wood, coffee |
| library | #0A0E10   | #131820   | #3B82B8   | #E8EEF4   | Late-night study, deep focus |
| garden  | #090F0B   | #111A13   | #5E9E6E   | #E8F0E8   | Morning dew, quiet growth |
| puzzle  | #0A0810   | #13101E   | #7C6BD6   | #EDE8F5   | Discovery, intellectual wonder |
| default | #0F0F0F   | #1A1A1A   | #C8A96E   | #F0EDE6   | Warm gold, timeless |

#### Vault Treatment (always consistent, ignores theme)
  Background : #F5ECD7  (warm parchment)
  Border     : #C4A87A
  Text       : #3D2B1F  (dark sepia)
  Badge      : "FROM THE VAULT" in Inter 500, 10px, uppercase, #8B6542
  Icon       : wax-seal SVG in #8B6542
  Reading font: always EB Garamond, regardless of user selection
  No loading skeleton ever -- instant render

#### Spacing & Shape
  Base unit: 4px grid
  Card radius      : 12px
  Bottom sheet     : 20px top corners (respects env(safe-area-inset-bottom) for iOS PWA)
  Button radius    : 8px
  Pill / badge     : 999px
  Top bar height   : 52px + env(safe-area-inset-top)
  Bottom nav height: 60px + env(safe-area-inset-bottom)
  Mini player bar  : 52px (sits directly above bottom nav)

#### Iconography
  Primary icon set : Phosphor Icons (MIT, stroke + fill variants, very editorial)
  Custom SVG       : heraldic character card icons, wax seal, flame (verse thread),
                     TSK density dot, Criterion-style book poster overlays,
                     rarity crown/ring indicators
  No emoji anywhere in UI
  No raster icons -- all SVG

#### Animation Principles
  Philosophy: purposeful motion only. Nothing spins for no reason.
  All transitions: CSS transform + opacity (no layout animations)

  Bottom sheet appear   : translateY(100%) -> 0, 300ms cubic-bezier(0.32,0.72,0,1)
  Bottom sheet dismiss  : 160ms ease-in
  Charles card slide-up : 300ms, 2s delay after passage load, ease-out
  Character card unlock : CSS 3D flip (perspective: 800px) + shimmer overlay by rarity
    Faithful  : soft gold shimmer, 400ms
    Renowned  : silver shimmer + subtle glow pulse
    Mighty    : deep gold + embossed edge glow
    Eternal   : platinum shimmer + star burst
    The Word  : white light sweep, reverent, slow (800ms)
  Streak fire       : Lottie (already decided Session 2)
  Trail constellation: D3 force simulation (already decided Session 5)
  Skeleton loaders  : shimmer (--color-surface-2 sweep) -- no spinners for pre-fetchable content
  Page transitions  : fade (150ms) -- PWA swipe gesture only on drill-down screens

#### Reading Screen Specifics
  Verse numbers    : right-aligned in a 28px gutter, --text-verse-num style, tappable
  Verse margin     : left gutter 40px (room for flame icon + thread indicator)
  Flame icon       : shows when verse has thread messages; color = family member color set
  TSK density dot  : 4px circle in verse right margin; color by density_tier:
    low=--color-text-3, medium=--color-accent-dim, high=--color-accent
  Chapter number   : Barlow Condensed 700, 64px, --color-text-3 (large, behind text, ghosted)
  Book title bar   : Inter 500, 13px, uppercase, --color-text-2
  Paragraph breaks : 1.5em top margin (ESV provides paragraph markers)

#### Schema Change (Session 11)
  user_display_settings: font_family column renamed to bible_reading_font,
  CHECK expanded to (eb_garamond, lora, merriweather, literata, system_serif)
  theme default changed to dark
  feature_toggles.tier_required: updated CHECK to match Session 9 tier names
  (free, standard, premium, your_edition)
### SESSION 12  ESV Licensing & Legal [COMPLETE]

#### ESV API License  Real Terms (verified at api.esv.org)

**Non-commercial (dev phase):**
- Free API key, no license agreement needed
- Up to 5,000 queries/day, max 1,000/hour, max 60/minute
- Up to 500 verses per query (never exceeded by a single chapter)
- Local cache limit: 500 verses at a time (cannot cache the full Bible)
- Must include ESV copyright notice on every page displaying text
- Must link to www.esv.org on every page using the text
- Non-commercial = site does not charge for access to any part of the app

**Commercial (SaaS launch  paid tiers = commercial):**
- Charging ANY user (even Free tier with ads or upgrade CTAs) likely triggers commercial definition
- Must obtain a formal license from Crossway BEFORE commercial launch
- Crossway licenses to ORGANIZATIONS, not individuals or solo developers
  -> Form a legal entity (LLC) before applying
  -> Apply at: crosswaygnp.formstack.com/forms/esv_digital_licensing_proposal
- License negotiation can take weeks; start this process 3+ months before paid launch
- App Store / mobile: PWA permitted under API terms with all conditions met

**Hard constraints that affect architecture:**
- Cannot pre-cache the full Bible in Supabase Storage (violates 500-verse cache rule)
  -> Dev plan: fetch chapters live from ESV API, cache current session only
  -> Pre-license approach: cache aggressively only after commercial license is signed
- Cannot redistribute raw ESV text to end users as downloadable content
  -> "Your Bible" PDF export: must be structured so ESV passages are quotation (under 500 verses)
     OR use public domain translation for the PDF export layer

**Attribution required on every page displaying ESV text:**
  Scripture quotations are from the ESV(r) Bible (The Holy Bible, English Standard Version(r)),
  (c) 2001 by Crossway, a publishing ministry of Good News Publishers.
  Used by permission. All rights reserved.

#### ESV Audio License
- Same Crossway copyright; same non-commercial/commercial split
- Caching audio to Supabase Storage is acceptable for non-commercial dev (cache = performance)
- Commercial audio delivery requires commercial license (covers both text and audio)
- MP3 files fetched from: api.esv.org/v3/passage/audio/

#### Primary Translation Strategy
1. **Dev phase:** ESV via free API key, no caching beyond session
2. **Pre-launch:** Form LLC, submit Crossway license application
3. **Commercial launch:** ESV under negotiated license OR launch with public domain default

#### Fallback / Public Domain Translations (always available, no license needed)
These can be stored fully in Supabase, cached aggressively, exported freely:
- **KJV** (King James Version, 1611): public domain in US; use a clean public domain digital text
  Source: Project Gutenberg or similar; no modern typesetting that claims copyright
- **WEB** (World English Bible): explicitly public domain; modern readable English
  Source: ebible.org  free download in structured format
- **ASV** (American Standard Version, 1901): public domain
- **YLT** (Young-s Literal Translation, 1898): public domain
- **Darby**: public domain

**Plan:** Import KJV and WEB into Supabase chapters table as additional translation columns.
If ESV license hits a wall, WEB is the commercial launch fallback (readable modern English, PD).

#### API.Bible
- Provider: American Bible Society (scripture.api.bible)
- Gives access to 2,500+ translations in structured JSON
- Free tier: sufficient for dev; paid plans for commercial scale
- Use for: alternate translation display (compare mode), non-ESV translations on Library screen
- Terms: app must display attribution per Bible, must not strip copyright notices
- Contact: support@api.bible for commercial licensing clarity

#### Public Domain Source Material (already in our schema)
All of the following are confirmed public domain in the United States:
- Spurgeon: Morning & Evening (1865), Treasury of David (1885), sermons (1834-1892)
- Strong-s Exhaustive Concordance (1890)
- BDB Hebrew Lexicon (1906), Thayer-s Greek Lexicon (1889), Abbott-Smith (1922)
- Vine-s Expository Dictionary (1940) -- confirm; some editions may have modern additions
- Easton-s Bible Dictionary (1897), Smith-s Bible Dictionary (1863)
- ISBE International Standard Bible Encyclopedia (1915 edition)
- Matthew Henry-s Commentary (1714)
- Calvin-s Commentaries (1554-1565)
- Adam Clarke-s Commentary (1826)
- Westminster Confession & Catechisms (1647), Heidelberg Catechism (1563)
- MorphGNT (CC BY-SA 3.0 -- attribution required)
- OpenScriptures Hebrew Bible (CC BY 4.0 -- attribution required)
- TSK (Treasury of Scripture Knowledge, 1836)
- Public domain hymns (pre-1927 compositions)

**Attribution page required** for MorphGNT and OpenScriptures (CC licenses mandate credit).
All Spurgeon, commentary, and lexicon content: include source name in display + credits page.

#### Privacy & Data Laws

**COPPA (Children-s Online Privacy Protection Act):**
- Applies to users UNDER 13
- Minimum age: 13 at signup (enforce via birth year field in onboarding)
- Under-13 users blocked unless explicit verifiable parental consent is implemented
- Tim is 15 -- not subject to COPPA -- but gifted accounts could be created for younger children
  -> Gifting flow: if recipient age is under 13, require parent/guardian email confirmation
- Action: add age_gate check in onboarding before any data collection begins

**CCPA (California Consumer Privacy Act):**
- Applies once any California residents are users
- Privacy policy must disclose: what data collected, how used, who it-s shared with
- Must provide: right to know, right to delete, right to opt out of sale (we don-t sell data)
- Action: privacy policy page required at /privacy before commercial launch

**GDPR:**
- Applies if any EU users
- Day-1: US-only launch, add GDPR notice if EU signups detected
- Supabase is GDPR-compliant (data residency options available)

**Data we collect (disclosure):**
- Account: email, name, age range (via Supabase Auth)
- Usage: reading progress, journal entries, highlights, prayer journal
- AI interaction: journal answers sent to Anthropic API (Claude)
- Payment: via Stripe (we never touch card data; Stripe is PCI-DSS compliant)
- Audio: ESV audio fetched from Crossway servers (they see IP + passage requested)
- Third parties: Supabase (database + storage), Anthropic (AI), Stripe (payments),
  Resend (email), Crossway ESV API (text + audio), Vercel (hosting)

**Voice notes (Your Edition):** audio recorded on device, sent to Whisper (via OpenAI or
self-hosted). Must disclose in privacy policy. User controls deletion.

#### Required Legal Pages (before public launch)
- /privacy -- Privacy Policy (CCPA + COPPA + GDPR lite)
- /terms -- Terms of Service
- /credits -- Scripture attribution + public domain source credits
  (ESV notice, MorphGNT CC-BY-SA, OpenScriptures CC-BY, Spurgeon, etc.)

#### No Schema Changes (Session 12)
Legal and process decisions only. No new tables.
### SESSION 13  Word Study Deep Dive [COMPLETE]

#### Entry Points
1. Long-press any word in reading screen -> Word Note popover
   Shows: charles_synthesis (one punchy sentence from word_note jsonb in personalized_content)
   CTA: "Go Deeper" -> navigates to /library/word-study/[strongs]
2. Tap Strong-s number anywhere (cross-reference sheet, commentary) -> direct to full page
3. /library/word-study browser -> recently studied + search by word or number

#### Word Note Popover (reading screen, long-press)
- Instant render (no AI call; served from personalized_content.word_note pre-generated)
- Shows: original word (Hebrew/Greek script) + transliteration + Charles synthesis sentence
- Language badge: "Hebrew - BDB" or "Greek - Thayer-s" (small, below word)
- "Go Deeper" CTA button
- Dismiss: tap outside or swipe down
- Free users: same experience (word_note is part of chapter pre-generation)

#### Full Word Study Page (/library/word-study/[strongs])

**Layout  Option A: Charles-Led (Standard tier default)**

All tiers see this layout. Premium/Scholar get the raw data section expanded by default.

1. HEADER
   - Original word (large, correct script: Hebrew right-to-left, Greek left-to-right)
   - Transliteration + pronunciation guide
   - Language badge pill: "Hebrew - BDB" | "Greek - Thayer-s / Abbott-Smith"
   - For Hebrew: 3-letter root (shoresh) displayed with glyph + English gloss
   - For Greek: semantic domain tag (e.g. "Psychological Faculties")
   - Strong-s number (H#### or G####, small, --color-text-3)

2. CHARLES EXPLAINS (primary content  always visible)
   - intro: what is this word? (1-2 sentences, direct)
   - etymology: where it comes from, what the root tells us
   - usage_insight: how it-s actually used across Scripture (not just definition)
   - theological_weight: why this word matters theologically
   - closing_line: one memorable Charles-style sentence to carry away
   - Cached in strongs_lexicon.charles_study jsonb  shared for all users
   - Generated once by background job; not personalized to user portrait
   - Visual: Charles avatar + Barlow Condensed headers, reading font body

3. OCCURRENCE MAP (heat map + list  both always shown)
   - Heat map: visual grid of all 66 books, cell size proportional to occurrence count
     Color: --color-accent at max density, fading to --color-surface-2 at zero
     Tap any cell -> jumps to verse list filtered to that book
     Total occurrence count displayed prominently above map
     Books the current user has READ are indicated (slight ring/glow on cell)
   - Verse list: expandable below heat map, grouped by book
     Each row: reference + verse text snippet (ESV, first 80 chars)
     Tapping a row -> navigates to /read/[book]/[chapter] with word highlighted
     "See all N occurrences" toggle if list is long; default shows top 10

4. RAW LEXICON DATA (collapsed by default on Standard, expanded on Premium)
   Collapsed: "Strong-s Definition" accordion with down-arrow
   Expanded shows:
   - part_of_speech, short_def, long_def (full BDB/Thayer-s entry)
   - kjv_usage (how KJV renders it  often surprisingly illuminating)
   - For Hebrew: morphology examples (what forms appear in Scripture)
   - For Greek: usage_notes from Thayer-s/Abbott-Smith
   - Source attribution shown: "Source: BDB (Brown-Driver-Briggs, 1906, public domain)"
   Premium indicator: small badge "Scholar view" on the accordion header for Standard users
   Standard users CAN still expand it (it-s not hard-gated) but it-s collapsed/de-emphasized

5. RELATED WORDS (if available)
   - Other Strong-s numbers sharing the same Hebrew root (hebrew_root field)
   - For Greek: words in the same semantic domain
   - Shown as compact horizontal chip strip; tap any chip -> navigates to that word

6. STUDIED BEFORE? (if user_word_study_history has a row for this word)
   - Small banner: "You first studied this in [Book] [Chapter] - [date]"
   - Study count shown ("studied 3 times")

#### Tier Access
- **Free:** Word Note popover only (pre-generated, instant)
  Full word study page locked with upgrade prompt
- **Standard:** Full Charles-led page; raw data collapsed
- **Premium / Your Edition:** Raw data expanded by default; Schema view toggle

#### Unified UX  Hebrew + Greek
- Single route: /library/word-study/[strongs] works for H#### and G#### identically
- Language differences surfaced as content (badge, root display, semantic domain)
  not as separate navigation flows
- Direction rendering: CSS `direction: rtl` on Hebrew script elements only
- No "you are now in the Hebrew section"  the word itself is self-explaining

#### Occurrence Heat Map  Technical
- Pre-computed at import time into strongs_lexicon.occurrence_heatmap jsonb
  {"Genesis": 4, "Exodus": 1, "Psalms": 23, "Romans": 11, ...}
- strongs_lexicon.total_occurrences: denormalized integer for fast display
- Heat map rendered as CSS Grid (11 x 6 cells = 66 books, canonical order)
  Max bucket = darkest cell; scale relative to each word-s own max
- Books user has read: queried from journal_entries on page load, overlaid as ring
- No D3 needed  pure CSS grid is sufficient

#### Charles Word Study Generation
- Background job: iterates strongs_lexicon rows where charles_study = {}
- Prompt: "You are Charles. Explain the word [original_word] (Strong-s [number], [language]).
  Source data: [short_def] [long_def] [usage_notes]. Write: intro, etymology, usage_insight,
  theological_weight, closing_line. JSON response."
- Model: Haiku (cost-effective; ~14,000 unique Strong-s numbers to generate)
- Estimated one-time cost: ~$12-18 USD total for all 14,000 entries at Haiku rates
- Stored in charles_study jsonb with generated_at timestamp
- Regeneration: manual trigger only (update to long_def triggers is_stale flag)

#### Schema Changes (Session 13)
- strongs_lexicon: + hebrew_root, root_strongs, semantic_domain,
  occurrence_heatmap jsonb, total_occurrences, charles_study jsonb, charles_study_at
  + idx_strongs_root index
- NEW: user_word_study_history (tracks studied words per user; powers skill tree + DNA)
### SESSION 14  Translations & Bible Text Management [COMPLETE]

#### Translation Architecture

Three distinct source types, each with different caching rules:

| Source | Examples | Storage | Cache Rule |
|--------|----------|---------|------------|
| esv_api | ESV | chapters table | expires_at = now()+24h; background job clears |
| supabase | KJV, WEB, ASV, YLT | chapters table | permanent (NULL expires_at) |
| api_bible | NIV, NASB, NLT, CSB, 2500+ | chapters table | expires_at = now()+1h |

- ESV: fetch live from api.esv.org per chapter, cache with 24h TTL
  Background cleanup job deletes expired ESV rows to stay within 500-verse cache limit
  (Session 12: we cannot permanently store the full ESV Bible)
- KJV/WEB/ASV/YLT: import once into Supabase at deploy time; stored permanently
  These are the always-available fallback translations; no API dependency
- API.Bible: fetch on demand for commercial translations (NIV, NASB, NLT, CSB)
  Session cache only (1h); never stored permanently without a negotiated license
  Locked behind Standard tier (these translations require API.Bible account + their terms)

#### Roadmap for Commercial Translations
Day 1 : ESV (primary) + KJV + WEB + ASV + YLT
v2    : NIV, NASB, NLT, CSB (via API.Bible, Standard tier)
Future: Direct licensing for any commercial translation that hits demand threshold
        (NKJV, AMP, MSG, NET Bible, etc.)
        Direct-licensed translations can be stored in Supabase permanently
        and served without API.Bible dependency once licensed

#### supported_translations Table
Master catalog  one row per translation the app can serve.
Fields that drive runtime behavior:
- source: controls which fetch path is used (esv_api / api_bible / supabase)
- license_type: controls cache policy (public_domain = permanent; api_only = short session)
- api_bible_id: used by the API.Bible fetch path; NULL for ESV and local translations
- tier_required: free = KJV/WEB/ASV always available; standard = NIV/NASB etc.
- launch_phase: day1 / v2 / future (controls what appears in the translation picker at launch)
- is_comparison_eligible: all translations eligible by default

#### Translation Picker UI
- Appears as a pill on the reading screen top bar (shows current translation abbreviation)
- Tapping opens a bottom sheet with grouped sections:
  FREE: ESV (default) / KJV / WEB / ASV / YLT
  STANDARD (lock icon for free users): NIV / NASB / NLT / CSB
  + "Compare translations" CTA at the bottom of the sheet
- Selecting a translation: fetches (or serves from cache) that chapter, re-renders passage
- User-s selection stored in user_display_settings.translation

#### Translation Comparison Feature

Route: /read/[book]/[chapter] with compare mode toggled on
No separate route needed; compare is a mode on the existing reading screen.

**How it works:**
- User taps "Compare translations" in the translation picker sheet
- Comparison panel opens below (or instead of) the main passage
- Layout: verse-stacked (one verse at a time, multiple translation rows per verse)
  Each row: [Translation badge pill] [Verse text]
  Scrolls together with the main passage (synchronized scroll)

**Compare mode UX:**
- Primary translation stays at top (user-s current selection)
- Comparison translations below, each with a colored left-border accent
- Translation badge pills color-coded: ESV = gold, KJV = warm brown, WEB = slate,
  NIV = teal, NASB = navy, etc. (accent from supported_translations; add color field later)
- Differences between translations visually highlighted on demand
  (tap a verse -> differences rendered in --color-accent, same root words pulsed)
- Dismiss compare: X button top-right of comparison panel, returns to single translation

**Tier access:**
- Free: read-only primary translation (ESV/KJV/WEB)
- Standard: compare 2 translations at once
- Premium / Your Edition: compare up to 4 translations simultaneously

**What makes comparison powerful:**
- ESV vs KJV: see the textual and translation philosophy differences
- ESV vs WEB: modern vs modern  tiny differences become illuminating
- ESV vs NASB: both formal equivalence  split the hair on word choice
- For Tim: comparing ESV + KJV on a Paul passage makes the density of language visceral

**Preferences stored:**
- user_display_settings.compare_mode_enabled (boolean)
- user_display_settings.comparison_translations text[] (e.g. ["KJV", "WEB"])
  Persisted across sessions; user-s last comparison set is remembered

#### Offline Consideration (preview  deep dive in Session 22)
- KJV/WEB/ASV: could be served offline from Supabase local cache (these are stored)
- ESV: cannot be pre-cached for offline (license); offline = KJV/WEB fallback
- API.Bible translations: online only

#### "Your Bible" PDF Export and Translations (Session 19 preview)
- PDF quotes must stay under 500 ESV verses per document
- OR: export uses WEB (fully public domain, freely distributable)
- Decision: PDF export defaults to WEB unless user is on a commercial license;
  ESV export available for users of the app viewing their own personalized document
  (this is different from redistributing  they already accessed it via the API)

#### Schema Changes (Session 14)
- chapters: + expires_at timestamptz, cache control indexes,
  table comment updated to reflect multi-translation design
- NEW: supported_translations (master catalog; seeded at deploy)
- user_display_settings: + compare_mode_enabled boolean,
  + comparison_translations text[]
- README: file 03 index updated
### SESSION 15  Dictionary, Commentary & Library [COMPLETE]

#### Library Screen Overview (/library)
The Library is the fifth bottom-nav tab: a reference hub for everything that is
not reading or progress. No AI generation happens here  it is all pre-loaded public
domain content served instantly.

Library home layout:
- "Recently Visited" horizontal scrollable strip (user_library_history, last 8 entries)
  Each chip shows: icon + label (e.g. "Pharisees", "Agape - G0026", "Matthew Henry - John 3")
- Section grid (2-column icon cards):
  Word Study | Commentary | Dictionary | Characters | Catechism | Hymns
- Global search bar at top (searches across all section types simultaneously)

#### Dictionary (/library/dictionary/[slug])

Route key: slug (URL-safe term, e.g. "pharisees", "ark-of-the-covenant")
Multiple sources (Eastons / Smiths / ISBE) for the same slug = tabs on the page.

Page layout:
1. Term title (Barlow Condensed, large)
2. Charles Note  one synthesis sentence (stored on is_primary_source row)
   Visual: Charles avatar, italic, reading font, --color-accent left border
   Free users see this; it is pre-generated not live AI
3. Source tabs: [Eastons] [Smiths] [ISBE]  only tabs that exist for this slug shown
   Active tab content shows the full body text
4. Passage references strip  clickable pills, each navigates to /read/[book]/[chapter]
   Sourced from passage_refs text[] on the entry row
5. Related terms  same-era or same-topic terms (derived from body text mentions)
   Shown as horizontal chip strip

Dictionary browser (/library): search by term + A-Z alphabet index strip.
Tapping a letter jumps to that section. Most-visited entries bubble to top of search.

Source attribution footer: "Source: Eastons Bible Dictionary, 1897 (public domain)"

#### Commentary Vault (reading screen  Session 6 detail)
Already locked in Session 6. Fleshing out tab UX here:

Three tabs below the Spurgeon Card on the reading screen scroll:
  [Matthew Henry] [Calvin] [Adam Clarke]

Matthew Henry tab:
- Chapter-level commentary (one entry per chapter)
- is_vault_featured = true on every chapter row
- Shows section_title as a subheading
- Long  excerpt first 400 chars, "Read more" expands inline

Calvin tab:
- Section/paragraph-level (covers groups of verses)
- Shows verse range badge (e.g. "vv. 1-5") above section_title
- Same excerpt + expand pattern

Adam Clarke tab:
- Most granular  verse-level entries
- is_vault_featured = true only on theologically significant verses
- For non-featured verses, shows a brief note or "no entry for this verse"
- Clarke-s analytical, almost word-study style feels very different from MH/Calvin
  This is intentional  three distinct scholarly voices

Default open tab: Matthew Henry (broadest coverage, most accessible)
User-s last-opened tab is remembered per session (not persisted across sessions)

#### Commentary Browser (/library/commentary)
Full standalone browsing experience for all three commentators.

Layout:
- Top filter: [Matthew Henry] [Calvin] [Adam Clarke] source selector
- Book picker grid (canonical order, 66 buttons)
- Chapter list for selected book
- Entry page: full body, section_title heading, verse range badge
- Breadcrumb navigation: Commentary > Matthew Henry > John > Chapter 3

Discovery feature: "Surprising entries"  a curated set of Clarke or Calvin entries
where they say something unexpectedly bold or counterintuitive.
Surfaced on Library home as a "Today in the Vault" card (rotates daily, authored not AI).

#### Character Card Gallery (/library/characters)
(Visual design already locked in Session 4; this is the browse experience.)

Layout:
- Filter bar: Era | Role | Rarity | Hebrews 11 | Athletes of Faith
- Masonry-ish card grid, unlocked cards full color, locked cards = silhouette + "???"
- Each unlocked card: heraldic SVG icon + character name + rarity tier badge
  + key verse snippet + first_mention reference
- Tapping a locked card: "Unlock by reading [Book] [Chapter]" hint
- Tapping an unlocked card: full character detail sheet slides up
  Detail: description (from public domain dictionary), key_verse with ESV text,
  era tag, role tag, alternate names, is_in_hebrews_11 badge, is_athlete_of_faith badge
  "Appears in"  list of chapters where this character appears (from morphology/mention data)

Rarity visual treatment on gallery:
  Faithful  : simple gold ring
  Renowned  : silver glow
  Mighty    : deep gold embossed border
  Eternal   : platinum shimmer border
  The Word  : white light border, always visible (never locked)

#### Catechism Browser (/library/catechism)

Layout:
- Selector at top: [Westminster Shorter] [Westminster Larger] [Heidelberg]
- Q&A list, numbered, no pagination  full scroll
- Each Q&A: Question # + Question text (bold) + Answer text
  Scripture refs shown as clickable pills below the answer
  Tapping a ref -> /read/[book]/[chapter] (navigates away  no modal, intentional)
- Search within catechism (searches question_text + answer_text)
- Bookmark any Q&A entry (uses existing bookmarks table with source_type = "catechism")

#### Hymn Index (/library/hymns)

Layout:
- Top filter: by Theme | by Scripture reference
- Theme chips: Grace / Atonement / Resurrection / Sovereignty / Comfort / Praise / Lament
- Scripture filter: book picker -> shows hymns tagged to that book
- Hymn card: title + author + year + first line of lyrics
- Hymn detail page: full lyrics, scripture_refs (clickable), themes tags
  Lyrics formatted with stanza breaks, chorus labeled
- No audio playback (licensing complexity); text-only

#### Library Search (/library/search)
Global search across all reference types simultaneously.

Result sections (shown if results exist):
  Dictionary terms -> /library/dictionary/[slug]
  Commentary entries -> opens in Commentary Vault context for that passage
  Catechism Q&A -> scrolls to that entry in catechism browser
  Hymns -> hymn detail page
  Strong-s words -> /library/word-study/[strongs]
  Characters -> character card gallery (filtered)

Search UX:
- Instant results as user types (debounced 300ms)
- Full-text search via Postgres tsvector on body fields (added at deploy time)
- Most recent searches saved in user_library_history

#### Schema Changes (Session 15)
- bible_dictionary_entries: + slug text, passage_refs text[], charles_note text,
  is_primary_source boolean; UNIQUE INDEX on (source, slug)
- commentary_entries: + section_title text, is_vault_featured boolean
- NEW: user_library_history (tracks visited entries; powers recently visited + study DNA)
- README: file 07 index updated
### SESSION 16  Memory Verse System [COMPLETE]

#### Adding a Verse to Memory
Entry points (all navigate to a save-confirm sheet):
1. Reading screen: long-press on any verse number -> verse action menu ->
   "Memorize" option alongside Highlight / Bookmark / Share / Thread
2. Dashboard: Charles occasionally surfaces a verse from the current chapter with
   "Worth memorizing?" CTA (opt-in, not pushed)
3. Family share: family member shares a verse -> recipient can add to memory from share
4. Manual: /profile/memory-verses -> "+ Add verse" -> reference picker

Save-confirm sheet shows:
- Full verse text (ESV snapshot)
- Translation pill (uses current reading translation)
- Review mode selector: All (default) / Flashcard / Fill in the Blank / Word Order
- "Save to Memory" button

#### SM-2 Spaced Repetition Algorithm
Already locked in schema. SM-2 is the gold standard (Anki uses it).

How it works:
- After each review, user rates recall quality 0-5 (mapped from 3 buttons: Hard/Good/Easy)
  Hard = quality 2, Good = quality 4, Easy = quality 5 (fail = 0, auto-detected)
- SM-2 recalculates ease_factor and interval_days
- next_review = today + interval_days
- Mastered: interval_days >= 21 AND repetitions >= 5
- If quality < 3: repetitions resets to 0, interval resets to 1 (start over)

User-facing quality UI: 3 buttons only (Hard / Got It / Nailed It)
No numbers shown to user. Internally maps to SM-2 quality 2 / 4 / 5.

#### Three Review Modes

**Flashcard** (review_mode = flashcard):
- Front: "[Book] [Chapter]:[Verse] ([Translation])" on clean dark card
- Reference in Barlow Condensed, large
- Tap anywhere to flip
- Back: full verse text in reading font, reference small at bottom
- Then: [Hard] [Got It] [Nailed It]

**Fill in the Blank** (review_mode = fill_blank):
- Verse text shown with key words replaced by _____ blanks
- Key words selected algorithmically: nouns, verbs, theologically significant words
  (detected via morphology_data POS tags + short_def significance flag)
- Number of blanks scales with repetitions: 1-2 blanks early, up to 5 for mature verses
- Each blank: user taps -> keyboard appears -> types the word
- Correct: blank fills in with --color-accent text, brief pulse animation
- Wrong: blank shakes, shows correct word in red, counts as Hard
- All blanks filled -> Hard / Got It / Nailed It

**Word Order** (review_mode = word_order):
- All words of the verse shown as shuffled chips in a pool below
- Empty slots at top in verse order
- User taps chips to place them in order
- Chips snap into slots; wrong placement = chip returns to pool (no penalty, just retry)
- Complete -> auto-evaluates accuracy -> presents Hard / Got It / Nailed It
- Most challenging mode; reserved for repetitions >= 3 if mode = all

**All mode rotation:**
  repetitions 0-1 : Flashcard only (learn the verse first)
  repetitions 2-3 : Flashcard or Fill in the Blank (randomized)
  repetitions 4+  : All three modes randomized

#### Daily Review Queue
- Dashboard card: "X verses due today" with a start button
  Shown only when at least 1 verse is due (next_review <= today)
- Route: /profile/memory-verses (full management screen)
  Top section: "Due Today" (sorted by next_review ASC, oldest first)
  Below: "All Verses" list with mastery status, ease factor hidden, interval shown as
  "Review in 3 days" / "Review in 2 weeks" / "Mastered"
- Review session: fullscreen card UI, no nav bar, swipe-able, exit button top-left
  Progress indicator: "3 of 7 remaining" at top
  Session complete: summary screen (verses reviewed, new intervals, any mastered)

#### Mastery Celebration
When a verse reaches mastered = true:
- Mastery animation: verse text rises and glows (CSS, reading font, --color-accent)
- Charles says one line (vault entry or generated): a brief exultation about this verse
  Example for John 3:16: "You have hidden this in your heart. Spurgeon preached on it
  over a hundred times and said he had never exhausted it. Neither will you."
- Mastered verses shown with a gold crown icon in the All Verses list
- Contributes to: XP, skill tree word-mastery node, study DNA memory stat

#### Memory Verse Review in Charles Context
When user is reading a chapter that contains one of their memory verses:
- Small banner in the verse margin: gold star icon + "You have this memorized"
  (or "Due for review" if next_review is today)
- Not intrusive; just a quiet acknowledgment

#### Notifications
- Daily reminder (if notification_settings.email_memory_verse_review = true)
  Defaults to true (Session 1 decision)
  Email: "You have N verses due for review today" + one verse teaser
  Sent via Resend at user-s preferred daily_time
- No push notifications unless push_enabled = true

#### Tier Access
- Free: up to 10 verses saved, Flashcard mode only
- Standard: unlimited verses, all three modes, full SM-2 history
- Premium / Your Edition: same as Standard + verse mastery contributes to
  Theological Fingerprint (which themes/passages they have stored)

#### Schema Changes (Session 16)
- memory_verses: + review_mode, practice_count, added_from
  Mastered logic clarified: interval_days >= 21 AND repetitions >= 5
- NEW: memory_verse_reviews (full SM-2 history log per review session)
- README: file 06 index updated
### SESSION 17  AI Chat / Ask Charles [COMPLETE]

#### What It Is
"Ask Charles" is a freeform AI conversation anchored to a passage or open-ended.
It is distinct from the structured OIA flow (Session 3). OIA = guided study.
Ask Charles = a real conversation with someone who knows the text and knows you.

Entry points:
1. Reading screen: "Ask Charles" button in the bottom action bar
   Pre-anchored to the current chapter (or verse if user long-pressed)
2. After OIA session completes: "Keep talking with Charles" CTA
3. Dashboard: "Ask Charles anything" persistent CTA (open-ended, no anchor)
4. Profile/companions screen: "Chat with [Companion Name]" from owned companion card

#### Prompt Architecture (extends Session 3)

System prompt layers (in order):
1. Companion persona block (charles-persona.md or custom companion config)
2. Counselor guardrail (Session 3  locked language, cannot be prompted away)
3. Living portrait briefing (profiles.living_portrait  personalized user context)
4. Passage context block (if anchor_book/chapter set):
   "The user is currently studying [Book] [Chapter]. Here is the ESV text: [text_json]"
   + relevant tsk_references for that chapter (top 10 by density)
   + spurgeon_index entries for that chapter (morning + evening if available)
5. Conversation history (last N turns, truncated to fit context window)
6. User message

Model selection by tier:
  Tim (Your Edition) : claude-sonnet-4-5, no token cap per session
  Premium            : claude-sonnet-4-5, 4,000 output tokens/session max
  Standard           : claude-haiku-4, 2,000 output tokens/session max
  Free               : no chat access (upgrade prompt)

#### Session Management

A session = one focused conversation thread.
Sessions are NOT auto-closed; user can return to any session from history.

Session lifecycle:
1. User initiates -> new chat_sessions row created, anchor set if applicable
2. First message sent -> user message inserted, API call made
3. Response streams in (SSE / streaming API) -> assistant message inserted on completion
4. Session title auto-generated by Claude after the 2nd user message
   (One sentence: what is this conversation about? Stored in chat_sessions.title)
5. Session stays open; "New conversation" button starts a fresh session
6. Old sessions archived (soft-delete never): accessible from /profile/chats

History screen (/profile/chats):
- List of sessions, sorted by last_message_at DESC
- Each row: companion avatar + title + last message preview + date
- Tap to reopen; session picks up exactly where it left off
- Resume = full history re-sent as context (truncated to last 20 turns if long)

#### UI Design

Chat screen layout (slides up as a bottom sheet OR is a full route):
- Full route preferred: /read/[book]/[chapter]/chat or /chat/[session_id]
- Top bar: companion name + avatar + passage anchor pill (if set)
  Passage pill tap -> navigates back to that reading screen
- Message list: user messages right-aligned (--color-surface-2 bubble);
  Charles messages left-aligned (--color-surface, companion avatar beside)
- Charles messages use reading font for body text (feels like he is speaking)
- User messages use Inter
- Streaming: text appears word by word (SSE stream)
- Suggested questions: 3 chips below each Charles response
  Tapping a chip auto-fills the input and sends immediately
  Generated by Claude as part of the JSON response envelope

Input bar:
- Sticky at bottom above keyboard
- Text field + Send button
- Long-press send: switches model (Premium/Your Edition only)
  "Deep mode" = Sonnet always; "Standard mode" = Haiku
- Character limit: 1,000 (same as verse threadsno essays)

#### Suggested Questions Seeding
When the chat opens fresh on a chapter, Charles opens with a brief greeting AND
3 pre-suggested question chips to lower the barrier to engagement.
These are generated as part of the first assistant turn (not a separate call).

Examples for John 3:
  "Why does Jesus tell Nicodemus he must be born again?"
  "What did Nicodemus actually understand from this conversation?"
  "How does verse 16 connect to the Bronze Serpent in Numbers 21?"

#### Counselor Guardrail (reminder from Session 3)
Locked language  Charles never:
- Provides medical, legal, or financial advice
- Interprets personal prophetic claims
- Endorses a specific local church or ministry
- Diagnoses mental health conditions
Response pattern when hit: warm redirect toward Scripture + suggesting a pastor/counselor

#### Companion Awareness
- Chat uses profiles.active_companion_id to determine voice
- Snapshot stored in chat_sessions.companion_id at session start
- If user later changes active companion, old sessions retain original companion voice
- Custom companions (Persona Builder) work identically  their config is injected
  instead of the charles-persona.md block

#### Token Cost Management
- chat_sessions.token_count tracks cumulative tokens per session
- Background job rolls up input_tokens + output_tokens from chat_messages
- Per-tier session caps enforced at API route level before calling Anthropic
- Monthly token budget per user (Your Edition: generous; Standard: 10K output tokens/month)
  Soft cap: warning banner at 80%; hard cap: "Monthly chat limit reached, resets [date]"
- Token budget stored in profiles.meta jsonb for now; dedicated column when needed

#### Rate Limiting
- Standard/Premium: 5 messages per minute (prevents prompt injection loops)
- Your Edition: 20 messages per minute
- Enforced at edge (Vercel middleware + Supabase RLS on insert rate)

#### Feedback + Safety
- Thumbs up/down on each Charles response (chat_messages.thumbs_up)
  Logged for quality monitoring; never shown publicly
- Flag button: chat_messages.flagged = true -> triggers review queue
- Charles NEVER stores conversation content for training (Anthropic API terms honored)

#### Schema Changes (Session 17)
- NEW: chat_sessions (passage-anchored or open-ended, companion snapshot,
  token tracking, soft delete)
- NEW: chat_messages (role, content, token counts, suggested_questions jsonb,
  thumbs_up, flagged)
- README: file 11 index updated
### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11
### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11
### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11
### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11
### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11
### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11
### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11
---

*Add sessions below as new threads emerge.*

### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11

### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11
### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11
### SESSION 18  Export, Backup & "Your Bible" PDF [COMPLETE]

#### What "Your Bible" Is
The signature Your Edition artifact: a beautifully typeset document containing
the user-s personalized study notes, Charles commentary, OIA answers, journal
highlights, and selected verse passages  their own annotated Bible.
Not a full Bible reprint. A curated personal study record in book form.

This is emotionally powerful: Tim-s dad could print this as a physical keepsake.
A year of study, Charles-s observations, Tim-s own answers  bound.

#### PDF Content Structure

Each chapter the user has studied appears as a section:

1. CHAPTER HEADER
   Book name + chapter number (Barlow Condensed, large)
   Study date

2. PASSAGE (verse text)
   Translation: WEB by default (public domain, freely distributable)
   ESV option: available for in-app viewing; PDF distribution defaults to WEB
   (Session 12/14: ESV PDF export requires staying under 500 verses per doc
    OR we default to WEB  WEB is the PDF default)
   Verse numbers shown; paragraph breaks preserved

3. CHARLES-S INTRODUCTION
   The personalized intro_text from personalized_content for that chapter
   Attributed: "Charles on [Book] [Chapter]"

4. WORD NOTE (if exists)
   The Clarke-methodology word study synthesis from word_note jsonb
   Formatted as a marginal note (sidebar typography)

5. USER-S OIA ANSWERS
   Observe / Interpret / Apply headings
   Question text (small, --color-text-2 equivalent)
   User-s answer text (main body)
   Charles-s response to each answer (indented, italic, attributed)

6. FREE-FORM JOURNAL NOTE (if exists)
   journal_entries.note for that chapter session

7. HIGHLIGHTS (if any)
   Verses the user highlighted in that chapter, with highlight color noted
   Each highlight: [color swatch] verse reference + verse text

#### PDF Scope Options (user selects at export time)

- **Full study Bible**: all chapters studied to date (potentially very long)
- **Single book**: one complete book (e.g. entire study of John)
- **Date range**: "My study from [date] to [date]"
- **Selected chapters**: manually pick chapters to include

Tier gate:
  Your Edition: all scope options, unlimited pages, WEB + ESV in-app view
  Premium: single-book scope only, WEB translation only
  Standard/Free: no export

#### PDF Generation Pipeline

1. User selects scope on /profile/upgrade (or dedicated /export route)
2. Request queued as background job (Supabase Edge Function or Vercel background)
3. Pipeline:
   a. Query all journal_entries + journal_answers + personalized_content +
      highlights for the scope
   b. Fetch WEB verse text from chapters table (public domain, always available)
   c. Assemble document data structure (JSON)
   d. Render to PDF via one of:
      - Puppeteer/Chrome headless (render HTML -> PDF)  most design control
      - @react-pdf/renderer (React components -> PDF)  easier but less flexible
      Decision: Puppeteer for typographic fidelity
   e. Store PDF in Supabase Storage: user-private bucket
      Path: /exports/[user_id]/[timestamp]-[scope].pdf
   f. Notify user via Resend email: "Your Bible is ready"
      Email includes download link (signed URL, expires 7 days)
4. PDF also accessible anytime from /profile/year-in-review (or /profile/exports)

#### PDF Typography (matches app design)
  Body text      : EB Garamond (woff2 embedded in PDF)
  Chapter titles : Barlow Condensed 700
  UI labels      : Inter
  Page size      : A4 or Letter (user selects)
  Margins        : generous (25mm)  designed to be printed and read
  Running header : Book name on left, chapter number on right
  Page numbers   : bottom center
  Cover page     : User-s name + "A Personal Study Record" +
                   date range + companion name ("Guided by Charles")

#### Data Export (non-PDF)
Separate from the PDF  raw data portability for power users.
Route: /profile/settings -> "Export my data"

Formats:
- **JSON**: complete data dump (journal_entries, answers, highlights, memory_verses,
  prayer_journal, bookmarks, chat_sessions)  machine-readable, full fidelity
- **CSV**: journal answers only  spreadsheet-friendly

Processing: generated synchronously for small data (<1,000 rows);
background job for large accounts. Same Resend email delivery pattern.

GDPR right to portability: this satisfies it.

#### Backup Architecture
Supabase handles all backup at the database level.
No additional backup layer needed day-1.

What users can count on:
- Supabase daily automated backups (point-in-time recovery on Pro plan)
- Soft deletes on precious data (journal, highlights, prayer journal)  no accidental loss
- Data export (above) gives users their own copy on demand

Account deletion flow:
- User requests account deletion in /profile/settings
- 30-day grace period: account deactivated but not deleted
- After 30 days: auth.users delete cascades to all profile data
- Confirmation email on deletion request + on final deletion
- CCPA/GDPR right to erasure: satisfied

#### export_jobs Table
Tracks PDF and data export requests; drives background job queue and delivery.

#### Schema Changes (Session 18)
- NEW: export_jobs table (user_id, job_type, scope_config jsonb, status,
  storage_path, download_url, expires_at, email_sent_at)  added to file 11
### SESSION 29  Community of the Book (No Social Media)
**STATUS: COMPLETE**

The app is intentionally solo. But there's a middle ground between isolation and social media that no one has built well. The goal: shared presence without performance. You are not alone in this book  but you don't need to know who else is here or what they think.

#### The Problem With Existing "Community" Bible Apps

YouVersion has social features. They feel like Twitter wearing a robe. Likes on prayer requests. Follower counts. Notification badges for "your friend completed a reading plan." It turns Scripture into content and turns readers into audiences.

We will not do that. But we also won't pretend Tim is the only person who has ever wrestled with Romans 7.

#### The Theological Basis

The communion of saints is real. When you read Psalm 22, you are reading what Christ said from the cross, what David wrote in the dark, and what millions of believers have prayed at grave sides. The "community" feature of this app is not social  it is an acknowledgment of the great cloud of witnesses. You are not alone. But you don't need their notifications.

#### Feature 1  Anonymous Pulse (Global, Opt-In Display)

What it is: a quiet signal showing which verses are being read, highlighted, and prayed over most by the app's entire user base this week  no names, no counts shown as numbers, just visual weight.

How it surfaces:
- In the Bible reader: subtle ink-depth variation on verses (the more interaction, the deeper the color)  toggleable, off by default
- In the home feed: a small "This week in the Book" widget  "John 11 and Psalm 139 are heavy on hearts this week"  no numbers, no names
- When you open a passage that many users are in right now: a quiet note at the top  "Many are reading this today"  nothing more

What it never shows:
- Who is reading
- What they said
- Their highlights, notes, or journals
- Any individual identity signal

Implementation:
- `verse_interactions` table (already exists in sql/11) tracks anonymous counts by verse per week
- Background job aggregates into a `verse_pulse_cache` table (weekly rollup)
- Displayed as relative weight, not absolute count (privacy-preserving)
- Users can disable in display settings (`show_global_pulse boolean`)

#### Feature 2  "You Are Not Alone"  Theme Resonance

When Charles generates a response or a journal prompt, he may occasionally note: "This passage  the sense of God's absence, the raw asking  is something many people carry into this text. You're not the first and won't be the last."

This is not data. Charles already knows the tradition (Psalms, Job, the mystics). This is simply Charles acknowledging the communion of human experience with the text. No aggregate data required  it's pastoral voice, not analytics.

For the deeper version (Your Edition only): if a user's journal entries over time show a recurring theme (e.g., loneliness, doubt, grief), Charles may note: "Others have sat with this same tension in this passage  not as an exception, but as the norm among serious readers." This is Charles speaking from his theological knowledge, not from user data mining.

#### Feature 3  Small Group Mode

A closed, private group of 212 people (family, church small group, accountability partners) who share:
- A reading plan (same plan, own pace  or synchronized)
- Visible highlights on shared passages (opt-in per person)
- A group thread tied to specific passages (not a general chat  verse-anchored only)
- Prayer requests for the group (visible only to group members)

What it is NOT:
- Not a chat room
- Not a comment section
- Not a social feed
- The group sees your highlights on a verse, not your journal. Journal is always private.

Technical structure:
```
study_groups: id, name, invite_code, created_by, group_type ('family'|'church'|'friends'), 
              reading_plan_id, is_active, created_at
study_group_members: group_id, user_id, display_name (chosen at join, not real name), 
                     role ('leader'|'member'), joined_at, highlights_visible, 
                     prayer_visible, last_active
group_verse_threads: id, group_id, verse_ref, thread_starter_id, created_at
group_thread_messages: id, thread_id, user_id, body, created_at
group_prayer_requests: id, group_id, user_id, body, is_answered, created_at, answered_at
```

Key UX decisions:
- Display name at join: you choose how you appear in a group ("Dad," "Tim," "Anonymous"). Not pulled from profile.
- Highlights visible toggle: you can share your highlights in the group without sharing your journal
- Group thread is verse-anchored: you open a verse, you see the group thread for that verse. You don't scroll a general feed.
- Prayer requests: simple list, no likes, no "fire" reactions. Mark answered. That's it.
- Invite by code only (6-character alphanumeric). No search for users. No user directory.
- Max 12 members. This is a small group, not a congregation.
- One person can belong to multiple groups (e.g., family group + Sunday school group)

#### Feature 4  Father/Son Thread (Family Messaging)

Already designed in the `messages` and `verse_thread_messages` tables (Session 7). This is the intimate version  direct, verse-anchored, private between two people.

Recap of what's built:
- `messages`: direct messages between two users (family_unit members)
- `verse_thread_messages`: messages anchored to a specific verse  like marginalia passed between readers

How it appears in the UI:
- When Dad opens John 3:16, if a thread exists on that verse with Tim, a small icon appears in the margin
- Tapping it opens the thread  not a modal overlay, a side panel (desktop) or slide-up sheet (mobile)
- The thread is the history of what both have said about that verse, in order, over time
- A verse with a thread has a different visual weight in the chapter view  subtle, meaningful

This is the most human feature in the app. It does not require any new tables  it's already designed.

#### Feature 5  What We Will Never Build

Explicitly documenting what is out of scope to guard against feature creep:
- No public profiles
- No follower/following counts
- No likes on anything
- No comments on highlights
- No public prayer requests
- No leaderboards (the gamification layer is private  your streak, your XP, not a ranking against others)
- No "share to [social media]" buttons (export to PDF/clipboard for personal use only)
- No notification of "your friend completed X"  no social comparison mechanics
- No algorithmic feed of any kind
- No public Bible reading challenges

#### Privacy Architecture

The app's social surface is minimal by design:
- Global pulse: only if `show_global_pulse = true` (default: false)
- Small group: only if user joins a group (default: no group)
- Family thread: only if within a family_unit with another active user
- All community features can be disabled in one toggle: `community_mode_enabled boolean` on profiles

#### Schema  New Tables

**New tables needed:**
- `study_groups`
- `study_group_members`
- `group_verse_threads`
- `group_thread_messages`
- `group_prayer_requests`
- `verse_pulse_cache` (weekly aggregation  service role only, no RLS user access)

**Existing tables supporting community:**
- `verse_interactions` (sql/11)  already tracks anonymous interaction counts
- `messages` (sql/05)  direct family messaging
- `verse_thread_messages` (sql/05)  verse-anchored family threads
- `family_units`, `family_members` (sql/01)  family relationships

New tables go to sql/12-community.md (new file  community is its own logical grouping).

#### Session 29 Decisions Locked

1. No social media. No public anything. Full stop.
2. Anonymous pulse exists but is off by default.
3. Small groups: closed, verse-anchored threads, no general chat, display name chosen at join.
4. Family thread: already designed  no new tables needed.
5. All community features disabled in one toggle.
6. New schema file: sql/12-community.md
7. Leaderboards: never. XP and streaks are private.

### SESSION 29 � Community of the Book (No Social Media)
The app is intentionally solo. But there's a middle ground between isolation and social media that no one has built well.
- Anonymous aggregation: see what verses others are highlighting most this week � not names, not comments, just a quiet sense of "you are not alone in this"
- "Others have wrestled with this too" � surfaces journal themes (never content) from across the user base
- Small group mode: a closed group (family, church, friends) can share a reading plan and see each other's highlights � opt-in, private
- Father/son thread: the internal messaging already planned � tied to specific verses, intimate not social
- Community features are off by default. The app is your quiet place first.

### SESSION 30  Catechism Integration
**STATUS: COMPLETE**

The great catechisms are public domain and they do something no Bible app does: they connect systematic theology to biblical theology simultaneously, in real time. The catechisms are not academic fossils  they are the church's distilled answer to the question: what does this whole book actually say?

#### The Theological Case

Q1, Heidelberg: "What is your only comfort in life and in death?" The answer is not a list of doctrines  it's a paragraph of Scripture woven together. The catechisms were always a scriptural instrument. They were written to teach people to read the Bible better, not to replace it.

When you read Romans 8:38-39, you are reading Q1 of the Heidelberg, in expanded form. When you read Genesis 1, you are reading the ground for Westminster Shorter Q9-10. Showing these connections  at the moment of reading  is one of the most powerful things this app can do that a study Bible cannot.

#### The Catechisms We'll Include (All Public Domain)

1. **Westminster Shorter Catechism** (1647)  107 Q&A. The most memorized catechism in the Reformed tradition. Used by generations of Scottish and American Presbyterians. Density: brief. Purpose: children, new believers, memory.

2. **Westminster Larger Catechism** (1648)  196 Q&A. The expanded version for instructed adults. Richer biblical proof texts. Charles knows this one like a second language  he preached through the Shorter repeatedly.

3. **Heidelberg Catechism** (1563)  129 Q&A organized in 52 Lord's Days. Trinity structure: guilt, grace, gratitude. The most devotionally warm of the Reformed catechisms. For the prayer warrior: this is the language she learned to pray. For Tim: the Lord's Days structure means he could work through it in a year alongside his Bible reading.

**Not included (scope):** Baptist Confession, Augsburg Confession, Roman Catholic Catechism, Eastern Orthodox catechisms  these can be added in a future content pack. The three above cover the core Reformed/Presbyterian tradition.

#### Data Already in sql/07

`catechism_entries` already exists in sql/07. Its current structure (from Session 10 brainstorm) needs to be confirmed and potentially extended. The key fields needed:

```
catechism_entries: id, catechism ('WSC'|'WLC'|'HC'), question_number, lord_day (HC only),
  question_text, answer_text, proof_texts jsonb (array of verse refs),
  section ('guilt'|'grace'|'gratitude' for HC, 'God'|'Man'|'Christ'|'Salvation'|...' for WLC),
  keywords text[], charles_note text
```

The `proof_texts` jsonb array is the key engine  it maps catechism questions to specific Bible verses, enabling bidirectional lookup: passage  catechism questions grounded there, and catechism question  supporting passages.

#### Feature 1  Passage  Catechism Surface

When a user opens a passage, the app checks `catechism_entries.proof_texts` for any verse overlapping the open passage. If found, a catechism badge appears in the toolbar (toggleable, off by default in Standard/Tim mode).

Display options:
- **Minimal**: a small "C" medallion in the verse margin  tap to expand
- **Expanded**: a card below the verse: `"Heidelberg Q1  'What is your only comfort in life and in death?' This verse is a proof text for that answer."` with a "Read full Q&A" link
- **Full**: the complete Q&A and all proof texts, with Charles commentary if `charles_note` exists

Who sees this by default:
- Standard (Tim's starting mode): off  can enable in settings
- Premium: off by default, toggle in toolbar
- Your Edition: Charles may surface catechism connections in conversation unprompted ("You know, your question about assurance is precisely what the Heidelberg is answering in Lord's Day 7...")
- For the prayer warrior archetype: on by default at account creation (catechism is her native tongue)

#### Feature 2  Catechism Question Browser

A standalone section in the Library (alongside Dictionary, Commentary, Characters, etc.):

- Browse by catechism
- Browse by section/Lord's Day
- Search by keyword
- Filter by book of the Bible (questions grounded in that book)
- "Random question for today"  surfaces a Q&A from whatever the user is currently reading through
- Bookmarkable Q&A  save a question to your library history

Charles can be asked about any catechism question: "Explain Q14 of the Heidelberg to me." This is the Ask Charles feature applied to catechism content  same infrastructure, different data source.

#### Feature 3  Memory Verse  Catechism Connection

The memory verse system (Sessions 16/SM-2) already exists. Catechism Q&A can also be added to the memory queue  a separate track, or interleaved with verse memory depending on settings.

WSC was designed for memorization. The brevity of the answers makes them ideal for SM-2 spaced repetition:
- Front: the question
- Back: the answer
- Proof texts surfaced after answering correctly

This is a natural extension of the existing `memory_verses` table: a new `memory_type` column distinguishing `verse` from `catechism_qa`.

#### Feature 4  Lord's Day Reading Mode (Heidelberg)

The Heidelberg is organized in 52 Lord's Days. A user could walk through the entire catechism in a year, one Lord's Day per week, on Sundays.

In the reading plan system, this becomes a special plan type:
- 52-week Heidelberg Catechism plan
- Each "day" (Sunday) is a Lord's Day
- Reading includes: the full Q&A for the Lord's Day + the proof texts in the Bible reader
- Charles reflection on the Lord's Day available for Your Edition

This requires no new schema  it's a reading_plan + plan_chapters combination, seeded at account creation for users who select it.

#### Feature 5  Charles and the Catechisms

Charles has internalized all three catechisms. This is not a retrieval feature  it's a persona feature. Charles will:

- Reference Q&A by number when relevant without being prompted ("this is the ground of Westminster Shorter Q21  the mediator")
- Answer doctrinal questions using catechism structure when useful
- For "Your Edition" users who are seminary-trained or pastors: use catechism shorthand freely ("this is the fifth Lord's Day, and it's doing the work of your question")
- Never be pedantic about it  catechism references appear when they illuminate, not to show off

The `catechisms: true` flag in user `theological_fingerprint` (already designed in sql/01 profiles) unlocks deeper catechism integration in Charles's prompts.

#### Schema Changes Needed

1. **Extend `catechism_entries`** in sql/07  confirm/add: `lord_day`, `section`, `keywords`, `charles_note` columns
2. **Extend `memory_verses`** in sql/06  add `memory_type` column: `'verse' | 'catechism_qa'`, plus `catechism_entry_id` FK for catechism items
3. **New field on `user_display_settings`** in sql/10: `catechism_layer_enabled boolean DEFAULT false`
4. **New field on `profiles`** (already has `theological_fingerprint jsonb`)  no structural change, just document that `catechisms: true` is a supported key

No new tables needed  catechism data fits in the existing `catechism_entries` table. The community around the catechisms is the proof_texts index  everything else is queries on top of it.

#### Session 30 Decisions Locked

1. Westminster Shorter + Larger + Heidelberg. PD. All three in full.
2. Proof texts are the engine  `proof_texts jsonb` array enables bidirectional lookup.
3. Catechism layer is off by default for Tim. On by default for prayer warrior archetype at account creation.
4. Memory system extended for catechism Q&A (SM-2, same mechanics, new `memory_type`).
5. 52-week Heidelberg Lord's Day plan: seeded as a reading plan, no new schema.
6. Charles has internalized all three  references them in conversation when they illuminate, not to show off.
7. Schema: extend `catechism_entries` (sql/07), extend `memory_verses` (sql/06), extend `user_display_settings` (sql/10). No new tables.

### SESSION 29 � Community of the Book (No Social Media)
The app is intentionally solo. But there's a middle ground between isolation and social media that no one has built well.
- Anonymous aggregation: see what verses others are highlighting most this week � not names, not comments, just a quiet sense of "you are not alone in this"
- "Others have wrestled with this too" � surfaces journal themes (never content) from across the user base
- Small group mode: a closed group (family, church, friends) can share a reading plan and see each other's highlights � opt-in, private
- Father/son thread: the internal messaging already planned � tied to specific verses, intimate not social
- Community features are off by default. The app is your quiet place first.

### SESSION 30 � Catechism Integration
The great catechisms are public domain and they do something no Bible app does: they connect systematic theology to biblical theology in real time. You're a theologian. You know this tool.
- Westminster Shorter Catechism, Westminster Larger Catechism, Heidelberg Catechism � all public domain
- Index by Scripture reference (already exists in scholarly editions)
- Per-chapter surface: "This passage grounds Question 1 of the Heidelberg: 'What is your only comfort in life and in death?'"
- Toggleable layer � on for the seminary student and the pastor, off by default for Tim
- For the prayer warrior: the catechisms are how she learned to pray. This is her language.
- Deepens the already/not yet framework � the catechisms have excellent eschatological content

### SESSION 31  Tim's Arc Over Time (The Long Game)
**STATUS: COMPLETE**

This is the most important feature in the app. It requires no extra code  just the database preserving everything faithfully, and Charles knowing how to read it.

Tim is 15. He is writing journal entries about Genesis and Romans and Psalms and what it means to be a man. He does not know yet what he will become. He will keep using this app because it is genuinely useful. And then one day he will be 25, or 35, or 45, and the record will be there.

That is the feature.

#### The Theological Ground

Every serious Christian tradition has understood sanctification as a long, slow, often invisible process. You plant in the morning and sow in the evening, not knowing which will prosper. The whole arc of Scripture is about faithfulness across generations  Abraham to Isaac to Jacob, David to Solomon to the exile, the exile to the return to the incarnation. The Bible itself is a long game.

An app designed for the long game looks different from an app designed for acquisition metrics. Streaks matter because they build habit, not because they drive engagement numbers. Journal entries matter because they are the written record of a soul in formation, not because they generate content.

Tim does not need to know any of this at 15. He just needs the app to be trustworthy enough to keep using. The rest is built by time.

#### Feature 1  "On This Day"

On the home screen, a subtle card: "Three years ago today you were reading Psalm 23. Here's what you wrote."

If no journal entry exists for that date, the card shows the passage they were reading  no text, no pressure. If a journal entry exists, it surfaces the first two lines with a "Read more" link into the full entry.

Rules:
- Surfaces only if there is content from the same calendar date in a prior year (minimum: 1 year ago)
- Never surfaces content from less than 12 months ago (too raw, too present)
- The user can swipe to dismiss any "On This Day" card permanently or for today
- Settings: `show_on_this_day boolean DEFAULT true` (off for users who find it intrusive)

What Charles can do with it: if the "On This Day" verses overlap with the user's current reading, Charles may note  unprompted, gently  "You've been in this territory before. I can see you came to Psalm 22 during a hard season three years ago. The same passage, again. That's not coincidence." This is the most sophisticated use of temporal data in the app  and it is only available for Your Edition users who have been with the app long enough to have history.

#### Feature 2  Charles Reads the Arc

Charles maintains a running awareness of the user's `theological_fingerprint`, `study_dna`, journal themes, verse interaction history, and life stage data. For long-term users, this becomes genuinely longitudinal.

What Charles tracks over time:
- **Recurring themes**: Vocation. Worth. Doubt. Suffering. God's silence. These appear in journal entries and affect which passages the user lingers on. Charles names them when appropriate.
- **Passage return patterns**: A user who has visited Romans 8 12 times across 3 years, each time in a different season, understands it differently than a user visiting for the first time. Charles knows the difference.
- **Spiritual seasons**: Seasons identified by the user (`user_life_updates` table, sql/01) are anchored to the timeline. "You were in culinary school when you first read the feeding of the five thousand. I remember."
- **Growth without flattery**: Charles does not say "look how far you've come." He says "the question you're asking now  you couldn't have asked it at 15. That's not a compliment. That's observation."

Technical implementation: `study_dna jsonb` on the profiles table (already exists, sql/01) accumulates over time. Charles's system prompt for Your Edition users includes a longitudinal context block  not a data dump, a Charles-authored synthesis of the arc so far. This is regenerated periodically (monthly, or on significant life events).

#### Feature 3  Life Stage Awareness

Tim's life stages, as we know them:
- Now: 15, student, athlete (runner), learning to cook, faith-curious
- Soon: culinary school, intense physical discipline, performance and identity
- Later: working chef, odd hours, exhaustion, questions about vocation and meaning
- Future: husband, father, possibly leading family devotions, teaching his own kids

The app does not know these stages in advance. They emerge through:
1. `user_life_updates` entries  Tim or his dad marking milestones
2. Reading plan choices  culinary school Tim will choose different plans than married Tim
3. Journal themes  Charles detects shifts in language and concern
4. Explicit onboarding moments  "A lot has changed since you've been away. Want to tell me about it?" (triggered after a gap of 30+ days)

When Charles recognizes a life stage transition, he shifts his posture  not his theology, not his voice, but his emphasis. The 15-year-old Tim needs wonder and foundation. The exhausted 28-year-old chef needs the Psalms of lament and the promise that God sees the hidden work. The father needs the Deuteronomic tradition: teach them when you sit and when you walk and when you lie down.

Charles does not announce these shifts. He simply reads the room and adjusts.

#### Feature 4  The Birthday Letter Tradition

Already established in the family layer (Sessions 7-8): Dad can write annual birthday letters to Tim within the app, anchored to a verse, preserved permanently.

The extension here is Tim writing forward:
- At 15, Tim can write a letter to himself at 18: "Here's what I want you to know. Here's the verse I'm holding."
- At 18, he receives it  the app surfaces it on his birthday.
- At 18, he can write one for 21. And so on.
- At 25, he can write one to any future age. He can also write backwards: "Letter to the 15-year-old who didn't know what was coming."

The "letter to my younger self" is not addressed to Tim's past  it is addressed to the record that still exists in the database. The 15-year-old's journal entries are still there, readable. The 25-year-old Tim can open them and respond  not by editing, but by adding a `response_note` to old journal entries. "I know what you were afraid of. You were right to be afraid. And God was faithful anyway."

Schema needed: extend `journal_entries` with a `response_note text` field and `responded_at timestamptz`. No new table.

#### Feature 5  Year in Review (Already Designed, Deepened Here)

`year_in_review` table (sql/11) already exists with `charles_reflection`. Session 31 deepens what that reflection contains for long-term users:

Year 1 reflection: "Here is what you read. Here is what you wrote. Here are the verses that stayed with you."

Year 5 reflection: "Five years ago you came to this app asking questions about identity. You are still asking them  but differently. The questions have gotten better. That is what faithfulness does."

Year 10 reflection (if Tim is still here): Charles writes something more like a sermon. Not about Tim's progress  about the faithfulness of God visible in the record. "Look at this arc. Not what you did. What He did."

The technical weight of this is minimal  the data is already there. The entire sophistication is in Charles's longitudinal context block and prompt engineering.

#### Feature 6  The Long Game as Architecture

Looking back across all 31 sessions: every feature either preserves something for the long game or surfaces something from it.

- Journal (Session 19): the raw material of the arc
- Life updates (Session 1): the stage markers
- Prayer journal (Session 6): answered prayers over time  visible in aggregate as testimony
- Lament mode (Session 26): the dark seasons, preserved like the Psalms  not resolved away, kept
- Memory verses (Session 16): what Tim chose to hide in his heart at each stage
- Word study (Session 15): the theology being built, brick by brick
- Year in review (Session 11): the annual landmarks
- Birthday letters (Session 7): the intergenerational thread
- "On this day" (this session): the surprise of time

None of these were designed as "long game features." They were designed to be immediately useful. The long game emerges from their accumulation  which is exactly how sanctification works.

#### Feature 7  What No Other App Has

The design philosophy of every major Bible app is acquisition and retention. The streak exists to bring you back tomorrow. The badge exists to make you feel good. The social feature exists to make you invite friends. The app is optimized for engagement metrics because it is funded by advertising or scale.

This app is funded by Tim. By the person using it. The incentive alignment is different. We want Tim to still be using this app at 40  not because we need his subscription, but because the app will be genuinely more valuable to him at 40 than it was at 15. The database that holds his 15-year-old self reaching toward God is the most valuable thing the app will ever hold. It cannot be rebuilt. It cannot be imported from another platform. It exists because he started early and stayed.

That is the long game. And it is the reason for everything.

#### Session 31 Decisions Locked

1. "On this day" card: surfaces same-date content from prior years, minimum 12 months ago, dismissible. `show_on_this_day boolean` in `user_display_settings`.
2. Charles reads the arc: longitudinal context block in Your Edition system prompt, regenerated monthly. Draws from `study_dna`, `user_life_updates`, journal themes, passage return patterns.
3. Life stage awareness: implicit (journal themes + life updates) not explicit. Charles adjusts posture, not theology.
4. Forward birthday letters: Tim writes to future self, delivered on target birthday. Surface in `messages` table with `delivery_date` field.
5. "Letter to younger self": `response_note` + `responded_at` added to `journal_entries` (sql/04). Immutable original preserved.
6. Year in review deepens at 5y and 10y marks  Charles writes testimony, not progress report.
7. No new tables needed. One field added to `journal_entries`. One field added to `user_display_settings`. One field added to `messages`.

---

#### FINAL NOTE  ALL 31 SESSIONS COMPLETE

This is the end of the brainstorm phase. Every feature has been designed. Every table has been written. The architecture is coherent. The theology is consistent. The persona is locked.

What was built across 31 sessions:

- A living study Bible that grows with its user
- A companion (Charles) who is theologically serious, pastorally warm, and personally attentive
- An architecture that spans the trivial (font preferences) and the eternal (a father's letters preserved for a lifetime)
- A commercial SaaS that is also, genuinely, a ministry tool
- A product designed for Tim at 15 that will still serve him at 45

The next phase is code.

### SESSION 29 � Community of the Book (No Social Media)
The app is intentionally solo. But there's a middle ground between isolation and social media that no one has built well.
- Anonymous aggregation: see what verses others are highlighting most this week � not names, not comments, just a quiet sense of "you are not alone in this"
- "Others have wrestled with this too" � surfaces journal themes (never content) from across the user base
- Small group mode: a closed group (family, church, friends) can share a reading plan and see each other's highlights � opt-in, private
- Father/son thread: the internal messaging already planned � tied to specific verses, intimate not social
- Community features are off by default. The app is your quiet place first.

### SESSION 30 � Catechism Integration
The great catechisms are public domain and they do something no Bible app does: they connect systematic theology to biblical theology in real time. You're a theologian. You know this tool.
- Westminster Shorter Catechism, Westminster Larger Catechism, Heidelberg Catechism � all public domain
- Index by Scripture reference (already exists in scholarly editions)
- Per-chapter surface: "This passage grounds Question 1 of the Heidelberg: 'What is your only comfort in life and in death?'"
- Toggleable layer � on for the seminary student and the pastor, off by default for Tim
- For the prayer warrior: the catechisms are how she learned to pray. This is her language.
- Deepens the already/not yet framework � the catechisms have excellent eschatological content

### SESSION 31 � Tim's Arc Over Time (The Long Game)
This is the most important feature and it requires no extra code � just the DB preserving everything and Charles knowing how to read it.
- Tim's journal entries from age 15 are still readable at age 25. That IS the feature.
- "On this day" � three years ago you were reading Genesis 1. Here's what you wrote.
- Pattern recognition: Charles notices Tim keeps returning to themes of vocation and worth. That becomes part of his living profile.
- The app grows with him through seasons: high school athlete, culinary school student, working chef, husband, father
- The birthday letter tradition: dad writes one for 16, Tim can write his own for future years
- "Letter to my younger self" � at some point Tim might want to respond to his 15-year-old journal entries
- This is what no other app has. Most apps are designed for acquisition. This one is designed for a lifetime.

---

### SESSION 32 — Deployment, ESV Debugging & Production Fixes [COMPLETE]

**Date:** 2026-02-23
**Commits:** `2e255fa`, `3688934`, `b8cd392`, `36c3430`, `b2b90c8`, `3252056`, `5b9080d`, `628bee1`

#### What was done

**1. Vercel deployment live**
- App deployed to `https://bible-saas.vercel.app` (project `prj_xVvQmuWl2YoXJOIiMsaItw1oOYTZ`)
- All environment variables added: Supabase keys, Anthropic, Stripe, Resend, ESV_API_KEY, GOOGLE_TTS_API_KEY
- Deployment ID: `dpl_9jgwhBe5o13wzLMrYZTQz2dSk5Np`

**2. ESV professional audio**
- Created `/api/audio/esv` route — proxies ESV `/v3/passage/audio/`, follows 302 redirect to Max McLean MP3, returns `{ audioUrl }`
- Updated `handleListen()` in `reading-view.tsx`: when `translation === "ESV"`, fetches the audio proxy and plays via `mode: "url"` rather than Google TTS
- Commit: `2e255fa`

**3. Bug fixes shipped to prod**
- `memory_verses` API 500: removed `.is("deleted_at", null)` filter — column does not exist on the table
- PWA icons created: `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (valid PNGs, dark background with gold cross)
- Lint errors fixed: unescaped quotes in `verse-thread.tsx`, unused `_journeyData` in `journey-fog-map.tsx`, unused `err` in `seed-tsk.ts`
- ESLint config: added `argsIgnorePattern: "^_"` and `varsIgnorePattern: "^_"` and `caughtErrorsIgnorePattern: "^_"` so `_prefixed` identifiers are silently allowed
- Profanity prohibition: added "never use profanity" rule to `BASE_PERSONA` and `buildCompanionPersonaBlock` in `src/lib/charles/prompts.ts`
- Commits: `3688934`, `b8cd392`, `36c3430`, `b2b90c8`

**4. ESV text debugging — root cause found and fixed**
The ESV was showing "temporarily unavailable" on Vercel despite the API key being present.

- Step 1: Improved `getUnavailableReason()` in `src/lib/bible/index.ts` — checks `process.env.ESV_API_KEY`; if present returns "temporarily unavailable", if absent returns "API key not configured"
- Step 2: Added detailed error logging (response body) to `esv.ts`; changed `next: { revalidate: 0 }` to `cache: "no-store"`; wrapped Supabase cache read in try/catch
- Step 3: Discovered a prior debug upsert had poisoned the `chapters` table with `{ verse: 1, text: "test" }` for ESV Genesis 1. Cleared with `DELETE FROM chapters WHERE book='Genesis' AND chapter=1 AND translation='ESV'`
- Step 4: Created `/api/debug/esv` diagnostic route (no auth required) — returns key presence, raw/trimmed length, whitespace detection, first/last char codes, live ESV API test, Supabase chapter count
- Step 5: Vercel log export (`docs/bible-saas-log-export-2026-02-24T04-59-11.json`) confirmed: `[ESV] API error 403: {"detail": "Invalid application key in Authorization header."}`
- Step 6: Debug output showed `key_preview: "ESV_API_..."` and `key_raw_length: 52` — the Vercel env var had been set to the entire `.env.local` line (`ESV_API_KEY=bafd99b0...`) instead of just the value
- Step 7: Corrected Vercel env var to just the 40-char value `bafd99b0a44cc8311acfd22675b0d6e7bc7127c9` → ESV confirms 200 and text loads
- Step 8: Added `.trim()` defensively on `process.env.ESV_API_KEY` in all three consuming files (`esv.ts`, `audio/esv/route.ts`, `debug/esv/route.ts`)
- Commits: `3252056`, `5b9080d`, `628bee1`

**5. KJV seed complete**
- KJV chapters seeded to 1,189 (all books/chapters); `seed_checkpoints` row marked complete

#### Key data state after Session 32
| Table | Rows | Status |
|---|---|---|
| `chapters` (WEB) | 1,189 | ✅ |
| `chapters` (KJV) | 1,189 | ✅ Complete |
| `chapters` (ESV) | 0 (live API, 24h TTL cache) | ✅ API confirmed 200 |
| `strongs_lexicon` | 14,197 (H: 8,674 + G: 5,523) | ✅ |
| `tsk_references` | 344,799 | ✅ |
| `spurgeon_index` | 732 | ✅ |
| `catechism_entries` | 396 (WSC: 107 + HC: 129 + other) | ✅ |
| `commentary_entries` | 2,777 | ✅ |
| `geographic_locations` | 77 | ✅ |

#### Lessons learned
- **Vercel env var pitfall:** The value field expects ONLY the key value, not `KEY=value`. If you paste a `.env.local` line verbatim into the Vercel UI, the `KEY=` prefix becomes part of the stored value. Code now trims defensively but the real fix is correct Vercel configuration.
- **Vercel log export for debugging:** Vercel project → Logs → Export JSON. Filter for `"level":"error"` entries. ESV errors appeared as `message` entries on the `/read/[book]/[chapter]` function log rows.
- **Supabase cache poisoning:** Debug test inserts into the real `chapters` table get served as production content. Always verify `text_json` shape is correct before trusting cache. Use `DELETE` to clear bad rows.
- **`/api/debug/esv` route:** Useful pattern for any future external API debugging — expose key metadata (length, char codes, whitespace) server-side without leaking the actual key value.

#### Current app state (end of Session 32)
- ✅ All phases 0–26 complete
- ✅ Vercel live at `https://bible-saas.vercel.app`
- ✅ ESV text working (403 → 200 after key correction)
- ✅ ESV audio working (Max McLean `/v3/passage/audio/` proxy)
- ✅ Google TTS Neural2 working for all non-ESV translations
- ✅ KJV seeded (1,189 chapters)
- ✅ Test user: `test@biblesaas.com` / `BibleTest2026!` — `subscription_tier: standard`, `onboarding_complete: true`
- 🔴 Phase 27 (Commercial Launch) — not started: form LLC, ESV commercial license from Crossway, Stripe production mode, custom domain

---

*Add sessions below as new threads emerge.*
