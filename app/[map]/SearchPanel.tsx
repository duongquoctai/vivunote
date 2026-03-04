import {
  GoongAutocompletePrediction,
  GoongAutocompleteResponse,
  GoongPlaceDetailResponse,
  Location,
  SearchResult,
} from "@/app/types/map";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import JourneyDrawer from "../components/map/JourneyDrawer";
import Button from "../components/ui/Button";
import { useMapContext } from "../context/MapContext";
import { debounce } from "../utils/helper";
import SearchInput from "./SearchInput";

interface SearchPanelProps {
  locations: Location[];
  onUpdateLocations: (locations: Location[]) => void;
  journeyId?: string;
}

const SearchPanel = ({
  locations,
  onUpdateLocations,
  journeyId,
}: SearchPanelProps) => {
  const router = useRouter();
  const { journeyName, setSelectedLocationId } = useMapContext();
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [activeResults, setActiveResults] = useState<{
    id: string;
    items: SearchResult[];
  } | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setActiveResults(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Synchronize queries with locations if they change externally
  useEffect(() => {
    const newQueries: Record<string, string> = {};
    locations.forEach((loc) => {
      newQueries[loc.id] = loc.name;
    });
    setQueries(newQueries);
  }, [locations]);

  const performSearch = useCallback(async (id: string, query: string) => {
    if (!query.trim()) {
      setActiveResults(null);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`/api/search?q=${query}`);
      if (!response.ok) throw new Error("Search failed");
      const data: GoongAutocompleteResponse = await response.json();
      const transform = (data.predictions || []).map(
        (item: GoongAutocompletePrediction) => ({
          name: item.structured_formatting.main_text,
          display_name: item.description,
          place_id: item.place_id,
        }),
      );
      setActiveResults({ id, items: transform });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((id: string, val: string) => performSearch(id, val), 1000),
    [performSearch],
  );

  const handleInputChange = (id: string, value: string) => {
    setQueries((prev) => ({ ...prev, [id]: value }));
    debouncedSearch(id, value);
  };

  const selectLocation = async (id: string, result: SearchResult) => {
    let lat = result.lat;
    let lon = result.lon;

    if (!lat || !lon) {
      setLoadingStates((prev) => ({ ...prev, [id]: true }));
      try {
        const response = await fetch(`/api/search?place_id=${result.place_id}`);
        if (!response.ok) throw new Error("Failed to fetch place details");
        const data: GoongPlaceDetailResponse = await response.json();
        lat = data.result.geometry.location.lat.toString();
        lon = data.result.geometry.location.lng.toString();
      } catch (error) {
        console.error("Details fetch error:", error);
        toast.error("Không thể lấy thông tin vị trí");
        setLoadingStates((prev) => ({ ...prev, [id]: false }));
        return;
      }
    }

    const newLocations = locations.map((loc) =>
      loc.id === id
        ? {
            ...loc,
            lat: parseFloat(lat!),
            lon: parseFloat(lon!),
            name: result.name || result.display_name,
          }
        : loc,
    );
    onUpdateLocations(newLocations);
    setActiveResults(null);
    setLoadingStates((prev) => ({ ...prev, [id]: false }));
    setQueries((prev) => ({
      ...prev,
      [id]: result.name || result.display_name,
    }));
    setSelectedLocationId(id);
  };

  const addNewLocation = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    onUpdateLocations([...locations, { id: newId, lat: 0, lon: 0, name: "" }]);
  };

  const removeLocation = (id: string) => {
    if (locations.length <= 1) return;
    onUpdateLocations(locations.filter((loc) => loc.id !== id));
  };

  const handleSave = async () => {
    if (locations.length === 0) return;

    setIsSaving(true);
    try {
      const url = journeyId ? `/api/journeys/${journeyId}` : "/api/journeys";
      const method = journeyId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locations }),
      });

      if (!response.ok) throw new Error("Failed to save journey");

      const data = await response.json();
      toast.success("Lưu thành công");

      if (!journeyId && data._id) {
        router.push(`/map/${data._id}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Đã có lỗi xảy ra khi lưu.");
    } finally {
      setIsSaving(false);
    }
  };

  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-3 pointer-events-none">
        {journeyName && (
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl px-5 py-3 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500 pointer-events-auto max-w-[200px] md:max-w-xs">
            <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20 shrink-0">
              <Icon icon="mdi:map-marker-path" className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                Đang xem
              </p>
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
                {journeyName}
              </h2>
            </div>
          </div>
        )}
        <Button
          variant="secondary"
          icon="mdi:chevron-left"
          onClick={() => setIsVisible(true)}
          className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl border border-zinc-200 dark:border-zinc-800 w-12 h-12 rounded-xl pointer-events-auto hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          title="Hiện bảng tìm kiếm"
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={panelRef}
        className="absolute top-4 right-4 z-10 w-80 md:w-96 flex flex-col gap-3 pointer-events-auto"
      >
        {journeyName && (
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl px-5 py-3 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
              <Icon icon="mdi:map-marker-path" className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                Đang xem
              </p>
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
                {journeyName}
              </h2>
            </div>
          </div>
        )}

        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-zinc-200 dark:border-zinc-800 transition-all duration-300">
          <div className="relative flex flex-col gap-6">
            {/* Vertical Dotted Line */}
            {locations.length > 1 && (
              <div className="absolute left-[13px] top-4 bottom-4 w-px border-l-2 border-dotted border-zinc-300 dark:border-zinc-700 z-0" />
            )}

            {locations.map((location) => (
              <SearchInput
                key={location.id}
                id={location.id}
                query={queries[location.id] || ""}
                loading={loadingStates[location.id] || false}
                onQueryChange={handleInputChange}
                onRemove={removeLocation}
                onSelect={selectLocation}
                activeResults={
                  activeResults?.id === location.id ? activeResults.items : null
                }
                isActive={activeResults?.id === location.id}
                isOnlyItem={locations.length <= 1}
              />
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              variant="secondary"
              icon="mdi:chevron-right"
              onClick={() => setIsVisible(false)}
              className="w-12"
              title="Ẩn bảng tìm kiếm"
            />
            <Button
              className="flex-1"
              variant="outline"
              icon="mdi:plus"
              onClick={addNewLocation}
            >
              Thêm
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon="mdi:account"
                onClick={() => setIsDrawerOpen(true)}
                title="Hành trình của tôi"
              />
              <Button
                variant="primary"
                icon="mdi:check"
                onClick={handleSave}
                isLoading={isSaving}
                title="Lưu hành trình"
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>

        {journeyId && (
          <Link href="/">
            <Button
              variant="secondary"
              icon="mdi:arrow-left"
              className="ml-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg border border-zinc-200 dark:border-zinc-800"
            />
          </Link>
        )}
      </div>

      <JourneyDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};

export default SearchPanel;
