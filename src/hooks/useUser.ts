import { useAppSelector } from "@/lib/redux/store";

export const useUser = () => {
  const icpBalance = useAppSelector((state) => state.user.icpBalance);
  const ckbtcAddress = useAppSelector((state) => state.user.ckbtcAddress);
  const ckbtcBalance = useAppSelector((state) => state.user.ckbtcBalance);
  const principal = useAppSelector((state) => state.user.principal);
  const name = useAppSelector((state) => state.user.name)

   return {
    name,
    principal,
    icpBalance,
    ckbtcAddress,
    ckbtcBalance
   }
}
