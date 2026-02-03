import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
      title: 'Children\'s Privacy',
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
    <div className="min-h-screen flex flex-col paper-texture relative overflow-hidden">
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-primary/8 via-primary/4 to-transparent blur-3xl animate-breathe" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-secondary/8 via-secondary/4 to-transparent blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[15%] left-[12%] text-primary/10 text-3xl animate-gentle-drift" style={{ animationDelay: '0s' }}>🐾</div>
        <div className="absolute bottom-[25%] right-[15%] text-secondary/10 text-2xl animate-gentle-drift" style={{ animationDelay: '3s' }}>🐾</div>
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
              <Shield className="w-4 h-4 text-primary" />
              <span>Your privacy matters to us</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-br from-primary via-primary to-chart-5 bg-clip-text text-transparent">
                Privacy Policy
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
                Welcome to Paws Up! We are committed to protecting your privacy and ensuring you have a positive experience using our app. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our pet care and budgeting game.
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
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <p className="text-muted-foreground text-sm">
              See also: <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
