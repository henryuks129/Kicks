module.exports = {
 darkMode: 'class',
 content: ['./src/**/*.{js,jsx,ts,tsx}'],
 presets: [require('nativewind/preset')],
 theme: { extend: { fontFamily: { sans: ['Manrope'], display: ['Anton'] }, colors: {
  background: '#f4f1e9', foreground: '#191a17', primary: '#b84c26', muted: '#e8e6de', border: '#cfcec5', secondary: '#606158', forest: '#283e32',
 } } },
 plugins: [],
};
