import React, { useRef, useState } from 'react';
import { Button } from './ui/button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.url) {
      setPreview(data.url);
      onChange(data.url);
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Button
          type="button"
          className="w-fit mb-1 bg-black text-white hover:bg-gray-900"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {label}
        </Button>
      )}
  {/* Preview removed to avoid duplicate display; handled by parent */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
      {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
    </div>
  );
}
