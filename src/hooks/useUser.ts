import { useAppSelector } from "@/lib/redux/store";
import { useCallback } from "react";

export const useUser = () => {
  const icpBalance = useAppSelector((state) => state.user.icpBalance);
  const ckbtcAddress = useAppSelector((state) => state.user.ckbtcAddress);
  const ckbtcBalance = useAppSelector((state) => state.user.ckbtcBalance);
  const seiAddress = useAppSelector((state) => state.user.seiAddress);
  const seiBalance = useAppSelector((state) => state.user.seiBalance);
  const principal = useAppSelector((state) => state.user.principal);
  const name = useAppSelector((state) => state.user.name)

  // Admin principal from environment variable
  const ADMIN_PRINCIPAL = process.env.NEXT_PUBLIC_ADMIN_PRINCIPAL;

  const isAdmin = useCallback(() => {
    if (!principal || !ADMIN_PRINCIPAL) return false;
    return principal === ADMIN_PRINCIPAL;
  }, [principal, ADMIN_PRINCIPAL]);

   return {
    name,
    principal,
    icpBalance,
    ckbtcAddress,
    ckbtcBalance,
    seiAddress,
    seiBalance,
    isAdmin: isAdmin()
   }
}
