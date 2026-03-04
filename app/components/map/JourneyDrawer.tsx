"use client";

import { Location } from "@/app/types/map";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";

interface Journey {
  _id: string;
  name: string;
  createdAt: string;
  locations: Location[];
}

interface JourneyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const JourneyCard = memo(
  ({
    journey,
    onUpdate,
    onSelect,
  }: {
    journey: Journey;
    onUpdate: (id: string, newName: string) => Promise<void>;
    onSelect: (locations: Location[], id: string) => void;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const {
      register,
      handleSubmit,
      reset,
      formState: { isSubmitting },
    } = useForm({
      defaultValues: {
        name: journey.name,
      },
    });

    useEffect(() => {
      reset({ name: journey.name });
    }, [journey.name, reset]);

    const onSubmit = async (data: { name: string }) => {
      if (data.name === journey.name) {
        setIsEditing(false);
        return;
      }

      try {
        await onUpdate(journey._id, data.name);
        setIsEditing(false);
      } catch {
        // Error handling is inside onUpdate toast
      }
    };

    const cancelEdit = () => {
      setIsEditing(false);
      reset();
    };

    return (
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all group">
        <div className="flex justify-between items-start mb-2">
          {isEditing ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex items-center gap-2 flex-1"
            >
              <input
                {...register("name", { required: true })}
                className="bg-white dark:bg-zinc-800 border-2 border-blue-500 rounded-lg px-2 py-1 text-sm outline-none flex-1"
                autoFocus
                disabled={isSubmitting}
              />
              <Button
                variant="ghost"
                size="icon"
                icon="mdi:check"
                type="submit"
                isLoading={isSubmitting}
                className="text-green-500 hover:bg-green-50"
              />
              <Button
                variant="ghost"
                size="icon"
                icon="mdi:close"
                type="button"
                onClick={cancelEdit}
                disabled={isSubmitting}
                className="text-red-500 hover:bg-red-50"
              />
            </form>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-blue-500 transition-colors">
                {journey.name}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                icon="mdi:pencil"
                className="opacity-0 group-hover:opacity-100 h-6 w-6"
                onClick={() => setIsEditing(true)}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Icon icon="mdi:calendar" />
            {format(new Date(journey.createdAt), "dd/MM/yyyy", { locale: vi })}
          </span>
          <span className="flex items-center gap-1">
            <Icon icon="mdi:map-marker" />
            {journey.locations.length} điểm đến
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="mt-4 w-full bg-white dark:bg-zinc-800 border-blue-100 dark:border-blue-900/50 text-blue-500"
          onClick={() => onSelect(journey.locations, journey._id)}
        >
          Xem trên bản đồ
        </Button>
      </div>
    );
  },
);

JourneyCard.displayName = "JourneyCard";

const JourneyDrawer = ({ isOpen, onClose }: JourneyDrawerProps) => {
  const router = useRouter();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJourneys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/journeys");
      if (!res.ok) throw new Error("Failed to fetch journeys");
      const data = await res.json();
      setJourneys(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách hành trình");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchJourneys();
    }
  }, [isOpen]);

  const handleUpdateName = async (id: string, newName: string) => {
    try {
      const res = await fetch(`/api/journeys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error("Update failed");

      setJourneys((prev) =>
        prev.map((j) => (j._id === id ? { ...j, name: newName } : j)),
      );
      toast.success("Đã cập nhật tên hành trình");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật tên");
      throw error;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Hành trình của tôi"
      icon="mdi:map-marker-path"
      iconClassName="bg-blue-50 dark:bg-blue-900/20 text-blue-500"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-2">
            <Icon
              icon="mdi:loading"
              className="w-8 h-8 text-blue-500 animate-spin"
            />
            <p className="text-sm text-zinc-500">Đang tải hành trình...</p>
          </div>
        ) : journeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-2 text-zinc-400">
            <Icon icon="mdi:map-marker-off" className="w-12 h-12" />
            <p className="text-sm">Bạn chưa có hành trình nào</p>
          </div>
        ) : (
          journeys.map((journey) => (
            <JourneyCard
              key={journey._id}
              journey={journey}
              onUpdate={handleUpdateName}
              onSelect={(locs, id) => {
                router.push(`/map/${id}`);
                onClose();
              }}
            />
          ))
        )}
      </div>
    </Drawer>
  );
};

export default JourneyDrawer;
