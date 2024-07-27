'use client'
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function ProgressSlider({ list }) {
  const duration = 5000;
  const itemsRef = useRef(null);
  const frame = useRef(0);
  const firstFrameTime = useRef(performance.now());
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const sliderList=list;


  useEffect(() => {
    firstFrameTime.current = performance.now();
    frame.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, [active]);

  const animate = now => {
    let timeFraction = (now - firstFrameTime.current) / duration;
    if (timeFraction <= 1) {
      setProgress(timeFraction * 100);
      frame.current = requestAnimationFrame(animate);
    } else {
      timeFraction = 1;
      setProgress(0);
      setActive((active + 1) % sliderList.length);
    }
  };

  return (
    <div className="w-full xl:w-screen text-center">
      {/* Item image */}
      <div className="transition-all duration-150 delay-300 ease-in-out">
        <div className="flex flex-col" ref={itemsRef}>
          {sliderList &&
            sliderList.map((e, index) => (
              <div
                key={index}
                className={` ${
                  active === index
                    ? 'transition ease-in-out duration-500 delay-200 order-first opacity-100 scale-100'
                    : 'transition ease-in-out duration-300 absolute opacity-0 scale-95'
                }`}
              >
                <Image
                  src={e.src}
                  alt={e.alt}
                  width={1000}
                  height={1000}
                  loading="lazy"
                  className="relative object-cover w-full h-full"
                />
              </div>
            ))}
        </div>
      </div>
      {/* Buttons */}
      <div className="max-w-xs sm:max-w-sm md:max-w-3xl mx-auto grid grid-cols-3 md:grid-cols-3 gap-4">
        {sliderList &&
          sliderList.map((item, index) => (
            <button
              key={index}
              title="slider button"
              className="p-2 rounded focus:outline-none focus-visible:ring focus-visible:ring-indigo-300 group"
              onClick={() => {
                setActive(index);
                setProgress(0);
              }}
            >
              <span
                className={`text-center flex flex-col sliderList-center ${
                  active === index
                    ? ''
                    : 'opacity-50 group-hover:opacity-100 group-focus:opacity-100 transition-opacity'
                }`}
              >
                <span className="block text-sm font-medium text-slate-900 mb-2">{item.desc}</span>
                <span
                  className="block relative w-full bg-slate-200 h-1 rounded-full"
                  role="progressbar"
                  aria-valuenow={active === index ? progress : 0}
                  title="slider progress"
                >
                  <span
                    className="absolute inset-0 bg-orange-500 rounded-[inherit]"
                    style={{ width: active === index ? `${progress}%` : '0%' }}
                  ></span>
                </span>
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
