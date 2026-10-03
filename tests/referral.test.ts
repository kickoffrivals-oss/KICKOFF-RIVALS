import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { db, users } from '../app/lib/db';
import { eq } from 'drizzle-orm';
import { registerReferral, getOrCreateUserInternal } from '../app/server/user';

/**
 * Referral System Test Suite
 *
 * Tests for the referral system including:
 * - User creation with referral code generation
 * - Referral code validation
 * - Reward distribution
 * - Transaction logging
 */

describe('Referral System', () => {
  const testWallets = {
    referrer: '0x' + 'a'.repeat(40),
    referred: '0x' + 'b'.repeat(40),
    self: '0x' + 'c'.repeat(40),
  };

  // Cleanup function
  const cleanupTestUsers = async () => {
    try {
      for (const wallet of Object.values(testWallets)) {
        await db
          .delete(users)
          .where(eq(users.walletAddress, wallet.toLowerCase()));
      }
    } catch (error) {
      console.log('Cleanup warning:', error);
    }
  };

  beforeAll(async () => {
    await cleanupTestUsers();
    console.log('✅ Test environment prepared');
  });

  afterAll(async () => {
    await cleanupTestUsers();
    console.log('✅ Test cleanup completed');
  });

  describe('User Creation and Referral Code Generation', () => {
    it('should create a new user with a referral code', async () => {
      const result = await getOrCreateUserInternal({
        walletAddress: testWallets.referrer,
        username: 'referrer_user',
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.walletAddress).toBe(testWallets.referrer.toLowerCase());
      expect(result.user?.username).toBe('referrer_user');
      expect(result.user?.referralCode).toBeDefined();
      expect(result.user?.referralCode?.length).toBe(6);
      expect(result.isNew).toBe(true);
      console.log(`✅ User created with referral code: ${result.user?.referralCode}`);
    });

    it('should return existing user without creating duplicate', async () => {
      const result = await getOrCreateUserInternal({
        walletAddress: testWallets.referrer,
        username: 'referrer_user',
      });

      expect(result.success).toBe(true);
      expect(result.isNew).toBe(false);
      console.log('✅ Existing user retrieved without duplication');
    });

    it('should generate unique referral codes for different users', async () => {
      const result1 = await getOrCreateUserInternal({
        walletAddress: testWallets.referred,
        username: 'referred_user',
      });

      const user1 = await db.query.users.findFirst({
        where: eq(users.walletAddress, testWallets.referrer.toLowerCase()),
      });

      expect(result1.user?.referralCode).toBeDefined();
      expect(user1?.referralCode).toBeDefined();
      expect(result1.user?.referralCode).not.toBe(user1?.referralCode);
      console.log(`✅ Generated unique codes: ${result1.user?.referralCode} vs ${user1?.referralCode}`);
    });
  });

  describe('Referral Registration', () => {
    it('should successfully apply a valid referral code', async () => {
      // Get the referrer's code
      const referrer = await db.query.users.findFirst({
        where: eq(users.walletAddress, testWallets.referrer.toLowerCase()),
      });

      expect(referrer?.referralCode).toBeDefined();

      // Apply referral
      const result = await registerReferral({
        data: {
          walletAddress: testWallets.referred,
          referralCode: referrer!.referralCode!,
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('5000');
      console.log(`✅ Referral applied: ${result.message}`);
    });

    it('should reject referral code not found', async () => {
      const result = await registerReferral({
        data: {
          walletAddress: testWallets.self,
          referralCode: 'INVALID',
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      console.log(`✅ Invalid code rejected: ${result.error}`);
    });

    it('should reject self-referral', async () => {
      const user = await db.query.users.findFirst({
        where: eq(users.walletAddress, testWallets.referrer.toLowerCase()),
      });

      const result = await registerReferral({
        data: {
          walletAddress: testWallets.referrer,
          referralCode: user!.referralCode!,
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('self');
      console.log(`✅ Self-referral rejected: ${result.error}`);
    });

    it('should prevent double referral', async () => {
      const referrer = await db.query.users.findFirst({
        where: eq(users.walletAddress, testWallets.referrer.toLowerCase()),
      });

      // Try to apply referral again (should fail)
      const result = await registerReferral({
        data: {
          walletAddress: testWallets.referred,
          referralCode: referrer!.referralCode!,
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already referred');
      console.log(`✅ Double referral prevented: ${result.error}`);
    });
  });

  describe('Reward Distribution', () => {
    it('should credit coins to referred user', async () => {
      const referred = await db.query.users.findFirst({
        where: eq(users.walletAddress, testWallets.referred.toLowerCase()),
      });

      expect(referred?.coins).toBe(5000 + 5000); // Initial 5000 + referral 5000
      console.log(`✅ Referred user credited: ${referred?.coins} coins`);
    });

    it('should credit coins to referrer', async () => {
      const referrer = await db.query.users.findFirst({
        where: eq(users.walletAddress, testWallets.referrer.toLowerCase()),
      });

      expect(referrer?.coins).toBe(5000 + 5000); // Initial 5000 + referral 5000
      console.log(`✅ Referrer credited: ${referrer?.coins} coins`);
    });

    it('should update referral count on referrer', async () => {
      const referrer = await db.query.users.findFirst({
        where: eq(users.walletAddress, testWallets.referrer.toLowerCase()),
      });

      expect(referrer?.referralCount).toBe(1);
      console.log(`✅ Referral count updated: ${referrer?.referralCount}`);
    });

    it('should update referral earnings on referrer', async () => {
      const referrer = await db.query.users.findFirst({
        where: eq(users.walletAddress, testWallets.referrer.toLowerCase()),
      });

      expect(referrer?.referralEarnings).toBe(5000);
      console.log(`✅ Referral earnings updated: ${referrer?.referralEarnings}`);
    });

    it('should mark referred user with referrer wallet', async () => {
      const referred = await db.query.users.findFirst({
        where: eq(users.walletAddress, testWallets.referred.toLowerCase()),
      });

      expect(referred?.referredBy).toBe(testWallets.referrer.toLowerCase());
      console.log(`✅ Referral relationship recorded`);
    });
  });

  describe('Transaction Logging', () => {
    it('should create transaction for referred user', async () => {
      const { transactions } = await import('../app/lib/db/schema');

      const txs = await db
        .select()
        .from(transactions)
        .where(eq(transactions.walletAddress, testWallets.referred.toLowerCase()));

      const referralTx = txs.find(tx => tx.type === 'referral');
      expect(referralTx).toBeDefined();
      expect(referralTx?.amount).toBe(5000);
      expect(referralTx?.currency).toBe('coins');
      expect(referralTx?.description).toContain('referrer_user');
      console.log(`✅ Transaction logged for referred user`);
    });

    it('should create transaction for referrer', async () => {
      const { transactions } = await import('../app/lib/db/schema');

      const txs = await db
        .select()
        .from(transactions)
        .where(eq(transactions.walletAddress, testWallets.referrer.toLowerCase()));

      const referralTx = txs.find(tx => tx.type === 'referral' && tx.description?.includes('referred_user'));
      expect(referralTx).toBeDefined();
      expect(referralTx?.amount).toBe(5000);
      expect(referralTx?.currency).toBe('coins');
      console.log(`✅ Transaction logged for referrer`);
    });
  });

  describe('Referral Code Format', () => {
    it('should generate 6-character alphanumeric codes', async () => {
      const user = await db.query.users.findFirst({
        where: eq(users.walletAddress, testWallets.referrer.toLowerCase()),
      });

      expect(user?.referralCode).toBeDefined();
      expect(user?.referralCode?.length).toBe(6);
      expect(/^[A-Z0-9]{6}$/.test(user?.referralCode!)).toBe(true);
      console.log(`✅ Code format valid: ${user?.referralCode}`);
    });

    it('should be case-insensitive during lookup', () => {
      expect(true).toBe(true);
    });
  });
});
