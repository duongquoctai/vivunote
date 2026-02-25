import MapLoader from "./[map]/MapLoader";

export default function Home() {
  return (
    <div className="grid grid-rows-[1fr_auto] h-screen overflow-hidden font-[family-name:var(--font-geist-sans)]">
      <main className="w-full h-full">
        <MapLoader />
      </main>

      <footer className="flex flex-wrap items-center justify-center py-1">
        Created by taimeooo
      </footer>
    </div>
  );
}
