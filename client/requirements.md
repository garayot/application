## Packages
recharts | For visualizing assessment scores (IES/CAR performance charts)
framer-motion | For smooth page transitions and step animations
lucide-react | Already in base, but emphasizing usage for all icons
date-fns | For formatting dates in tables and timelines
clsx | Utility for conditional classes
tailwind-merge | Utility for merging tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["Inter", "sans-serif"],
  display: ["Outfit", "sans-serif"],
}
Authentication uses cookie-based sessions (credentials: "include").
Uploads are mocked - frontend sends string paths like "/uploads/demo.pdf".
