import { useAppSelector } from "@/lib/redux/store";

export const useUser = () => {
  const icpBalance = useAppSelector((state) => state.user.icpBalance);
  const ckbtcAddress = useAppSelector((state) => state.user.ckbtcAddress);
  const ckbtcBalance = useAppSelector((state) => state.user.ckbtcBalance);

   return {
    icpBalance,
    ckbtcAddress,
    ckbtcBalance
   }
}
