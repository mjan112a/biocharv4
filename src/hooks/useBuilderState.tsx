'use client';

import { useState, useCallback } from 'react';
import { BuilderNode, BuilderLink, EditorMode, SelectedItem, DiagramData, DiagramConfig } from '@/types/builder';
import { DiagramTheme } from '@/types/builder-theme';
import { defaultTheme } from '@/lib/themePresets';

const DEFAULT_CONFIG: DiagramConfig = {
  width: 1000,
  height: 1100,
  nodePadding: 20,
  nodeWidth: 80,
  circularLinkGap: 20,
};

export function useBuilderState() {
  const [mode, setMode] = useState<EditorMode>('edit');
  const [nodes, setNodes] = useState<BuilderNode[]>([]);
  const [links, setLinks] = useState<BuilderLink[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [config, setConfig] = useState<DiagramConfig>(DEFAULT_CONFIG);
  const [currentTheme, setCurrentTheme] = useState<DiagramTheme>(defaultTheme);

  // Generate unique ID
  const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add a new node
  const addNode = useCallback((x?: number, y?: number) => {
    const newNode: BuilderNode = {
      id: generateId('node'),
      name: `Node ${nodes.length + 1}`,
      x: x ?? config.width / 2,
      y: y ?? config.height / 2,
      color: '#3B82F6', // Default blue
      width: config.nodeWidth,
      height: 50,
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedItem({ type: 'node', id: newNode.id });
    return newNode.id;
  }, [nodes.length, config.width, config.height, config.nodeWidth]);

  // Update a node
  const updateNode = useCallback((id: string, updates: Partial<BuilderNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, ...updates } : node
    ));
  }, []);

  // Delete a node and its connected links
  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(node => node.id !== id));
    setLinks(prev => prev.filter(link => link.source !== id && link.target !== id));
    if (selectedItem?.type === 'node' && selectedItem.id === id) {
      setSelectedItem(null);
    }
  }, [selectedItem]);

  // Add a new link
  const addLink = useCallback((sourceId: string, targetId: string) => {
    // Prevent duplicate links
    const exists = links.some(link => 
      link.source === sourceId && link.target === targetId
    );
    if (exists) return null;

    const newLink: BuilderLink = {
      id: generateId('link'),
      source: sourceId,
      target: targetId,
      value: 10, // Default thickness
      color: '#6B7280', // Default gray
    };
    setLinks(prev => [...prev, newLink]);
    setSelectedItem({ type: 'link', id: newLink.id });
    return newLink.id;
  }, [links]);

  // Update a link
  const updateLink = useCallback((id: string, updates: Partial<BuilderLink>) => {
    setLinks(prev => prev.map(link => 
      link.id === id ? { ...link, ...updates } : link
    ));
  }, []);

  // Delete a link
  const deleteLink = useCallback((id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
    if (selectedItem?.type === 'link' && selectedItem.id === id) {
      setSelectedItem(null);
    }
  }, [selectedItem]);

  // Toggle connection mode
  const toggleConnectionMode = useCallback(() => {
    setConnectionMode(prev => !prev);
    setConnectionStart(null);
  }, []);

  // Handle node click in connection mode
  const handleConnectionClick = useCallback((nodeId: string) => {
    if (!connectionMode) return false;
    
    if (!connectionStart) {
      // First click - set source
      setConnectionStart(nodeId);
      return true;
    } else if (connectionStart === nodeId) {
      // Clicking same node - cancel
      setConnectionStart(null);
      return true;
    } else {
      // Second click - create connection
      addLink(connectionStart, nodeId);
      setConnectionStart(null);
      setConnectionMode(false);
      return true;
    }
  }, [connectionMode, connectionStart, addLink]);

  // Cancel connection
  const cancelConnection = useCallback(() => {
    setConnectionMode(false);
    setConnectionStart(null);
  }, []);

  // Get selected node or link
  const getSelectedNode = useCallback(() => {
    if (selectedItem?.type === 'node') {
      return nodes.find(n => n.id === selectedItem.id);
    }
    return null;
  }, [selectedItem, nodes]);

  const getSelectedLink = useCallback(() => {
    if (selectedItem?.type === 'link') {
      return links.find(l => l.id === selectedItem.id);
    }
    return null;
  }, [selectedItem, links]);

  // Export diagram data
  const exportData = useCallback((): DiagramData => {
    return { nodes, links, config };
  }, [nodes, links, config]);

  // Import diagram data
  const importData = useCallback((data: DiagramData) => {
    setNodes(data.nodes);
    setLinks(data.links);
    setConfig(data.config || DEFAULT_CONFIG);
    setSelectedItem(null);
    setConnectionMode(false);
    setConnectionStart(null);
  }, []);

  // Clear all data
  const clearAll = useCallback(() => {
    setNodes([]);
    setLinks([]);
    setSelectedItem(null);
    setConnectionMode(false);
    setConnectionStart(null);
  }, []);

  // Update current theme
  const updateTheme = useCallback((theme: DiagramTheme) => {
    setCurrentTheme(theme);
  }, []);

  return {
    // State
    mode,
    nodes,
    links,
    selectedItem,
    connectionMode,
    connectionStart,
    config,
    currentTheme,
    
    // Actions
    setMode,
    addNode,
    updateNode,
    deleteNode,
    addLink,
    updateLink,
    deleteLink,
    setSelectedItem,
    toggleConnectionMode,
    handleConnectionClick,
    cancelConnection,
    getSelectedNode,
    getSelectedLink,
    exportData,
    importData,
    clearAll,
    updateTheme,
  };
}