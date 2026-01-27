import Link from 'next/link';
import {
  Sparkles,
  Zap,
  Calendar,
  Palette,
  FileText,
  Video,
  ArrowRight,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description:
      'Transform any blog URL into LinkedIn posts, TikTok scripts, and cover images automatically.',
  },
  {
    icon: Palette,
    title: 'Brand Voice Presets',
    description:
      'Save your brand style once. Our AI remembers your tone, style, and preferences every time.',
  },
  {
    icon: FileText,
    title: 'Approval Workflow',
    description:
      'Edit, review, and approve content before publishing. Track versions and content status.',
  },
  {
    icon: Calendar,
    title: 'Content Calendar',
    description:
      'Visualize and schedule your content with a drag-and-drop calendar interface.',
  },
  {
    icon: Video,
    title: 'Asset Transformation',
    description:
      'Upload videos and get transcriptions, tweet threads, blog articles, and Reels ideas.',
  },
  {
    icon: Zap,
    title: 'One-Click Publishing',
    description:
      'Connect your social accounts and publish directly to LinkedIn, Twitter, and more.',
  },
];

const benefits = [
  'No more repeating brand tone in every prompt',
  'Organized projects, not infinite chat histories',
  'Single workflow for text, scripts, and images',
  'Real agency-style approval process',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Postry AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="btn-ghost">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Automated Content Factory</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
            Transform Content Into
            <span className="gradient-text block mt-2">Multi-Platform Magic</span>
          </h1>
          <p className="text-xl text-foreground-muted max-w-2xl mx-auto mb-10">
            Paste a blog URL and let AI generate LinkedIn posts, TikTok scripts, and cover images.
            All with your brand voice, automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              Start Creating Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-8 py-3">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="card bg-background-secondary border-border-light overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-error" />
              <div className="w-3 h-3 rounded-full bg-warning" />
              <div className="w-3 h-3 rounded-full bg-success" />
            </div>
            <div className="bg-background rounded-lg p-6 min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-foreground-muted">
                  Interactive demo coming soon...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Postry AI vs. ChatGPT?
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Stop copy-pasting between chats. Get a purpose-built content factory.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border"
              >
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Scale Content
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              From idea to published post, all in one workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-primary p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Automate Your Content?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Join creators and brands who are scaling their social presence with AI.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">Postry AI</span>
            </div>
            <p className="text-foreground-muted text-sm">
              © 2026 Postry AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
