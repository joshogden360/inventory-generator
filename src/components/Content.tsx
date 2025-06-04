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
import getStroke from 'perfect-freehand';
import {useCallback, useMemo, useRef, useState} from 'react';
import {ResizePayload, useResizeDetector} from 'react-resize-detector';
import {
  ActiveColorAtom,
  BoundingBoxes2DAtom,
  DetectTypeAtom,
  DrawModeAtom,
  ImageSentAtom,
  ImageSrcAtom,
  InventoryItemsAtom,
  LinesAtom,
  RevealOnHoverModeAtom,
  ShareStream,
  ShowInventoryAtom,
  VideoRefAtom,
} from '../state/atoms';
import {lineOptions} from '../utils/consts';
import {getSvgPathFromStroke, saveToInventory} from '../utils/utils';
import { CropModal } from './CropModal';
import { generateItemMetadata, generateUniqueId } from '../utils/utils';

export function Content() {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [stream] = useAtom(ShareStream);
  const [detectType] = useAtom(DetectTypeAtom);
  const [videoRef] = useAtom(VideoRefAtom);
  const [, setImageSent] = useAtom(ImageSentAtom);
  const [revealOnHover] = useAtom(RevealOnHoverModeAtom);
  const [hoverEntered, setHoverEntered] = useState(false);
  const [hoveredBox, _setHoveredBox] = useState<number | null>(null);
  const [drawMode] = useAtom(DrawModeAtom);
  const [lines, setLines] = useAtom(LinesAtom);
  const [activeColor] = useAtom(ActiveColorAtom);
  const [, setInventoryItems] = useAtom(InventoryItemsAtom);
  const [savingBoxIndex, setSavingBoxIndex] = useState<number | null>(null);
  const [, setShowInventory] = useAtom(ShowInventoryAtom);
  
  // Add these new state variables for crop modal
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedBox, setSelectedBox] = useState<any>(null);

  // Handling resize and aspect ratios
  const boundingBoxContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDims, setContainerDims] = useState({
    width: 0,
    height: 0,
  });
  const [activeMediaDimensions, setActiveMediaDimensions] = useState({
    width: 1,
    height: 1,
  });

  const onResize = useCallback((el: ResizePayload) => {
    if (el.width && el.height) {
      setContainerDims({
        width: el.width,
        height: el.height,
      });
    }
  }, []);

  const {ref: containerRef} = useResizeDetector({onResize});

  const boundingBoxContainer = useMemo(() => {
    const {width, height} = activeMediaDimensions;
    const aspectRatio = width / height;
    const containerAspectRatio = containerDims.width / containerDims.height;
    if (aspectRatio < containerAspectRatio) {
      return {
        height: containerDims.height,
        width: containerDims.height * aspectRatio,
      };
    } else {
      return {
        width: containerDims.width,
        height: containerDims.width / aspectRatio,
      };
    }
  }, [containerDims, activeMediaDimensions]);

  function setHoveredBox(e: React.PointerEvent) {
    const boxes = document.querySelectorAll('.bbox');
    const dimensionsAndIndex = Array.from(boxes).map((box) => {
      const {top, left, width, height} = box.getBoundingClientRect();
      // Get the original index from the data attribute
      const originalIndex = parseInt(box.getAttribute('data-original-index') || '0');
      return {
        top,
        left,
        width,
        height,
        index: originalIndex,
      };
    });
    // Sort smallest to largest
    const sorted = dimensionsAndIndex.sort(
      (a, b) => a.width * a.height - b.width * b.height,
    );
    // Find the smallest box that contains the mouse
    const {clientX, clientY} = e;
    const found = sorted.find(({top, left, width, height}) => {
      return (
        clientX > left &&
        clientX < left + width &&
        clientY > top &&
        clientY < top + height
      );
    });
    if (found) {
      _setHoveredBox(found.index);
    } else {
      _setHoveredBox(null);
    }
  }

  const handleSaveToInventory = async (box: any, index: number) => {
    setSavingBoxIndex(index);
    try {
      const inventoryItem = await saveToInventory(box, imageSrc);
      
      setInventoryItems(prev => {
        const newItems = [...prev, inventoryItem];
        
        // Automatically show inventory if this is the first item
        if (prev.length === 0) {
          setTimeout(() => {
            setShowInventory(true);
          }, 1500);
        }
        
        return newItems;
      });
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'toast toast-end toast-bottom z-50';
      notification.innerHTML = `
        <div class="alert alert-success shadow-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="font-medium">${box.label} saved to inventory!</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 4000);
    } catch (error: unknown) {
      console.error('Error saving to inventory:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      notification.className = 'toast toast-end toast-bottom z-50';
      notification.innerHTML = `
        <div class="alert alert-error shadow-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Error: ${errorMessage}</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 5000);
    } finally {
      setSavingBoxIndex(null);
    }
  };

  const handleCropAndSave = async (croppedData: { imageUrl: string; label: string; cropBox: any }) => {
    const inventoryItem = {
      id: generateUniqueId(),
      imageUrl: croppedData.imageUrl,
      label: croppedData.label,
      category: croppedData.label.split(' ')[0],
      tags: [croppedData.label],
      dateAdded: new Date().toISOString(),
      sourceImageUrl: imageSrc || undefined,
      notes: '',
      originalBox: croppedData.cropBox,
      metadata: await generateItemMetadata(croppedData.imageUrl, croppedData.label),
    };
    
    setInventoryItems(prev => {
      const newItems = [...prev, inventoryItem];
      
      // Automatically show inventory if this is the first item
      if (prev.length === 0) {
        setTimeout(() => {
          setShowInventory(true);
        }, 1500);
      }
      
      return newItems;
    });
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'toast toast-end toast-bottom z-50';
    notification.innerHTML = `
      <div class="alert alert-success shadow-lg">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="font-medium">${croppedData.label} saved to inventory!</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 4000);
  };

  const downRef = useRef<Boolean>(false);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {stream ? (
        <video
          className="absolute top-0 left-0 w-full h-full object-contain"
          autoPlay
          onLoadedMetadata={(e) => {
            setActiveMediaDimensions({
              width: e.currentTarget.videoWidth,
              height: e.currentTarget.videoHeight,
            });
          }}
          ref={(video) => {
            videoRef.current = video;
            if (video && !video.srcObject) {
              video.srcObject = stream;
            }
          }}
        />
      ) : imageSrc ? (
        <img
          src={imageSrc}
          className="absolute top-0 left-0 w-full h-full object-contain"
          alt="Uploaded image"
          onLoad={(e) => {
            setActiveMediaDimensions({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            });
          }}
        />
      ) : null}
      <div
        className={`absolute w-full h-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${drawMode ? 'cursor-crosshair' : ''}`}
        ref={boundingBoxContainerRef}
        onPointerEnter={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(true);
            setHoveredBox(e);
          }
        }}
        onPointerMove={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(true);
            setHoveredBox(e);
          }
          if (downRef.current) {
            const parentBounds =
              boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev.slice(0, prev.length - 1),
              [
                [
                  ...prev[prev.length - 1][0],
                  [
                    (e.clientX - parentBounds.left) /
                      boundingBoxContainer!.width,
                    (e.clientY - parentBounds.top) /
                      boundingBoxContainer!.height,
                  ],
                ],
                prev[prev.length - 1][1],
              ],
            ]);
          }
        }}
        onPointerLeave={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(false);
            setHoveredBox(e);
          }
        }}
        onPointerDown={(e) => {
          if (drawMode) {
            setImageSent(false);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            downRef.current = true;
            const parentBounds =
              boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev,
              [
                [
                  [
                    (e.clientX - parentBounds.left) /
                      boundingBoxContainer!.width,
                    (e.clientY - parentBounds.top) /
                      boundingBoxContainer!.height,
                  ],
                ],
                activeColor,
              ],
            ]);
          }
        }}
        onPointerUp={(e) => {
          if (drawMode) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            downRef.current = false;
          }
        }}
        style={{
          width: boundingBoxContainer.width,
          height: boundingBoxContainer.height,
        }}>
        {lines.length > 0 && (
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{
              pointerEvents: 'none',
              width: boundingBoxContainer?.width,
              height: boundingBoxContainer?.height,
            }}>
            {lines.map(([points, color], i) => (
              <path
                key={i}
                d={getSvgPathFromStroke(
                  getStroke(
                    points.map(([x, y]) => [
                      x * boundingBoxContainer!.width,
                      y * boundingBoxContainer!.height,
                      0.5,
                    ]),
                    lineOptions,
                  ),
                )}
                fill={color}
              />
            ))}
          </svg>
        )}
        {detectType === '2D bounding boxes' &&
          boundingBoxes2D
            // Sort boxes by area (smallest first) to ensure proper z-index layering
            .map((box, i) => ({
              ...box,
              index: i,
              area: box.width * box.height
            }))
            .sort((a, b) => b.area - a.area)
            .map((boxWithIndex) => {
              const { index: i, area, ...box } = boxWithIndex;
              const isHovered = i === hoveredBox;
              const isSaving = savingBoxIndex === i;
              
              return (
                <div
                  key={i}
                  className={`absolute bbox transition-all duration-200 cursor-pointer`}
                  data-original-index={i}
                  style={{
                    top: box.y * 100 + '%',
                    left: box.x * 100 + '%',
                    width: box.width * 100 + '%',
                    height: box.height * 100 + '%',
                    // Enhanced border styling for better visibility
                    border: isHovered ? '3px solid rgb(37, 99, 235)' : '2px solid rgb(59, 130, 246)',
                    backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    boxShadow: isHovered 
                      ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 20px rgba(59, 130, 246, 0.4)' 
                      : 'none',
                    // Proper z-index: smaller boxes on top, hovered box on very top
                    zIndex: isHovered ? 100 : Math.floor((1 - area) * 50),
                  }}
                  onMouseEnter={() => _setHoveredBox(i)}
                  onMouseLeave={() => _setHoveredBox(null)}
                  onClick={() => handleSaveToInventory(box, i)}
                >
                  {/* Label positioned inside the box at top-left */}
                  <div 
                    className="absolute top-1 left-1 max-w-[calc(100%-8px)]"
                    style={{
                      // Prevent label from extending outside box
                      maxWidth: 'calc(100% - 8px)',
                    }}
                  >
                    <div 
                      className={`
                        inline-flex items-center gap-1.5 
                        bg-gray-900/90 backdrop-blur-sm 
                        text-white text-xs font-medium
                        px-2 py-1 rounded
                        shadow-lg
                        transition-all duration-200
                        ${isHovered ? 'scale-105' : 'scale-100'}
                      `}
                      style={{
                        // Ensure label is always visible
                        minWidth: 'fit-content',
                        maxWidth: '100%',
                      }}
                    >
                      {/* Label text with truncation */}
                      <span className="truncate">{box.label}</span>
                      
                      {/* Save button - only visible on hover */}
                      {isHovered && (
                        <>
                          <div className="w-px h-3 bg-white/30 mx-0.5"></div>
                          {isSaving ? (
                            <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <div className="flex items-center gap-1">
                              {/* Quick save button */}
                              <button 
                                className="p-1 hover:bg-white/20 rounded transition-all hover:scale-110 min-w-[28px] min-h-[28px] flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveToInventory(box, i);
                                }}
                                title="Quick save to inventory"
                              >
                                <svg className="w-4 h-4 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                                </svg>
                              </button>
                              
                              {/* Crop and edit button */}
                              <button 
                                className="p-1 hover:bg-white/20 rounded transition-all hover:scale-110 min-w-[28px] min-h-[28px] flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBox(box);
                                  setShowCropModal(true);
                                }}
                                title="Crop and edit"
                              >
                                <svg className="w-4 h-4 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Optional: Hover indicator in corner */}
                  {isHovered && !isSaving && (
                    <div className="absolute bottom-1 right-1">
                      <div className="bg-gray-900/80 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded shadow">
                        Click anywhere to save
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
      </div>
      
      {/* Add the crop modal */}
      <CropModal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setSelectedBox(null);
        }}
        box={selectedBox}
        onSave={handleCropAndSave}
      />
    </div>
  );
}
