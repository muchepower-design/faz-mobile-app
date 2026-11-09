module.exports = {
  content: ['./App.{js,jsx}', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF7F0', 100: '#D5ECDA', 500: '#198A35', 600: '#157A2E',
          700: '#0F5F23', 900: '#0A3D16',
        },
        fazorange: { 500: '#EF7E12', 600: '#D96E08' },
        fazred: { 500: '#CE1126', 600: '#B00E20' },
        ink: '#172033',
        muted: '#68738A',
        canvas: '#F5F7FB',
        success: '#16865B',
        danger: '#C63B45',
      },
    },
  },
  plugins: [],
};