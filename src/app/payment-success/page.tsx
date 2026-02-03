'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/icons';
import { CheckCircle, Download } from 'lucide-react';
import Header from '@/components/landing/header';
import { Suspense } from 'react';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const amount = searchParams.get('amount');
    const reference = searchParams.get('reference');
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-[#0f0510] text-white font-sans overflow-x-hidden relative selection:bg-accent/30">
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen opacity-30"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow flex flex-col items-center justify-center p-6 py-12 lg:py-20">
                    <div className="w-full max-w-4xl flex flex-col items-center text-center">
                        <div className="mb-8 text-accent animate-pulse">
                            <CheckCircle className="h-[100px] w-[100px] md:h-[120px] md:w-[120px]" strokeWidth={1} />
                        </div>
                        <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-light font-display leading-tight tracking-tight mb-6">
                            Payment<br className="md:hidden" /> Successful
                        </h1>
                        <p className="text-white/60 text-lg md:text-xl font-sans max-w-xl font-light leading-relaxed mb-16">
                            Thank you for your seed. We have successfully processed your donation to VOSEM INT'L.
                        </p>
                        <div className="w-full flex flex-col md:flex-row items-center justify-center border-t border-b border-accent/40 py-10 mb-16 gap-8 md:gap-0">
                            <div className="flex-1 px-4 flex flex-col gap-2">
                                <span className="text-accent text-xs uppercase tracking-[0.2em] font-bold font-sans">Amount</span>
                                <span className="text-white text-4xl md:text-5xl font-display">
                                    {amount ? `₦${Number(amount).toLocaleString()}` : '...'}
                                </span>
                            </div>
                            <div className="hidden md:block w-px h-16 bg-accent/40"></div>
                            <div className="md:hidden w-16 h-px bg-accent/40"></div>
                            <div className="flex-1 px-4 flex flex-col gap-2">
                                <span className="text-accent text-xs uppercase tracking-[0.2em] font-bold font-sans">Date</span>
                                <span className="text-white/90 text-xl md:text-2xl font-display">{date}</span>
                            </div>
                            <div className="hidden md:block w-px h-16 bg-accent/40"></div>
                            <div className="md:hidden w-16 h-px bg-accent/40"></div>
                            <div className="flex-1 px-4 flex flex-col gap-2">
                                <span className="text-accent text-xs uppercase tracking-[0.2em] font-bold font-sans">Reference</span>
                                <span className="text-white/80 text-lg md:text-xl font-mono">{reference || '...'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center w-full gap-5">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
                                <Button asChild variant="outline" className="group relative w-full sm:w-auto min-w-[200px] h-14 rounded-full bg-accent/20 backdrop-blur-xl border-accent/50 hover:bg-accent/30 transition-all duration-300 text-white text-base font-semibold tracking-wide font-sans z-10">
                                    <Link href="/">Return to Home</Link>
                                </Button>
                                <Button variant="ghost" className="w-full sm:w-auto min-w-[200px] h-14 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-all text-base font-medium font-sans gap-2 border border-transparent hover:border-white/10">
                                    <Download size={20} />
                                    <span>Download Receipt</span>
                                </Button>
                            </div>
                            <a className="flex w-full sm:w-auto min-w-[240px] sm:min-w-[400px] h-14 cursor-pointer items-center justify-center rounded-xl bg-white/5 hover:bg-[#25D366]/10 border border-[#25D366]/40 backdrop-blur-md transition-all text-white gap-3 px-8 text-sm font-bold tracking-wide group mt-4 font-sans" href="https://wa.me/?text=I%20just%20sowed%20a%20seed%20at%20VOSEM%20INT'L!%20Join%20us%20in%20experiencing%20God's%20grace.%20https://vosem.org" target="_blank" rel="noopener noreferrer">
                                <WhatsAppIcon className="w-6 h-6 text-[#25D366] transition-transform group-hover:scale-110" />
                                <span className="truncate">Share Testimony on WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </main>
                <div className="h-10"></div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    )
}
