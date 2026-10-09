import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isVerified: boolean;
  verificationTimestamp: number | null;
}

interface RegistrationData {
  username: string;
  leagueId: string;
  teamId: string;
}

interface UserState {
  // Wallet
  walletState: WalletState;
  setWalletAddress: (address: string | null) => void;
  setWalletVerified: (verified: boolean) => void;
  logout: () => void;

  // Onboarding/Registration
  isNewUser: boolean;
  setIsNewUser: (isNew: boolean) => void;
  registrationData: RegistrationData | null;
  setRegistrationData: (data: RegistrationData | null) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
}

export const DEFAULT_SIMULATED_ADDRESS = '0x65bc46df99bc2385128c8a67752d7cd3922de740';

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Wallet
      walletState: {
        address: DEFAULT_SIMULATED_ADDRESS,
        isConnected: true,
        isVerified: true,
        verificationTimestamp: Date.now(),
      },
      setWalletAddress: (address) =>
        set((state) => {
          const target = address || DEFAULT_SIMULATED_ADDRESS;
          return {
            walletState: {
              ...state.walletState,
              address: target,
              isConnected: true,
              isVerified: true,
              verificationTimestamp: Date.now(),
            },
          };
        }),
      setWalletVerified: (verified) =>
        set((state) => ({
          walletState: {
            ...state.walletState,
            isVerified: verified,
            verificationTimestamp: verified ? Date.now() : null,
          },
        })),
      logout: () =>
        set({
          walletState: {
            address: DEFAULT_SIMULATED_ADDRESS,
            isConnected: true,
            isVerified: true,
            verificationTimestamp: Date.now(),
          },
          isNewUser: false,
          registrationData: null,
          onboardingComplete: true,
        }),

      // Onboarding
      isNewUser: false,
      setIsNewUser: (isNew) => set({ isNewUser: isNew }),
      registrationData: null,
      setRegistrationData: (data) => set({ registrationData: data }),
      onboardingComplete: true,
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
    }),
    {
      name: 'kickoff-user-storage',
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        isNewUser: state.isNewUser,
        registrationData: state.registrationData,
        walletState: {
          address: state.walletState.address,
          isConnected: state.walletState.isConnected,
          isVerified: state.walletState.isVerified,
        },
      }),
    }
  )
);
