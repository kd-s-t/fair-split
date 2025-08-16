"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Bitcoin, Trash2, Sparkles, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import z from "zod";
import { escrowFormSchema } from "@/validation/escrow";

type FormData = z.infer<typeof escrowFormSchema>;

interface FormProps {
  form: UseFormReturn<FormData>;
}

const Form = ({ form }: FormProps) => {

  const { getValues, setValue, control, watch, register, formState: { errors } } = form

  // Debug: Log current form values
  const currentValues = watch();
  console.log('Current form values:', currentValues);

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "recipients"
  });

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
          principal,
          percentage: Math.floor(100 / jsonData.recipients.length)
        }));

        // Handle remainder for equal distribution
        const totalAssigned = newRecipients.reduce((sum: number, recipient: { percentage: number }) => sum + recipient.percentage, 0);
        const remainder = 100 - totalAssigned;
        if (remainder > 0 && newRecipients.length > 0) {
          newRecipients[0].percentage += remainder;
        }

        // Replace all recipients at once
        setValue("recipients", newRecipients);

        toast.success(`Loaded ${jsonData.recipients.length} recipients and amount from JSON file`);
      } catch (error) {
        console.error("JSON upload error:", error);
        toast.error("Invalid JSON file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const handleAddRecipient = () => {
    const currentRecipients = getValues("recipients");
    const newRecipient = {
      id: `recipient-${currentRecipients.length + 1}`,
      principal: "",
      percentage: 0
    };
    append(newRecipient);
  };

  const handleRemoveRecipient = (idx: number) => {
    if (fields.length > 1) {
      remove(idx);
      // Redistribute percentages after removal
      const remainingRecipients = getValues("recipients").filter((_, index) => index !== idx);
      if (remainingRecipients.length > 0) {
        const equalPercentage = Math.floor(100 / remainingRecipients.length);
        const remainder = 100 % remainingRecipients.length;

        remainingRecipients.forEach((recipient, index) => {
          const newPercentage = equalPercentage + (index < remainder ? 1 : 0);
          setValue(`recipients.${index}.percentage`, newPercentage);
        });
      }
    }
  };

  const handlePercentageChange = (idx: number, value: string) => {
    const numValue = Number(value);

    // Prevent negative values
    if (numValue < 0) {
      setValue(`recipients.${idx}.percentage`, 0);
      toast.warning("Percentage cannot be negative");
      return;
    }

    // Handle empty or invalid input
    if (isNaN(numValue) || value === '') {
      setValue(`recipients.${idx}.percentage`, 0);
      return;
    }

    // Cap at 100%
    if (numValue > 100) {
      setValue(`recipients.${idx}.percentage`, 100);
      toast.warning("Percentage cannot exceed 100%");
      return;
    }

    // Calculate total percentage excluding current field
    const recipients = getValues("recipients");
    const totalOtherPercentage = recipients.reduce((sum, recipient, index) => {
      if (index !== idx) {
        return sum + (recipient.percentage || 0);
      }
      return sum;
    }, 0);

    // Check if new total would exceed 100%
    if (totalOtherPercentage + numValue > 100) {
      const maxAllowed = 100 - totalOtherPercentage;
      setValue(`recipients.${idx}.percentage`, maxAllowed);
      toast.warning(`Maximum allowed: ${maxAllowed}% (total cannot exceed 100%)`);
      return;
    }

    setValue(`recipients.${idx}.percentage`, numValue);
  };

  const calculateTotalAllocation = () => {
    const recipients = watch("recipients");
    return recipients.reduce((sum, recipient) => sum + (recipient.percentage || 0), 0);
  };

  const isTotalValid = calculateTotalAllocation() === 100;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin color="#F97415" />
          <Typography variant="large">Escrow setup</Typography>
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
            className="mt-1"
            type="text"
            {...register("title")}
            placeholder="e.g., Freelance project payment"
          />
          {errors.title && (
            <div className="text-red-400 text-sm mt-1">{errors.title.message}</div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-[#A1A1AA]">
              BTC amount
            </label>
          </div>
          <Input
            className="mt-1"
            type="number"
            min="0"
            step="0.00000001"
            {...register("btcAmount")}
            placeholder="0.00000000"
          />
          {errors.btcAmount && (
            <div className="text-red-400 text-sm mt-1">{errors.btcAmount.message}</div>
          )}
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
            {fields.map((field, idx) => (
              <motion.div
                key={field.id}
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.25 }}
                className="container bg-[#2C2C2C] rounded-lg relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Recipient {idx + 1}</span>
                  {fields.length > 1 && (
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
                      ICP Principal ID
                    </label>
                    <Input
                      type="text"
                      value={watch(`recipients.${idx}.principal`) || ''}
                      placeholder="ICP Principal ID"
                      className="mt-1"
                      autoComplete="off"
                      onChange={(e) => {
                        console.log('Field value changed:', e.target.value);
                        console.log('Field name:', `recipients.${idx}.principal`);
                        setValue(`recipients.${idx}.principal`, e.target.value);
                      }}
                    />
                    {errors.recipients?.[idx]?.principal && (
                      <div className="text-red-400 text-sm mt-1">
                        {errors.recipients[idx]?.principal?.message}
                      </div>
                    )}
                    <div className="text-gray-400 text-xs mt-1">
                      Enter the recipient&apos;s ICP Principal ID. The system will automatically convert to BTC addresses.
                    </div>
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
                        value={watch(`recipients.${idx}.percentage`)}
                        onChange={(e) => handlePercentageChange(idx, e.target.value)}
                        onKeyDown={(e) => {
                          // Prevent negative sign, e, and other non-numeric characters
                          if (['-', 'e', 'E'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="mt-1"
                      />
                      {errors.recipients?.[idx]?.percentage && (
                        <div className="text-red-400 text-sm mt-1">
                          {errors.recipients[idx]?.percentage?.message}
                        </div>
                      )}
                    </div>
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
            className={`${isTotalValid ? 'text-[#FEB64D]' : 'text-red-400'}`}
          >
            {calculateTotalAllocation()}%
          </Typography>
        </div>
        {!isTotalValid && calculateTotalAllocation() > 0 && (
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
  );
};

export default Form;
