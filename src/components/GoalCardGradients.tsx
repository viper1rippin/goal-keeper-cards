
// Collection of emerald-toned gradients for cards with improved brilliance
export const gradientVariations = [
  "from-emerald-dark/40 to-emerald-light/30",
  "from-emerald/50 to-emerald-dark/70",
  "from-emerald-light/40 to-emerald/60",
  "from-emerald/60 to-emerald-light/30",
  "from-emerald-dark/50 to-emerald-light/25",
  "from-emerald/50 to-emerald-dark/40",
];

// Collection of progress bar gradients with enhanced vibrancy
export const progressGradientVariations = [
  "from-emerald to-emerald-light/90",
  "from-emerald-light to-emerald/90",
  "from-emerald-dark to-emerald/95",
  "from-emerald to-emerald-dark/90",
  "from-emerald-light to-emerald/80",
  "from-emerald/90 to-emerald-light/80",
];

// Generate a consistent gradient for each card based on the title
export const getCardGradient = (title: string) => {
  // Use the title to create a deterministic but seemingly random index
  const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const gradientIndex = charSum % gradientVariations.length;
  return gradientVariations[gradientIndex];
};

// Generate a consistent gradient for each progress bar based on the title
export const getProgressGradient = (title: string) => {
  const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const gradientIndex = charSum % progressGradientVariations.length;
  return progressGradientVariations[gradientIndex];
};
