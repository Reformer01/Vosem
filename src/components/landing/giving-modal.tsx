
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
import { useToast } from "@/hooks/use-toast";
import { usePaystackPayment } from "react-paystack";

interface GivingModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  defaultPurpose: string;
}

export function GivingModal({ isOpen, onOpenChange, defaultPurpose }: GivingModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [purpose, setPurpose] = useState(defaultPurpose);
  const [amount, setAmount] = useState("10000");
  const [customAmount, setCustomAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [frequency, setFrequency] = useState('one-time');
  const [gateway, setGateway] = useState<'paystack' | 'flutterwave'>('paystack');

  useEffect(() => {
    if (isOpen) {
      setPurpose(defaultPurpose);
      setAmount("10000");
      setCustomAmount("");
      setFrequency('one-time');
      setGateway('paystack');
      setIsPaying(false);
    }
  }, [isOpen, defaultPurpose]);

  const finalAmount = Number(customAmount) || Number(amount);

  const config = {
    reference: ("VOSEM-" + Date.now()).toString(),
    email: user?.email || "",
    amount: finalAmount * 100, // Amount in Kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    channels: ['card', 'bank', 'ussd'],
    // A recurring gift uses the church's Paystack plan; a plan code is required.
    ...(frequency === 'recurring' && process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE
      ? { plan: process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE }
      : {}),
    metadata: {
      name: user?.displayName || "Anonymous Giver",
      userId: user?.uid,
      purpose: purpose,
      recurring: frequency === 'recurring',
      custom_fields: [
        {
          display_name: "Giving Purpose",
          variable_name: "giving_purpose",
          value: purpose,
        }
      ]
    },
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: { reference: string }) => {
    setIsPaying(false);
    onOpenChange(false);
    router.replace(`/payment-processing?amount=${finalAmount}&reference=${reference.reference}`);
  };

  const onClose = () => {
    setIsPaying(false);
  };

  const handleProceed = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "Please log in or create an account to give.",
      });
      router.push('/login');
      return;
    }
    
    if (gateway === 'flutterwave') {
      const key = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
      if (!key) {
        toast({ variant: 'destructive', title: 'Payment Error', description: 'Flutterwave is not configured for this site.' });
        return;
      }
      const txRef = `VOSEM-FW-${Date.now()}`;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://checkout.flutterwave.com/v3/hosted/pay';
      const fields: Record<string, string> = {
        public_key: key,
        tx_ref: txRef,
        amount: String(finalAmount),
        currency: 'NGN',
        email: user.email || '',
        name: user.displayName || 'VOSEM Giver',
        redirect_url: `${window.location.origin}/payment-processing?gateway=flutterwave&amount=${finalAmount}&reference=${txRef}`,
        meta: JSON.stringify({ userId: user.uid, purpose, name: user.displayName || 'VOSEM Giver', recurring: frequency === 'recurring' }),
      };
      if (frequency === 'recurring' && process.env.NEXT_PUBLIC_FLUTTERWAVE_PLAN_ID) {
        fields.payment_plan = process.env.NEXT_PUBLIC_FLUTTERWAVE_PLAN_ID;
      }
      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      return;
    }

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast({ variant: 'destructive', title: 'Payment Error', description: 'Paystack is not configured for this site.' });
      return;
    }

    setIsPaying(true);
    initializePayment({ onSuccess, onClose });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[520px] rounded-2xl overflow-hidden glass-panel border-white/10 dark:bg-[#141414]/80">
        {!isPaying ? (
          <>
            <DialogHeader className="relative items-center justify-center pt-8 pb-4 px-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent ring-4 ring-white/10">
                <HeartHandshake className="h-8 w-8" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Make Your Contribution</DialogTitle>
              <DialogDescription className="text-sm font-medium text-accent">Give to VOSEM INT'L</DialogDescription>
            </DialogHeader>

            <div className="px-6 sm:px-10 pb-10">
              <div className="mb-8 flex justify-center">
                <RadioGroup value={frequency} onValueChange={setFrequency} className="flex h-12 w-full max-w-[320px] items-center justify-center rounded-xl bg-gray-200/50 dark:bg-white/5 p-1">
                  <Label className="group flex h-full grow cursor-pointer items-center justify-center rounded-lg px-4 transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-accent dark:has-[:checked]:text-white has-[:checked]:shadow-sm">
                    <RadioGroupItem value="one-time" id="one-time" className="sr-only" />
                    <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700 peer-data-[state=checked]:text-accent dark:text-gray-400 dark:group-hover:text-gray-200 dark:peer-data-[state=checked]:text-white">One-time</span>
                  </Label>
                  <Label className="group flex h-full grow cursor-pointer items-center justify-center rounded-lg px-4 transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-accent dark:has-[:checked]:text-white has-[:checked]:shadow-sm">
                    <RadioGroupItem value="recurring" id="recurring" className="sr-only" />
                    <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700 peer-data-[state=checked]:text-accent dark:text-gray-400 dark:group-hover:text-gray-200 dark:peer-data-[state=checked]:text-white">Recurring</span>
                  </Label>
                </RadioGroup>
                {frequency === 'recurring' && (
                  <p className="mt-2 text-center text-xs text-amber-700">
                    Recurring gifts use the church&apos;s plan code. If none is configured, this gift is processed as a single payment.
                  </p>
                )}
                <div className="mt-4 flex items-center justify-center gap-2">
                  {(['paystack', 'flutterwave'] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGateway(option)}
                      className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition-colors ${gateway === option ? 'bg-accent text-white' : 'border border-border text-muted-foreground'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 h-[580px]">
            <DialogTitle className="sr-only">Processing Payment</DialogTitle>
            <DialogDescription className="sr-only">Please wait while we redirect you to the secure payment gateway.</DialogDescription>
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
            <p className="mt-6 text-muted-foreground font-medium">Redirecting to secure payment gateway...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
