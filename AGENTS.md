# Repository agent guidance

Use this repository with a focused custom agent for app stability, QA, mobile polish, and Google Play release work.

## Preferred agent role
Prefer the custom agent defined in [.agent.md](.agent.md) for tasks involving:
- debugging broken behavior
- testing features and finding regressions
- improving UX and mobile polish
- debugging Supabase or Stripe issues
- preparing Android builds and Google Play release artifacts

## Working expectations
- Investigate root cause before changing code.
- Prefer small, targeted fixes.
- Verify with the relevant checks before claiming success.
- Call out what remains unverified when a full validation is not possible.

## Relevant commands
- npm run lint
- npm run test
- npm run build
- npm run cap:build:android
