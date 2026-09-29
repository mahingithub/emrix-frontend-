import Link from "next/link";
import { Logo } from "@emrix/shared/ui/logo";
import { NotFoundContent } from "@/components/not-found-content";

export default function NotFound() {
  return (
    <>
      <header className="border-b-2 border-ink bg-paper">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 lg:px-8">
          <Link href="/" aria-label="EMRIX home">
            <Logo />
          </Link>
        </div>
      </header>
      <NotFoundContent />
    </>
  );
}
