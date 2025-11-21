'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { DiagramUploadModalProps, DiagramCardFormData } from '@/types/homepage';
import { DiagramData } from '@/types/builder';

/**
 * DiagramUploadModal Component
 * 
 * Modal dialog for uploading new diagram cards to the homepage.
 * Handles file upload, validation, and form submission for adding new diagrams.
 */
export default function DiagramUploadModal({
  isOpen,
  onClose,
  onSave,
}: DiagramUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<DiagramCardFormData>({
    title: '',
    description: '',
    file: null,
    order: 1,
    visible: true,
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      file: null,
      order: 1,
      visible: true,
    });
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.json')) {
      setValidationError('Please select a valid JSON file');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Read and validate the JSON file
      const text = await file.text();
      const data = JSON.parse(text) as DiagramData;

      // Validate required structure
      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error('Invalid diagram format: missing nodes array');
      }
      if (!data.links || !Array.isArray(data.links)) {
        throw new Error('Invalid diagram format: missing links array');
      }
      if (!data.config || typeof data.config !== 'object') {
        throw new Error('Invalid diagram format: missing config object');
      }

      // Validation passed
      setFormData(prev => ({ ...prev, file }));
      
      // Auto-populate title from filename if empty
      if (!formData.title) {
        const filename = file.name.replace('.json', '').replace(/[-_]/g, ' ');
        const title = filename
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setFormData(prev => ({ ...prev, title }));
      }
    } catch (err) {
      console.error('Error validating diagram file:', err);
      setValidationError(
        err instanceof Error ? err.message : 'Invalid JSON file format'
      );
      setFormData(prev => ({ ...prev, file: null }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Handle form field changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value,
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      visible: e.target.checked,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.title.trim()) {
      setValidationError('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      setValidationError('Please enter a description');
      return;
    }
    if (!formData.file) {
      setValidationError('Please select a diagram file');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      // Step 1: Upload the diagram file
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);

      const uploadResponse = await fetch('/api/diagrams/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      const uploadData = await uploadResponse.json();

      // Step 2: Add card to configuration
      const configResponse = await fetch('/api/diagrams/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          diagramPath: uploadData.path,
          order: formData.order,
          visible: formData.visible,
        }),
      });

      if (!configResponse.ok) {
        const error = await configResponse.json();
        throw new Error(error.error || 'Failed to update configuration');
      }

      // Success - call onSave callback
      const cardData = await configResponse.json();
      await onSave(cardData.card);

      // Reset and close
      resetForm();
      onClose();
      
      // Refresh the page to show new card
      window.location.reload();
    } catch (err) {
      console.error('Error saving diagram:', err);
      setValidationError(
        err instanceof Error ? err.message : 'Failed to save diagram'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close with confirmation if form has data
  const handleClose = () => {
    if (formData.title || formData.description || formData.file) {
      if (confirm('Discard unsaved changes?')) {
        resetForm();
        onClose();
      }
    } else {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200 sticky top-0">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Add New Diagram Card</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Display */}
          {validationError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <span className="text-red-500 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-red-800 font-medium">Validation Error</p>
                <p className="text-red-600 text-sm">{validationError}</p>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagram File <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="diagram-file-input"
                disabled={isSubmitting}
              />
              <label
                htmlFor="diagram-file-input"
                className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors text-center"
              >
                {isValidating ? (
                  <span className="text-gray-600">Validating...</span>
                ) : formData.file ? (
                  <span className="text-green-600 font-medium">
                    ✓ {formData.file.name}
                  </span>
                ) : (
                  <span className="text-gray-600">
                    Click to select JSON file or drag and drop
                  </span>
                )}
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Upload a diagram exported from the Sankey Builder
            </p>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Complete Biochar System - January 2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this diagram and what it shows..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              required
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Describe what this diagram shows and any key highlights
            </p>
          </div>

          {/* Display Order */}
          <div className="mb-6">
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Lower numbers appear first (1 = top position)
            </p>
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="visible"
                checked={formData.visible}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-gray-700">
                Make this diagram visible on homepage
              </span>
            </label>
            <p className="mt-1 ml-6 text-xs text-gray-500">
              You can hide diagrams without deleting them
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting || !formData.file}
            >
              {isSubmitting ? 'Adding...' : 'Add Diagram'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}