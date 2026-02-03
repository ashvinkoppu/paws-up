import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PawPrint, ArrowLeft, ScrollText, ChevronRight } from 'lucide-react';

const TermsOfService: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: 'Acceptance of Terms',
      content: `By accessing or using Paws Up, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this application.`
    },
    {
      title: 'Description of Service',
      content: `Paws Up is a gamified application that combines virtual pet care with personal finance tracking. The app allows you to:

• Adopt and care for virtual pets
• Track your real-world budget and expenses
• Complete tasks and challenges to earn in-game rewards
• Learn financial management through gameplay

The service is provided for entertainment and educational purposes.`
    },
    {
      title: 'User Accounts',
      content: `To use certain features of our service, you must create an account. You are responsible for:

• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Notifying us immediately of any unauthorized use
• Providing accurate and complete registration information

We reserve the right to suspend or terminate accounts that violate these terms.`
    },
    {
      title: 'User Conduct',
      content: `You agree not to:

• Use the service for any unlawful purpose
• Attempt to gain unauthorized access to any part of the service
• Interfere with or disrupt the service or servers
• Upload malicious code or harmful content
• Impersonate others or misrepresent your affiliation
• Exploit bugs or vulnerabilities instead of reporting them`
    },
    {
      title: 'Intellectual Property',
      content: `All content, features, and functionality of Paws Up, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the exclusive property of Paws Up and are protected by copyright, trademark, and other intellectual property laws.

You may not reproduce, distribute, modify, or create derivative works without our express written permission.`
    },
    {
      title: 'Virtual Currency and Items',
      content: `Paws Up may include virtual currency, points, or items that can be earned through gameplay. These virtual items:

• Have no real-world monetary value
• Cannot be exchanged for real currency
• Are non-transferable between accounts
• May be modified or removed at our discretion

We reserve the right to manage, regulate, control, modify, or eliminate virtual items at any time.`
    },
    {
      title: 'Financial Tracking Disclaimer',
      content: `The financial tracking features in Paws Up are intended for personal budgeting assistance and educational purposes only. We do not provide financial advice, and you should not rely solely on this app for financial decisions.

• The app does not connect to real bank accounts
• All financial data you enter is self-reported
• We are not responsible for any financial decisions you make based on app information
• Consult a qualified financial advisor for professional advice`
    },
    {
      title: 'Limitation of Liability',
      content: `To the fullest extent permitted by law, Paws Up shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.

Our total liability for any claims arising from your use of the service shall not exceed the amount you paid us, if any, in the twelve months prior to the claim.`
    },
    {
      title: 'Service Modifications',
      content: `We reserve the right to modify, suspend, or discontinue any part of the service at any time without prior notice. We may also impose limits on certain features or restrict your access to parts or all of the service without notice or liability.`
    },
    {
      title: 'Termination',
      content: `We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the service will immediately cease.`
    },
    {
      title: 'Governing Law',
      content: `These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these terms or your use of the service shall be resolved through binding arbitration or in the courts of competent jurisdiction.`
    },
    {
      title: 'Changes to Terms',
      content: `We reserve the right to update these Terms of Service at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the service after changes constitutes acceptance of the updated terms.`
    },
    {
      title: 'Contact Information',
      content: `If you have any questions about these Terms of Service, please contact us through the app's support feature or reach out to our team directly.`
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full text-sm mb-4">
            <ScrollText className="w-4 h-4 text-secondary" />
            <span className="text-secondary font-medium">Legal</span>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to Paws Up! These Terms of Service govern your use of our pet care and budgeting game application. By using Paws Up, you agree to these terms. Please read them carefully before using our service.
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
              to="/privacy"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span>Privacy Policy</span>
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

export default TermsOfService;
