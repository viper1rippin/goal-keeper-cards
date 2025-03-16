
// Collection of emerald-toned gradients for cards
export const gradientVariations = [
  "from-emerald-dark/30 to-apple-dark",
  "from-emerald-dark/40 to-emerald/10",
  "from-emerald/15 to-apple-dark",
  "from-emerald-light/15 to-apple-dark",
  "from-emerald/10 to-emerald-dark/25",
  "from-emerald-dark/35 to-emerald/15",
];

// Collection of progress bar gradients
export const progressGradientVariations = [
  "from-emerald to-emerald-light",
  "from-emerald-light to-emerald",
  "from-emerald-dark to-emerald",
  "from-emerald to-emerald-dark",
  "from-emerald-light/90 to-emerald",
  "from-emerald/90 to-emerald-light",
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
