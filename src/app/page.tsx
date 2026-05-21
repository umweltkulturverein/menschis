import Image from "next/image";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth/nextauth";
import Link from "next/link";

export default async function Home() {
    return (
        <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <div className="flex justify-center items-center mt-20 w-screen transition duration-150  ease-in-out hover:scale-105 h-80 bg-gradient-to-r from-ci-green-300 hover:from-ci-green-600 rounded-xl hover:to-ci-green-300 to-ci-green-500">
                <div className="flex justify-center items-center transition duration-150  ease-in-out hover:scale-110 rounded bg-white h-10 w-40">
                    <Link className="justify-center items-center  bg-white bg-gradient-to-r from-ci-green-300 rounded to-ci-green-400 text-transparent bg-clip-text" href="/events" >
                        <button>Go to Events</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
