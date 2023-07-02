import { Canvas } from "../components/Canvas";

export default function Home() {
  return (
    <main className="min-h-screen w-screen p-4">
      <div>Haar Wavelet Decomposition Tool.</div>
      <div className="w-full">
        <Canvas canvasHeight={512} canvasWidth={512} />
      </div>
    </main>
  );
}
