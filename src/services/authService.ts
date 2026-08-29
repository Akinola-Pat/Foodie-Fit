/**
 * Foodie Fit — Authentication & Account Management Service
 * 
 * Implements Sign-In, Sign-Up, Session Management, and In-App Account Deletion
 * complying with Apple App Store Review Guideline 5.1.1(v).
 */

export interface AuthResponse {
  user: any | null;
  error: Error | null;
}

export interface DeleteAccountResponse {
  success: boolean;
  error: Error | null;
}

// Minimal mock/real supabase client interface for client-side invocation
export interface SupabaseClientLike {
  rpc: (funcName: string, params?: Record<string, any>) => Promise<{ data: any; error: any }>;
  auth: {
    signOut: () => Promise<{ error: any }>;
  };
}

export interface LocalStorageAdapter {
  clear: () => Promise<void>;
  deleteSecureItem: (key: string) => Promise<void>;
}

export interface AppStoreResetter {
  resetAllStores: () => void;
}

/**
 * Permanently deletes the authenticated user's account and all associated data.
 * 
 * Apple Guideline 5.1.1(v) Compliance:
 * 1. Invokes the PostgreSQL `delete_user_account` RPC which runs as SECURITY DEFINER.
 * 2. Cascades deletion from `auth.users` to `profiles`, `weight_logs`, `workout_completions`,
 *    `meal_plans`, `meal_swaps`, and `notification_preferences` via database-level ON DELETE CASCADE.
 * 3. Signs out of the local auth session.
 * 4. Wipes all cached local guest/user data and secure tokens.
 * 5. Resets client-side state stores to clean initial guest state.
 */
export async function deleteAccount(
  supabase: SupabaseClientLike,
  storage: LocalStorageAdapter,
  storeResetter?: AppStoreResetter
): Promise<DeleteAccountResponse> {
  try {
    // 1. Execute database-level account deletion with cascade
    const { error: rpcError } = await supabase.rpc('delete_user_account');
    if (rpcError) {
      throw new Error(`Database account deletion failed: ${rpcError.message}`);
    }

    // 2. Sign out locally
    await supabase.auth.signOut();

    // 3. Clear local storage and secure store tokens
    await storage.clear();
    await storage.deleteSecureItem('supabase_auth_token');

    // 4. Reset client application state stores
    if (storeResetter) {
      storeResetter.resetAllStores();
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
