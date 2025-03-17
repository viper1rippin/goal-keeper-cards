
// Collection of emerald-toned gradients for cards (dark mode)
export const gradientVariations = [
  "from-emerald-dark/30 to-apple-dark",
  "from-emerald-dark/40 to-emerald/10",
  "from-emerald/15 to-apple-dark",
  "from-emerald-light/15 to-apple-dark",
  "from-emerald/10 to-emerald-dark/25",
  "from-emerald-dark/35 to-emerald/15",
];

// Collection of ocean-gold gradients for light mode
export const lightModeGradientVariations = [
  "from-gold-light/40 to-ocean-light/20",
  "from-gold/30 to-ocean/15",
  "from-ocean-light/30 to-gold-light/15",
  "from-gold-light/35 to-gold/20",
  "from-ocean-light/25 to-ocean/10",
  "from-gold-dark/20 to-gold-light/30",
];

// Collection of progress bar gradients for dark mode
export const progressGradientVariations = [
  "from-emerald to-emerald-light",
  "from-emerald-light to-emerald",
  "from-emerald-dark to-emerald",
  "from-emerald to-emerald-dark",
  "from-emerald-light/90 to-emerald",
  "from-emerald/90 to-emerald-light",
];

// Collection of progress bar gradients for light mode
export const lightModeProgressGradientVariations = [
  "from-ocean to-ocean-light",
  "from-ocean-light to-ocean",
  "from-ocean-dark to-ocean",
  "from-gold-dark to-gold-light",
  "from-gold to-gold-light",
  "from-ocean-light to-gold-light",
];

// Generate a consistent gradient for each card based on the title
export const getCardGradient = (title: string) => {
  // Use the title to create a deterministic but seemingly random index
  const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const gradientIndex = charSum % gradientVariations.length;
  return gradientVariations[gradientIndex];
};

// Generate a consistent light mode gradient for each card based on the title
export const getLightModeCardGradient = (title: string) => {
  const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const gradientIndex = charSum % lightModeGradientVariations.length;
  return lightModeGradientVariations[gradientIndex];
};

// Generate a consistent gradient for each progress bar based on the title
export const getProgressGradient = (title: string) => {
  const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const gradientIndex = charSum % progressGradientVariations.length;
  return progressGradientVariations[gradientIndex];
};

// Generate a consistent light mode gradient for each progress bar based on the title
export const getLightModeProgressGradient = (title: string) => {
  const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const gradientIndex = charSum % lightModeProgressGradientVariations.length;
  return lightModeProgressGradientVariations[gradientIndex];
};
