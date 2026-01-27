import { Book, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          
          {/* Left - About */}
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">City Library</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Serving our community with access to knowledge, culture, and information since 1892.
            </p>
          </div>

          {/* Right - Contact */}
          <div className="max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  123 Library Street
                  <br />
                  City, State 12345
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@citylibrary.org</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2026 City Library. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
