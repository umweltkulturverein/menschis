import Image from "next/image";
import NavBar from "@/_components/Navigation/NavBar";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-8 px-8 bg-white dark:bg-black sm:items-start">
        <NavBar />
      </main>
    </div>
  );
}
