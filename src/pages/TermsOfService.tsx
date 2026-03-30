import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PawPrint, ChevronRight, ScrollText } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
      title: 'Acceptance of Terms',
      content: `By accessing or using Paws Up, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this application.`,
    },
    {
      title: 'Description of Service',
      content: `Paws Up is a gamified application that combines virtual pet care with personal finance tracking. The app allows you to:

• Adopt and care for virtual pets
• Track your real-world budget and expenses
• Complete tasks and challenges to earn in-game rewards
• Learn financial management through gameplay

The service is provided for entertainment and educational purposes.`,
    },
    {
      title: 'User Accounts',
      content: `To use certain features of our service, you must create an account. You are responsible for:

• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Notifying us immediately of any unauthorized use
• Providing accurate and complete registration information

We reserve the right to suspend or terminate accounts that violate these terms.`,
    },
    {
      title: 'User Conduct',
      content: `You agree not to:

• Use the service for any unlawful purpose
• Attempt to gain unauthorized access to any part of the service
• Interfere with or disrupt the service or servers
• Upload malicious code or harmful content
• Impersonate others or misrepresent your affiliation
• Exploit bugs or vulnerabilities instead of reporting them`,
    },
    {
      title: 'Intellectual Property',
      content: `All content, features, and functionality of Paws Up, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the exclusive property of Paws Up and are protected by copyright, trademark, and other intellectual property laws.

You may not reproduce, distribute, modify, or create derivative works without our express written permission.`,
    },
    {
      title: 'Virtual Currency and Items',
      content: `Paws Up may include virtual currency, points, or items that can be earned through gameplay. These virtual items:

• Have no real-world monetary value
• Cannot be exchanged for real currency
• Are non-transferable between accounts
• May be modified or removed at our discretion

We reserve the right to manage, regulate, control, modify, or eliminate virtual items at any time.`,
    },
    {
      title: 'Financial Tracking Disclaimer',
      content: `The financial tracking features in Paws Up are intended for personal budgeting assistance and educational purposes only. We do not provide financial advice, and you should not rely solely on this app for financial decisions.

• The app does not connect to real bank accounts
• All financial data you enter is self-reported
• We are not responsible for any financial decisions you make based on app information
• Consult a qualified financial advisor for professional advice`,
    },
    {
      title: 'Limitation of Liability',
      content: `To the fullest extent permitted by law, Paws Up shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.

Our total liability for any claims arising from your use of the service shall not exceed the amount you paid us, if any, in the twelve months prior to the claim.`,
    },
    {
      title: 'Service Modifications',
      content: `We reserve the right to modify, suspend, or discontinue any part of the service at any time without prior notice. We may also impose limits on certain features or restrict your access to parts or all of the service without notice or liability.`,
    },
    {
      title: 'Termination',
      content: `We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the service will immediately cease.`,
    },
    {
      title: 'Governing Law',
      content: `These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these terms or your use of the service shall be resolved through binding arbitration or in the courts of competent jurisdiction.`,
    },
    {
      title: 'Changes to Terms',
      content: `We reserve the right to update these Terms of Service at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the service after changes constitutes acceptance of the updated terms.`,
    },
    {
      title: 'Contact Information',
      content: `If you have any questions about these Terms of Service, please contact us through the app's support feature or reach out to our team directly.`,
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
            <ScrollText className="w-4 h-4" />
            Legal
          </div>
          <h1 className="font-serif text-5xl font-bold text-foreground leading-[1.1] tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to Paws Up! These Terms of Service govern your use of our pet care and budgeting game application. By using Paws Up, you agree to these terms. Please read them carefully before using our service.
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
            to="/privacy"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
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

export default TermsOfService;
