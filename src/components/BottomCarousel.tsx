/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import {useAtom} from 'jotai';
import {
  UploadedImagesAtom,
  CurrentImageIndexAtom,
  ImageSrcAtom,
  ShowBottomCarouselAtom,
  IsUploadedImageAtom,
  BumpSessionAtom,
} from '../state/atoms';
import {useResetState} from '../hooks/hooks';

export function BottomCarousel() {
  const [uploadedImages, setUploadedImages] = useAtom(UploadedImagesAtom);
  const [currentIndex, setCurrentIndex] = useAtom(CurrentImageIndexAtom);
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [showBottomCarousel] = useAtom(ShowBottomCarouselAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);
  const resetState = useResetState();

  const handleSelectImage = (index: number) => {
    if (index >= 0 && index < uploadedImages.length) {
      setCurrentIndex(index);
      setImageSrc(uploadedImages[index].src);
    }
  };

  const handleDeleteImage = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const imageToDeleteId = uploadedImages[index]?.id;
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    if (newImages.length === 0) {
      setImageSrc(null);
      setCurrentIndex(0);
      setIsUploadedImage(false);
      resetState();
    } else {
      let newIndex = currentIndex;
      if (currentIndex === index) {
        newIndex = Math.max(0, index - 1);
      } else if (currentIndex > index) {
        newIndex = currentIndex - 1;
      }
      newIndex = Math.min(newIndex, newImages.length - 1);
      
      setCurrentIndex(newIndex);
      setImageSrc(newImages[newIndex].src);
    }
  };

  if (!showBottomCarousel || uploadedImages.length === 0) {
    return null;
  }

  return (
    <div className="bg-base-100 border-t border-base-300 p-2 shadow-md">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <h3 className="text-base-content text-xs font-medium">
          Filmstrip ({uploadedImages.length})
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-base-content/70 text-xs">
            {currentIndex + 1} / {uploadedImages.length}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100 scrollbar-corner-base-100">
        {uploadedImages.map((image, index) => (
          <div
            key={image.id || index}
            className={`relative flex-shrink-0 cursor-pointer group transition-all duration-200 rounded-lg overflow-hidden shadow ${
              index === currentIndex 
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100' 
                : 'opacity-70 hover:opacity-100 hover:shadow-md'
            }`}
            style={{ width: '5rem', height: '5rem' }}
            onClick={() => handleSelectImage(index)}
          >
            <img 
              src={image.src} 
              alt={image.name}
              className="w-full h-full object-cover bg-base-300"
            />
            
            {index === currentIndex && (
              <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-primary-content" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            <button
              onClick={(e) => handleDeleteImage(index, e)}
              className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center shadow-sm hover:bg-error/80"
              title="Delete Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-error-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div 
              className={`absolute bottom-0 left-0 right-0 px-1 py-0.5 text-xs font-medium text-center transition-opacity duration-150 ${
                index === currentIndex ? 'bg-primary text-primary-content' : 'bg-black/40 text-white group-hover:opacity-100 opacity-0'
              }`}
            >
              {image.name.length > 10 ? `${image.name.substring(0,8)}...` : image.name} | {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 