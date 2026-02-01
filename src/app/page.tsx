import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import Events from '@/components/landing/events';
import Sermons from '@/components/landing/sermons';
import About from '@/components/landing/about';
import Testimonies from '@/components/landing/testimonies';
import Giving from '@/components/landing/giving';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Events />
        <Sermons />
        <About />
        <Testimonies />
        <Giving />
      </main>
      <Footer />
    </div>
  );
}
