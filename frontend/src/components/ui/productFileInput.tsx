import { useEffect, useState } from "react";

type FileInputProps = {
  label?: string;
  onChange: (files: File[], updatedExistingImages: string[]) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
  id?: string;
  currentFiles?: File[];
  imageUrl?: string; // New prop to display image preview
};

const ProductFileInput = ({
  onChange,
  className,
  required,
  id,
  imageUrl,
}: FileInputProps) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>(imageUrl ? [imageUrl] : []);

  useEffect(() => {
    if (imageUrl) {
      setImagePreviews([imageUrl]); 
    }
  }, [imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length > 0) {
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
      onChange(newFiles, []); // Pass new files to parent
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor={id || "dropzone-file"}
        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-primary border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative ${className}`}
      >
        <input
          id={id || "dropzone-file"}
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
          required={required ?? false}
        />

        {/* Image Preview */}
        {imagePreviews.length > 0 ? (
          <div className="flex items-center gap-2">
            <img src={imagePreviews[0]} alt="Uploaded" className="w-16 h-16 rounded-md" />
          </div>
        ) : (
          <>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload </span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">SVG, PNG, JPG, WEBP</p>
          </>
        )}
      </label>
    </div>
  );
};

export default ProductFileInput;

