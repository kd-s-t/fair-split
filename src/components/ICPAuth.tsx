"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { KeyRound, LogOut } from "lucide-react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/lib/redux/store";
import type { RootState } from "@/lib/redux/store";
import { clearUser, setBtcBalance } from "@/lib/redux/userSlice";
import { Typography } from "./ui/typography";
import { useAuth } from "@/contexts/auth-context";


export default function Home() {
  const dispatch = useDispatch();
  const principal = useAppSelector((state: RootState) => state.user.principal);
  const { authClient, updatePrincipal } = useAuth();

  const login = async () => {
    if (!authClient) return;
    await authClient.login({
      identityProvider: 'https://identity.ic0.app',
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1_000_000_000),
      onSuccess: async () => {
        // Update the authentication state
        await updatePrincipal();
      },
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    indexedDB.deleteDatabase('auth-client-storage');
    dispatch(clearUser());
    dispatch(setBtcBalance(null));
  };


  return (
    <div
      className="min-h-screen flex flex-col p-4 relative justify-between"
      style={{
        background:
          "radial-gradient(91.85% 91.85% at 57.95% 22.75%, #3E3E3E 0%, #0D0D0D 100%)",
      }}
    >
      <div>
        <Image
          src="/logo-partial.svg"
          alt="SplitDApp Logo"
          width={24}
          height={24}
        />
      </div>
      <motion.div
        className="absolute top-0 right-0"
        initial={{ x: 400, y: 0, opacity: 0 }}
        animate={{ x: 130, y: -40, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <Image
          src="/bg-logo.svg"
          alt="SplitDApp Logo"
          width={800}
          height={64}
          style={{ height: "auto" }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full space-y-2 flex flex-col items-center -mt-8 z-10"
      >
        <Image
          src="/safesplit-logo.svg"
          alt="SplitDApp Logo"
          width={150}
          height={64}
          style={{ height: "auto" }}
        />
        <Typography variant="h2" className="text-center mt-6">
          Secure. Trustless. On-chain.
        </Typography>

        <Typography
          variant="large"
          className="font-medium text-center text-[#BCBCBC]"
        >
          Built for native Bitcoin escrow — no bridges, no wraps.
        </Typography>

        {principal ? (
          <>
            <p className="text-center break-all">Principal: {principal}</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={logout}
                variant="secondary"
                className="text-sm mt-4 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 animate-pulse" />
                <div className="relative flex items-center gap-2">
                  <LogOut size={14} /> 
                  <span>Logout</span>
                </div>
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="secondary"
              onClick={login}
              className="text-sm mt-4 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 animate-pulse" />
              <div className="relative flex items-center gap-2">
                <KeyRound size={14} color="#FEB64D" /> 
                <span>Login with Internet Identity</span>
              </div>
            </Button>
          </motion.div>
        )}
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 w-[450px]"
        initial={{ scale: 0.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <Image
          src="/bg-eclipse-group.svg"
          alt="SplitDApp Logo"
          width={450}
          height={64}
          style={{ height: "auto" }}
        />
      </motion.div>
      <div className="flex items-center gap-8 w-full justify-center">
        <Typography variant="muted">Terms of service</Typography>
        <Typography variant="muted">Privacy policy</Typography>
      </div>
    </div>
  );
}
