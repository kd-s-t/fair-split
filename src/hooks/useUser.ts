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

  // Admin principal from the canister
  const ADMIN_PRINCIPAL = "ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe";

  const isAdmin = useCallback(() => {
    if (!principal) return false;
    return principal === ADMIN_PRINCIPAL;
  }, [principal]);

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
