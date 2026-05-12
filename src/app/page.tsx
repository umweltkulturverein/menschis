import Image from "next/image";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export default async function Home() {
    const session = await getServerSession(authOptions);
    return (
        <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black"></div>
    );
}
