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
import {useEffect} from 'react';
import {Content} from './Content';
import {Inventory} from './Inventory';
import {LoadingIndicator} from './LoadingIndicator';
import {Prompt} from './Prompt';
import {FileCarousel} from './FileCarousel';
import {BottomCarousel} from './BottomCarousel';
import {LeftPanelInventory} from './LeftPanelInventory';
import {
  BumpSessionAtom,
  ImageSrcAtom,
  InitFinishedAtom,
  InventoryItemsAtom,
  IsUploadedImageAtom,
  ShowInventoryAtom,
  DetectTypeAtom,
  UploadedImagesAtom,
  ShowFileCarouselAtom,
  CurrentImageIndexAtom,
  InventorySidePanelModeAtom,
  LightroomLayoutModeAtom,
  LeftPanelExpandedAtom,
  ShareStream,
} from '../state/atoms';
import {useResetState} from '../hooks/hooks';

function App() {
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const resetState = useResetState();
  const [initFinished] = useAtom(InitFinishedAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const [showInventory, setShowInventory] = useAtom(ShowInventoryAtom);
  const [inventoryItems] = useAtom(InventoryItemsAtom);
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [stream] = useAtom(ShareStream);
  const [, setDetectType] = useAtom(DetectTypeAtom);
  const [uploadedImages, setUploadedImages] = useAtom(UploadedImagesAtom);
  const [showFileCarousel, setShowFileCarousel] = useAtom(ShowFileCarouselAtom);
  const [currentImageIndex, setCurrentImageIndex] = useAtom(CurrentImageIndexAtom);
  const [inventorySidePanelMode, setInventorySidePanelMode] = useAtom(InventorySidePanelModeAtom);
  const [lightroomLayoutMode, setLightroomLayoutMode] = useAtom(LightroomLayoutModeAtom);
  const [leftPanelExpanded, setLeftPanelExpanded] = useAtom(LeftPanelExpandedAtom);

  useEffect(() => {
    // Ensure dark mode is applied based on system preference if not set by DaisyUI theme explicitly
    if (window.matchMedia('(prefers-color-scheme: dark)').matches && !document.documentElement.hasAttribute('data-theme')) {
      // Assuming 'dark' is a DaisyUI theme you have or want to use by default for dark mode users.
      // Or, you might have a specific dark theme like 'night' or 'dracula'.
      // document.documentElement.setAttribute('data-theme', 'dark');
    }
    // Set default detection type to 2D bounding boxes for household items
    setDetectType('2D bounding boxes');
  }, [setDetectType]);

  const generateImageId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true; // Allow multiple file selection
    input.onchange = (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        const newImagesData: { id: string; src: string; name: string; uploadDate: string }[] = [];
        let firstNewImageSrc: string | null = null;

        files.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageSrcResult = e.target?.result as string;
            const imageData = {
              id: generateImageId(),
              src: imageSrcResult,
              name: file.name,
              uploadDate: new Date().toISOString(),
            };
            newImagesData.push(imageData);

            if (index === 0 && !firstNewImageSrc) {
              firstNewImageSrc = imageSrcResult;
            }

            // When all files are read, update state
            if (newImagesData.length === files.length) {
              const currentUploadedCount = uploadedImages.length;
              setUploadedImages(prev => [...prev, ...newImagesData]);
              if (firstNewImageSrc) {
                setImageSrc(firstNewImageSrc);
                // Set index relative to the full new list
                setCurrentImageIndex(currentUploadedCount + newImagesData.findIndex(img => img.src === firstNewImageSrc)); 
                setIsUploadedImage(true);
                setBumpSession((prev) => prev + 1);
                resetState(); // Consider if resetState is needed for each batch or only first image.
              }
            }
          };
          reader.readAsDataURL(file);
        });
      }
    };
    input.click();
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageSrcResult = e.target?.result as string;
          const imageData = {
            id: generateImageId(),
            src: imageSrcResult,
            name: file.name || 'Camera capture ' + new Date().toLocaleTimeString(),
            uploadDate: new Date().toISOString(),
          };
          
          setUploadedImages(prev => [...prev, imageData]);
          setCurrentImageIndex(uploadedImages.length); // Index of the newly added image
          
          setImageSrc(imageSrcResult);
          setIsUploadedImage(true);
          setBumpSession((prev) => prev + 1);
          resetState();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-base-200 text-base-content" data-theme="nord">
      {/* Header */}
      <div className="navbar bg-base-100 shadow px-4 sm:px-6 sticky top-0 z-30">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Smart Inventory</h1>
              <p className="text-xs sm:text-sm opacity-70 hidden sm:block">AI Household Catalog</p>
            </div>
          </div>
        </div>
        <div className="navbar-end flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setShowFileCarousel(true)}
            disabled={uploadedImages.length === 0}
            className="btn btn-ghost btn-sm sm:btn-md gap-1 sm:gap-2"
            title="View Uploaded Images"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden md:inline">Images</span>
            {uploadedImages.length > 0 && <div className="badge badge-neutral badge-sm">{uploadedImages.length}</div>}
          </button>
          <button
            onClick={() => setShowInventory(true)}
            className="btn btn-primary btn-sm sm:btn-md gap-1 sm:gap-2"
            title="Open Inventory"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span className="hidden md:inline">Inventory</span>
            {inventoryItems.length > 0 &&  <div className="badge badge-secondary badge-sm">{inventoryItems.length}</div>}
          </button>
          
          {!lightroomLayoutMode && (
            <div className="dropdown dropdown-end hidden sm:block">
              <label tabIndex={0} className="btn btn-ghost btn-sm sm:btn-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <a onClick={() => setInventorySidePanelMode(!inventorySidePanelMode)}>
                    {inventorySidePanelMode ? 'Modal Inventory View' : 'Side Panel Inventory'}
                  </a>
                </li>
              </ul>
            </div>
          )}
          
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-sm sm:btn-md">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <a onClick={() => setLightroomLayoutMode(!lightroomLayoutMode)}>
                  {lightroomLayoutMode ? 'Standard Layout' : 'Studio Layout'}
                </a>
              </li>
               <li><a>Settings</a></li>
               <li><a>Help</a></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Main Content */}
      {lightroomLayoutMode ? (
        // Studio Layout (More compact, tool-focused)
        <div className="flex-1 flex h-[calc(100vh-var(--navbar-height,64px))] bg-base-300">
          <LeftPanelInventory />
          
          <div className="flex-1 flex flex-col bg-base-200">
            <div className="bg-base-100/80 backdrop-blur-md border-b border-base-300 px-4 py-3 shadow-sm">
              <Prompt />
            </div>
            
            <div className="flex-1 relative overflow-hidden p-2 sm:p-4">
              {imageSrc || stream ? (
                <div className="relative h-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
                  <Content />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-base-content">
                  <div className="text-center p-4 card bg-base-100 shadow-xl max-w-md">
                    <figure className="px-10 pt-10">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </figure>
                    <div className="card-body items-center text-center">
                      <h2 className="card-title text-xl">Import Images</h2>
                      <p className="opacity-70 text-sm">Upload or take photos to start cataloging.</p>
                      <div className="card-actions mt-4 flex flex-col sm:flex-row gap-3 w-full">
                        <button
                          onClick={handleCameraCapture}
                          className="btn btn-success flex-1 gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Take Photo
                        </button>
                        <button
                          onClick={handleImageUpload}
                          className="btn btn-primary flex-1 gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <BottomCarousel />
          </div>
        </div>
      ) : (
        // Standard Layout (More spacious, content-first)
        <div className={`flex-1 flex flex-col overflow-hidden transition-margin duration-300 ease-in-out ${
          inventorySidePanelMode && showInventory ? (leftPanelExpanded ? 'lg:mr-[calc(24rem+16rem)]' : 'lg:mr-96') : ''
        }`}>
          {!imageSrc && !stream ? (
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-base-200 to-secondary/5">
              <div className="card bg-base-100 shadow-xl max-w-lg w-full">
                <div className="card-body items-center text-center p-6 sm:p-10">
                  <div className="p-4 bg-primary/10 rounded-full inline-block mb-6 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="card-title text-2xl sm:text-3xl mb-3">Start Your Smart Inventory</h2>
                  <p className="opacity-70 text-base sm:text-lg mb-6">Upload photos or use your camera to automatically catalog household items with AI.</p>
                  <div className="w-full space-y-3">
                    <button
                      onClick={handleCameraCapture}
                      className="btn btn-success btn-block gap-2" 
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      Take Photo
                    </button>
                    <button
                      onClick={handleImageUpload}
                      className="btn btn-primary btn-block gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Photo
                    </button>
                  </div>
                  <div className="divider my-6 sm:my-8">Key Features</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-sm">
                    {[
                      { title: 'Smart Detection', desc: 'AI finds items in photos.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                      { title: 'Easy Cataloging', desc: 'Organize with categories & tags.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /> },
                      { title: 'Detailed Info', desc: 'Track brand, condition, value.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m0-6v2m0 4v2m0 4v2m4-10v2m-4-4v2m0 4v2" /> }
                    ].map(feature => (
                      <div key={feature.title} className="p-3 bg-base-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            {feature.icon}
                          </svg>
                          <h3 className="font-semibold">{feature.title}</h3>
                        </div>
                        <p className="opacity-70 text-xs">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-base-200">
              <div className="flex-1 relative min-h-0">
                {initFinished ? <Content /> : null}
                <LoadingIndicator />
              </div>
              
              <div className="bg-base-100/80 backdrop-blur-md border-t border-base-300 p-3 sm:p-4 shadow-md">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      setImageSrc(null);
                      setUploadedImages(prev => prev.filter(img => img.src === imageSrc));
                      const currentIndex = uploadedImages.findIndex(img => img.src === imageSrc);
                      if (currentIndex > 0) {
                        setImageSrc(uploadedImages[currentIndex -1].src);
                        setCurrentImageIndex(currentIndex -1);
                      } else if (uploadedImages.length > 1 && currentIndex === 0) {
                         setImageSrc(uploadedImages[1].src);
                         setCurrentImageIndex(0);
                      } else {
                        resetState();
                      }
                    }}
                    className="btn btn-ghost btn-sm sm:btn-md gap-2"
                    title="Back to Upload / Previous Image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Back</span>
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <Prompt />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!lightroomLayoutMode && showInventory && <Inventory />}
      
      <FileCarousel />
    </div>
  );
}

export default App;
