import { supabase } from '@/api/supabaseClient';

/**
 * Return the current user from the LOCALLY STORED session.
 *
 * Why not `supabase.auth.getUser()`: that performs a NETWORK round trip to the
 * Auth server on every call, and each call is a chance to trigger a token
 * refresh. `api/programs.js` used it 8 times, so a single page load fired
 * several of them at once (fetchSavedSearches on mount, plus whichever data
 * functions ran alongside). Two refreshes then raced, and because Supabase
 * ROTATES refresh tokens on use, the loser presented an already-used token.
 * The client surfaced:
 *
 *     AuthApiError: Invalid Refresh Token: Already Used
 *
 * and cleared the session, bouncing the user to /Login. Observed live in the
 * browser console on matchamd.com.
 *
 * `getSession()` reads from local storage and only refreshes when the stored
 * token is actually expired, with supabase-js serialising that refresh
 * internally. For "who is this request for", the local session is sufficient:
 * RLS enforces authorization server-side, and a genuinely invalid token is
 * rejected by the request itself.
 *
 * Use this everywhere a call site only needs `user.id`.
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[getCurrentUser] session read failed:', error.message);
    return null;
  }
  return data?.session?.user ?? null;
}

export default getCurrentUser;
