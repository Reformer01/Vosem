
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
import { useState, useEffect, useRef } from "react";
import { useMachine } from "@/machines/use-machine";
import { givingMachine } from "@/machines/payment.machine";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface GivingModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  defaultPurpose: string;
}

type PaystackHandler = { openIframe: () => void };
declare global {
  interface Window {
    PaystackPop?: { setup: (args: Record<string, unknown>) => PaystackHandler };
  }
}

let paystackScriptPromise: Promise<void> | null = null;

function loadPaystack(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  if (!paystackScriptPromise) {
    paystackScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => { paystackScriptPromise = null; reject(new Error("Could not load Paystack")); };
      document.body.appendChild(script);
    });
  }
  return paystackScriptPromise;
}

export function GivingModal({ isOpen, onOpenChange, defaultPurpose }: GivingModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => (user ? doc(firestore, "users", user.uid) : null), [user, firestore]);
  const { data: profile } = useDoc<{ name?: string }>(profileRef);
  const fullName = (profile?.name || user?.displayName || "").trim() || "Valued Giver";
  const [firstName, ...nameRest] = fullName.split(/\s+/);
  const [purpose, setPurpose] = useState(defaultPurpose);
  const [amount, setAmount] = useState("10000");
  const [customAmount, setCustomAmount] = useState("");
  const [givingState, sendGive] = useMachine(givingMachine);
  const isPaying = givingState === "paying-paystack";
  const [frequency, setFrequency] = useState('one-time');
  const paystackTimer = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPurpose(defaultPurpose);
      setAmount("10000");
      setCustomAmount("");
      setFrequency('one-time');
      sendGive('RESET');
      sendGive('CLOSE');
      sendGive('OPEN');
    }
  }, [isOpen, defaultPurpose, sendGive]);

  useEffect(() => () => {
    if (paystackTimer.current !== null) window.clearTimeout(paystackTimer.current);
  }, []);

  const finalAmount = Number(customAmount) || Number(amount);

  // Setup Paystack directly with only the fields we actually use. The
  // react-paystack hook sends empty strings for plan/quantity/label, which the
  // Paystack checkout reads as present values and then crashes on.
  const openPaystack = async () => {
    await loadPaystack();
    if (!window.PaystackPop) throw new Error("Paystack could not be loaded");

    const reference = `VOSEM-${Date.now()}`;
    const args: Record<string, unknown> = {
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
      email: user?.email || "",
      firstname: firstName,
      lastname: nameRest.join(" "),
      amount: finalAmount * 100, // kobo
      ref: reference,
      currency: "NGN",
      channels: ["card", "bank", "ussd"],
      callback: onSuccess,
      onClose,
      metadata: {
        name: fullName,
        userId: user?.uid,
        purpose,
        recurring: frequency === "recurring",
        custom_fields: [{ display_name: "Giving Purpose", variable_name: "giving_purpose", value: purpose }],
      },
    };
    const planCode = process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE;
    if (frequency === "recurring" && planCode) args.plan = planCode;

    window.PaystackPop.setup(args).openIframe();
  };

  const onSuccess = (reference: { reference: string }) => {
    sendGive('PAYMENT_SUCCESS');
    onOpenChange(false);
    router.replace(`/payment-processing?amount=${finalAmount}&reference=${reference.reference}`);
  };

  const onClose = () => {
    // Paystack was cancelled. Bring our giving form back.
    sendGive('PAYMENT_CLOSED');
    onOpenChange(true);
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

    const planCode = process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE;
    if (frequency === 'recurring' && !planCode) {
      toast({
        variant: 'destructive',
        title: 'Recurring giving is unavailable',
        description: 'Please choose a one-time gift or contact the church office to set up a recurring plan.',
      });
      return;
    }

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast({ variant: 'destructive', title: 'Payment Error', description: 'Paystack is not configured for this site.' });
      return;
    }

    // Close our Radix dialog first: its modal layer blocks clicks inside the
    // Paystack iframe (which is portalled outside this dialog).
    sendGive('PROCEED_PAYSTACK');
    onOpenChange(false);
    paystackTimer.current = window.setTimeout(() => {
      paystackTimer.current = null;
      openPaystack().catch(() => {
        sendGive('PAYMENT_CLOSED');
        toast({ variant: "destructive", title: "Payment Error", description: "We could not open the payment window. Please try again." });
        onOpenChange(true);
      });
    }, 150);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="giving-dialog-description" className="p-0 max-w-[520px] rounded-[2rem] overflow-hidden border border-border bg-card text-foreground shadow-xl">
        {!isPaying ? (
          <>
            <DialogHeader className="relative items-center justify-center pt-8 pb-4 px-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HeartHandshake className="h-8 w-8" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Make Your Contribution</DialogTitle>
              <DialogDescription id="giving-dialog-description" className="text-sm font-medium text-accent">Give to VOSEM INT&apos;L</DialogDescription>
            </DialogHeader>

            <div className="px-6 sm:px-10 pb-10">
              <div className="mb-8 flex flex-col items-center gap-4">
                <RadioGroup value={frequency} onValueChange={setFrequency} className="flex h-11 w-full max-w-xs items-center justify-center rounded-xl bg-muted p-1">
                  <Label className="flex h-full grow cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-all has-[:checked]:bg-primary has-[:checked]:text-white">
                    <RadioGroupItem value="one-time" id="one-time" className="sr-only" />
                    One-time
                  </Label>
                  <Label className="flex h-full grow cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-all has-[:checked]:bg-primary has-[:checked]:text-white">
                    <RadioGroupItem value="recurring" id="recurring" className="sr-only" />
                    Recurring
                  </Label>
                </RadioGroup>

                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Secure payment by Paystack</p>

                {frequency === 'recurring' && (
                  <p className="max-w-sm text-center text-xs leading-relaxed text-muted-foreground">
                    Recurring giving needs a plan from the church office. Choose one-time to give now.
                  </p>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Amount (NGN)</Label>
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
                        <div className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all hover:border-primary hover:bg-primary/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white">
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
                      <span className="text-muted-foreground">₦</span>
                    </div>
                    <Input id="custom-amount" placeholder="0.00" type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="site-curved py-3.5 pl-10 h-auto" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="block text-sm font-medium text-foreground">Giving Purpose</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="site-curved h-12 text-sm text-left justify-start px-4">
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
                    className="site-btn site-btn-solid w-full py-4 disabled:opacity-50">
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
