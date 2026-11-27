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
        <div className="app-shell min-h-screen p-3 sm:p-8 md:p-12">
            <div className="mx-auto max-w-4xl">
                <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <VosemLogoIcon className="size-8 shrink-0 text-primary sm:size-9" />
                        <span className="truncate text-base font-black tracking-tighter sm:text-xl">VOSEM <span className="text-primary">INT&apos;L</span></span>
                    </div>
                    <Button onClick={() => window.print()} className="site-btn site-btn-solid shrink-0 !px-4 !py-2 text-xs sm:!px-6 sm:!py-3 sm:text-sm">
                        <Download className="size-4" /> Print / Download
                    </Button>
                </div>

                <div className="printable-area site-curved border border-border bg-card p-4 shadow-sm sm:p-8 lg:p-12">
                    <header className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row">
                        <div>
                            <div className="mb-4 flex items-center gap-3">
                                <VosemLogoIcon className="size-10 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-black">VOSEM INT&apos;L</h2>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">12/14 Ademola Adefuye Street, Alapere, Agboyi/Ketu, Lagos</p>
                        </div>
                        <div className="sm:text-right">
                            <h3 className="text-2xl font-black uppercase tracking-wider">Receipt</h3>
                            <p className="mt-1 break-all font-mono text-sm text-muted-foreground"># {donation.id}</p>
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
                        </div>
                    </section>

                    <section>
                        <table className="app-table w-full table-fixed">
                            <thead>
                                <tr className="border-y border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="w-1/2 px-3 sm:px-4">Description</th>
                                    <th className="w-1/2 px-3 text-right sm:px-4">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-border">
                                    <td className="break-words px-3 font-semibold sm:px-4">{donation.purpose}</td>
                                    <td className="whitespace-nowrap px-3 text-right font-mono text-sm sm:px-4 sm:text-base">{formattedAmount}</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section className="py-8">
                        <div className="w-full sm:ml-auto sm:max-w-xs">
                            <div className="flex items-center justify-between gap-3 py-3 text-sm text-muted-foreground sm:text-base"><span>Subtotal</span><span className="whitespace-nowrap text-right">{formattedAmount}</span></div>
                            <div className="flex items-center justify-between gap-3 border-b border-border py-3 text-sm text-muted-foreground sm:text-base"><span>Fees</span><span className="whitespace-nowrap text-right">{formattedAmount.replace(/[\d,.]+/, '0')}</span></div>
                            <div className="flex items-center justify-between gap-3 pt-4 text-base font-bold sm:text-xl"><span>Total paid</span><span className="whitespace-nowrap text-right">{formattedAmount}</span></div>
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
