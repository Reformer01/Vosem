'use client';

import { Button } from "@/components/ui/button";
import { VosemLogoIcon } from "@/components/icons";
import { Download } from "lucide-react";

interface Donation {
    id: string;
    amount: number; // in kobo
    currency: string;
    purpose: string;
    status: string;
    createdAt: string; // ISO string
    donorName: string;
    donorEmail: string;
}

export function ReceiptDetails({ donation }: { donation: Donation }) {
    const formattedDate = new Date(donation.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const amountInMajorUnit = donation.amount / 100;
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency', currency: donation.currency || 'NGN',
    }).format(amountInMajorUnit);

    return (
        <div className="app-shell min-h-screen p-4 sm:p-8 md:p-12">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-start justify-between no-print">
                    <div className="flex items-center gap-3">
                        <VosemLogoIcon className="size-9 text-primary" />
                        <span className="text-xl font-black tracking-tighter">VOSEM <span className="text-primary">INT&apos;L</span></span>
                    </div>
                    <Button onClick={() => window.print()} className="site-btn site-btn-solid">
                        <Download className="size-4" /> Print / Download
                    </Button>
                </div>

                <div className="printable-area site-curved border border-border bg-card p-8 shadow-sm sm:p-12">
                    <header className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row">
                        <div>
                            <div className="mb-4 flex items-center gap-3">
                                <VosemLogoIcon className="size-10 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-black">VOSEM INT&apos;L</h2>
                                    <p className="text-sm text-muted-foreground">Official Donation Receipt</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">12/14 Ademola Adefuye Street, Alapere, Agboyi/Ketu, Lagos</p>
                        </div>
                        <div className="sm:text-right">
                            <h3 className="text-2xl font-black uppercase tracking-wider">Receipt</h3>
                            <p className="mt-1 font-mono text-sm text-muted-foreground"># {donation.id}</p>
                        </div>
                    </header>

                    <section className="grid gap-8 py-8 sm:grid-cols-2">
                        <div>
                            <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-primary">Billed to</h4>
                            <p className="text-lg font-bold">{donation.donorName}</p>
                            <p className="text-muted-foreground">{donation.donorEmail}</p>
                        </div>
                        <div className="sm:text-right">
                            <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-primary">Payment details</h4>
                            <p className="text-muted-foreground">Date: <span className="font-semibold text-foreground">{formattedDate}</span></p>
                            <p className="text-muted-foreground">Status: <span className="font-semibold capitalize text-green-700">{donation.status}</span></p>
                        </div>
                    </section>

                    <section className="overflow-x-auto">
                        <table className="app-table">
                            <thead>
                                <tr className="border-y border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="px-4">Description</th>
                                    <th className="px-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-border">
                                    <td className="px-4 font-semibold">{donation.purpose}</td>
                                    <td className="px-4 text-right font-mono">{formattedAmount}</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section className="flex justify-end py-8">
                        <div className="w-full max-w-xs">
                            <div className="flex justify-between py-3 text-muted-foreground"><span>Subtotal</span><span>{formattedAmount}</span></div>
                            <div className="flex justify-between border-b border-border py-3 text-muted-foreground"><span>Fees</span><span>{formattedAmount.replace(/[\d,.]+/, '0')}</span></div>
                            <div className="flex justify-between pt-4 text-xl font-bold"><span>Total paid</span><span>{formattedAmount}</span></div>
                        </div>
                    </section>

                    <footer className="border-t border-border pt-8 text-center text-muted-foreground">
                        <p className="text-lg font-semibold">Thank you for your generous contribution!</p>
                        <p className="mt-2 text-sm">Your support helps us continue our mission. May God bless you abundantly.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
