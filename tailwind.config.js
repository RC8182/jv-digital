/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        metal: '#14A8CD',
        gpt_blue: '#1B4AEF',
        verde1: '#0bccf6',
        logo1: '#05fcf8',
        logo2: '#0c96f7',
        primary: '#3c72fc',
        secondary: '#0f0d1d',
        'primary-10': 'rgba(60, 114, 252, 0.1)',
        gradientBg: 'linear-gradient(90deg, #3c72fc -10.59%, #00060c 300.59%)',
        mainBg: '#ffffff',
        subBg: '#f3f7fb',
        headingColor: '#0f0d1d',
        paragraph: '#585858',
        span: '#585858',
        borderColor: '#e3e3e3',
        white: '#ffffff',
        black: '#000000',
        darkMainBg: '#151327',
        darkSubBg: '#16142c',
        darkHeadingColor: '#fff',
        darkParagraph: 'rgba(255, 255, 255, 0.8)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        inter: ['var(--font-inter)'],
        mono: ['var(--font-roboto-mono)'],
        dancing: ['var(--dancing-script)'],
        kumbh: ['Kumbh Sans', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse': 'spin 20s linear infinite reverse',
        sway: 'sway 3s linear infinite alternate',
        swayX: 'swayX 3s linear infinite alternate',
        swayY: 'swayY 3s linear infinite alternate',
      },
      boxShadow: {
        custom: '0px 4px 25px 0px #0000000f',
      },
      transitionProperty: {
        'width-height': 'width 0.3s ease-in-out, height 0.3s ease-in-out',
      },
      keyframes: {
        sway: {
          '0%': { transform: 'translateX(-20px)' },
          '100%': { transform: 'translateX(0)' },
        },
        swayX: {
          '0%': { transform: 'translateX(20px)' },
          '100%': { transform: 'translateX(0)' },
        },
        swayY: {
          '0%': { transform: 'translateY(20px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      transformOrigin: {
        'center': 'center',
      },
    },
  },
  plugins: [],
};
