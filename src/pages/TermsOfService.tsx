import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, ArrowLeft, ScrollText } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
    <div className="min-h-screen flex flex-col paper-texture relative overflow-hidden">
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-secondary/8 via-secondary/4 to-transparent blur-3xl animate-breathe" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-primary/8 via-primary/4 to-transparent blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] text-primary/10 text-3xl animate-gentle-drift" style={{ animationDelay: '1s' }}>🐾</div>
        <div className="absolute bottom-[30%] left-[12%] text-secondary/10 text-2xl animate-gentle-drift" style={{ animationDelay: '4s' }}>🐾</div>
      </div>

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <PawPrint className="w-6 h-6 text-primary" />
          <Link to="/" className="text-xl font-serif font-bold bg-gradient-to-br from-primary to-chart-5 bg-clip-text text-transparent">
            Paws Up
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="rounded-xl gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="rounded-xl">
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-4 pb-12 relative z-10">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full text-sm font-medium text-accent-foreground mb-6 shadow-sm">
              <ScrollText className="w-4 h-4 text-primary" />
              <span>Please read carefully</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-br from-primary via-primary to-chart-5 bg-clip-text text-transparent">
                Terms of Service
              </span>
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <Card className="glass-card rounded-2xl shadow-lg mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <p className="text-foreground leading-relaxed">
                Welcome to Paws Up! These Terms of Service govern your use of our pet care and budgeting game application. By using Paws Up, you agree to these terms. Please read them carefully before using our service.
              </p>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <Card
                key={index}
                className="glass-card rounded-2xl shadow-lg animate-fade-in-up"
                style={{ animationDelay: `${0.15 + index * 0.05}s` }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-serif text-primary">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer links */}
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <p className="text-muted-foreground text-sm">
              See also: <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
