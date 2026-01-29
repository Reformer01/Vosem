import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { TwitterIcon, InstagramIcon } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const mapImage = PlaceHolderImages.find(img => img.id === 'footer-map');

export default function Footer() {
  return (
    <footer className="bg-[#0d0d1b] text-white pt-24 pb-12 border-t border-white/5" id="contact">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div>
            <h4 className="text-2xl font-black mb-8 tracking-tighter">VOSEM <span className="text-accent">INT'L</span></h4>
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              A global community of believers passionate about God's presence and people's purpose. Experience royalty in worship.
            </p>
            <div className="flex gap-5">
              <Link href="#" className="size-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-accent transition-all">
                <TwitterIcon className="h-5 w-5" />
              </Link>
              <Link href="#" className="size-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-accent transition-all">
                <InstagramIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-white mb-8 uppercase tracking-widest text-xs">Navigation</h5>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link className="hover:text-accent transition-colors" href="#about">About VOSEM</Link></li>
              <li><Link className="hover:text-accent transition-colors" href="#">Growth Track</Link></li>
              <li><Link className="hover:text-accent transition-colors" href="#">Dream Team</Link></li>
              <li><Link className="hover:text-accent transition-colors" href="#sermons">Sermon Library</Link></li>
              <li><Link className="hover:text-accent transition-colors" href="#">Prayer Center</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-8 uppercase tracking-widest text-xs">Community</h5>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link className="hover:text-accent transition-colors" href="#">Small Groups</Link></li>
              <li><Link className="hover:text-accent transition-colors" href="#">VOSEM Kids</Link></li>
              <li><Link className="hover:text-accent transition-colors" href="#">Campus Locations</Link></li>
              <li><Link className="hover:text-accent transition-colors" href="#">Foundations Class</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-8 uppercase tracking-widest text-xs">Visit Our Campus</h5>
            <div className="h-40 w-full rounded-2xl overflow-hidden bg-gray-800 mb-6 relative group cursor-pointer">
              {mapImage && (
                <Image
                  alt="Lagos Map"
                  className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
                  src={mapImage.imageUrl}
                  fill
                  data-ai-hint={mapImage.imageHint}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="text-accent text-4xl" />
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              12/14, Ademolu Adefuye,<br />
              Off Davies Street,<br />
              Alapere, Ketu, Lagos State, Nigeria.
            </p>
          </div>
        </div>
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <p>© 2026 VOSEM INTERNATIONAL. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-10 mt-6 md:mt-0">
            <Link className="hover:text-white transition-colors" href="#">Privacy</Link>
            <Link className="hover:text-white transition-colors" href="#">Terms</Link>
            <Link className="hover:text-white transition-colors" href="#contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
