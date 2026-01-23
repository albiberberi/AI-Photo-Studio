import { useEffect, useRef } from 'react';
import logoimg from './assets/Logo.png';
import beforeImage from './assets/before.png';
import afterImage from './assets/after.png';

// Declare BeerSlider type for TypeScript
declare global {
    interface Window {
        BeerSlider: new (element: HTMLElement) => void;
    }
}

interface LandingPageProps {
  onNext: () => void;
}

export default function LandingPage({ onNext }: LandingPageProps) {
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load ImgSlider CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/beerslider@1.0.3/dist/BeerSlider.css';
        document.head.appendChild(link);

        // Load ImgSlider JS
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/beerslider@1.0.3/dist/BeerSlider.js';
        script.async = true;

        script.onload = () => {
            if (sliderRef.current && window.BeerSlider) {
                new window.BeerSlider(sliderRef.current);
            }
        };

        document.body.appendChild(script);

        return () => {
            document.head.removeChild(link);
            document.body.removeChild(script);
        };
    }, []);

  return (
    <div className="relative w-full h-screen bg-white flex items-center justify-center">
      {/* Logo in top left */}
        <div className="absolute top-0 left-0">
          <img src={logoimg} alt="Logo" className="w-24 h-24 object-cover" />
        </div>

      {/* Main Title */}
        <div
            className="absolute text-center"
            style={{
                top: '25px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '600px'
            }}
        >
            <h1
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '52px',
                  lineHeight: '60px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  margin: 0,
                
                }}
            >
                AI Photo Studio
            </h1>
        </div>



        {/* Project Description */}
        <div
            className="absolute text-center"
            style={{
                top: '110px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '550px'
            }}
        >
        <p
            className="font-normal text-gray-600"
            style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                lineHeight: '25px',
                height: '20px'
            }}
        >
          Transform your photos with artificial intelligence. 
          Create unique images, edit and enhance their quality.
        </p>
        </div>

        {/* ImgSlider */}
        <div
            className="absolute slider-glow"
            style={{
                width: '600px',
                height: '500px',
                left: '50%',
                top: '200px',
                transform: 'translateX(-50%)',
            }}
        >
            {/* Inner container */}
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#f8f8f8',
                }}
            >
                <div
                    ref={sliderRef}
                    className="beer-slider"
                    data-beer-label="after"
                >
                    <img src={afterImage} alt="After" />
                    <div className="beer-reveal" data-beer-label="before">
                        <img src={beforeImage} alt="Before" />
                    </div>
                </div>
            </div>
        </div>


        {/* Navigation Button */}
        <button
        onClick={onNext}
        className="
            absolute
            font-medium
            text-[#F5F5F5]
            flex items-center justify-center
            transition-all duration-200 ease-out
            hover:shadow-lg
            hover:-translate-y-[1px]
            active:translate-y-0
        "
        style={{
            width: '220px',
            height: '54px',
            left: '50%',
            top: '725px',
            transform: 'translateX(-50%)',

            background: '#4A413C', // глубокий коричневый
            borderRadius: '9999px',

            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            lineHeight: '22px',
            fontWeight: 500,
        }}
        >
        Get started
        </button>
      </div>
  );
}
