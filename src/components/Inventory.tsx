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

export function Inventory() {
  const [showInventory, setShowInventory] = useAtom(ShowInventoryAtom);
  const [inventoryItems, setInventoryItems] = useAtom(InventoryItemsAtom);
  const [sidePanelMode] = useAtom(InventorySidePanelModeAtom);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

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

  const baseClasses = sidePanelMode 
    ? "fixed right-0 top-0 h-full w-96 bg-base-100 shadow-xl border-l border-base-300 z-40 flex flex-col"
    : "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50";

  const contentClasses = sidePanelMode
    ? "flex flex-col h-full"
    : "bg-base-100 rounded-2xl shadow-2xl w-11/12 max-w-6xl max-h-[90vh] flex flex-col";

  return (
    <div className={baseClasses}>
      {!sidePanelMode && <div className="absolute inset-0" onClick={() => setShowInventory(false)} />}
      
      <div className={contentClasses}>
        {/* Header */}
        <div className="p-6 border-b border-base-300 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Inventory</h2>
            <p className="text-sm opacity-70">{inventoryItems.length} items total</p>
          </div>
          <button 
            onClick={() => setShowInventory(false)}
            className="btn btn-circle btn-ghost"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Filters */}
        <div className="p-6 border-b border-base-300 flex-shrink-0">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search by label or tag..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div className="flex gap-2">
              <select 
                className="select select-bordered flex-1"
                value={filterCategory || ''}
                onChange={(e) => setFilterCategory(e.target.value || null)}
              >
                <option value="">All Categories</option>
                {categories.map((category, i) => (
                  <option key={i} value={category}>{category}</option>
                ))}
              </select>
              
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setFilterCategory(null);
                  setSearchTerm('');
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-auto flex-1 p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center p-8 opacity-70">
              {inventoryItems.length === 0 
                ? "No items in inventory. Save items from detected objects to see them here."
                : "No items match your filters."}
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
                />
              ))}
            </div>
          )}
        </div>
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
}

function InventoryCard({ item, onDelete, onUpdate, isEditing, onStartEdit, onStopEdit, sidePanelMode }: InventoryCardProps) {
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
              className="btn btn-ghost btn-circle btn-sm text-error"
              title="Delete item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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