
"use client"; // Keep client directive as it uses hooks and form from ContactFormSection

import ContactFormSection from './ContactFormSection'; // Import the translated component

export default function ContactPage() {
  return (
    <div className="space-y-12 rounded-xl bg-gradient-to-br from-[hsl(var(--hero-gradient-start-hsl))] via-[hsl(var(--hero-gradient-mid-hsl))] to-[hsl(var(--hero-gradient-end-hsl))] p-4 md:p-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">Contact</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          You can use the form below to contact me, discuss projects, or collaborate.
        </p>
      </section>
      <ContactFormSection />
    </div>
  );
}
