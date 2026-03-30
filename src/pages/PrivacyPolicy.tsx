import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PawPrint, ChevronRight, Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support. This may include:

• Email address and password for account authentication
• Username and profile preferences
• Game progress and financial tracking data you choose to input
• Device information and usage statistics to improve our service`,
    },
    {
      title: 'How We Use Your Information',
      content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices, updates, and support messages
• Respond to your comments, questions, and customer service requests
• Monitor and analyze trends, usage, and activities in connection with our services`,
    },
    {
      title: 'Data Storage and Security',
      content: `We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. Your data is stored securely using industry-standard encryption and security practices.

We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time.`,
    },
    {
      title: 'Sharing of Information',
      content: `We do not sell, trade, or otherwise transfer your personal information to third parties. We may share information only in the following circumstances:

• With your consent or at your direction
• With service providers who assist in our operations
• To comply with legal obligations or protect our rights
• In connection with a merger, acquisition, or sale of assets`,
    },
    {
      title: 'Your Rights and Choices',
      content: `You have the right to:

• Access, update, or delete your personal information
• Opt out of promotional communications
• Request a copy of your data
• Withdraw consent where applicable

To exercise these rights, please contact us through the app or email us directly.`,
    },
    {
      title: 'Cookies and Tracking',
      content: `We use cookies and similar tracking technologies to collect and store information about your preferences and usage. You can control cookies through your browser settings, though disabling them may affect some features of our service.`,
    },
    {
      title: "Children's Privacy",
      content: `Our service is designed to be family-friendly. We do not knowingly collect personal information from children under 13 without parental consent. If you believe we have collected information from a child under 13, please contact us immediately.`,
    },
    {
      title: 'Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the service after changes constitutes acceptance of the updated policy.`,
    },
    {
      title: 'Contact Us',
      content: `If you have any questions about this Privacy Policy or our practices, please contact us through the app's support feature or reach out to our team directly.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Accent top line */}
      <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 w-full" />

      {/* Navbar */}
      <nav
        className={`border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50 transition-all duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">Paws Up</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Features
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full" />
            </a>
            <a
              href="/#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              How it works
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-9 px-4 font-medium"
              >
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="sm"
                className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-sm"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6 border border-primary/20">
            <Shield className="w-4 h-4" />
            Legal
          </div>
          <h1 className="font-serif text-5xl font-bold text-foreground leading-[1.1] tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to Paws Up! We are committed to protecting your privacy and ensuring you have a positive experience using our app. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our pet care and budgeting game.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Contents</p>
          <div className="grid sm:grid-cols-2 gap-1">
            {sections.map((section, index) => (
              <a
                key={index}
                href={`#section-${index}`}
                className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors py-1.5"
              >
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <section key={index} id={`section-${index}`} className="scroll-mt-24">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">{section.title}</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</div>
            </section>
          ))}
        </div>

        {/* Bottom navigation */}
        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
          <Link
            to="/terms"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/faq"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <div className="border-t border-border py-7">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PawPrint className="w-4 h-4" />
            <span className="font-medium">Paws Up</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
