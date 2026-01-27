import { Book, Users, Clock, Award } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl mb-6">About City Library</h1>
          <p className="text-xl text-muted-foreground">
            Serving our community with access to knowledge, culture, and information since 1892
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl mb-6">Our Mission</h2>
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p className="leading-relaxed mb-4">
            The City Library is dedicated to providing free and equal access to information, ideas, and
            resources to all members of our community. We strive to be a welcoming space where people of
            all ages and backgrounds can explore, learn, and grow.
          </p>
          <p className="leading-relaxed">
            Through our extensive collection of books, digital resources, and community programs, we aim
            to foster literacy, support lifelong learning, and strengthen community bonds.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl mb-12 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Book className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Extensive Collection</h3>
              <p className="text-muted-foreground">
                Over 50,000 books spanning all genres and subjects, plus digital resources and audiobooks
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Community Programs</h3>
              <p className="text-muted-foreground">
                Book clubs, author talks, children's story time, and educational workshops
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Extended Hours</h3>
              <p className="text-muted-foreground">
                Open 7 days a week with evening and weekend hours for your convenience
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Award-Winning</h3>
              <p className="text-muted-foreground">
                Recognized for excellence in library services and community engagement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl mb-6">Our History</h2>
        <div className="space-y-6 text-muted-foreground">
          <p className="leading-relaxed">
            Founded in 1892 by a group of civic-minded citizens, the City Library began as a small
            reading room with just 500 books. Through the generous support of the community and dedicated
            librarians, we have grown into a cornerstone institution serving over 15,000 active members.
          </p>
          <p className="leading-relaxed">
            Our beautiful historic building, designed in the Beaux-Arts style, was completed in 1905 and
            has been carefully preserved while being modernized to meet the needs of today's library users.
            Recent renovations have added state-of-the-art technology labs, collaborative study spaces, and
            a dedicated children's wing.
          </p>
          <p className="leading-relaxed">
            Today, we continue to honor our founding mission while embracing new technologies and services
            to serve our evolving community. From our earliest days to the present, the City Library
            remains committed to being a free and open resource for all.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl mb-4">Visit Us Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Everyone is welcome at the City Library. Come discover your next favorite book!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15551234567"
              className="px-8 py-3 bg-white text-primary rounded-lg hover:bg-white/90 transition-colors"
            >
              Call Us: (555) 123-4567
            </a>
            <a
              href="mailto:info@citylibrary.org"
              className="px-8 py-3 bg-white/10 border-2 border-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
