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

    const handlePrint = () => {
        window.print();
    };

    const formattedDate = new Date(donation.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const amountInNaira = donation.amount / 100;

    return (
        <div className="bg-background-dark text-slate-200 min-h-screen font-sans p-4 sm:p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-8 no-print">
                    <div className="flex items-center gap-4">
                        <VosemLogoIcon className="size-10 text-primary"/>
                        <h1 className="text-2xl font-bold text-white">VOSEM INT'L</h1>
                    </div>
                    <Button onClick={handlePrint} className="flex items-center gap-2">
                        <Download size={18}/>
                        Print / Download
                    </Button>
                </div>
                
                <div className="bg-[#1a101a] border border-[#331133] rounded-2xl p-8 sm:p-12 printable-area">
                    <header className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-[#331133]">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <VosemLogoIcon className="size-12 text-primary"/>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white">VOSEM INT'L</h2>
                                    <p className="text-slate-400">Official Donation Receipt</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">12/14, Ademolu Adefuye, Alapere, Ketu, Lagos</p>
                        </div>
                        <div className="text-left sm:text-right mt-6 sm:mt-0">
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Receipt</h3>
                            <p className="text-sm text-slate-400 mt-1"># <span className="font-mono">{donation.id}</span></p>
                        </div>
                    </header>

                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Billed To</h4>
                            <p className="font-bold text-white text-lg">{donation.donorName}</p>
                            <p className="text-slate-300">{donation.donorEmail}</p>
                        </div>
                        <div className="sm:text-right">
                             <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment Details</h4>
                            <p className="text-slate-300">Date: <span className="font-semibold text-white">{formattedDate}</span></p>
                            <p className="text-slate-300">Status: <span className="font-semibold capitalize text-green-400">{donation.status}</span></p>
                        </div>
                    </section>

                    <section>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#120a12]/50 text-slate-400 text-xs uppercase tracking-wider border-b border-t border-[#331133]">
                                        <th className="px-6 py-4 font-semibold">Description</th>
                                        <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-[#331133]">
                                        <td className="px-6 py-5 text-white font-medium">{donation.purpose}</td>
                                        <td className="px-6 py-5 text-white font-mono text-right">₦{amountInNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="flex justify-end py-8">
                        <div className="w-full max-w-xs">
                             <div className="flex justify-between items-center py-3 text-slate-300">
                                <span>Subtotal</span>
                                <span>₦{amountInNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                             </div>
                              <div className="flex justify-between items-center py-3 text-slate-300 border-b border-[#331133]">
                                <span>Fees</span>
                                <span>₦0.00</span>
                             </div>
                             <div className="flex justify-between items-center pt-4 text-white font-bold text-xl">
                                <span>Total Paid</span>
                                <span>₦{amountInNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                             </div>
                        </div>
                    </section>
                    
                    <footer className="border-t border-[#331133] pt-8 text-center text-slate-400">
                        <p className="text-lg font-semibold">Thank you for your generous contribution!</p>
                        <p className="text-sm mt-2">Your support helps us continue our mission. May God bless you abundantly.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
