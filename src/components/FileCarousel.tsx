/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import {useAtom} from 'jotai';
import {useState, useEffect, useRef} from 'react';
import {
  UploadedImagesAtom,
  CurrentImageIndexAtom,
  ShowFileCarouselAtom,
  ImageSrcAtom,
  IsUploadedImageAtom,
  BumpSessionAtom,
} from '../state/atoms';
import {useResetState} from '../hooks/hooks';

export function FileCarousel() {
  const [uploadedImages, setUploadedImages] = useAtom(UploadedImagesAtom);
  const [currentIndex, setCurrentIndex] = useAtom(CurrentImageIndexAtom);
  const [showCarousel, setShowCarousel] = useAtom(ShowFileCarouselAtom);
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const resetState = useResetState();

  const currentImagePreviewRef = useRef<HTMLImageElement>(null);
  const selectedThumbnailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showCarousel && selectedThumbnailRef.current) {
      selectedThumbnailRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [showCarousel, currentIndex]);

  const handleSelectImage = (index: number) => {
    if (index >= 0 && index < uploadedImages.length) {
      setCurrentIndex(index);
      setImageSrc(uploadedImages[index].src);
    }
    setShowCarousel(false);
  };

  const handleDeleteImage = (indexToDelete: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newImages = uploadedImages.filter((_, i) => i !== indexToDelete);
    setUploadedImages(newImages);
    
    if (newImages.length === 0) {
      setImageSrc(null);
      setCurrentIndex(0);
      setIsUploadedImage(false);
      setShowCarousel(false);
      resetState();
    } else {
      let newCurrentIndex = currentIndex;
      if (currentIndex === indexToDelete) {
        newCurrentIndex = Math.max(0, indexToDelete - 1);
      } else if (currentIndex > indexToDelete) {
        newCurrentIndex = currentIndex - 1;
      }
      newCurrentIndex = Math.min(newCurrentIndex, newImages.length - 1);

      setCurrentIndex(newCurrentIndex);
      if (newImages[newCurrentIndex]) {
        setImageSrc(newImages[newCurrentIndex].src);
      } else {
        setImageSrc(null);
        setIsUploadedImage(false);
      }
    }
  };

  if (!showCarousel || uploadedImages.length === 0) return null;

  const currentImage = uploadedImages[currentIndex];

  return (
    <div className="modal modal-open bg-black/70 backdrop-blur-sm" role="dialog">
      <div className="modal-box max-w-4xl w-11/12 max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-base-300 flex-shrink-0">
          <h2 className="text-xl font-semibold">
            Image Gallery ({uploadedImages.length})
          </h2>
          <button
            onClick={() => setShowCarousel(false)}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="md:w-2/3 flex flex-col p-4 border-b md:border-b-0 md:border-r border-base-300 flex-shrink-0 md:overflow-y-auto">
            <div className="aspect-video bg-base-200 rounded-lg overflow-hidden mb-3 shadow-inner flex items-center justify-center">
              {currentImage ? (
                <img 
                  ref={currentImagePreviewRef}
                  src={currentImage.src} 
                  alt={currentImage.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <p className="text-base-content/50">No image selected</p>
              )}
            </div>
            
            {currentImage && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg truncate" title={currentImage.name}>{currentImage.name}</h3>
                <p className="text-sm opacity-70">
                  Uploaded: {new Date(currentImage.uploadDate).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => handleSelectImage(currentIndex)}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                    Use This Image
                  </button>
                  <button
                    onClick={(e) => handleDeleteImage(currentIndex, e)}
                    className="btn btn-error btn-outline btn-sm gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="md:w-1/3 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100 flex-1">
            <div className="grid grid-cols-3 gap-2">
              {uploadedImages.map((image, index) => (
                <div
                  key={image.id || index}
                  ref={index === currentIndex ? selectedThumbnailRef : null}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden shadow-sm border-2 transition-all duration-150 aspect-square ${
                    index === currentIndex 
                      ? 'border-primary ring-2 ring-primary/50' 
                      : 'border-base-300 hover:border-neutral-focus'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <img 
                    src={image.src} 
                    alt={image.name}
                    className="w-full h-full object-cover bg-base-200"
                  />
                  {index === currentIndex && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-content rounded-full flex items-center justify-center shadow">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent text-center">
                    <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-base-300 flex-shrink-0">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="btn btn-ghost btn-sm gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          
          <span className="text-sm opacity-70">
            {currentIndex + 1} / {uploadedImages.length}
          </span>
          
          <button
            onClick={() => setCurrentIndex(Math.min(uploadedImages.length - 1, currentIndex + 1))}
            disabled={currentIndex >= uploadedImages.length - 1}
            className="btn btn-ghost btn-sm gap-2"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 