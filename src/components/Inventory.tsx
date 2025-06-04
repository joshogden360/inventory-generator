/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {useAtom} from 'jotai';
import {useState} from 'react';
import {InventoryItemsAtom, ShowInventoryAtom, InventorySidePanelModeAtom} from '../state/atoms';
import {InventoryItemType} from '../types/types';
import { CropModal } from './CropModal';

export function Inventory() {
  const [showInventory, setShowInventory] = useAtom(ShowInventoryAtom);
  const [inventoryItems, setInventoryItems] = useAtom(InventoryItemsAtom);
  const [sidePanelMode] = useAtom(InventorySidePanelModeAtom);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropItem, setCropItem] = useState<InventoryItemType | null>(null);

  if (!showInventory) {
    return null;
  }

  const categories = [...new Set(inventoryItems.map(item => item.category).filter(Boolean))];
  
  const filteredItems = inventoryItems.filter(item => {
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesSearch = !searchTerm || 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const handleDeleteItem = (id: string) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id));
    if (editingItemId === id) {
      setEditingItemId(null);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<InventoryItemType>) => {
    setInventoryItems(prev => 
      prev.map(item => item.id === id ? {...item, ...updates} : item)
    );
  };

  const handleCropSave = (croppedData: { imageUrl: string; label: string; cropBox: any }) => {
    if (cropItem) {
      setInventoryItems(prev => prev.map(item =>
        item.id === cropItem.id
          ? { ...item, imageUrl: croppedData.imageUrl, label: croppedData.label, originalBox: croppedData.cropBox }
          : item
      ));
    }
    setShowCropModal(false);
    setCropItem(null);
  };

  const baseClasses = sidePanelMode 
    ? "fixed right-0 top-0 h-full w-96 bg-base-100 shadow-xl border-l border-base-300 z-40 flex flex-col"
    : "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50";

  const contentClasses = sidePanelMode
    ? "flex flex-col h-full"
    : "bg-base-100 rounded-2xl shadow-2xl w-11/12 max-w-6xl max-h-[90vh] flex flex-col";

  return (
    <div className="modal modal-open bg-black/80 backdrop-blur-sm z-50">
      <div className="modal-box max-w-6xl w-[95vw] max-h-[90vh] flex flex-col p-0 relative bg-gray-800 border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Smart Inventory</h2>
              <p className="text-sm text-gray-300">{inventoryItems.length} {inventoryItems.length === 1 ? 'item' : 'items'} cataloged</p>
            </div>
          </div>
          <button
            onClick={() => setShowInventory(false)}
            className="btn btn-circle btn-ghost text-white hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items..."
                className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                className="select select-bordered bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                value={filterCategory || ''}
                onChange={(e) => setFilterCategory(e.target.value || null)}
              >
                <option value="">All Categories</option>
                {categories.map((category, i) => (
                  <option key={i} value={category as string}>{category}</option>
                ))}
              </select>
              
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterCategory(null)}
                  className="btn btn-ghost btn-circle btn-sm text-gray-400 hover:bg-gray-700 hover:text-white"
                  title="Clear filters"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium mb-2 text-gray-300">No items found</h3>
                <p className="text-sm text-center max-w-md">
                  {inventoryItems.length === 0 
                    ? "Your inventory is empty. Start by uploading images and detecting items with AI."
                    : "No items match your current search and filter criteria."}
                </p>
              </div>
            ) : (
              <div className={`gap-4 ${sidePanelMode ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                {filteredItems.map((item) => (
                  <InventoryCard 
                    key={item.id} 
                    item={item} 
                    onDelete={handleDeleteItem}
                    onUpdate={handleUpdateItem}
                    isEditing={editingItemId === item.id}
                    onStartEdit={() => setEditingItemId(item.id)}
                    onStopEdit={() => setEditingItemId(null)}
                    sidePanelMode={sidePanelMode}
                    onCrop={() => { setCropItem(item); setShowCropModal(true); }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Side Panel for Item Details */}
          {editingItemId && (
            <div className="w-80 border-l border-gray-700 bg-gray-800 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">Item Details</h3>
                  <button
                    onClick={() => setEditingItemId(null)}
                    className="btn btn-ghost btn-circle btn-sm text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="aspect-square bg-black rounded-lg overflow-hidden border border-gray-600">
                  <img 
                    src={item.imageUrl} 
                    alt={item.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleUpdateItem(item.id, { label: e.target.value })}
                      className="input input-bordered w-full text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={item.category || ''}
                      onChange={(e) => handleUpdateItem(item.id, { category: e.target.value })}
                      className="input input-bordered w-full text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      placeholder="e.g., Kitchen, Electronics, Books"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                    <textarea
                      value={item.notes || ''}
                      onChange={(e) => handleUpdateItem(item.id, { notes: e.target.value })}
                      className="textarea textarea-bordered w-full text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      rows={3}
                      placeholder="Add any additional notes..."
                    />
                  </div>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="badge bg-blue-600 text-white border-blue-500 badge-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      Added: {new Date(item.dateAdded).toLocaleDateString([], { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingItemId(null)}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white border-blue-600 btn-sm flex-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="btn btn-ghost btn-sm text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Crop Modal */}
        <CropModal
          isOpen={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            setCropItem(null);
          }}
          box={cropItem?.originalBox}
          onSave={handleCropSave}
          initialLabel={cropItem?.label}
          initialImageUrl={cropItem?.imageUrl}
        />
      </div>
    </div>
  );
}

interface InventoryCardProps {
  item: InventoryItemType;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<InventoryItemType>) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  sidePanelMode: boolean;
  onCrop: () => void;
}

function InventoryCard({ item, onDelete, onUpdate, isEditing, onStartEdit, onStopEdit, sidePanelMode, onCrop }: InventoryCardProps) {
  const [newTag, setNewTag] = useState('');
  const [editCategory, setEditCategory] = useState(item.category || '');
  const [editNotes, setEditNotes] = useState(item.notes || '');

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const tags = [...(item.tags || []), newTag.trim()];
    onUpdate(item.id, {tags});
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    const tags = (item.tags || []).filter(t => t !== tag);
    onUpdate(item.id, {tags});
  };

  const handleSaveCategory = () => {
    onUpdate(item.id, {category: editCategory, notes: editNotes});
    onStopEdit();
  };

  return (
    <div className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all ${sidePanelMode ? 'w-full' : ''}`}>
      <figure className={`bg-base-200 ${sidePanelMode ? 'aspect-video' : 'aspect-square'} p-4`}>
        <img 
          src={item.imageUrl} 
          alt={item.label}
          className="object-contain max-h-full max-w-full"
        />
      </figure>
      
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <h3 className={`card-title ${sidePanelMode ? 'text-base' : 'text-lg'}`}>{item.label}</h3>
          <div className="flex gap-1">
            <button 
              onClick={isEditing ? onStopEdit : onStartEdit}
              className="btn btn-ghost btn-circle btn-sm"
              title={isEditing ? "Cancel editing" : "Edit details"}
            >
              {isEditing ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </button>
            <button 
              onClick={() => onDelete(item.id)}
              className="btn btn-error btn-circle btn-sm hover:btn-error/80"
              title="Delete item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              onClick={onCrop}
              className="btn btn-ghost btn-circle btn-sm"
              title="Crop/Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <input
                type="text"
                placeholder="Enter category"
                className="input input-bordered input-sm"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Notes</span>
              </label>
              <textarea
                placeholder="Add notes about this item"
                className="textarea textarea-bordered textarea-sm"
                rows={sidePanelMode ? 2 : 3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Add Tag</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter tag"
                  className="input input-bordered input-sm flex-1"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button 
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="btn btn-primary btn-sm"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="card-actions justify-end">
              <button 
                onClick={onStopEdit}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCategory}
                className="btn btn-primary btn-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium opacity-70">Category:</span> 
              <span className="ml-1">{item.category || 'None'}</span>
            </div>
            
            {item.notes && (
              <div>
                <span className="font-medium opacity-70">Notes:</span> 
                <span className="ml-1">{item.notes}</span>
              </div>
            )}
            
            <div className="text-xs opacity-60">
              Added: {new Date(item.dateAdded).toLocaleDateString()}
            </div>
            
            {item.metadata && (
              <div className="space-y-1 text-xs">
                {item.metadata.brand && (
                  <div><span className="font-medium">Brand:</span> {item.metadata.brand}</div>
                )}
                {item.metadata.condition && (
                  <div><span className="font-medium">Condition:</span> {item.metadata.condition}</div>
                )}
                {item.metadata.resaleValue && (
                  <div><span className="font-medium">Resale:</span> {item.metadata.resaleValue}</div>
                )}
                {item.metadata.manufacturerWebsite && (
                  <div>
                    <a
                      href={item.metadata.manufacturerWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      Website
                    </a>
                  </div>
                )}
                {item.metadata.warrantyInfo && (
                  <div><span className="font-medium">Warranty:</span> {item.metadata.warrantyInfo}</div>
                )}
                {item.metadata.description && (
                  <div className="opacity-70">{item.metadata.description}</div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Tags */}
        {(item.tags?.length || 0) > 0 && (
          <div className="card-actions mt-3">
            {item.tags?.map((tag: string, i: number) => (
              <div key={i} className="badge badge-primary badge-sm gap-1">
                {tag}
                {isEditing && (
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-xs hover:text-error"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 