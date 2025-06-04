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
import {SideNavbar} from './SideNavbar';
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
  const [imageSrc, setImageSrc] = useAtom(ImageSrcAtom);
  const resetState = useResetState();
  const [initFinished] = useAtom(InitFinishedAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const [showInventory] = useAtom(ShowInventoryAtom);
  const [stream] = useAtom(ShareStream);
  const [, setDetectType] = useAtom(DetectTypeAtom);
  const [uploadedImages, setUploadedImages] = useAtom(UploadedImagesAtom);
  const [lightroomLayoutMode] = useAtom(LightroomLayoutModeAtom);
  const [inventorySidePanelMode] = useAtom(InventorySidePanelModeAtom);
  const [leftPanelExpanded] = useAtom(LeftPanelExpandedAtom);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    setDetectType('2D bounding boxes');
  }, [setDetectType]);

  const generateImageId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
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

            if (newImagesData.length === files.length) {
              const currentUploadedCount = uploadedImages.length;
              setUploadedImages(prev => [...prev, ...newImagesData]);
              if (firstNewImageSrc) {
                setImageSrc(firstNewImageSrc);
                setIsUploadedImage(true);
                setBumpSession((prev) => prev + 1);
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
    input.capture = 'environment';
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
          setImageSrc(imageSrcResult);
          setIsUploadedImage(true);
          setBumpSession((prev) => prev + 1);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const CameraIconSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  const UploadIconSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
   const TakePhotoIconSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  return (
    <div className="flex flex-row h-screen bg-gray-950 text-gray-100 antialiased" data-theme="dark">
      <SideNavbar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {lightroomLayoutMode ? (
          <div className="flex-1 flex h-full bg-gray-900">
            <LeftPanelInventory /> 
            <div className="flex-1 flex flex-col bg-gray-850">
              <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 shadow-sm">
                <Prompt />
              </div>
              <div className="flex-1 relative overflow-y-auto p-4 bg-black">
                {imageSrc || stream ? (
                  <div className="relative h-full w-full max-w-full max-h-full mx-auto my-auto flex items-center justify-center">
                     <Content />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CameraIconSvg />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Studio Mode</h3>
                      <p className="text-gray-400 mb-6 text-sm">Upload an image or use the camera to begin.</p>
                      <div className="space-y-3">
                        <button
                          onClick={handleCameraCapture}
                          className="btn btn-success btn-block gap-2 bg-green-600 hover:bg-green-700 text-white border-none"
                        >
                          <TakePhotoIconSvg />
                          Take Photo
                        </button>
                        <button
                          onClick={handleImageUpload}
                          className="btn btn-primary btn-block gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none"
                        >
                          <UploadIconSvg />
                          Upload Photos
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <BottomCarousel />
            </div>
          </div>
        ) : (
          <div className={`flex-1 flex flex-col overflow-hidden transition-margin duration-300 ease-in-out ${inventorySidePanelMode && showInventory && !leftPanelExpanded ? 'lg:mr-96' : ''} ${inventorySidePanelMode && showInventory && leftPanelExpanded ? 'lg:mr-[calc(24rem+16rem)]' : ''}`}>
            {!imageSrc && !stream ? (
              <div className="flex-1 flex items-center justify-center p-6 bg-gray-900">
                <div className="w-full max-w-md text-center">
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-400/50 shadow-lg">
                    <CameraIconSvg />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">The Itemizer</h2>
                  <p className="text-gray-400 mb-8 text-lg">Itemize and organize with ease.</p>
                  <div className="space-y-4">
                    <button
                      onClick={handleCameraCapture}
                      className="btn btn-lg bg-green-600 hover:bg-green-700 text-white border-none w-full justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <TakePhotoIconSvg />
                      Take Photo
                    </button>
                    <button
                      onClick={handleImageUpload}
                      className="btn btn-lg bg-blue-600 hover:bg-blue-700 text-white border-none w-full justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <UploadIconSvg />
                      Upload Photos
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full bg-black">
                <div className="flex-1 relative min-h-0 overflow-y-auto">
                  {initFinished ? <Content /> : null}
                  <LoadingIndicator />
                </div>
                <div className="bg-gray-850 border-t border-gray-700 p-3 shadow-md">
                  <Prompt />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {!lightroomLayoutMode && showInventory && <Inventory />} 
      <FileCarousel />
    </div>
  );
}

export default App;
