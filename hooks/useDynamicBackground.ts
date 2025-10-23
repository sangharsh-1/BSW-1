
import { useEffect } from 'react';

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const interpolateColor = (color1: {r: number, g: number, b: number}, color2: {r: number, g: number, b: number}, factor: number) => {
  const result = { ...color1 };
  result.r = Math.round(result.r + factor * (color2.r - result.r));
  result.g = Math.round(result.g + factor * (color2.g - result.g));
  result.b = Math.round(result.b + factor * (color2.b - result.b));
  return `rgb(${result.r}, ${result.g}, ${result.b})`;
};

const useDynamicBackground = () => {
  useEffect(() => {
    const startColor = hexToRgb('#fff8f0');
    const endColor = hexToRgb('#dbe7ff');

    const handleScroll = () => {
      if (!startColor || !endColor) return;

      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;
      let scrollFraction = scrollY / scrollMax;

      if (scrollFraction > 1) scrollFraction = 1;
      if (isNaN(scrollFraction)) scrollFraction = 0;

      const currentStart = interpolateColor(startColor, endColor, scrollFraction);
      const currentEnd = interpolateColor(startColor, endColor, scrollFraction + 0.2); // End color changes faster

      document.body.style.setProperty('--gradient-start', currentStart);
      document.body.style.setProperty('--gradient-end', currentEnd);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
};

export default useDynamicBackground;