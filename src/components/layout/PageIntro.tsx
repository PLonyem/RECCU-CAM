import { Container } from "@/components/ui/Container";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-institutional py-section-sm text-white sm:py-section">
      <div aria-hidden="true" className="absolute -left-24 -top-24 h-72 w-72 rounded-pill bg-gold/15 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 right-0 h-80 w-80 rounded-pill bg-forest/30 blur-3xl" />
      <Container className="relative">
        <p className="text-meta uppercase text-accent-300">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-h1 text-white">
          {title}
        </h1>
        <p className="mt-6 max-w-reading text-lead text-primary-100">{description}</p>
      </Container>
    </section>
  );
}
