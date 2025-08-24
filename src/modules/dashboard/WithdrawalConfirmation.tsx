import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog-new';
import { Typography } from '@/components/ui/typography';
import { RootState } from '@/lib/redux/store';
import { setWithdrawConfirmClose } from '@/lib/redux/withdrawSlice';
import { CircleCheckBig } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
export default function WithdrawalConfirmation() {
  const dispatch = useDispatch();

  const { isConfirmed, amount, destination, status } = useSelector((state: RootState) => state.withdraw);

  const handleCloseConfirmation = () => {
    dispatch(setWithdrawConfirmClose(false))
  }

  return (
    <Dialog open={isConfirmed} onOpenChange={handleCloseConfirmation}>
      <DialogContent className="!bg-[#313030] !max-w-[528px] border border-[#303333] max-h-[90vh] overflow-hidden !rounded-3xl">
        <DialogHeader>
          <DialogTitle className='flex gap-3'>
            <CircleCheckBig color='#00C287' size={14} />
            Withdrawal confirmed
          </DialogTitle>
          <DialogDescription className='text-[#BCBCBC]'>
            Your withdrawal has been processed successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 bg-[#282828] rounded-xl p-4">
          <div className='flex justify-between'>
            <Typography variant="small" className="text-[#9F9F9F]">Amount:</Typography>
            <Typography variant="small">{amount}</Typography>
          </div>
          <div className='flex justify-between'>
            <Typography variant="small" className="text-[#9F9F9F]">Destination:</Typography>
            <Typography variant="small">{destination}</Typography>
          </div>
          <div className='flex justify-between'>
            <Typography variant="small" className="text-[#9F9F9F]">Transaction hash:</Typography>
            <Typography variant="small">1a2b3c4d5e6f....4567890</Typography>
          </div>
          <div className='flex justify-between'>
            <Typography variant="small" className="text-[#9F9F9F]">Status:</Typography>
            <Typography className="capitalize" variant="small">{status}</Typography>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" className='w-full border border-[#7A7A7A]'>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
} 