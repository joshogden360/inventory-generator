import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { ImageSrcAtom } from '../state/atoms';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: any;
  onSave: (croppedData: { imageUrl: string; label: string; cropBox: any }) => void;
}

export function CropModal({ isOpen, onClose, box, onSave }: CropModalProps) {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [label, setLabel] = useState(box?.label || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cropBox, setCropBox] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen && box && imageSrc) {
      setLabel(box.label);
      loadAndDrawImage();
    }
  }, [isOpen, box, imageSrc]);

  const loadAndDrawImage = async () => {
    if (!imageSrc || !canvasRef.current || !containerRef.current) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current!;
      const container = containerRef.current!;
      
      // Set canvas size to match container
      const containerRect = container.getBoundingClientRect();
      const scale = Math.min(
        containerRect.width / img.width,
        containerRect.height / img.height
      ) * 0.9;
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Initialize crop box from bounding box
      setCropBox({
        x: box.x * canvas.width,
        y: box.y * canvas.height,
        width: box.width * canvas.width,
        height: box.height * canvas.height
      });
      
      drawImage();
    };
    img.src = imageSrc;
  };

  const drawImage = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = imageRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Draw darkened overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear crop area to show original image
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
    ctx.restore();
    
    // Draw crop box border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
    
    // Draw resize handles
    const handleSize = 8;
    ctx.fillStyle = '#3b82f6';
    
    // Corners
    ctx.fillRect(cropBox.x - handleSize/2, cropBox.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x + cropBox.width - handleSize/2, cropBox.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x - handleSize/2, cropBox.y + cropBox.height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x + cropBox.width - handleSize/2, cropBox.y + cropBox.height - handleSize/2, handleSize, handleSize);
    
    // Edges
    ctx.fillRect(cropBox.x + cropBox.width/2 - handleSize/2, cropBox.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x + cropBox.width/2 - handleSize/2, cropBox.y + cropBox.height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x - handleSize/2, cropBox.y + cropBox.height/2 - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x + cropBox.width - handleSize/2, cropBox.y + cropBox.height/2 - handleSize/2, handleSize, handleSize);
  };

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getResizeHandle = (pos: { x: number; y: number }) => {
    const threshold = 10;
    const { x, y, width, height } = cropBox;
    
    if (Math.abs(pos.x - x) < threshold && Math.abs(pos.y - y) < threshold) return 'nw';
    if (Math.abs(pos.x - (x + width)) < threshold && Math.abs(pos.y - y) < threshold) return 'ne';
    if (Math.abs(pos.x - x) < threshold && Math.abs(pos.y - (y + height)) < threshold) return 'sw';
    if (Math.abs(pos.x - (x + width)) < threshold && Math.abs(pos.y - (y + height)) < threshold) return 'se';
    if (Math.abs(pos.x - (x + width/2)) < threshold && Math.abs(pos.y - y) < threshold) return 'n';
    if (Math.abs(pos.x - (x + width/2)) < threshold && Math.abs(pos.y - (y + height)) < threshold) return 's';
    if (Math.abs(pos.x - x) < threshold && Math.abs(pos.y - (y + height/2)) < threshold) return 'w';
    if (Math.abs(pos.x - (x + width)) < threshold && Math.abs(pos.y - (y + height/2)) < threshold) return 'e';
    
    if (pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height) return 'move';
    
    return '';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const handle = getResizeHandle(pos);
    
    if (handle === 'move') {
      setIsDragging(true);
      setDragStart({ x: pos.x - cropBox.x, y: pos.y - cropBox.y });
    } else if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const canvas = canvasRef.current!;
    
    if (isDragging) {
      setCropBox(prev => ({
        ...prev,
        x: Math.max(0, Math.min(canvas.width - prev.width, pos.x - dragStart.x)),
        y: Math.max(0, Math.min(canvas.height - prev.height, pos.y - dragStart.y))
      }));
      drawImage();
    } else if (isResizing) {
      let newBox = { ...cropBox };
      
      switch (resizeHandle) {
        case 'nw':
          newBox.width += newBox.x - pos.x;
          newBox.height += newBox.y - pos.y;
          newBox.x = pos.x;
          newBox.y = pos.y;
          break;
        case 'ne':
          newBox.width = pos.x - newBox.x;
          newBox.height += newBox.y - pos.y;
          newBox.y = pos.y;
          break;
        case 'sw':
          newBox.width += newBox.x - pos.x;
          newBox.height = pos.y - newBox.y;
          newBox.x = pos.x;
          break;
        case 'se':
          newBox.width = pos.x - newBox.x;
          newBox.height = pos.y - newBox.y;
          break;
        case 'n':
          newBox.height += newBox.y - pos.y;
          newBox.y = pos.y;
          break;
        case 's':
          newBox.height = pos.y - newBox.y;
          break;
        case 'w':
          newBox.width += newBox.x - pos.x;
          newBox.x = pos.x;
          break;
        case 'e':
          newBox.width = pos.x - newBox.x;
          break;
      }
      
      // Ensure minimum size
      if (newBox.width > 20 && newBox.height > 20) {
        setCropBox(newBox);
        drawImage();
      }
    } else {
      // Update cursor
      const handle = getResizeHandle(pos);
      const cursors: { [key: string]: string } = {
        'nw': 'nw-resize',
        'ne': 'ne-resize',
        'sw': 'sw-resize',
        'se': 'se-resize',
        'n': 'n-resize',
        's': 's-resize',
        'w': 'w-resize',
        'e': 'e-resize',
        'move': 'move'
      };
      canvas.style.cursor = cursors[handle] || 'default';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  const handleSave = async () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d')!;
    
    // Calculate actual crop dimensions on original image
    const scaleX = img.width / canvas.width;
    const scaleY = img.height / canvas.height;
    
    const actualCrop = {
      x: cropBox.x * scaleX,
      y: cropBox.y * scaleY,
      width: cropBox.width * scaleX,
      height: cropBox.height * scaleY
    };
    
    cropCanvas.width = actualCrop.width;
    cropCanvas.height = actualCrop.height;
    
    // Draw cropped portion
    cropCtx.drawImage(
      img,
      actualCrop.x, actualCrop.y,
      actualCrop.width, actualCrop.height,
      0, 0,
      actualCrop.width, actualCrop.height
    );
    
    const croppedImageUrl = cropCanvas.toDataURL('image/png', 1.0);
    
    // Convert back to relative coordinates
    const relativeCrop = {
      x: actualCrop.x / img.width,
      y: actualCrop.y / img.height,
      width: actualCrop.width / img.width,
      height: actualCrop.height / img.height,
      label: label
    };
    
    onSave({
      imageUrl: croppedImageUrl,
      label: label,
      cropBox: relativeCrop
    });
    
    onClose();
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    // TODO: Call AI to regenerate label
    setTimeout(() => {
      setLabel(`${label} (regenerated)`);
      setIsGenerating(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-base-300">
          <h2 className="text-2xl font-bold">Crop & Edit Item</h2>
          <p className="text-sm opacity-70 mt-1">Adjust the crop area and edit item details</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Canvas for cropping */}
          <div 
            ref={containerRef}
            className="relative bg-base-200 rounded-lg overflow-hidden"
            style={{ height: '400px' }}
          >
            <canvas
              ref={canvasRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
          
          {/* Label editing */}
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Item Name</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="input input-bordered flex-1"
                  placeholder="Enter item name..."
                />
                <button
                  onClick={handleRegenerate}
                  className={`btn btn-secondary ${isGenerating ? 'loading' : ''}`}
                  disabled={isGenerating}
                >
                  {!isGenerating && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-base-300 flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
            </svg>
            Save to Inventory
          </button>
        </div>
      </div>
    </div>
  );
} 