import { useAtom } from 'jotai';
import {
  ImageSrcAtom,
  UploadedImagesAtom,
  ShowInventoryAtom,
  ShowFileCarouselAtom,
  CurrentImageIndexAtom,
  LightroomLayoutModeAtom,
  InventorySidePanelModeAtom,
  InventoryItemsAtom,
  IsUploadedImageAtom
} from '../state/atoms';
import { useResetState } from '../hooks/hooks';

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-6 h-6 text-white group-hover:text-white group-focus:text-white transition-colors duration-150">
    {children}
  </div>
);

const HomeIcon = () => (
  <IconWrapper>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3.75 10.5V21a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-6a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v6a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V10.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </IconWrapper>
);

const ImagesIcon = () => (
  <IconWrapper>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  </IconWrapper>
);

const InventoryIcon = () => (
  <IconWrapper>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 18.75M10.5 7.5v11.25m0-11.25c0-1.148.93-2.077 2.077-2.077h1.586c1.148 0 2.077.93 2.077 2.077v11.25m0-11.25H18M3.75 7.5h16.5M12 7.5c0-1.148-.93-2.077-2.077-2.077H8.333c-1.148 0-2.077.93-2.077 2.077L6.25 7.5v11.25m5.625-11.25H6.25" />
    </svg>
  </IconWrapper>
);

const LayoutIcon = () => (
  <IconWrapper>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  </IconWrapper>
);

const SettingsIcon = () => (
 <IconWrapper>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107a1.125 1.125 0 01-.932.78l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.893z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </IconWrapper>
);

export function SideNavbar() {
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [, setUploadedImages] = useAtom(UploadedImagesAtom);
  const resetState = useResetState();
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const [showInventory, setShowInventory] = useAtom(ShowInventoryAtom);
  const [inventoryItems] = useAtom(InventoryItemsAtom);
  const [, setShowFileCarousel] = useAtom(ShowFileCarouselAtom);
  const [, setCurrentImageIndex] = useAtom(CurrentImageIndexAtom);
  const [lightroomLayoutMode, setLightroomLayoutMode] = useAtom(LightroomLayoutModeAtom);
  const [inventorySidePanelMode, setInventorySidePanelMode] = useAtom(InventorySidePanelModeAtom);

  const handleHomeClick = () => {
    setImageSrc(null);
    setUploadedImages([]);
    resetState();
    setIsUploadedImage(false);
    setShowInventory(false);
    setShowFileCarousel(false);
    setCurrentImageIndex(0);
  };

  return (
    <div className="w-72 h-screen bg-gray-900 text-white flex flex-col p-6 border-r border-gray-700 shadow-lg font-sans">
      {/* App Title */}
      <div className="mb-10 pt-2 text-center">
        <h1 className="text-3xl font-semibold text-white">The Itemizer</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-2">
        <button
          onClick={handleHomeClick}
          className="group flex items-center gap-4 px-4 py-3 rounded-lg w-full text-left text-white hover:bg-gray-800 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800"
        >
          <HomeIcon />
          <span className="text-base font-medium text-white">Home</span>
        </button>
        <button
          onClick={() => setShowFileCarousel(true)}
          className="group flex items-center gap-4 px-4 py-3 rounded-lg w-full text-left text-white hover:bg-gray-800 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800"
        >
          <ImagesIcon />
          <span className="text-base font-medium text-white">Images</span>
        </button>
        <button
          onClick={() => setShowInventory(true)}
          className="group flex items-center gap-4 px-4 py-3 rounded-lg w-full text-left text-white hover:bg-gray-800 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800"
        >
          <InventoryIcon />
          <span className="text-base font-medium text-white">Inventory</span>
          {inventoryItems.length > 0 && (
            <span className="ml-auto px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
              {inventoryItems.length}
            </span>
          )}
        </button>
      </nav>

      {/* Layout Controls */}
      <div className="mt-auto pb-2 space-y-2">
        <h3 className="px-4 text-sm font-semibold text-white uppercase tracking-wider mb-2">Layout Options</h3>
        <button
          onClick={() => setLightroomLayoutMode(!lightroomLayoutMode)}
          className="group flex items-center gap-4 px-4 py-3 rounded-lg w-full text-left text-white hover:bg-gray-800 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800"
        >
          <LayoutIcon />
          <span className="text-base font-medium text-white">{lightroomLayoutMode ? 'Standard View' : 'Studio View'}</span>
        </button>
        {!lightroomLayoutMode && (
          <button
            onClick={() => setInventorySidePanelMode(!inventorySidePanelMode)}
            className="group flex items-center gap-4 px-4 py-3 rounded-lg w-full text-left text-white hover:bg-gray-800 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800"
          >
            <SettingsIcon />
            <span className="text-base font-medium text-white">{inventorySidePanelMode ? 'Modal Inventory' : 'Side Panel Inventory'}</span>
          </button>
        )}
      </div>
    </div>
  );
} 