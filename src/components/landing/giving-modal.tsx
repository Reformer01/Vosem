
"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { HeartHandshake, ArrowRight, ShieldCheck, Lock } from "lucide-react";

interface GivingModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function GivingModal({ isOpen, onOpenChange }: GivingModalProps) {
  const router = useRouter();

  const handleProceed = () => {
    onOpenChange(false);
    router.push('/payment-success');
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

          <form action="#" className="space-y-6">
            <div className="space-y-3">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Select Amount</Label>
              <RadioGroup defaultValue="10000" className="grid grid-cols-3 gap-3">
                {['5000', '10000', '20000'].map(amount => (
                  <Label key={amount} className="cursor-pointer">
                    <RadioGroupItem value={amount} id={`amount-${amount}`} className="peer sr-only" />
                    <div className="flex h-12 w-full items-center justify-center rounded-xl border border-accent/30 bg-white/50 text-gray-700 transition-all hover:border-accent hover:bg-accent/5 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-md dark:bg-white/5 dark:text-gray-200 dark:peer-data-[state=checked]:text-white">
                      <span className="font-bold">₦{parseInt(amount).toLocaleString()}</span>
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
                <Input id="custom-amount" placeholder="0.00" type="text" className="block w-full rounded-xl border-gray-200 bg-white/60 py-3.5 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-accent focus:ring-1 focus:ring-accent dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 h-auto" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose" className="block text-sm font-medium text-foreground">Giving Purpose</Label>
              <Select defaultValue="Offering">
                <SelectTrigger className="w-full rounded-xl border-gray-200 bg-white/60 dark:border-white/10 dark:bg-white/5 dark:text-white h-12 focus:border-accent focus:ring-1 focus:ring-accent text-sm">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tithes">Tithes</SelectItem>
                  <SelectItem value="Offering">Offering</SelectItem>
                  <SelectItem value="Building Fund">Building Fund</SelectItem>
                  <SelectItem value="Thanksgiving">Thanksgiving</SelectItem>
                  <SelectItem value="Mission Support">Mission Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button
                type="button"
                onClick={handleProceed}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-accent px-6 py-4 text-base font-bold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 hover:shadow-accent/50 h-auto">
                <span className="relative z-10 flex items-center gap-2">
                  Proceed to Secure Payment
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 grayscale transition-all hover:grayscale-0">
                  <ShieldCheck className="h-[18px] w-[18px] text-green-600" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Secured by Paystack</span>
                </div>
                <div className="h-3 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-1.5 grayscale transition-all hover:grayscale-0">
                  <Lock className="h-[18px] w-[18px] text-green-600" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Flutterwave Verified</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
