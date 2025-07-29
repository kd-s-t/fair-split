import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Bitcoin, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { TransactionFormProps } from './types';

const TransactionForm = ({
  title,
  setTitle,
  btcAmount,
  setBtcAmount,
  recipients,
  handleAddRecipient,
  handleRemoveRecipient,
  handleRecipientChange,
}: TransactionFormProps) => {
  return (
    <div className="w-[70%] min-w-[340px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Typography variant="large">Escrow setup</Typography>
            <Bitcoin color="#F97415" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-[#A1A1AA]">
              Title 
            </label>
            <Input
              className="mt-1 "
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Freelance project payment"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-[#A1A1AA]">
                BTC amount
              </label>
              <span className="font-normal">
                {/* {isBalanceLoading ? 'Loading...' : btcBalance !== null ? `${btcBalance} BTC` : '—'} */}
              </span>
            </div>
            <Input
              className="mt-1"
              type="number"
              min="0"
              step="0.00000001"
              value={btcAmount}
              onChange={(e) => setBtcAmount(e.target.value)}
              placeholder="0.00000000"
            />
          </div>
          <hr className="mt-6 mb-6 text-[#424444]" />
          <div className="flex items-center justify-between">
            <Typography variant="large">Recipients & split allocation</Typography>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddRecipient}
              type="button"
              className="cursor-pointer"
            >
              + Add recipient
            </Button>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {recipients.map((r, idx) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.25 }}
                  className="container bg-[#2C2C2C] rounded-lg relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Recipient {idx + 1}</span>
                    {recipients.length > 1 && (
                      <Button
                        variant="secondary"
                        onClick={() => handleRemoveRecipient(idx)}
                        type="button"
                        size="icon"
                        aria-label="Remove recipient"
                      >
                        <Trash2 size={16} color="#F64C4C" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-8 gap-4 mt-2">
                    <div className="col-span-6">
                      <label className="text-sm font-medium text-[#A1A1AA]">
                        BTC address
                      </label>
                      <Input
                        type="text"
                        value={r.principal}
                        onChange={(e) =>
                          handleRecipientChange(
                            idx,
                            "principal",
                            e.target.value
                          )
                        }
                        placeholder="BTC address"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 items-center col-span-2">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-[#A1A1AA]">
                          Percentage (%)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={r.percentage}
                          onChange={(e) =>
                            handleRecipientChange(
                              idx,
                              "percentage",
                              Number(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      {/* <div className="flex-1">
                          <label className="text-xs font-medium">Amount</label>
                          <Input
                            type="text"
                            value={
                              btcAmount && r.percentage
                                ? (Number(btcAmount) * r.percentage / 100).toFixed(8)
                                : '0.00000000'
                            }
                            readOnly
                            className="mt-1 bg-gray-900/30"
                          />
                        </div> */}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between">
            <Typography variant="muted">Total allocation:</Typography>
            <Typography variant="small" className="text-[#FEB64D]">
              100%
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;
