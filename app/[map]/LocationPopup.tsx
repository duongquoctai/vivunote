"use client";

import { LocationProperties } from "@/app/types/map";
import { useFieldArray, useForm } from "react-hook-form";

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
    <div className="w-64 max-h-96 overflow-y-auto p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-3 border-b pb-2">
        {name}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Notes Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
              Liên kết
            </span>
            <button
              type="button"
              onClick={() => append({ value: "" })}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-blue-500 transition-colors"
              title="Thêm liên kết"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-1 group">
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                            />
                          </svg>
                        </button>
                        <a
                          href={watch(`links.${index}.value`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-blue-500 transition-colors"
                          title="Mở"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                          </svg>
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default LocationPopup;
