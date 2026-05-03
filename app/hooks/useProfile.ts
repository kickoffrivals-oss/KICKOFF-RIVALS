import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from '../stores/userStore';
import type { UserStats } from '../types';
import { INITIAL_QUESTS } from '../constants';

const API_URL = "";

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { 
    walletState, 
    registrationData, 
    setRegistrationData, 
    setIsNewUser 
  } = useUserStore();
  
  const address = walletState.address;

  const query = useQuery<UserStats & { success: boolean; isNew?: boolean }>({
    queryKey: ['profile', address],
    queryFn: async () => {
      if (!address) throw new Error("No wallet connected");

      const params = new URLSearchParams({
        walletAddress: address.toLowerCase(),
      });

      // Include registration data if available to create/update user
      if (registrationData) {
        if (registrationData.username) params.set("username", registrationData.username);
        if (registrationData.leagueId) params.set("leagueId", registrationData.leagueId);
        if (registrationData.teamId) params.set("teamId", registrationData.teamId);
      }

      console.log("[useProfile] Fetching with params:", params.toString());

      const res = await fetch(`${API_URL}/api/user/profile?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        // If the server tells us it's a new user, update the store
        if (data.isNew) {
          setIsNewUser(true);
          setRegistrationData(null); // Clear pending registration
        } else {
          setIsNewUser(false);
        }

        // Robust quest merging logic
        if (data.quests && Array.isArray(data.quests)) {
          data.quests = INITIAL_QUESTS.map((baseQuest) => {
            const dbQuest = data.quests.find((dq: any) => String(dq.questId || dq.id) === String(baseQuest.id));
            
            return {
              ...baseQuest,
              id: String(baseQuest.id),
              progress: dbQuest?.progress ?? 0,
              completed: dbQuest?.completed ?? false,
              status: (() => {
                if (dbQuest?.completed) return "CLAIMED";
                if (dbQuest?.status === "VERIFYING" && dbQuest.verifiedAt) {
                  const readyTime = new Date(dbQuest.verifiedAt).getTime();
                  if (Date.now() >= readyTime) return "CLAIMABLE";
                  return "VERIFYING";
                }
                return dbQuest?.status || "LIVE";
              })(),
              verifiedAt: dbQuest?.verifiedAt,
            };
          });
        }
      }

      return data;
    },
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["profile", address] });
  }, [queryClient, address]);

  const profile = query.data;
  const isError = query.isError || (profile && profile.success === false);

  return {
    ...query,
    profile,
    isError,
    refresh,
  };
};
