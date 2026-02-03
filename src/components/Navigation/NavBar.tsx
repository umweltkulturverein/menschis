"use client";

export default function NavBar() {
  return (
    <nav className="w-full bg-white dark:bg-black p-4 shadow-md">
      <div className="max-w-3xl mx-auto flex items-center">
        <img
          className="h-10 w-10 dark:invert"
          src="/pics/umku/logo.svg"
          alt="umku logo"
        />
        <span className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
          umku
        </span>
      </div>
    </nav>
  );
}
