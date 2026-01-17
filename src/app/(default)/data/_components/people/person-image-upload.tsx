import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { deleteImage, getImagesByPerson, uploadImage } from '@/lib/api/images';
import Delete from '@/components/popup/delete';

interface PersonImageUploadProps {
  personId: string | null;
  currentImage?: string | null;
  onUploadSuccess: () => void;
}

export function PersonImageUpload({
  personId,
  currentImage,
  onUploadSuccess,
}: PersonImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(currentImage || null);
  const [images, setImages] = useState<any[]>([]);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const MAX_FILE_SIZE = 4 * 1024 * 1024;

  useEffect(() => {
    if (personId) {
      fetchImages();
    }
  }, [personId]);

  const fetchImages = async () => {
    if (!personId) return;

    setIsLoading(true);
    try {
      const response = await getImagesByPerson(personId);
      const sortedImages = (response.data || []).sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setImages(sortedImages);
    } catch (err) {
      console.error('Failed to fetch images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowAllImages = () => {
    setShowAllImages(!showAllImages);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be < 4MB`);
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    if (personId) {
      setIsUploading(true);
      try {
        await uploadImage(file, personId);
        onUploadSuccess();
        fetchImages();
      } catch (err) {
        console.error(err);
        setError('Upload failed');
        setImagePreview(null);
      } finally {
        setIsUploading(false);
      }
    } else {
      setError('Person ID missing');
    }
  };

  const onRemoveImage = (id: string) => {
    setSelectedImageId(id);
    setShowDelete(true);
  };

  const handleRemove = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteImage(String(selectedImageId));
      await fetchImages();
      setSelectedImageId(null);
      setShowDelete(false);
    } catch (err) {
      console.error('Failed to delete images:', err);
    } finally {
      setIsDeleting(false);
      setError('');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 ? (
        <div className="flex flex-col">
          <div className="relative aspect-video w-full">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_API_URL}${images[0].image}`}
              alt="Preview"
              className="h-full w-full rounded-lg object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              </div>
            )}
            <button
              className="absolute top-0 left-0 flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100"
              onClick={() => onRemoveImage(images[0].id)}
            >
              <Trash2 className="h-8 w-8" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {(showAllImages ? images.slice(1) : images.slice(1, images.length > 4 ? 3 : 4)).map((img) => (
              <div className="relative aspect-4/3 max-h-full w-full rounded-lg">
                <img
                  key={img.id}
                  src={`${process.env.NEXT_PUBLIC_BASE_API_URL}${img.image}`}
                  alt="Preview"
                  className="h-full w-full rounded-lg object-cover"
                />
                <button
                  className="absolute top-0 left-0 flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100"
                  onClick={() => onRemoveImage(img.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            {images.length > 4 && !showAllImages && (
              <label
                className="flex aspect-4/3 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-700 hover:bg-white/10"
                onClick={toggleShowAllImages}
              >
                <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                  +{images.length - 3}
                </div>
              </label>
            )}
            <label className="flex aspect-4/3 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-700 hover:bg-white/10">
              <div className="flex flex-col items-center justify-center gap-2">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      ) : (
        <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-700 hover:bg-white/10">
          <div className="flex flex-col items-center justify-center gap-2">
            <Plus className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">Click to upload</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isUploading}
          />
        </label>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <Delete
        isOpen={showDelete}
        onOpenChange={setShowDelete}
        onDelete={handleRemove}
        isDeleting={isDeleting}
      />
    </div>
  );
}
