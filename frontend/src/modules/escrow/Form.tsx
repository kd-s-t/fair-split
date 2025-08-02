import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Bitcoin, Trash2, Sparkles, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { TransactionFormProps } from './types';
import { toast } from "sonner";

const TransactionForm = ({
  title,
  setTitle,
  btcAmount,
  setBtcAmount,
  recipients,
  setRecipients,
  handleAddRecipient,
  handleRemoveRecipient,
  handleRecipientChange,
}: TransactionFormProps) => {
  
  const generateTitle = () => {
    const titles = [
      "Freelance Web Development Payment",
      "Design Project Milestone",
      "Consulting Services Escrow",
      "Content Creation Payment",
      "Software Development Phase 1",
      "Marketing Campaign Deposit",
      "Project Management Fee",
      "Technical Support Payment",
      "Creative Services Escrow",
      "Business Consulting Fee",
      "Product Development Payment",
      "Strategic Planning Deposit",
      "Client Project Escrow",
      "Professional Services Payment",
      "Digital Asset Transfer",
      "Business Partnership Payment",
      "Service Agreement Deposit",
      "Project Completion Payment",
      "Work Milestone Escrow",
      "Professional Fee Payment"
    ];
    
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    setTitle(randomTitle);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate the JSON structure
        if (!jsonData.recipients || !Array.isArray(jsonData.recipients)) {
          toast.error("Invalid JSON format. Expected: { recipients: string[] }");
          return;
        }

        console.log("JSON data:", jsonData); // Debug log

        // Set the title if provided
        if (jsonData.title) {
          setTitle(jsonData.title);
        }

        // Set the amount if provided
        if (jsonData.amount !== undefined) {
          setBtcAmount(jsonData.amount.toString());
        }

        // Create new recipients array from JSON data
        const newRecipients = jsonData.recipients.map((principal: string, index: number) => ({
          id: `recipient-${index + 1}`,
          principal,
          percentage: Math.floor(100 / jsonData.recipients.length)
        }));

        // Replace all recipients at once
        setRecipients(newRecipients);

        toast.success(`Loaded ${jsonData.recipients.length} recipients and amount from JSON file`);
      } catch (error) {
        console.error("JSON upload error:", error);
        toast.error("Invalid JSON file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const handlePercentageChange = (idx: number, value: string) => {
    const numValue = Number(value);
    
    // Prevent negative values
    if (numValue < 0) {
      handleRecipientChange(idx, "percentage", 0);
      toast.warning("Percentage cannot be negative");
      return;
    }
    
    // Handle empty or invalid input
    if (isNaN(numValue) || value === '') {
      handleRecipientChange(idx, "percentage", 0);
      return;
    }
    
    // Cap at 100%
    if (numValue > 100) {
      handleRecipientChange(idx, "percentage", 100);
      toast.warning("Percentage cannot exceed 100%");
      return;
    }
    
    // Calculate total percentage excluding current field
    const totalOtherPercentage = recipients.reduce((sum, recipient, index) => {
      if (index !== idx) {
        return sum + (recipient.percentage || 0);
      }
      return sum;
    }, 0);
    
    // Check if new total would exceed 100%
    if (totalOtherPercentage + numValue > 100) {
      const maxAllowed = 100 - totalOtherPercentage;
      handleRecipientChange(idx, "percentage", maxAllowed);
      toast.warning(`Maximum allowed: ${maxAllowed}% (total cannot exceed 100%)`);
      return;
    }
    
    handleRecipientChange(idx, "percentage", numValue);
  };

  const calculateTotalAllocation = () => {
    return recipients.reduce((sum, recipient) => sum + (recipient.percentage || 0), 0);
  };

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
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-[#A1A1AA]">
                Title 
              </label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateTitle}
                  className="text-[#FEB64D] hover:text-[#FEB64D] hover:bg-[#FEB64D]/10 p-0 h-auto"
                >
                  <Sparkles size={14} className="mr-1" />
                  Generate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById('json-upload')?.click()}
                  className="text-[#FEB64D] hover:text-[#FEB64D] hover:bg-[#FEB64D]/10 p-0 h-auto"
                >
                  <Upload size={14} className="mr-1" />
                  Upload JSON
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-upload"
                />
              </div>
            </div>
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
                        autoComplete="off"
                        name={`btc-address-${idx}`}
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
                          step="1"
                          value={r.percentage}
                          onChange={(e) => handlePercentageChange(idx, e.target.value)}
                          onKeyDown={(e) => {
                            // Prevent negative sign, e, and other non-numeric characters
                            if (['-', 'e', 'E'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
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
            <Typography 
              variant="small" 
              className={`${calculateTotalAllocation() === 100 ? 'text-[#FEB64D]' : 'text-red-400'}`}
            >
              {calculateTotalAllocation()}%
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;
