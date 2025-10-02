import Navbar from "../features/landing/components/Navbar";
import Hero from "../features/landing/components/Hero";
import Features from "../features/landing/components/Features";
import CTA from "../features/landing/components/CTA";
import Testimonials from "../features/landing/components/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <footer className="border-t mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-500 flex items-center justify-between">
          <p>© {new Date().getFullYear()} Remote Work Collaboration Suite</p>
          <div className="flex gap-4">
            <a className="hover:underline" href="#">Privacy</a>
            <a className="hover:underline" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
