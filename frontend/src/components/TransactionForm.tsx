import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Bitcoin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Recipient } from "@/types/Recipient";

type TransactionFormProps = {
  description: string;
  setDescription: (description: string) => void;
  btcAmount: string;
  setBtcAmount: (btcAmount: string) => void;
  recipients: Recipient[];
  handleAddRecipient: () => void;
  handleRemoveRecipient: (idx: number) => void;
  handleRecipientChange: (
    idx: number,
    field: keyof Recipient,
    value: string | number
  ) => void;
};

const TransactionForm = ({
  description,
  setDescription,
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
            <Typography variant="h4">Escrow setup</Typography>
            <Bitcoin color="#F97415" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">
              Description{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Freelance project payment"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">BTC amount</label>
              <span className="text-xs text-muted-foreground">
                {/* {isBalanceLoading ? 'Loading...' : btcBalance !== null ? `${btcBalance} BTC` : '—'} */}
              </span>
            </div>
            <Input
              className="focus-visible:ring-yellow-400 focus-visible:border-yellow-400"
              type="number"
              min="0"
              step="0.00000001"
              value={btcAmount}
              onChange={(e) => setBtcAmount(e.target.value)}
              placeholder="0.00000000"
            />
          </div>
          <hr className="my-2" />
          <div className="flex items-center justify-between mt-6">
            <Typography variant="base">
              Recipients & split allocation
            </Typography>
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
          <div className="container">
            <div className="space-y-4">
              <AnimatePresence>
                {recipients.map((r, idx) => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, x: 50 }} // swipe in from right
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }} // swipe out to left
                    transition={{ duration: 0.25 }}
                    className="bg-muted rounded-lg relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Recipient {idx + 1}</span>
                      {recipients.length > 1 && (
                        <button
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={() => handleRemoveRecipient(idx)}
                          type="button"
                          aria-label="Remove recipient"
                        ></button>
                      )}
                    </div>

                    <div className="grid grid-cols-8 gap-4">
                      <div className="col-span-6">
                        <label className="text-xs font-medium">
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
                          <label className="text-xs font-medium">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;
