export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a1816',
        'dark-surface': '#24211f',
        'dark-surface-alt': '#2d2a27',
        'dark-border': '#3d3835',
        'dark-text': '#d6d1cb',
        'dark-text-muted': '#8c8680',
        'dark-accent': '#3d3835',
        'dark-accent-hover': '#4a4540',
        'risk-low': '#52a87c',
        'risk-low-bg': '#1a2f24',
        'risk-medium': '#bd9350',
        'risk-medium-bg': '#2f2a1a',
        'risk-high': '#bd6262',
        'risk-high-bg': '#2f1a1a',
        'blue-soft': '#6b9ac4',
        'blue-soft-bg': '#1a2530',
        'amber-soft': '#c9a962',
        'amber-soft-bg': '#302a1a',
        'emerald-soft': '#52a87c',
        'emerald-soft-bg': '#1a2f24',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
