import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        motion: '#4C97FF',
        looks: '#9966FF',
        sound: '#CF63CF',
        events: '#FFBF00',
        control: '#FFAB19',
        sensing: '#5CB1D6',
        operators: '#59C059',
        variables: '#FF8C1A',
        app: {
          background: '#F9F7F3',
          panel: '#FFFFFF',
          border: '#E2E0DC',
          primary: '#4C6EF5',
          text: '#2D2D2D',
          secondaryText: '#6B7280',
          success: '#22C55E',
          stop: '#EF4444',
          cosmo: '#06B6D4',
        },
      },
      spacing: {
        'block-h': '40px',
        'block-gap': '4px',
        'palette-w': '200px',
        'stage-w': '480px',
        'stage-h': '360px',
        'toolbar-h': '48px',
        'chatbar-h': '120px',
      },
      borderRadius: {
        block: '8px',
        panel: '0px',
        button: '6px',
        input: '6px',
        reporter: '999px',
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
}

export default config
