
import type { LucideIcon } from 'lucide-react';
import { icons, Settings } from 'lucide-react'; // Import the 'icons' object and a fallback

export const getLucideIcon = (name: string | undefined | null): LucideIcon => {
  if (!name) {
    // console.warn('getLucideIcon called with no name, returning fallback Settings icon.');
    return Settings; // Return a default fallback icon component
  }
  
  // Ensure the name is in PascalCase as expected by lucide-react's icons object
  const pascalCaseName = name.charAt(0).toUpperCase() + name.slice(1);
  
  const IconComponent = icons[pascalCaseName as keyof typeof icons];
  
  if (IconComponent) {
    return IconComponent;
  }
  
  console.warn(`Icon "${pascalCaseName}" (from input "${name}") not found in lucide-react icons object. Returning fallback Settings icon.`);
  return Settings; // Return a default fallback icon component if not found
};
