import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#22d3ee',
          fuchsia: '#e879f9',
          emerald: '#34d399',
          lime: '#a3e635'
        }
      },
      boxShadow: {
        neon: '0 0 20px rgba(34,211,238,0.45)',
        'neon-emerald': '0 0 20px rgba(52,211,153,0.4)',
        'neon-fuchsia': '0 0 20px rgba(232,121,249,0.45)'
      }
    }
  },
  plugins: []
};
export default config;
