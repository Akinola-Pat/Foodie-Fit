# Foodie Fit — Project Journal

## Thursday, August 27, 2026

Started the project with a raw idea: an app that plans workouts and meals based on where someone lives and what they can afford, using AI to check what's locally available. Went straight to building with Gemini.

It didn't go well. The output didn't resemble what I actually wanted, and not in a small, fixable way. The generated plan and structure diverged from the brief enough that patching it in place would probably have taken longer than starting over.

I sat with that instead of jumping straight back in. Decided overnight to restart, but with a different process this time, not just another attempt at the same approach.

## Friday, August 28, 2026

Restarted from scratch, using Claude this time for planning, feasibility review, and prompt writing before touching a build tool at all, instead of going straight from idea to generated code.

The real lesson from yesterday wasn't "one AI tool beat another." It was that handing a raw idea to any model, with no feasibility check and no written brief, produces something unreliable no matter which model you use. The fix was adding a planning phase before scaffolding, not switching brands.

Before writing any build prompt, I ran the original idea through an actual feasibility pass instead of assuming it was buildable the way I'd pitched it. Turns out "AI checks what meals are available locally and suggests them" isn't a solved problem. I looked into restaurant and grocery data APIs (Google Places, a few dedicated menu-data providers) and there's no clean, affordable, reliable source of live menu pricing or nutrition tied to GPS location. Building toward that literally would have meant months of scraping infrastructure with real legal and reliability risk, not a feature I could actually ship.

Also found that the category itself is already crowded. MyFitnessPal, Noom, FoodiePrep, Mealime, Eat This Much, Nutrola, plenty of others already claim some version of AI-driven, budget-aware meal planning. "AI plus local plus budget" on its own isn't a differentiator.

Redefined "local" as curated regional ingredient and cuisine templates instead of live data, and "budget" as a self-selected tier rather than real-time pricing. Cut the scope down from mobile, web, dynamic theming, live location, and a full AI engine all in v1, to something closer to a real MVP: mobile only, one theme, honest estimates instead of data I can't actually get.

Spent the rest of the day on the design system. Worked from three reference mockups, a dark stat-heavy fitness screen, a card-based daily planning screen, and a clean data screen, to settle on a visual language before letting the build tool improvise screen by screen.

Landed on a single accent color policy, no gradients, no rainbow palette. Went through two versions of the palette itself: started with a bright green (`#4DD21D`), then swapped it for a darker, more muted forest green (`#2D6A4F`) after actually sitting with what each one signals. Bright green reads energetic and urgent, the muted tone reads calmer, more premium, and that was the better fit for what this app is supposed to feel like. Background is a warm winter white (`#F5ECD2`) instead of stark white, ink is `#212121` with a full neutral grey ramp built off it, amber and red are reserved strictly for status states and never used decoratively. 8px spacing grid, 16px corner radius, one type family, a capped type scale, all locked before any screen work started rather than figured out as I went.

Also settled the framework question: React Native with Expo over Flutter. Picked deliberately, faster scaffold-to-preview loop, stronger library support for the card and ring-heavy UI I wanted, and a real path to React Native Web if a web app happens later. Not an arbitrary coin flip.

Turned the feasibility findings and the design system into a full written build prompt for Google Antigravity, explicit scope boundaries, explicit design tokens, explicit things it should not build, rather than a loose conversational ask.

Antigravity came back with an implementation plan. Read it line by line instead of approving on a skim. Found real gaps: reminders were a stated MVP feature but `expo-notifications` wasn't in the dependency list at all. Storage had quietly been downgraded to local-only, dropping the account-persistence expectation without flagging that as a decision anyone made. No charting library named for the weight trend line. Regional cuisine buckets existed but there was no actual locale-to-region mapping logic behind them. No unit tests specified for the nutrition math, which is the one part of this app that has to be numerically right. No accessibility or contrast checks, no reduced-motion check, in the verification plan. And the equipment-access question's optionality wasn't confirmed against the rule that no optional field should block onboarding.

The biggest call here: chose to require real accounts through Supabase over local-only storage, even though that adds scope, auth screens, an account deletion flow, privacy policy work down the line, because losing someone's progress on a reinstall would undermine the entire point of the app.

The revised plan came back addressing all seven of those. Two more things turned up on review. The nutrition engine was applying a flat calorie deficit regardless of a user's calculated TDEE, which could push a smaller or less active person below a safe daily minimum, not something to leave unhandled in an app that isn't medically supervised. And there was no in-app account deletion flow, which Apple's Guideline 5.1.1(v) requires for any app with account creation. Missing that would mean a guaranteed rejection later, cheaper to catch now than after a failed submission. Sent both back as required before building further.

Somewhere in this back-and-forth, a pattern became clear that ended up mattering more than any single bug: a description of correct behavior from an AI agent is not the same thing as verified correct behavior. Caught a claimed contrast ratio that didn't independently check out to the exact number stated (still passed WCAG AA, just wasn't verified the way it was presented). Caught a vague citation, "supported by NIH and ACSM guidelines," tacked onto a real, specific one (Harvard Health), and cut it because sounding authoritative isn't the same as being checkable. And caught a "deletion cascade verification" that was written entirely in the hypothetical, "when this executes, it should cascade," rather than describing an actual database run. The type signature in the code gave it away, `SupabaseClientLike` meant the supporting test was mocked, not real.

That became a standing rule for the rest of the build: pure logic, math, formatting, client-side validation, is fairly provable with unit tests alone. Anything touching a real external system, a database, an auth provider, a third-party API, isn't verified until it's actually been run against that real system at least once. A mock or a narrated description doesn't count as either.

Asked for actual proof on the calorie safety floor and the account deletion cascade, and got it. A real citation fix, the Harvard Health quote kept, the vague NIH/ACSM name-drop removed. A macro-sum invariant fix with a real test suite covering low-TDEE and high-bodyweight edge cases, real Jest output attached. And the account deletion verified against `@electric-sql/pglite`, an actual embedded Postgres engine, not a mock, with real before-and-after row counts across every linked table for a real inserted user, proving the cascade genuinely fires.

One caveat still open: pglite proves the Postgres cascade mechanics are solid, that part's fully trustworthy now, but it doesn't run Supabase's actual auth layer, so the permission and role machinery (`auth.uid()`, `SECURITY DEFINER`, the `authenticated` grant) hasn't actually been exercised yet. Need to re-run the same before-and-after check against a real Supabase dev project once the auth and database layer is actually built, not just against pglite.

Approved scaffolding.

Standing items to check as the relevant build steps come up, not saved for the very end: the real-Supabase re-verification above, actual rendered contrast checking on a device instead of calculated on paper, reduced-motion behavior tested with the OS setting actually on, the account deletion flow tested as a real tap-through in the built app, and the privacy policy, which is entirely on me, not the build tool, and needs to exist before any App Store submission.

*(Keep logging here as the build moves forward, screen reviews, device testing notes, anything else that turns up, and eventually the deployment steps: local dev, GitHub, hosting, production.)*

## Sunday, September 20, 2026

Went back to the codebase after a stretch on other work and pulled the actual state of the app instead of going off memory of where things stood. Good thing I did. The onboarding flow ended in a real dead end: step 6 pushes to `/(onboarding)/plan-summary`, and that file did not exist. The onboarding layout even had a `Stack.Screen` declared for it. Declared, not built. Past that, root layout references `(tabs)`, `(auth)`, and `settings/account`, none of which existed either. So the honest state of the app before today was: a working six-step onboarding flow that led nowhere.

The good surprise: the service layer, the stores, and the shared components were much further along than I remembered. `useUserStore`, `useLogStore`, `useAuthStore`, the nutrition engine, meal and workout services, the weight trend chart, the meal card, the guest banner, all real and already working. The gap wasn't the logic. It was that nothing had been wired into an actual screen past onboarding.

Built the plan summary screen first since it's the literal blocker, pulls the calculated nutrition plan and safety notice out of the store that's already there, and routes into the tab group on "Get Started." Then built the `(tabs)` group itself with one real tab for now, Home, since a second tab with buttons that don't go anywhere yet is worse than no second tab. The dashboard pulls today's meal plan by matching the actual day of the week against the stored weekly plan, shows the weight trend chart against real logged entries, and has a working water tracker against the log store's existing `addWater` action. Nothing in it is placeholder data.

Verified with `npx tsc --noEmit`, clean, and the existing Jest suite still at 24 passing, nothing broken. That's real but partial proof. It confirms the code compiles and existing logic wasn't touched. It does not confirm the screens actually render right or that the navigation from step 6 through plan summary into the dashboard works as a real tap-through on a device or simulator, I don't have one available from here. That's still owed before I'd call this screen done, not just written.

Deliberately left out of this pass: the `(auth)` group and `settings/account`. Checked `authService.ts` while I was in there, it only has account deletion implemented, there's no sign-up or sign-in function at all yet. Building a real auth screen on top of that would mean writing new backend-facing auth logic under time pressure, not just wiring an existing screen to an existing store the way plan summary and the dashboard were. Guest mode already covers this gap for now, the dashboard shows the existing guest banner and its save-account prompt just routes back to plan summary rather than to a real signup screen that doesn't exist yet. That's the honest scope of what's next, not a corner I'm treating as already handled.

