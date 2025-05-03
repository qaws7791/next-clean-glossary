import Navbar from "@/components/navbar";

export default async function Home() {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <p className="text-2xl">Welcome to the glossary app</p>
      </div>
    </div>
  );
}
