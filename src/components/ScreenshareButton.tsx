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
import {ShareStream} from '../state/atoms';
import {useResetState} from '../hooks/hooks';

export function ScreenshareButton() {
  const [, setStream] = useAtom(ShareStream);
  const resetState = useResetState();

  return (
    <button
      className="btn btn-secondary gap-3"
      onClick={() => {
        resetState();
        navigator.mediaDevices.getDisplayMedia({video: true}).then((stream) => {
          setStream(stream);
        });
      }}>
      <div className="text-lg">🖥️</div>
      <div>Screenshare</div>
    </button>
  );
}
