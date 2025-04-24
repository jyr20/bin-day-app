module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse-red': 'pulse-red 2s infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { borderColor: '#f87171' },
          '50%': { borderColor: '#fca5a5' },
        },
      },
    },
  },
}
