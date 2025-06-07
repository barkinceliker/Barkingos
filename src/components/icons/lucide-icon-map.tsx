
import type { LucideIcon } from 'lucide-react';
// Import specific icons that might be problematic and the main 'icons' object
import { icons, Settings, Home as HomeIcon, User as UserIcon, Sparkles, Laptop, Lightbulb, Award, BookOpen, MessageSquare, Shield } from 'lucide-react';

export const getLucideIcon = (name: string | undefined | null): LucideIcon => {
  if (!name) {
    // console.warn('getLucideIcon called with no name, returning fallback Settings icon.');
    return Settings; // Return a default fallback icon component
  }
  
  // Ensure the name is in PascalCase as expected by lucide-react's icons object
  const pascalCaseName = name.charAt(0).toUpperCase() + name.slice(1);

  // Explicitly handle known common icons first to ensure they are found
  // These are based on your staticNavItems in Header.tsx
  switch (pascalCaseName) {
    case 'Home':
      return HomeIcon;
    case 'User':
      return UserIcon;
    case 'Sparkles':
      return Sparkles;
    case 'Laptop':
      return Laptop;
    case 'Lightbulb':
      return Lightbulb;
    case 'Award':
      return Award;
    case 'BookOpen':
      return BookOpen;
    case 'MessageSquare':
      return MessageSquare;
    case 'Shield': // For Admin Panel
      return Shield;
    // Add other frequently used icons here if needed
  }
  
  const IconComponent = icons[pascalCaseName as keyof typeof icons];
  
  if (IconComponent) {
    return IconComponent;
  }
  
  console.warn(`Icon "${pascalCaseName}" (from input "${name}") not found in lucide-react general 'icons' object. Returning fallback Settings icon.`);
  return Settings; // Return a default fallback icon component if not found
};
