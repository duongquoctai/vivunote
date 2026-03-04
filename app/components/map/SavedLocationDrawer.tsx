"use client";

import { useMapContext } from "@/app/context/MapContext";
import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import MediaEmbed from "./MediaEmbed";

interface FormValues {
  notes: string;
  links: { value: string }[];
}

const SavedLocationDrawer = () => {
  const {
    selectedLocationId,
    setSelectedLocationId,
    locations,
    updateLocationProperties,
  } = useMapContext();

  const isOpen = selectedLocationId !== null;
  const location = locations.find((loc) => loc.id === selectedLocationId);

  const { register, control, handleSubmit, watch, reset } = useForm<FormValues>(
    {
      defaultValues: {
        notes: "",
        links: [],
      },
    },
  );

  useEffect(() => {
    if (location) {
      reset({
        notes: location.properties?.notes || "",
        links:
          location.properties?.links?.map((link) => ({ value: link })) || [],
      });
    }
  }, [location, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  const onSubmit = (data: FormValues) => {
    if (selectedLocationId) {
      updateLocationProperties(selectedLocationId, {
        notes: data.notes,
        links: data.links.map((link) => link.value).filter(Boolean),
      });
    }
  };

  const handleClose = () => {
    setSelectedLocationId(null);
  };

  const handleRemoveLink = (index: number) => {
    const currentLinks = [...watch("links")];
    currentLinks.splice(index, 1);
    remove(index);

    if (selectedLocationId) {
      updateLocationProperties(selectedLocationId, {
        notes: watch("notes"),
        links: currentLinks.map((link) => link.value).filter(Boolean),
      });
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={location?.name || "Chi tiết vị trí"}
      description="Đã lưu trong hành trình"
      icon="mdi:map-marker"
      iconClassName="bg-red-50 dark:bg-red-900/20 text-red-500"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Notes Section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <Icon icon="mdi:note-text-outline" className="w-4 h-4" />
            Ghi chú
          </label>
          <textarea
            {...register("notes")}
            onBlur={handleSubmit(onSubmit)}
            className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-zinc-800 outline-none transition-all placeholder:text-zinc-400 min-h-[120px] resize-none text-sm shadow-inner"
            placeholder="Những điều thú vị tại đây..."
          />
        </div>

        {/* Links Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              <Icon icon="mdi:video-outline" className="w-4 h-4" />
              TikTok / Video
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              icon="mdi:plus"
              onClick={() => append({ value: "" })}
              className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg h-8 w-8"
            />
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      {...register(`links.${index}.value`)}
                      onBlur={handleSubmit(onSubmit)}
                      className="w-full pl-4 pr-12 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm shadow-sm"
                      placeholder="Dán link TikTok..."
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {watch(`links.${index}.value`) && (
                        <a
                          href={watch(`links.${index}.value`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"
                        >
                          <Icon icon="mdi:open-in-new" className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    icon="mdi:delete-outline"
                    onClick={() => handleRemoveLink(index)}
                    className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  />
                </div>

                <MediaEmbed url={watch(`links.${index}.value`)} />
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/10">
                <Icon
                  icon="mdi:video-off-outline"
                  className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2"
                />
                <p className="text-xs text-zinc-400">
                  Thêm liên kết video để xem trước tại đây
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </Drawer>
  );
};

export default SavedLocationDrawer;
