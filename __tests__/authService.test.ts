import { deleteAccount, SupabaseClientLike, LocalStorageAdapter, AppStoreResetter } from '../src/services/authService';

describe('Foodie Fit Auth Service — In-App Account Deletion (Apple 5.1.1(v))', () => {
  let mockSupabase: SupabaseClientLike;
  let mockStorage: LocalStorageAdapter;
  let mockResetter: AppStoreResetter;

  beforeEach(() => {
    mockSupabase = {
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
    };

    mockStorage = {
      clear: jest.fn().mockResolvedValue(undefined),
      deleteSecureItem: jest.fn().mockResolvedValue(undefined),
    };

    mockResetter = {
      resetAllStores: jest.fn(),
    };
  });

  it('successfully invokes delete_user_account RPC, signs out, clears storage, and resets stores', async () => {
    const result = await deleteAccount(mockSupabase, mockStorage, mockResetter);

    expect(result.success).toBe(true);
    expect(result.error).toBeNull();

    // Assert RPC call to delete_user_account (which executes database-level ON DELETE CASCADE)
    expect(mockSupabase.rpc).toHaveBeenCalledWith('delete_user_account');
    
    // Assert sign out
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();

    // Assert local storage and secure tokens wiped
    expect(mockStorage.clear).toHaveBeenCalled();
    expect(mockStorage.deleteSecureItem).toHaveBeenCalledWith('supabase_auth_token');

    // Assert store reset
    expect(mockResetter.resetAllStores).toHaveBeenCalled();
  });

  it('returns error if the Supabase RPC fails without clearing local state prematurely', async () => {
    mockSupabase.rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
    });

    const result = await deleteAccount(mockSupabase, mockStorage, mockResetter);

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Database account deletion failed: Database connection failed');
    expect(mockStorage.clear).not.toHaveBeenCalled();
    expect(mockResetter.resetAllStores).not.toHaveBeenCalled();
  });
});
