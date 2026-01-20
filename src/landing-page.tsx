import { ArrowRight } from 'lucide-react';
import logoimg from './assets/Logo.png';

interface LandingPageProps {
  onNext: () => void;
}

export default function LandingPage({ onNext }: LandingPageProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Logo in top left */}
      <div className="absolute top-6 left-6 z-10">
        <div className="w-16 h-16 bg-white flex items-center justify-center shadow-lg overflow-hidden">
          <img src={logoimg} alt="Logo" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Project Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-center">
          AI Photo Studio
        </h1>

        {/* Project Description */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl text-center">
          Transform your photos with artificial intelligence. 
          Create unique images, edit and enhance their quality.
        </p>

        {/* Interactive GIF Placeholder */}
        <div className="w-full max-w-2xl mb-12 flex items-center justify-center">
          <div className="w-full aspect-video bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Placeholder for GIF - replace with actual GIF file */}
            <div className="text-white text-2xl font-medium">
              🎨 Interactive Demo
            </div>

          </div>
        </div>

        {/* Navigation Button */}
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white px-12 py-4 rounded-full text-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
        >
          <span>Get Started</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

