---
id: "01-05"
phase: 1
wave: 3
plan: FileUpload Component
objective: Build the FileUpload React component with drag-and-drop, click-to-browse, upload progress, error handling, and redirect to dashboard after successful upload.
requirements: UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UI-02
autonomous: true
depends_on: ["01-04"]
---

## Objective

Create `frontend/components/FileUpload.tsx` — the primary upload interface. This is the core value delivery component. It must be visually stunning, functional, and handle all edge cases.

## Tasks

### Task 1: Create FileUpload component (frontend/components/FileUpload.tsx)

Full implementation with:
- **Drag-and-drop zone** — onDragOver, onDragLeave, onDrop handlers
- **Click-to-browse** — hidden file input with label trigger
- **File validation** — type (CSV only), size (≤100MB) client-side
- **Upload progress** — Axios `onUploadProgress` callback → progress bar
- **Error states** — wrong file type, too large, server error
- **Success** — navigate to `/dashboard?id={dataset_id}`
- **Loading state** — spinner during upload

Visual design requirements:
- Large drop zone (min 300px height) with dashed border
- Icon (upload cloud from lucide-react)
- Animated hover state (border color change, scale)
- Progress bar with percentage
- Error message with retry button
- File info display when file selected (name, size)

### Task 2: Integration with Zustand and API
```typescript
const { setDatasetId, setColumns } = useDashboardStore();

const handleUpload = async (file: File) => {
  const response = await uploadCSV(file); // from lib/api.ts
  setDatasetId(response.dataset_id);
  setColumns(response.columns);
  router.push(`/dashboard?id=${response.dataset_id}`);
};
```

### Task 3: Add FileUpload to landing page
Integrate FileUpload component into `/app/page.tsx` hero section.

### Task 4: Create loading/uploading UI states
- Idle: drop zone with icon and instructions
- Hover/dragover: highlighted border, "Drop to upload" message
- File selected: file name + size + "Uploading..." button
- Uploading: progress bar + percentage + animated spinner
- Success: green checkmark + brief animation before redirect
- Error: red border + error message + "Try again" button

### Task 5: Responsive design
- Full-width on mobile
- Centered with max-width on desktop
- Touch-friendly for mobile file selection

### Task 6: Add NEXT_PUBLIC_API_URL to .env files
Create `frontend/.env.local.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Visual Specifications
- Drop zone: `border-dashed border-2` with smooth color transition on hover
- Use gradient background for the drop zone (subtle)
- File type badge showing "CSV" when file is selected
- Animated progress bar with gradient fill
- Smooth scale animation on hover: `hover:scale-[1.02]`
- Error state: red tinted background + shake animation
- Success state: green pulse animation

## Key Files to Create
- `frontend/components/FileUpload.tsx` — main component
- `frontend/.env.local.example` — environment template
