import { useFileUpload } from "#/hooks/use-file-upload";
import { Dialog, DialogContent } from "#/components/ui/dialog";
import { Icon } from "@iconify/react";
import { useState } from "react";

interface PhotoUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  maxSize?: number;
}

export function PhotoUpload({
  onChange,
  maxSize = 5 * 1024 * 1024,
}: PhotoUploadProps) {
  const [
    { files, isDragging },
    {
      openFileDialog,
      getInputProps,
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
    onFilesChange: (files) => {
      const file = files[0]?.file instanceof File ? files[0].file : null;
      onChange(file);
    },
  });

  const preview = files[0]?.preview;
  const fileId = files[0]?.id;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-3xl p-2 bg-transparent border-none shadow-none"
          showCloseButton={true}
        >
          <img
            src={preview || ""}
            alt="Aperçu plein écran"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </DialogContent>
      </Dialog>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Photo</p>

        {preview ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Aperçu"
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setDialogOpen(true)}
            />
            <button
              type="button"
              onClick={() => {
                removeFile(fileId!);
                onChange(null);
              }}
              className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <Icon icon="mdi:close" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={openFileDialog}
            className={`flex flex-col items-center justify-center gap-2 w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              isDragging
                ? "border-sky-400 bg-sky-50"
                : "border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50/50"
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-50">
              <Icon
                icon="mdi:image-plus-outline"
                className="h-6 w-6 text-sky-400"
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-500">
                Glissez une image ou{" "}
                <span className="text-sky-500 font-medium">parcourir</span>
              </p>
              <p className="text-xs text-neutral-300 mt-0.5">
                PNG, JPG, WEBP — max {Math.round(maxSize / 1024 / 1024)} Mo
              </p>
            </div>
          </div>
        )}

        <input {...getInputProps()} className="sr-only" />
      </div>
    </>
  );
}
