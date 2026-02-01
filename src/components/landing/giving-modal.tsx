
"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HeartHandshake, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/firebase";

interface GivingModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  defaultPurpose: string;
}

declare global {
  interface Window {
    FlutterwaveCheckout: (options: any) => void;
  }
}

export function GivingModal({ isOpen, onOpenChange, defaultPurpose }: GivingModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [purpose, setPurpose] = useState(defaultPurpose);
  const [amount, setAmount] = useState("10000");
  const [customAmount, setCustomAmount] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPurpose(defaultPurpose);
      setAmount("10000");
      setCustomAmount("");
    }
  }, [isOpen, defaultPurpose]);

  const handleProceed = () => {
    if (!user) {
      console.error("User is not logged in.");
      // Optionally, show a toast message to the user.
      return;
    }
    const finalAmount = Number(customAmount) || Number(amount);
    
    if (typeof window.FlutterwaveCheckout === 'function') {
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: "VOSEM-" + Date.now(),
        amount: finalAmount,
        currency: "NGN",
        payment_options: "card, ussd, banktransfer",
        customer: {
          email: user.email || '',
          name: user.displayName || 'Anonymous Member',
        },
        customizations: {
          title: "VOSEM INT'L Giving",
          description: `Contribution for ${purpose}`,
        },
        callback: function (data: any) {
          onOpenChange(false);
          router.push(`/payment-success?amount=${data.amount}&transaction_id=${data.transaction_id}`);
        },
        onclose: function () {
          // Redirect to failed page if user closes modal without completing payment
          // router.push('/payment-failed');
        },
      });
    } else {
      console.error("Flutterwave Checkout script not loaded.");
      // Fallback or error message
      const finalAmount = Number(customAmount) || Number(amount);
      router.push(`/payment-processing?amount=${finalAmount}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[520px] rounded-2xl overflow-hidden glass-panel border-white/10 dark:bg-[#141414]/80">
        <DialogHeader className="relative items-center justify-center pt-8 pb-4 px-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent ring-4 ring-white/10">
            <HeartHandshake className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Make Your Contribution</DialogTitle>
          <DialogDescription className="text-sm font-medium text-accent">Give to VOSEM INT'L</DialogDescription>
        </DialogHeader>

        <div className="px-6 sm:px-10 pb-10">
          <div className="mb-8 flex justify-center">
            <RadioGroup defaultValue="one-time" className="flex h-12 w-full max-w-[320px] items-center justify-center rounded-xl bg-gray-200/50 dark:bg-white/5 p-1">
              <Label className="group flex h-full grow cursor-pointer items-center justify-center rounded-lg px-4 transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-accent dark:has-[:checked]:text-white has-[:checked]:shadow-sm">
                <RadioGroupItem value="one-time" id="one-time" className="sr-only" />
                <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700 peer-data-[state=checked]:text-accent dark:text-gray-400 dark:group-hover:text-gray-200 dark:peer-data-[state=checked]:text-white">One-time</span>
              </Label>
              <Label className="group flex h-full grow cursor-pointer items-center justify-center rounded-lg px-4 transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-accent dark:has-[:checked]:text-white has-[:checked]:shadow-sm">
                <RadioGroupItem value="recurring" id="recurring" className="sr-only" />
                <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700 peer-data-[state=checked]:text-accent dark:text-gray-400 dark:group-hover:text-gray-200 dark:peer-data-[state=checked]:text-white">Recurring</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Select Amount (NGN)</Label>
              <RadioGroup
                value={customAmount ? '' : amount}
                onValueChange={(value) => {
                  if (value) {
                    setAmount(value);
                    setCustomAmount('');
                  }
                }}
                className="grid grid-cols-3 gap-3">
                {['5000', '10000', '20000'].map(val => (
                  <Label key={val} className="cursor-pointer">
                    <RadioGroupItem value={val} id={`amount-${val}`} className="peer sr-only" />
                    <div className="flex h-12 w-full items-center justify-center rounded-xl border border-accent/30 bg-white/50 text-gray-700 transition-all hover:border-accent hover:bg-accent/5 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-md dark:bg-white/5 dark:text-gray-200 dark:peer-data-[state=checked]:text-white">
                      <span className="font-bold">₦{parseInt(val).toLocaleString()}</span>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-amount" className="block text-sm font-medium text-foreground">Or Enter Custom Amount</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-gray-500 dark:text-gray-400">₦</span>
                </div>
                <Input id="custom-amount" placeholder="0.00" type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="block w-full rounded-xl border-gray-200 bg-white/60 py-3.5 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-accent focus:ring-1 focus:ring-accent dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 h-auto" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose" className="block text-sm font-medium text-foreground">Giving Purpose</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="w-full rounded-xl border-gray-200 bg-white/60 dark:border-white/10 dark:bg-white/5 dark:text-white h-12 text-sm text-left justify-start px-4">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tithes">Tithes</SelectItem>
                  <SelectItem value="Offerings">Offerings</SelectItem>
                  <SelectItem value="Building Fund">Building Fund</SelectItem>
                  <SelectItem value="Thanksgiving">Thanksgiving</SelectItem>
                  <SelectItem value="Mission Support">Mission Support</SelectItem>
                  <SelectItem value="Kingdom Projects">Kingdom Projects</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button
                type="button"
                onClick={handleProceed}
                disabled={!user || (!amount && !customAmount)}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-accent px-6 py-4 text-base font-bold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 hover:shadow-accent/50 h-auto disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed">
                <span className="relative z-10 flex items-center gap-2">
                  Proceed to Payment
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
