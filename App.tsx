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
import {DetectTypeSelector} from './DetectTypeSelector';
import {ExampleImages} from './ExampleImages';
import {ExtraModeControls} from './ExtraModeControls';
import {Inventory} from './Inventory';
import {LoadingIndicator} from './LoadingIndicator';
import {Prompt} from './Prompt';
import {SideControls} from './SideControls';
import {TopBar} from './TopBar';
import {
  BumpSessionAtom,
  ImageSrcAtom,
  InitFinishedAtom,
  InventoryItemsAtom,
  IsUploadedImageAtom,
  ProcessingStatusAtom,
  ShowInventoryAtom,
} from './atoms';
import {useResetState} from './hooks';

function App() {
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const resetState = useResetState();
  const [initFinished, setInitFinished] = useAtom(InitFinishedAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const [processingStatus] = useAtom(ProcessingStatusAtom);
  const [showInventory, setShowInventory] = useAtom(ShowInventoryAtom);
  const [inventoryItems] = useAtom(InventoryItemsAtom);

  useEffect(() => {
    if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="flex grow flex-col border-b overflow-hidden">
        <TopBar />
        {initFinished ? <Content /> : null}
        <LoadingIndicator />
        <ExtraModeControls />
      </div>
      <div className="flex shrink-0 w-full overflow-auto py-6 px-5 gap-6 lg:items-start">
        <div className="flex flex-col lg:flex-col gap-6 items-center border-r pr-5">
          <ExampleImages />
          <SideControls />
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => setShowInventory(true)}
              className="w-full bg-[#3B68FF] text-white px-4 py-2 rounded flex items-center justify-center gap-2"
              disabled={inventoryItems.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              Inventory ({inventoryItems.length})
            </button>
          </div>
        </div>
        <div className="flex flex-row gap-6 grow">
          <DetectTypeSelector />
          <Prompt />
        </div>
      </div>
      {showInventory && <Inventory />}
    </div>
  );
}

export default App;
