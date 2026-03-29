import { useFileUpload } from "#/hooks/use-file-upload";
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog";
import { Icon } from "@iconify/react";
import { useState } from "react";

async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

interface PhotoUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  maxSize?: number;
  initialUrl?: string | null;
}

export function PhotoUpload({
  onChange,
  maxSize = 5 * 1024 * 1024,
  initialUrl,
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
      if (!file) { onChange(null); return; }
      compressImage(file).then(onChange);
    },
  });

  const newPreview = files[0]?.preview;
  const fileId = files[0]?.id;
  const preview = newPreview ?? initialUrl ?? null;
  const isNew = !!newPreview;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-3xl p-2 bg-transparent border-none shadow-none"
          showCloseButton={true}
        >
          <DialogTitle className="sr-only">Aperçu de la photo</DialogTitle>
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
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 h-8 rounded-full bg-black/50 text-white text-xs font-medium hover:bg-black/70 transition-colors"
            >
              <Icon icon="mdi:image-edit-outline" className="h-3.5 w-3.5" />
              Changer
            </button>
            {isNew && (
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
            )}
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
                <span className="text-sky-500 font-medium">
                  parcourir ou prendre une photo
                </span>
              </p>
              <p className="text-xs text-neutral-300 mt-0.5"></p>
            </div>
          </div>
        )}

        <input {...getInputProps()} className="sr-only" />
      </div>
    </>
  );
}
