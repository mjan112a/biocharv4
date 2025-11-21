/**
 * Types for Homepage Dynamic Diagram Cards
 */

/**
 * Configuration for a single diagram card on the homepage
 */
export interface DiagramCard {
  id: string;
  title: string;
  description: string;
  diagramPath: string; // Path to the JSON file in /data/diagrams/
  order: number; // Display order (lower numbers appear first)
  visible: boolean; // Whether the card is shown
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Complete homepage diagrams configuration
 */
export interface HomepageDiagramsConfig {
  cards: DiagramCard[];
  version: string;
  lastUpdated: string; // ISO 8601 timestamp
}

/**
 * Props for DiagramCard component
 */
export interface DiagramCardProps {
  card: DiagramCard;
  editMode?: boolean;
  onEdit?: (card: DiagramCard) => void;
  onDelete?: (cardId: string) => void;
  onToggleVisibility?: (cardId: string) => void;
}

/**
 * Props for DiagramManager component
 */
export interface DiagramManagerProps {
  editMode?: boolean;
}

/**
 * Props for DiagramUploadModal component
 */
export interface DiagramUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<DiagramCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

/**
 * Form data for creating/editing a diagram card
 */
export interface DiagramCardFormData {
  title: string;
  description: string;
  file: File | null;
  order: number;
  visible: boolean;
}