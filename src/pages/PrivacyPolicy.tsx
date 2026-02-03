import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PawPrint, ArrowLeft, Shield, ChevronRight } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support. This may include:

• Email address and password for account authentication
• Username and profile preferences
• Game progress and financial tracking data you choose to input
• Device information and usage statistics to improve our service`
    },
    {
      title: 'How We Use Your Information',
      content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices, updates, and support messages
• Respond to your comments, questions, and customer service requests
• Monitor and analyze trends, usage, and activities in connection with our services`
    },
    {
      title: 'Data Storage and Security',
      content: `We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. Your data is stored securely using industry-standard encryption and security practices.

We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time.`
    },
    {
      title: 'Sharing of Information',
      content: `We do not sell, trade, or otherwise transfer your personal information to third parties. We may share information only in the following circumstances:

• With your consent or at your direction
• With service providers who assist in our operations
• To comply with legal obligations or protect our rights
• In connection with a merger, acquisition, or sale of assets`
    },
    {
      title: 'Your Rights and Choices',
      content: `You have the right to:

• Access, update, or delete your personal information
• Opt out of promotional communications
• Request a copy of your data
• Withdraw consent where applicable

To exercise these rights, please contact us through the app or email us directly.`
    },
    {
      title: 'Cookies and Tracking',
      content: `We use cookies and similar tracking technologies to collect and store information about your preferences and usage. You can control cookies through your browser settings, though disabling them may affect some features of our service.`
    },
    {
      title: "Children's Privacy",
      content: `Our service is designed to be family-friendly. We do not knowingly collect personal information from children under 13 without parental consent. If you believe we have collected information from a child under 13, please contact us immediately.`
    },
    {
      title: 'Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the service after changes constitutes acceptance of the updated policy.`
    },
    {
      title: 'Contact Us',
      content: `If you have any questions about this Privacy Policy or our practices, please contact us through the app's support feature or reach out to our team directly.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-primary/10 rounded-lg transition-colors group-hover:bg-primary/20">
              <PawPrint className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif font-bold bg-gradient-to-r from-primary to-chart-5 bg-clip-text text-transparent">
              Paws Up
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border-0">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">Legal</span>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to Paws Up! We are committed to protecting your privacy and ensuring you have a positive experience using our app. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our pet care and budgeting game.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 p-6 bg-card/50 rounded-2xl border border-border/20">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Contents</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {sections.map((section, index) => (
              <a
                key={index}
                href={`#section-${index}`}
                className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors py-1"
              >
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, index) => (
            <section key={index} id={`section-${index}`} className="scroll-mt-20">
              <h2 className="text-xl font-serif font-semibold mb-4 text-foreground">
                {section.title}
              </h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Footer navigation */}
        <div className="mt-16 pt-8 border-t border-border/30">
          <div className="flex items-center justify-between">
            <Link
              to="/terms"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span>Terms of Service</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/faq"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span>FAQ</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
