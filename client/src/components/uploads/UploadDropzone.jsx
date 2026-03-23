import { useState } from 'react';

const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
const maxSize = 10 * 1024 * 1024;

function UploadDropzone({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file) => {
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG/JPG/PDF allowed');
      return;
    }
    if (file.size > maxSize) {
      alert('File must be under 10MB');
      return;
    }

    setProgress(10);
    const timer = setInterval(() => {
      setProgress((p) => Math.min(90, p + 15));
    }, 150);

    try {
      await onUpload(file);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    } finally {
      clearInterval(timer);
    }
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        uploadFile(e.dataTransfer.files?.[0]);
      }}
      className={`glass-panel block cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center ${dragging ? 'border-emerald-300' : 'border-slate-600'}`}
    >
      <input type="file" className="hidden" onChange={(e) => uploadFile(e.target.files?.[0])} />
      <p className="text-sm text-slate-200">Drag & drop a PNG/JPG/PDF, or click to upload</p>
      {progress > 0 ? (
        <div className="mx-auto mt-3 max-w-xs rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </label>
  );
}

export default UploadDropzone;

