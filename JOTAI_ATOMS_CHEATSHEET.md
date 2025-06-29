# Jotai Atoms Cheat Sheet

> **Jotai** is a minimal, flexible state-management library for React. It uses **atomic state**: each piece of state is an _atom_ that can be read and written independently.

This cheat-sheet covers:
1. Jotai basics (creating/using atoms)
2. Derived atoms (read-only & read-write)
3. Async atoms
4. Utility hooks (`useAtomValue`, `useSetAtom`, etc.)
5. Project-specific atom catalogue
6. Debugging & performance tips

---

## 1. Basics – Primitive Atoms

```typescript
import { atom, useAtom } from 'jotai';

// 1️⃣ Define an atom (initial value = "Hello")
export const greetingAtom = atom('Hello');

// 2️⃣ Use it inside a component
function Greeting() {
  const [greeting, setGreeting] = useAtom(greetingAtom);
  return (
    <input value={greeting} onChange={(e) => setGreeting(e.target.value)} />
  );
}
```

**Key points**
- `atom(initialValue)` creates a **writable** atom
- `useAtom(atom)` returns `[value, setter]`
- The setter can take either a new value _or_ an updater function `(prev) => next`

```typescript
setGreeting((prev) => prev + '!');
```

---

## 2. Derived Atoms

### 2.1 Read-Only Derived Atom

```typescript
import { atom, useAtomValue } from 'jotai';

const countAtom = atom(0);
const doubleAtom = atom((get) => get(countAtom) * 2);

function Counter() {
  const count = useAtomValue(countAtom); // 0
  const doubled = useAtomValue(doubleAtom); // 0 → 2 → 4 ...
  // ...
}
```

### 2.2 Read-Write Derived Atom

```typescript
const countAtom = atom(0);

// read = get(countAtom)         
// write = set(countAtom, next)  
export const countWithLimitAtom = atom(
  (get) => get(countAtom),
  (_get, set, newValue: number) => {
    if (newValue <= 10) set(countAtom, newValue);
  }
);
```

---

## 3. Async & Promise Atoms

### 3.1 Async Read Atom

```typescript
const userAtom = atom(async () => {
  const res = await fetch('/api/user');
  return res.json();
});
```
`useAtom(userAtom)` automatically triggers Suspense until the promise resolves.

### 3.2 Async Write (e.g., POST)

```typescript
const todosAtom = atom(async () => (await fetch('/api/todos')).json());

export const addTodoAtom = atom(
  null,
  async (_get, set, newTodo) => {
    await fetch('/api/todos', { method: 'POST', body: JSON.stringify(newTodo) });
    // refetch list
    set(todosAtom, await (await fetch('/api/todos')).json());
  }
);
```

---

## 4. Helper Hooks

| Hook | Purpose |
|------|---------|
| `useAtom` | Read & write atom value `[value, setValue]` |
| `useAtomValue` | **Read-only** value (avoids re-renders when you only read) |
| `useSetAtom` | Setter only – no re-render when value changes |
| `useReducerAtom` | Redux-style reducer for an atom |
| `useUpdateAtom` (alias) | same as `useSetAtom` |

Example:
```typescript
import { useSetAtom } from 'jotai';

function ClearButton() {
  const resetImage = useSetAtom(ImageSrcAtom);
  return <button onClick={() => resetImage(null)}>Clear</button>;
}
```

---

## 5. Project-Specific Atom Catalogue

Below is a quick reference to all atoms defined in **`src/state/atoms.ts`**.

| Atom | Type | Purpose |
|------|------|---------|
| `ImageSrcAtom` | `string \| null` | Current image (Data URI) |
| `ImageSentAtom` | `boolean` | Flag when image has been sent to AI |
| `BoundingBoxes2DAtom` | `BoundingBox2DType[]` | Array of detected 2D boxes |
| `PromptsAtom` | `Record<DetectTypes, string[]>` | Built-in prompt parts |
| `CustomPromptsAtom` | `Record<DetectTypes, string>` | Overrides by user |
| `RevealOnHoverModeAtom` | `boolean` | Show box labels on hover |
| `FOVAtom` | `number` | 3D field-of-view (unused in 2D) |
| `BoundingBoxes3DAtom` | `BoundingBox3DType[]` | 3D bounding boxes |
| `BoundingBoxMasksAtom` | `BoundingBoxMaskType[]` | Segmentation masks |
| `PointsAtom` | `PointingType[]` | Point annotations |
| `TemperatureAtom` | `number` | Gemini temperature setting |
| `ShareStream` | `MediaStream \| null` | Screen-share / webcam stream |
| `DrawModeAtom` | `boolean` | Whether user is drawing mask |
| `DetectTypeAtom` | `DetectTypes` | Current detection mode |
| `LinesAtom` | `[[[number,number][]], string][]` | Freehand drawing data |
| `JsonModeAtom` | `boolean` | Toggle JSON overlay |
| `ActiveColorAtom` | `string` | Current drawing color |
| `HoverEnteredAtom` | `boolean` | Hover state inside overlay |
| `HoveredBoxAtom` | `number \| null` | Index of hovered box |
| `VideoRefAtom` | `{ current: HTMLVideoElement \| null }` | Video element ref |
| `InitFinishedAtom` | `boolean` | App init complete flag |
| `BumpSessionAtom` | `number` | Triggers re-processing |
| `IsUploadedImageAtom` | `boolean` | Distinguish upload vs. stream |
| `SelectionModeAtom` | `'single' \| 'multi' \| 'crop'` | Item selection mode |
| `ZoomAtom` | `number` | Image zoom factor |
| `PanAtom` | `{x:number, y:number}` | Image pan offset |
| `ViewResetAtom` | `number` | Used to trigger zoom/pan reset |
| `IsLoadingAtom` | `boolean` | Global loading flag |
| `UploadProgressAtom` | `number` | Upload progress % |
| `ProcessingStatusAtom` | `'idle' \| 'uploading' \| 'processing' \| 'complete' \| 'error'` | AI workflow status |
| `InventoryItemsAtom` | `InventoryItemType[]` | Saved items list |
| `ShowInventoryAtom` | `boolean` | Toggle right panel visibility |
| `UploadedImagesAtom` | `{id:string,src:string,name:string,uploadDate:string}[]` | Carousel images |
| `CurrentImageIndexAtom` | `number` | Index in carousel |
| `LeftPanelExpandedAtom` | `boolean` | Collapse/expand nav bar |
| `RightPanelExpandedAtom` | `boolean` | Collapse/expand inventory |

> **Tip:** Need a quick reference at runtime? Log all atoms:
```typescript
import * as atoms from '../state/atoms';
console.table(Object.keys(atoms));
```

---

## 6. Debugging & Performance

1. **Avoid unnecessary re-renders**
   - Prefer `useAtomValue` when you only need to read
   - Use `useSetAtom` for write-only components
2. **Memoize expensive derived atoms** – Jotai caches derived values automatically, but avoid heavy computations inside atom functions.
3. **Batch updates** – You can update multiple atoms inside one callback to minimize renders.
4. **DevTools** – Install the [Jotai DevTools extension](https://chrome.google.com/webstore/detail/jotai-devtools/ndanibghlndgikhjjdbghldpfcfihmif) for Chrome to inspect atom state.

---

### Quick Patterns

| Pattern | Snippet |
|---------|---------|
| **Resettable Atom** | `const countAtom = atomWithReset(0);` |
| **Persist to LocalStorage** | `const tokenAtom = atomWithStorage('token', '');` |
| **Immer Mutations** | `const listAtom = atomWithImmer<string[]>([]);` |
| **Split Array into Atoms** | `const todosAtoms = splitAtom(todosAtom);` |

*(Requires Jotai **utils** package)*

```bash
npm i jotai jotai/utils
```

---

## 👍 You are ready!
Keep this cheat-sheet open while working with **Jotai** in _The Itemizer_ to speed up development and debugging. 