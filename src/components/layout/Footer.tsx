
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-card border-t border-border py-8 text-center text-muted-foreground">
      <div className="container mx-auto px-4">
        <p>&copy; {currentYear} BenimSitem. Tüm hakları saklıdır.</p>
        <p className="text-sm mt-1">
          Profesyonel ve modern bir dokunuşla tasarlandı.
        </p>
      </div>
    </footer>
  );
}
