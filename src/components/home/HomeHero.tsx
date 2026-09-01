import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Network } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { institution } from "@/config/institution";
import heroImage from "../../../public/images/home/cooperative-network-hero.webp";

export function HomeHero() {
  return (
    <section className="relative isolate min-h-[42rem] overflow-hidden bg-institutional text-white sm:min-h-[46rem] lg:min-h-[48rem]">
      <Image
        src={heroImage}
        alt="Illustrative scene of Cameroonian cooperative professionals reviewing documents together"
        fill
        preload
        sizes="100vw"
        className="-z-20 object-cover object-[62%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-institutional via-institutional/90 to-institutional/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-institutional/80 via-transparent to-institutional/20 lg:hidden" />

      <Container className="flex min-h-[42rem] items-center py-16 sm:min-h-[46rem] lg:min-h-[48rem] lg:py-24">
        <div className="max-w-[52rem]">
          <p className="inline-flex items-center gap-2 rounded-pill border border-white/20 bg-institutional/50 px-4 py-2 text-meta uppercase text-accent-200 backdrop-blur-sm">
            <Network className="h-4 w-4" aria-hidden="true" /> {institution.displayName}
          </p>
          <h1 className="mt-7 font-display text-h1 text-white sm:text-display">
            Building Stronger Credit Unions. <span className="text-accent-300">Building Stronger Communities.</span>
          </h1>
          <p className="mt-7 max-w-[45rem] text-lead text-primary-50 sm:text-xl sm:leading-9">
            RECCU-CAM strengthens cooperative financial institutions through institutional support, capacity building, responsible financial solutions, compliance and shared growth.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/network/affiliates" className={buttonVariants({ variant: "accent", size: "lg" })}>
              Explore Our Network <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/network/become-an-affiliate" className={buttonVariants({ variant: "secondary", size: "lg", className: "border-white/40 bg-white/10 text-white hover:border-white/70 hover:bg-white/15" })}>
              Become an Affiliate
            </Link>
          </div>
        </div>
      </Container>

      <p className="absolute bottom-5 right-5 rounded-pill bg-institutional/70 px-3 py-1.5 text-xs text-primary-100 backdrop-blur-sm">
        Illustrative institutional imagery
      </p>
    </section>
  );
}
