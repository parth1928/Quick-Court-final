import Image from "next/image";

export function CampCard() {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-8">
      <Image
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
        alt="Camp"
        width={600}
        height={300}
        className="rounded-xl mb-6"
        style={{ objectFit: "cover" }}
      />
      <h2 className="text-3xl font-bold mb-2">Your next camp</h2>
      <p className="text-gray-500 mb-6">
        See our latest and best camp destinations all across the five continents of the globe.
      </p>
      <div className="flex gap-4">
        <button className="bg-black text-white px-6 py-2 rounded-lg font-semibold">Let's go</button>
        <button className="bg-gray-100 text-black px-6 py-2 rounded-lg font-semibold">Another time</button>
      </div>
    </div>
  );
}
