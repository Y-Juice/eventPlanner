const COLORS = {
  primary: "#121212", // Dark background
  secondary: "#1e1e1e", // Slightly lighter dark shade for elements like the calendar
  text: "#FFFFFF",
  textSecondary: "#A0A0A0",
  accent: "#FDEE87", // Yellow, for highlights or primary actions

  // Card Colors
  cardYellow: "#FDEE87",
  cardPink: "#F5B8D5",
  cardBlue: "#AECBFA",
  cardGreen: "#BAF5BB",

  // Other UI
  lightGray: '#333',
  disabled: '#555',
  black: '#000',
  white: '#fff',
};

const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 20,
  padding: 16,

  // Font sizes
  h1: 32,
  h2: 24,
  h3: 18,
  body: 16,
  caption: 12,
};

const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold' as 'bold', fontFamily: 'AlanSans' },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold' as 'bold', fontFamily: 'AlanSans' },
  h3: { fontSize: SIZES.h3, fontWeight: 'bold' as 'bold', fontFamily: 'AlanSans' },
  body: { fontSize: SIZES.body, fontFamily: 'AlanSans' },
  caption: { fontSize: SIZES.caption, fontFamily: 'AlanSans' },
};

export { COLORS, FONTS, SIZES };

