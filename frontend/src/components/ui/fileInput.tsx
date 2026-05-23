// FileInput.tsx
import { useEffect, useState, useRef } from "react";
import { Button } from "./button";

type FileInputProps = {
  label?: string;
  onChange: (files: File[]) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
  id?: string;
  currentFile?: File | null;
  actionItem?: { ProductImage?: { imageUrl: string }[] };
  disabled?: boolean;
  index?: number;
  onRemove?: () => void;
  onGalleryClick?: () => void; // Add this prop
};

const FileInput = ({
  onChange,
  placeholder,
  className,
  required,
  id,
  actionItem,
  disabled,
  index,
  currentFile,
  onRemove,
  onGalleryClick, // Add this prop
}: FileInputProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (actionItem?.ProductImage?.[0]?.imageUrl) {
      setPreviewUrl(actionItem.ProductImage[0].imageUrl);
      return;
    }

    if (currentFile) {
      const url = URL.createObjectURL(currentFile);
      setPreviewUrl(url);
      return;
    }

    setPreviewUrl(null);
  }, [actionItem?.ProductImage, currentFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];

    if (newFile) {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(newFile);
      setPreviewUrl(url);
      onChange([newFile]);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onChange([]);
    }
  };

  const handleClearPreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(null);
    onChange([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor={id ? `${id}-${index}` : `dropzone-file-${index}`}
          className={`flex flex-col items-center justify-center w-full h-24 border-2 border-primary border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative ${className}`}
        >
          <input
            ref={fileInputRef}
            id={id ? `${id}-${index}` : `dropzone-file-${index}`}
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
            required={required ?? false}
            placeholder={placeholder}
            disabled={disabled}
            accept="image/*"
          />

          <div className="flex flex-col items-center justify-center">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg mx-2"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearPreview();
                  }}
                  className="absolute top-1 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center pb-0.5 justify-center transform translate-x-1/2 -translate-y-1/2"
                >
                  x
                </button>
              </div>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG, WEBP</p>
              </>
            )}
          </div>
        </label>
      </div>

      {onGalleryClick && (
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onGalleryClick}
          className="w-full"
        >
          Select from Gallery
        </Button>
      )}
    </div>
  );
};

export default FileInput;