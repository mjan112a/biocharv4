/**
 * Icons Library Registry
 *
 * This library now loads icons from a JSON configuration file for easier management.
 * To add new icons, edit: public/data/icons-registry.json
 */

export interface IconDefinition {
  name: string;
  path: string;
  keywords?: string[]; // For search
}

export interface IconCategory {
  name: string;
  icon: string; // Emoji for category tab
  icons: IconDefinition[];
}

interface IconRegistryJSON {
  categories: Array<{
    name: string;
    icon: string;
    icons: Array<{
      name: string;
      file: string;
      keywords: string;
    }>;
  }>;
}

// Cache for loaded icons
let cachedLibrary: IconCategory[] | null = null;

/**
 * Load icons from JSON registry
 */
async function loadIconsFromRegistry(): Promise<IconCategory[]> {
  if (cachedLibrary) {
    return cachedLibrary;
  }

  try {
    const response = await fetch('/data/icons-registry.json');
    if (!response.ok) {
      throw new Error('Failed to load icons registry');
    }
    
    const registry: IconRegistryJSON = await response.json();
    
    // Transform JSON format to IconCategory format
    cachedLibrary = registry.categories.map(category => ({
      name: category.name,
      icon: category.icon,
      icons: category.icons.map(icon => ({
        name: icon.name,
        path: `/images/iconslibrary/${icon.file}`,
        keywords: icon.keywords.split(',').map(k => k.trim()),
      })),
    }));
    
    return cachedLibrary;
  } catch (error) {
    console.error('Error loading icons registry:', error);
    // Return empty array as fallback
    return [];
  }
}

/**
 * Get the icons library (async)
 */
export async function getIconsLibrary(): Promise<IconCategory[]> {
  return await loadIconsFromRegistry();
}

/**
 * Synchronous version for backwards compatibility
 * Returns empty array if not loaded yet
 */
export const ICONS_LIBRARY: IconCategory[] = [];

/**
 * Get all icons flattened (useful for search)
 */
export async function getAllIcons(): Promise<IconDefinition[]> {
  const library = await getIconsLibrary();
  return library.flatMap(category => category.icons);
}

/**
 * Search icons by name or keywords
 */
export async function searchIcons(query: string): Promise<IconDefinition[]> {
  const allIcons = await getAllIcons();
  if (!query.trim()) return allIcons;
  
  const lowerQuery = query.toLowerCase();
  return allIcons.filter(icon => {
    const nameMatch = icon.name.toLowerCase().includes(lowerQuery);
    const keywordMatch = icon.keywords?.some(keyword =>
      keyword.toLowerCase().includes(lowerQuery)
    );
    return nameMatch || keywordMatch;
  });
}

/**
 * Get icon by path
 */
export async function getIconByPath(path: string): Promise<IconDefinition | undefined> {
  const allIcons = await getAllIcons();
  return allIcons.find(icon => icon.path === path);
}