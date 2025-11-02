import type { ReactNode } from "react";
import Cropper, { type CropperProps } from "react-easy-crop";
import { ArrowLeftIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import { getCroppedImg } from "./crop-image";
import { useEditMedia } from "./use-edit-media";
import { Slider } from "../slider";
import { Button } from "../button";
import {
  Content,
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../dialog";

export interface EditMediaProps
  extends Pick<CropperProps, "aspect" | "cropShape"> {
  imageFile: File | null;
  isOpen: boolean;
  renderButtonTrigger: () => ReactNode;
  setPreviewUrl: (url: string) => void;
  setCroppedImageFile: (file: File | null) => void;
  cancel: (...args: unknown[]) => void;
  done: () => void;
}

export function EditMediaDialog({
  imageFile,
  isOpen,
  setPreviewUrl,
  setCroppedImageFile,
  cancel,
  done,
  renderButtonTrigger,
  ...props
}: EditMediaProps) {
  const {
    objectUrl,
    crop,
    zoom,
    croppedAreaPixels,
    rotation,
    setCrop,
    setZoom,
    setCroppedAreaPixels,
  } = useEditMedia(imageFile);

  const saveResult = async () => {
    if (imageFile && objectUrl) {
      const imageRes = await getCroppedImg(
        objectUrl,
        imageFile.type,
        croppedAreaPixels,
        rotation
      );

      if (!imageRes) return null;

      const data = await fetch(imageRes);
      const blob = await data.blob();
      const fileType = blob.type;
      const file = new File(
        [blob],
        `${imageFile.name}.${fileType.split("/")[1]}`,
        {
          type: fileType,
        }
      );
      setPreviewUrl(imageRes);
      setCroppedImageFile(file);
    }

    done();
    close();
  };

  return (
    <Dialog open={isOpen} defaultOpen={!!imageFile}>
      <DialogTrigger asChild>{renderButtonTrigger()}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />

        <Content className='bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid h-dvh w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-black p-6 shadow-lg duration-200 sm:h-auto sm:w-md sm:rounded-lg'>
          <DialogHeader>
            <div className='flex items-center-safe justify-between'>
              <div className='flex items-center-safe gap-5'>
                <DialogClose asChild>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='text-foreground'
                    onClick={() => {
                      cancel();
                      close();
                    }}
                  >
                    <span className='sr-only'>Cancel</span>
                    <ArrowLeftIcon />
                  </Button>
                </DialogClose>
                <DialogTitle>
                  <span className='text-foreground'>Edit media</span>
                </DialogTitle>
              </div>

              <Button
                type='button'
                variant='secondary'
                size='sm'
                onClick={saveResult}
                disabled={!objectUrl}
              >
                Apply
              </Button>
            </div>
          </DialogHeader>

          <div className='relative h-99'>
            <Cropper
              {...props}
              image={objectUrl ?? ""}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onCropComplete={(_, c) => setCroppedAreaPixels(c)}
              onZoomChange={setZoom}
              showGrid={false}
            />
          </div>
          <DialogFooter>
            <ZoomOutIcon className='text-zinc-700' />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby='Zoom'
              onValueChange={(value) => setZoom(Number(value.join("")))}
            />
            <ZoomInIcon className='text-zinc-700' />
          </DialogFooter>
        </Content>
      </DialogPortal>
    </Dialog>
  );
}
