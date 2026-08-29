# Foodie Fit

An AI-guided workout and meal planning app built around who you actually are: your goals, your current weight, your dietary needs, your budget, and the food culture of your region. It doesn't pretend to know real-time restaurant menus or live grocery prices, because no honest version of this app can promise that yet.

## What this is

Most fitness apps track. Most diet apps log. Foodie Fit plans. It generates a workout split and a set of meal suggestions from a short onboarding, then adjusts as you log progress. AI does two things here: turns structured inputs (goal, weight, activity level, restrictions, region, budget tier) into a coherent daily plan, and adds enough variety that the plan doesn't feel like a rigid template repeated every week.

It doesn't claim to know what's on the menu at the restaurant down your street tonight, or what chicken costs at your specific grocery store this week. Most competitors quietly fudge or skip that part, because the underlying data doesn't exist as a clean, affordable API. This app is upfront about it instead: "local" means regionally appropriate ingredients and cuisine, "budget" means a tier you select yourself, not a live price feed.

## The problem it solves

Most fitness and diet apps are built around one food economy, usually a US or UK grocery basket and a US or UK sense of what things cost, then shipped globally with a currency symbol swapped in and not much else changed. That leaves a lot of users picking between plans that don't reflect what they can actually get or afford, or apps so vague ("eat healthy, move more") that they don't give anyone a real starting point. Foodie Fit's bet is that a plan built around a real budget tier and a real regional food culture, paired with a workout plan that fits the equipment someone actually has, ends up more useful, and more honest, than one that quietly assumes conditions the user doesn't have.

## Who it's for

- People starting or restarting a fitness routine who find existing apps either too clinical, spreadsheet-style calorie counters, or too vague to act on.
- Budget-conscious users outside the US/UK markets most fitness apps are built for, who need meal suggestions that reflect what's actually affordable and available where they live.
- 18 to 45 year-olds who want a plan handed to them without a lot of setup friction. Onboarding is built to take under a minute on smart defaults, with room to go back and refine.
- People who respond better to simple visual progress, a completion ring, a weight trend line, than to a dense analytics dashboard.

Who this isn't for yet: anyone with medical dietary requirements (diabetes, kidney conditions, eating disorder recovery). Onboarding says plainly that this app doesn't substitute for professional medical or dietetic advice. It's also not for anyone who wants restaurant ordering or barcode-level food logging, since neither is in this version.

## How it works (MVP)

Onboarding runs six screens: goal, weight/height/age, activity level, dietary restrictions, budget tier, region. Smart defaults throughout, nothing mandatory that doesn't need to be. It ends with a "here's your plan" summary before asking for an account, so people see something real before being asked to sign up.

The workout plan is a weekly split generated from your goal and what equipment you actually have, with sets, reps, and short instructions. Marking a session complete feeds the weekly progress ring.

Meal suggestions come as daily cards, built from a calorie and macro target (standard Mifflin-St Jeor BMR/TDEE math), your dietary restrictions, your budget tier, and a curated set of regionally common ingredients and cuisines. Any meal can be swapped for an alternative in one tap, and every number is labeled as an estimate because that's what it is.

Progress tracking is a weight log running from your starting weight to your goal, a simple trend line, and an optional daily check-in. Reminders for workouts, meal logging, and weigh-ins can each be turned on or off individually.

Accounts are optional at first. Guest mode caches locally, with a non-blocking prompt to save progress by creating a Supabase-backed account. Account deletion is fully handled in-app.

## What's deliberately out of scope for v1

Live restaurant menu and price lookup isn't in here, because no reliable API for that exists at a usable cost. Real-time grocery pricing is out for the same reason, it's fragmented and retailer-owned with no unified way to access it. There's no web app and no dynamic light/dark theming yet, both deferred so the mobile app can get built well instead of several things getting built shallowly. Barcode scanning, wearable sync, social features, and restaurant ordering are also out.

None of this is abandoned, it's backlog. The natural v2 roadmap once the core loop (plan, do, track, adjust) is validated with real users.

## Technologies and tools used

The mobile app is React Native with Expo, TypeScript, one codebase covering iOS and Android. Picked for the fastest path from a generated scaffold to something running on a real device, and for stronger library support for the card and progress-ring heavy interface this needed (Reanimated, react-native-svg).

The backend is Supabase: Postgres, built-in authentication for email/password and OAuth, row-level security scoped per user. Notifications run through expo-notifications, with an explanation screen shown before the native OS permission prompt fires.

Testing uses Jest for unit tests covering the nutrition engine math, macro-sum checks, and auth service logic, plus `@electric-sql/pglite`, an embedded real Postgres engine, for checking database cascade behavior locally before touching a live Supabase project.

Design runs off a locked token system, one color palette, an 8px spacing grid, 16px corner radius, a single type scale, instead of styling each screen on its own. Google Antigravity handled scaffolding and implementation, working from a written build brief rather than a single loose prompt. Version control is Git locally, backed up to GitHub, with Vercel-style hosting in mind for any future web companion.

## Important decisions made

React Native and Expo won out over Flutter for a faster iteration loop on a design-first prototype, and because there's a real path to React Native Web if a companion web app gets built later.

The color system went through a real revision. The palette locks in `#2D6A4F` as primary, `#F5ECD2` as the background, and a neutral grey ramp built from `#212121`, with amber and red kept strictly for status states, not decoration. No gradients. An earlier, brighter green was considered and dropped in favor of something calmer, closer to a premium register than a high-energy one.

Scope got cut hard toward mobile-first, one theme. The original brief asked for mobile, web, and dynamic light/dark mode all in v1. That got cut deliberately, better to ship one platform and one theme well than several things half-done. Web and theming are v2.

"Local" got redefined honestly. Rather than chase live restaurant or grocery data, which doesn't exist as an affordable API at any usable scale, "local" became curated regional ingredient and cuisine templates mapped from the user's country or locale, with a defined fallback for countries that don't map cleanly and an in-app note that this is an approximation people can override.

Accounts became required rather than optional, for the sake of not losing anyone's data. The original plan considered local-only storage for speed. That got rejected once it was clear that losing a user's weight history on reinstall would undermine the exact retention this app is trying to build. The trade-off was more scope, auth screens, an account deletion flow, privacy policy obligations, in exchange for not quietly breaking user trust.

The nutrition engine got a hard safety floor. It doesn't apply a flat calorie deficit or surplus blindly, it clamps the output to a safe daily minimum (citing Harvard Health Publishing) and tells the user when that adjustment kicks in, instead of silently handing over a number that could be unsafe for someone smaller or less active.

In-app account deletion got built before launch, not bolted on after. Apple's App Store Review Guideline 5.1.1(v) requires it for any app with account creation, and it was verified against a real Postgres cascade test rather than assumed to work because the code looked right.

## Challenges encountered and how they were solved

The first build attempt used Gemini for brainstorming and scaffolding, and it didn't produce anything close to the intended product. The gap between plan and output was structural, not cosmetic, enough that restarting was faster than trying to fix it in place. The project restarted with Claude handling planning, feasibility review, and prompt engineering, then handed off to Google Antigravity for the actual build. The real lesson wasn't which tool is better. It was that handing a raw idea to any AI model without a feasibility pass and a written brief first produces an unreliable result, and that catching a mismatched tool or approach early is a lot cheaper than trying to force a build that's already gone sideways.

The original idea, live local restaurant and grocery price matching, turned out not to be technically feasible at MVP scale. Checking available APIs (Google Places, restaurant menu data providers) confirmed there's no clean, affordable source of live menu-level pricing and nutrition tied to GPS location. Rather than build toward a promise the data couldn't back up, the feature became curated regional ingredient templates plus a self-selected budget tier, a scoped-down version that's honest about what it actually knows.

The original scope was too big for a real MVP. Mobile and web, dynamic theming, live location data, a full AI meal and workout engine, all planned for v1 at once. That got cut down to one mobile platform, one theme, and clearly labeled estimates instead of live data, with everything else logged as backlog instead of quietly dropped.

AI-reported "verification" repeatedly turned out not to be verification. Several implementation plans described tests, contrast ratios, and database behavior as confirmed when the actual evidence behind the claim was a mocked test, a description of expected behavior, or an unchecked number. Each one got caught by asking for literal evidence instead: real terminal output, real code, a real database query result against a real or real-equivalent system. That became a standing rule for the rest of the build. Pure logic, math, formatting, is provable by unit tests alone. Anything touching a real external system, a database, an auth provider, a payment flow, isn't verified until it's been run against that real system at least once.

A flat calorie deficit could have produced an unsafe target for some users. Caught on review, not in the original plan: applying the same fixed deficit regardless of a user's calculated TDEE could push a smaller or less active person below a safe daily minimum. Fixed with a clamped safety floor, a cited source, and a message that tells the user when the clamp kicks in.

In-app account deletion was missing from the first backend plan, which would have meant a guaranteed App Store rejection. Caught before build, not after a failed submission.

## Opportunities

The real wedge isn't "AI meal planning" on its own, that category is saturated already (MyFitnessPal, Noom, FoodiePrep, Mealime, Eat This Much, Nutrola, and others all claim some version of AI-driven, budget-aware suggestions). The opportunity is doing it well for the regions and budget tiers that most US-centric apps treat as an afterthought.

There's also a case for approach-oriented guidance over pure tracking. Research on dietary adherence tends to favor apps that tell people what to eat next over apps that just log and judge what they already ate, which is the posture this app takes by design.

A well-curated, growing library of region-specific meal templates is genuinely harder for a generic global competitor to copy cheaply than a feature is, since it's editorial and data work rather than something a model prompt alone can replicate.

Being upfront about limits is itself a kind of differentiation. Claiming clear budget tiers and honestly labeled estimates is a smaller promise than claiming to know someone's exact local prices, but it's a promise that can actually be kept.

Once the core loop has real users and real retention data behind it, restaurant discovery (labeled honestly as nearby options, not an exact match), wearable integration, and a web companion all become reasonable next investments instead of day-one guesses.

## Status

In active build. The core engines (nutrition, workout, meal generation), the database schema, authentication, and account deletion are implemented and independently verified. UI screens and end-to-end device testing are in progress. A privacy policy and one more verification pass against a live Supabase environment are still open before any App Store submission.
