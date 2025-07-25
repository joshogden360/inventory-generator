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

export type DetectTypes =
  | '2D bounding boxes'
  | 'Segmentation masks'
  | '3D bounding boxes'
  | 'Points';

export type BoundingBox2DType = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export type BoundingBoxMaskType = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  imageData: string;
};

export type BoundingBox3DType = {
  center: [number, number, number];
  size: [number, number, number];
  rpy: [number, number, number];
  label: string;
};

export type InventoryItemType = {
  id: string;
  imageUrl: string;
  label: string;
  category?: string;
  tags?: string[];
  dateAdded: string;
  sourceImageUrl?: string;
  notes?: string;
  originalBox?: BoundingBox2DType | BoundingBoxMaskType;
  metadata?: ItemMetadata;
};

export type ItemMetadata = {
  brand?: string;
  condition?: string;
  resaleValue?: string;
  manufacturerWebsite?: string;
  documentationLinks?: string[];
  warrantyInfo?: string;
  description?: string;
};
