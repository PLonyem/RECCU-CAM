import { Container } from "@/components/ui/Container";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="relative overflow-hidden border-b border-primary-100 bg-primary-900 py-16 text-white sm:py-20">
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#F0C351_0,transparent_28%),radial-gradient(circle_at_80%_80%,#7CBA99_0,transparent_30%)]" />
      <Container className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-300">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-100">{description}</p>
      </Container>
    </section>
  );
}
