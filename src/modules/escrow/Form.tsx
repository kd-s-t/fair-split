"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Bitcoin, Trash2, Sparkles, Upload, Info, Plus, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import z from "zod";
import { escrowFormSchema } from "@/validation/escrow";
import { useUser } from "@/hooks/useUser";


type FormData = z.infer<typeof escrowFormSchema>;

interface FormProps {
  form: UseFormReturn<FormData>;
}

const Form = ({ form }: FormProps) => {
  const { getValues, setValue, control, watch, register, formState: { errors } } = form;
  const { ckbtcBalance } = useUser();

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "recipients"
  });

  const watchedRecipients = watch("recipients");
  const totalAllocation = watchedRecipients?.reduce((sum, recipient) => sum + (recipient.percentage || 0), 0) || 0;

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
    setValue("title", randomTitle);
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
          setValue("title", jsonData.title);
        }

        // Set the amount if provided
        if (jsonData.amount !== undefined) {
          setValue("btcAmount", jsonData.amount.toString());
        }

        // Create new recipients array from JSON data
        const newRecipients = jsonData.recipients.map((principal: string, index: number) => ({
          id: `recipient-${index + 1}`,
          name: "",
          principal,
          percentage: Math.floor(100 / jsonData.recipients.length)
        }));

        // Handle remainder for equal distribution
        const totalAssigned = newRecipients.reduce((sum: number, recipient: { percentage: number }) => sum + recipient.percentage, 0);
        const remainder = 100 - totalAssigned;
        if (remainder > 0 && newRecipients.length > 0) {
          newRecipients[0].percentage += remainder;
        }

        // Replace existing recipients with new ones
        setValue("recipients", newRecipients);

        toast.success(`Successfully imported ${newRecipients.length} recipients`);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        toast.error("Invalid JSON file");
      }
    };

    reader.readAsText(file);
  };

  const addRecipient = () => {
    const newId = `recipient-${fields.length + 1}`;
    append({
      id: newId,
      name: "",
      principal: "",
      percentage: 0
    });
  };

  const removeRecipient = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      // Redistribute percentages
      const remainingRecipients = getValues("recipients").filter((_, i) => i !== index);
      if (remainingRecipients.length > 0) {
        const equalPercentage = Math.floor(100 / remainingRecipients.length);
        const remainder = 100 - (equalPercentage * remainingRecipients.length);

        const updatedRecipients = remainingRecipients.map((recipient, i) => ({
          ...recipient,
          name: recipient.name || "",
          percentage: equalPercentage + (i === 0 ? remainder : 0)
        }));

        setValue("recipients", updatedRecipients);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-none">
      {/* Escrow Setup Section */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-[#F97A15]" />
            <Typography variant="large" className="text-white">Escrow setup</Typography>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#A1A1A1]">Title</label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateTitle}
                  className="text-[#FEB64D] hover:text-[#FEB64D] hover:bg-[#FEB64D]/10 p-1 h-auto"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Generate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById('json-upload')?.click()}
                  className="text-[#FEB64D] hover:text-[#FEB64D] hover:bg-[#FEB64D]/10 p-1 h-auto"
                >
                  <Upload className="w-4 h-4 mr-1" />
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
              {...register("title")}
              placeholder="e.g., Freelance project payment"
              className="bg-[#3D3D3D] border-[#5A5E5E] text-white placeholder:text-[#A1A1A1]"
            />
            {errors.title && (
              <div className="text-red-400 text-sm">{errors.title.message}</div>
            )}
          </div>

          {/* BTC Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#A1A1A1]">BTC amount</label>
              <span className="text-white text-sm">
                {ckbtcBalance ? `${(Number(ckbtcBalance) / 1e8).toFixed(8)} BTC` : "0.00000000 BTC"}
              </span>
            </div>
            <Input
              {...register("btcAmount")}
              type="number"
              step="0.00000001"
              placeholder="0.00000000"
              className="bg-[#3D3D3D] border-[#5A5E5E] text-white placeholder:text-[#A1A1A1]"
            />
            {errors.btcAmount && (
              <div className="text-red-400 text-sm">{errors.btcAmount.message}</div>
            )}
          </div>
        </CardContent>
        <hr className="text-[#424444] mt-6 mb-4" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Typography variant="large" className="text-white">Recipients & split allocation</Typography>
            <Button
              variant="ghost"
              size="sm"
              onClick={addRecipient}
              className="text-white hover:bg-[#303333] gap-2"
            >
              <Plus className="w-4 h-4" />
              Add recipient
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#1F374F] border border-[#0077FF] rounded-lg p-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#71B5FF] mt-0.5 flex-shrink-0" />
              <div>
                <Typography variant="base" className="text-[#71B5FF] font-medium mb-1">
                  Recipient ID required
                </Typography>
                <Typography variant="small" className="text-white">
                  Enter recipient&apos;s ICP Principal ID. SplitSafe will route BTC payouts automatically.
                </Typography>
              </div>
            </div>
          </div>

          {/* Recipients List */}
          <div className="space-y-3">
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#2B2B2B] border border-[#424242] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="base" className="text-white font-medium">
                      Recipient {index + 1}
                    </Typography>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecipient(index)}
                        className="w-8 h-8 !p-0 bg-[#353535] hover:bg-[#404040] !rounded-full"
                      >
                        <Trash2 className="w-4 h-4 text-[#F64B4B]" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 space-y-2">
                      <label className="text-[#A1A1A1] text-sm">ICP address</label>
                      <Input
                        {...register(`recipients.${index}.principal`)}
                        placeholder="ICP Principal ID"
                        className="bg-[#3D3D3D] border-[#5A5E5E] text-white placeholder:text-[#A1A1A1]"
                      />
                      {errors.recipients?.[index]?.principal && (
                        <div className="text-red-400 text-sm">
                          {errors.recipients[index]?.principal?.message}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[#A1A1A1] text-sm">Percentage</label>
                      <div className="relative">
                        <Input
                          {...register(`recipients.${index}.percentage`)}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          className="bg-[#3D3D3D] border-[#5A5E5E] text-white placeholder:text-[#A1A1A1] pr-8"
                        />
                        <ChevronsUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A1A1A1]" />
                      </div>
                      {errors.recipients?.[index]?.percentage && (
                        <div className="text-red-400 text-sm">
                          {errors.recipients[index]?.percentage?.message}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Total Allocation */}
          <div className="flex justify-between items-center pt-3 border-t border-[#424242]">
            <Typography variant="muted" className="text-[#9F9F9F]">Total allocation:</Typography>
            <Typography
              variant="small"
              className={`font-medium ${totalAllocation === 100 ? 'text-[#FEB64D]' : 'text-red-400'}`}
            >
              {totalAllocation}%
            </Typography>
          </div>
          {totalAllocation !== 100 && totalAllocation > 0 && (
            <div className="text-red-400 text-sm">
              Total allocation must equal 100%
            </div>
          )}
          {errors.recipients && (
            <div className="text-red-400 text-sm">
              {errors.recipients.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Form;
