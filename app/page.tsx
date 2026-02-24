import MapLoader from "./[map]/MapLoader";

export default function Home() {
  return (
    <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="w-full">
        <div
          style={{
            height: "98vh",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <MapLoader />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        Created by taimeooo
      </footer>
    </div>
  );
}
