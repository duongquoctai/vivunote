"use client";

import { LocationProperties } from "@/app/types/map";
import { Icon } from "@iconify/react";
import { useFieldArray, useForm } from "react-hook-form";
import Button from "../components/ui/Button";

interface LocationPopupProps {
  id: string;
  name: string;
  properties?: LocationProperties;
  onUpdate: (id: string, properties: LocationProperties) => void;
}

interface FormValues {
  notes: string;
  links: { value: string }[];
}

const extractTikTokId = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:video\/|v\/|embed\/v2\/)(\d+)/);
  return match ? match[1] : null;
};

const LocationPopup = ({
  id,
  name,
  properties,
  onUpdate,
}: LocationPopupProps) => {
  const { register, control, handleSubmit, watch, getValues } =
    useForm<FormValues>({
      defaultValues: {
        notes: properties?.notes || "",
        links: properties?.links?.map((link) => ({ value: link })) || [],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  const onSubmit = (data: FormValues) => {
    onUpdate(id, {
      notes: data.notes,
      links: data.links.map((link) => link.value).filter(Boolean),
    });
  };

  return (
    <div className="w-[350px] max-h-[750px] overflow-y-auto p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-3 border-b pb-2">
        {name}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Notes Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Icon icon="mdi:note-text-outline" className="w-3.5 h-3.5" />
              Ghi chú
            </span>
          </div>
          <textarea
            {...register("notes")}
            onBlur={handleSubmit(onSubmit)}
            className="w-full p-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-none outline-none transition-all placeholder:text-zinc-400"
            placeholder="Thêm ghi chú của bạn..."
          />
        </div>

        {/* Links Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Icon icon="mdi:link-variant" className="w-3.5 h-3.5" />
              Liên kết
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => append({ value: "" })}
              title="Thêm liên kết"
              className="text-blue-500"
              icon="mdi:plus"
            />
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center gap-1 group">
                  <div className="relative flex-1">
                    <input
                      {...register(`links.${index}.value`)}
                      onBlur={handleSubmit(onSubmit)}
                      className="w-full pl-2 pr-12 py-1.5 text-[10px] rounded-md bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="https://tiktok.com/..."
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {watch(`links.${index}.value`) && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const val = getValues(`links.${index}.value`);
                              if (val) navigator.clipboard.writeText(val);
                            }}
                            className="text-zinc-400 hover:text-blue-500 transition-colors"
                            title="Copy"
                          >
                            <Icon icon="mdi:content-copy" className="w-3 h-3" />
                          </button>
                          <a
                            href={watch(`links.${index}.value`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-blue-500 transition-colors"
                            title="Mở"
                          >
                            <Icon icon="mdi:open-in-new" className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="danger"
                    onClick={() => remove(index)}
                    icon="mdi:close"
                    className="p-1.5!"
                  />
                </div>
                {/* TikTok Embed Preview */}
                {extractTikTokId(watch(`links.${index}.value`)) && (
                  <div className="mt-2 aspect-[9/16] w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-inner">
                    <iframe
                      src={`https://www.tiktok.com/embed/v2/${extractTikTokId(
                        watch(`links.${index}.value`),
                      )}`}
                      className="w-full h-full border-none"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default LocationPopup;
