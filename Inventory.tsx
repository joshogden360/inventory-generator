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
import {InventoryItemsAtom, ShowInventoryAtom} from './atoms';
import {InventoryItemType} from './Types';

export function Inventory() {
  const [showInventory, setShowInventory] = useAtom(ShowInventoryAtom);
  const [inventoryItems, setInventoryItems] = useAtom(InventoryItemsAtom);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!showInventory) {
    return null;
  }

  const categories = [...new Set(inventoryItems.map(item => item.category).filter(Boolean))];
  
  const filteredItems = inventoryItems.filter(item => {
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesSearch = !searchTerm || 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const handleDeleteItem = (id: string) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEditTags = (id: string, tags: string[]) => {
    setInventoryItems(prev => 
      prev.map(item => item.id === id ? {...item, tags} : item)
    );
  };

  const handleEditCategory = (id: string, category: string) => {
    setInventoryItems(prev => 
      prev.map(item => item.id === id ? {...item, category} : item)
    );
  };
  
  const handleEditNotes = (id: string, notes: string) => {
    setInventoryItems(prev => 
      prev.map(item => item.id === id ? {...item, notes} : item)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-11/12 max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Inventory Management</h2>
          <button 
            onClick={() => setShowInventory(false)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-4 flex gap-4 border-b">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by label or tag..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <select 
              className="w-full p-2 border rounded"
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map((category, i) => (
                <option key={i} value={category as string}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              className="bg-[#3B68FF] text-white px-4 py-2 rounded"
              onClick={() => setFilterCategory(null)}
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        <div className="overflow-auto flex-1 p-4">
          {filteredItems.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {inventoryItems.length === 0 
                ? "No items in inventory. Save items from detected objects to see them here."
                : "No items match your filters."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <InventoryCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDeleteItem}
                  onEditTags={handleEditTags}
                  onEditCategory={handleEditCategory}
                  onEditNotes={handleEditNotes}
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
  onEditTags: (id: string, tags: string[]) => void;
  onEditCategory: (id: string, category: string) => void;
  onEditNotes: (id: string, notes: string) => void;
}

function InventoryCard({ item, onDelete, onEditTags, onEditCategory, onEditNotes }: InventoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editCategory, setEditCategory] = useState(item.category || '');
  const [editNotes, setEditNotes] = useState(item.notes || '');

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const tags = [...(item.tags || []), newTag.trim()];
    onEditTags(item.id, tags);
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    const tags = (item.tags || []).filter(t => t !== tag);
    onEditTags(item.id, tags);
  };

  const handleSaveCategory = () => {
    onEditCategory(item.id, editCategory);
    onEditNotes(item.id, editNotes);
    setIsEditing(false);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center p-2">
        <img 
          src={item.imageUrl} 
          alt={item.label}
          className="object-contain max-h-full max-w-full"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{item.label}</h3>
          <div className="flex gap-1">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Edit details"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
            <button 
              onClick={() => onDelete(item.id)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Delete item"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {isEditing ? (
          <div className="mb-3 space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Category</label>
              <input
                type="text"
                placeholder="Category"
                className="w-full p-1.5 border rounded text-sm"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Notes</label>
              <textarea
                placeholder="Add notes about this item"
                className="w-full p-1.5 border rounded text-sm resize-none"
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Add Tag</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add tag"
                  className="flex-1 p-1.5 border rounded text-sm"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button 
                  onClick={handleAddTag}
                  className="bg-[#3B68FF] text-white px-2 py-1 rounded text-xs"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleSaveCategory}
                className="bg-[#3B68FF] text-white px-4 py-1.5 rounded text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span> {item.category || 'None'}
              </div>
              
              {item.notes && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span> {item.notes}
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Added: {new Date(item.dateAdded).toLocaleDateString()}
              </div>
              {item.metadata && (
                <div className="space-y-1 text-xs mt-2">
                  {item.metadata.brand && (
                    <div>
                      <span className="font-medium">Brand:</span> {item.metadata.brand}
                    </div>
                  )}
                  {item.metadata.condition && (
                    <div>
                      <span className="font-medium">Condition:</span> {item.metadata.condition}
                    </div>
                  )}
                  {item.metadata.resaleValue && (
                    <div>
                      <span className="font-medium">Resale:</span> {item.metadata.resaleValue}
                    </div>
                  )}
                  {item.metadata.manufacturerWebsite && (
                    <div>
                      <a
                        href={item.metadata.manufacturerWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  {item.metadata.warrantyInfo && (
                    <div>
                      <span className="font-medium">Warranty:</span> {item.metadata.warrantyInfo}
                    </div>
                  )}
                  {item.metadata.description && (
                    <div>{item.metadata.description}</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        
        {(item.tags?.length || 0) > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags?.map((tag, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5 text-xs flex items-center gap-1">
                {tag}
                {isEditing && (
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="w-3 h-3 flex items-center justify-center text-gray-500 hover:text-red-500"
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