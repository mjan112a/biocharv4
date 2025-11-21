// Sankey Flow Builder - Theme Management System

import { 
  DiagramTheme, 
  NodeThemeStyle, 
  LinkThemeStyle,
  StyledBuilderNode,
  StyledBuilderLink,
  ThemeAsset
} from '@/types/builder-theme';
import { defaultTheme } from './themePresets';

/**
 * Resolve node style with CSS-like cascade
 * Priority: defaults → type-based → per-item → inline override
 */
export function resolveNodeStyle(
  node: StyledBuilderNode,
  theme: DiagramTheme
): NodeThemeStyle {
  const baseStyle = theme.defaults.node;
  const typeStyle = node.type && theme.nodeTypes ? theme.nodeTypes[node.type] : {};
  const itemStyle = theme.nodeStyles[node.id] || {};
  const inlineStyle = node.styleOverride || {};
  
  return {
    ...baseStyle,
    ...typeStyle,
    ...itemStyle,
    ...inlineStyle
  } as NodeThemeStyle;
}

/**
 * Resolve link style with CSS-like cascade
 * Priority: defaults → type-based → per-item → inline override
 */
export function resolveLinkStyle(
  link: StyledBuilderLink,
  theme: DiagramTheme
): LinkThemeStyle {
  const baseStyle = theme.defaults.link;
  const typeStyle = link.type && theme.linkTypes ? theme.linkTypes[link.type] : {};
  const itemStyle = theme.linkStyles[link.id] || {};
  const inlineStyle = link.styleOverride || {};
  
  return {
    ...baseStyle,
    ...typeStyle,
    ...itemStyle,
    ...inlineStyle
  } as LinkThemeStyle;
}

/**
 * Get asset by ID from theme
 */
export function getAsset(theme: DiagramTheme, assetId: string): ThemeAsset | undefined {
  return theme.assets.find(a => a.id === assetId);
}

/**
 * Get asset path (handles both ID and direct path)
 */
export function getAssetPath(theme: DiagramTheme, assetIdOrPath?: string): string | undefined {
  if (!assetIdOrPath) return undefined;
  
  // Check if it's already a path (starts with / or http)
  if (assetIdOrPath.startsWith('/') || assetIdOrPath.startsWith('http')) {
    return assetIdOrPath;
  }
  
  // Otherwise, look it up as an asset ID
  const asset = getAsset(theme, assetIdOrPath);
  return asset?.path;
}

/**
 * Export theme to JSON string
 */
export function exportTheme(theme: DiagramTheme): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Import theme from JSON string
 */
export function importTheme(json: string): DiagramTheme {
  try {
    const theme = JSON.parse(json) as DiagramTheme;
    
    // Validate required fields
    if (!theme.id || !theme.name || !theme.defaults) {
      throw new Error('Invalid theme structure');
    }
    
    // Ensure defaults exist
    if (!theme.defaults.node || !theme.defaults.link || !theme.defaults.canvas) {
      throw new Error('Theme must include node, link, and canvas defaults');
    }
    
    // Set default values for optional fields
    theme.nodeStyles = theme.nodeStyles || {};
    theme.linkStyles = theme.linkStyles || {};
    theme.assets = theme.assets || [];
    theme.modified = new Date().toISOString();
    
    return theme;
  } catch (error) {
    throw new Error(`Failed to import theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new theme from defaults
 */
export function createTheme(name: string, description?: string): DiagramTheme {
  const now = new Date().toISOString();
  
  return {
    id: `custom-theme-${Date.now()}`,
    name,
    version: '1.0.0',
    description: description || `Custom theme: ${name}`,
    author: 'User',
    created: now,
    modified: now,
    tags: ['custom'],
    isBuiltIn: false,
    defaults: {
      ...defaultTheme.defaults
    },
    nodeStyles: {},
    linkStyles: {},
    nodeTypes: {},
    linkTypes: {},
    assets: []
  };
}

/**
 * Clone a theme with a new name
 */
export function cloneTheme(theme: DiagramTheme, newName: string): DiagramTheme {
  const now = new Date().toISOString();
  
  return {
    ...theme,
    id: `custom-theme-${Date.now()}`,
    name: newName,
    version: '1.0.0',
    description: `Cloned from ${theme.name}`,
    created: now,
    modified: now,
    isBuiltIn: false
  };
}

/**
 * Merge two themes (override takes precedence)
 */
export function mergeThemes(base: DiagramTheme, override: Partial<DiagramTheme>): DiagramTheme {
  return {
    ...base,
    ...override,
    defaults: {
      node: { ...base.defaults.node, ...override.defaults?.node },
      link: { ...base.defaults.link, ...override.defaults?.link },
      canvas: { ...base.defaults.canvas, ...override.defaults?.canvas }
    },
    nodeStyles: { ...base.nodeStyles, ...override.nodeStyles },
    linkStyles: { ...base.linkStyles, ...override.linkStyles },
    nodeTypes: { ...base.nodeTypes, ...override.nodeTypes },
    linkTypes: { ...base.linkTypes, ...override.linkTypes },
    assets: [...base.assets, ...(override.assets || [])],
    modified: new Date().toISOString()
  };
}

/**
 * Update theme defaults
 */
export function updateThemeDefaults(
  theme: DiagramTheme,
  defaults: {
    node?: Partial<NodeThemeStyle>;
    link?: Partial<LinkThemeStyle>;
    canvas?: Partial<typeof theme.defaults.canvas>;
  }
): DiagramTheme {
  return {
    ...theme,
    defaults: {
      node: { ...theme.defaults.node, ...defaults.node },
      link: { ...theme.defaults.link, ...defaults.link },
      canvas: { ...theme.defaults.canvas, ...defaults.canvas }
    },
    modified: new Date().toISOString()
  };
}

/**
 * Add or update node type style
 */
export function setNodeTypeStyle(
  theme: DiagramTheme,
  typeName: string,
  style: Partial<NodeThemeStyle>
): DiagramTheme {
  return {
    ...theme,
    nodeTypes: {
      ...theme.nodeTypes,
      [typeName]: { ...(theme.nodeTypes?.[typeName] || {}), ...style }
    },
    modified: new Date().toISOString()
  };
}

/**
 * Add or update link type style
 */
export function setLinkTypeStyle(
  theme: DiagramTheme,
  typeName: string,
  style: Partial<LinkThemeStyle>
): DiagramTheme {
  return {
    ...theme,
    linkTypes: {
      ...theme.linkTypes,
      [typeName]: { ...(theme.linkTypes?.[typeName] || {}), ...style }
    },
    modified: new Date().toISOString()
  };
}

/**
 * Set style for specific node
 */
export function setNodeStyle(
  theme: DiagramTheme,
  nodeId: string,
  style: Partial<NodeThemeStyle>
): DiagramTheme {
  return {
    ...theme,
    nodeStyles: {
      ...theme.nodeStyles,
      [nodeId]: { ...(theme.nodeStyles[nodeId] || {}), ...style }
    },
    modified: new Date().toISOString()
  };
}

/**
 * Set style for specific link
 */
export function setLinkStyle(
  theme: DiagramTheme,
  linkId: string,
  style: Partial<LinkThemeStyle>
): DiagramTheme {
  return {
    ...theme,
    linkStyles: {
      ...theme.linkStyles,
      [linkId]: { ...(theme.linkStyles[linkId] || {}), ...style }
    },
    modified: new Date().toISOString()
  };
}

/**
 * Add asset to theme
 */
export function addAsset(theme: DiagramTheme, asset: ThemeAsset): DiagramTheme {
  return {
    ...theme,
    assets: [...theme.assets, asset],
    modified: new Date().toISOString()
  };
}

/**
 * Remove asset from theme
 */
export function removeAsset(theme: DiagramTheme, assetId: string): DiagramTheme {
  return {
    ...theme,
    assets: theme.assets.filter(a => a.id !== assetId),
    modified: new Date().toISOString()
  };
}

/**
 * Update asset in theme
 */
export function updateAsset(theme: DiagramTheme, assetId: string, updates: Partial<ThemeAsset>): DiagramTheme {
  return {
    ...theme,
    assets: theme.assets.map(a => 
      a.id === assetId ? { ...a, ...updates } : a
    ),
    modified: new Date().toISOString()
  };
}

/**
 * Validate theme structure
 */
export function validateTheme(theme: DiagramTheme): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!theme.id) errors.push('Theme must have an ID');
  if (!theme.name) errors.push('Theme must have a name');
  if (!theme.version) errors.push('Theme must have a version');
  
  if (!theme.defaults) {
    errors.push('Theme must have defaults');
  } else {
    if (!theme.defaults.node) errors.push('Theme must have node defaults');
    if (!theme.defaults.link) errors.push('Theme must have link defaults');
    if (!theme.defaults.canvas) errors.push('Theme must have canvas defaults');
  }
  
  // Validate node styles
  if (theme.nodeTypes) {
    Object.keys(theme.nodeTypes).forEach(type => {
      if (type.trim() === '') {
        errors.push('Node type name cannot be empty');
      }
    });
  }
  
  // Validate link styles
  if (theme.linkTypes) {
    Object.keys(theme.linkTypes).forEach(type => {
      if (type.trim() === '') {
        errors.push('Link type name cannot be empty');
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Save theme to localStorage
 */
export function saveThemeToStorage(theme: DiagramTheme): void {
  try {
    const themes = getStoredThemes();
    const index = themes.findIndex(t => t.id === theme.id);
    
    if (index >= 0) {
      themes[index] = theme;
    } else {
      themes.push(theme);
    }
    
    localStorage.setItem('sankey-custom-themes', JSON.stringify(themes));
  } catch (error) {
    console.error('Failed to save theme:', error);
    throw new Error('Failed to save theme to storage');
  }
}

/**
 * Load theme from localStorage
 */
export function loadThemeFromStorage(themeId: string): DiagramTheme | null {
  try {
    const themes = getStoredThemes();
    return themes.find(t => t.id === themeId) || null;
  } catch (error) {
    console.error('Failed to load theme:', error);
    return null;
  }
}

/**
 * Get all stored custom themes
 */
export function getStoredThemes(): DiagramTheme[] {
  try {
    const stored = localStorage.getItem('sankey-custom-themes');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load themes:', error);
    return [];
  }
}

/**
 * Delete theme from localStorage
 */
export function deleteThemeFromStorage(themeId: string): void {
  try {
    const themes = getStoredThemes();
    const filtered = themes.filter(t => t.id !== themeId);
    localStorage.setItem('sankey-custom-themes', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete theme:', error);
    throw new Error('Failed to delete theme from storage');
  }
}

/**
 * Get all available themes (built-in + custom)
 */
export function getAllThemes(): DiagramTheme[] {
  const { themePresets } = require('./themePresets');
  const builtInThemes = themePresets.map((p: any) => p.theme);
  const customThemes = getStoredThemes();
  
  return [...builtInThemes, ...customThemes];
}