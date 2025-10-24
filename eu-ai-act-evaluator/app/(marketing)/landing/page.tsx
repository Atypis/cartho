'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Shield,
  FileText,
  Zap,
  CheckCircle2,
  Brain,
  Scale,
  Target,
  Building2,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-sm'
          : 'bg-white/80 backdrop-blur-xl border-b border-neutral-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">EU</span>
              </div>
              <div>
                <div className="font-bold text-xl text-neutral-900">AI Act Evaluator</div>
                <div className="text-xs text-neutral-500 -mt-0.5">by Cartho</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Enter App
              </Link>
              <Button size="sm" className="bg-neutral-900 hover:bg-neutral-800">
                Request Access
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-6 bg-neutral-900 text-white border-0 px-4 py-1.5">
              Now in Private Beta
            </Badge>

            <h1 className="text-6xl md:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
              Navigate the EU AI Act with
              <span className="block bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text text-transparent">
                Precision & Confidence
              </span>
            </h1>

            <p className="text-xl text-neutral-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Transform complex legal obligations into actionable compliance roadmaps.
              Built for AI teams, legal counsel, and compliance officers navigating Europe&apos;s
              landmark AI regulation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-6 text-lg group">
                Join Private Beta
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="/">
                  View Live Demo
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Based on Official EU AI Act Text
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Prescriptive Norms Framework
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                LLM-Powered Analysis
              </div>
            </div>
          </div>

          {/* Hero Visual - Screenshot placeholder */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 rounded-3xl blur-2xl opacity-50" />
            <Card className="relative overflow-hidden border-2 border-neutral-200 shadow-2xl">
              <div className="bg-gradient-to-br from-white to-neutral-50 p-1">
                <div className="bg-white rounded-lg border border-neutral-200 aspect-[16/10] flex items-center justify-center">
                  <div className="text-center p-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-2xl mb-6">
                      <Scale className="w-10 h-10 text-neutral-700" />
                    </div>
                    <p className="text-neutral-500 font-medium">
                      Interactive Evaluation Dashboard Preview
                    </p>
                    <p className="text-sm text-neutral-400 mt-2">
                      Screenshots coming soon
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 border-neutral-200">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Everything you need for AI Act compliance
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              From initial assessment to ongoing monitoring, we&apos;ve built the tools
              to keep your AI systems compliant.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: 'Prescriptive Norms Mapping',
                description: 'Every obligation decomposed into actionable requirements with clear applicability conditions.',
                color: 'blue'
              },
              {
                icon: Brain,
                title: 'LLM-Powered Evaluation',
                description: 'Advanced AI analyzes your system descriptions against 100+ prescriptive norms automatically.',
                color: 'purple'
              },
              {
                icon: Target,
                title: 'Use Case Management',
                description: 'Document and track all your AI systems in one place. See which obligations apply to each.',
                color: 'green'
              },
              {
                icon: Scale,
                title: 'Legal Transparency',
                description: 'Every decision includes citations to specific articles, paragraphs, and recitals of the Act.',
                color: 'orange'
              },
              {
                icon: Zap,
                title: 'Real-Time Updates',
                description: 'Track evaluation progress live. See exactly which requirements are being assessed.',
                color: 'red'
              },
              {
                icon: Shield,
                title: 'Compliance Cockpit',
                description: 'Dashboard view of all obligations by use case. Filter by risk level, implementation status, and more.',
                color: 'indigo'
              },
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all border-2 border-neutral-200 group hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-${feature.color}-100 rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 border-neutral-200">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              From description to compliance in minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Describe Your AI System',
                description: 'Tell us what your AI does, who uses it, and how it works. Our LLM understands natural language.',
                icon: FileText
              },
              {
                step: '02',
                title: 'Get Instant Assessment',
                description: 'We evaluate your system against all applicable prescriptive norms from the EU AI Act.',
                icon: Brain
              },
              {
                step: '03',
                title: 'Navigate Obligations',
                description: 'See exactly which obligations apply, why they apply, and what you need to do to comply.',
                icon: CheckCircle2
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-neutral-100 mb-4">{step.step}</div>
                <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-900 rounded-xl mb-6">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">{step.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{step.description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-24 -right-4 text-neutral-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 border-neutral-200">Built For</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Designed for legal and technical teams
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 border-2 border-neutral-200 hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">For Companies</h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI Product Teams building systems subject to the Act</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Compliance Officers managing regulatory risk</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>In-house Legal Counsel interpreting obligations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>CTOs and Technical Leaders planning compliance roadmaps</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 border-2 border-neutral-200 hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6">
                <Briefcase className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">For Legal Professionals</h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Law Firms advising clients on AI Act compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Compliance Consultants conducting assessments</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Legal Researchers analyzing the Act&apos;s requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Policy Advisors working with regulators</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-1.5">
            Limited Spots Available
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join the Private Beta
          </h2>

          <p className="text-xl text-neutral-300 mb-10 leading-relaxed">
            Be among the first to experience the most sophisticated EU AI Act compliance
            platform. Request access today and get priority onboarding.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-6 py-4 rounded-xl bg-white border-2 border-transparent focus:border-neutral-400 outline-none text-neutral-900 text-lg"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-white text-neutral-900 hover:bg-neutral-100 px-8 py-4 text-lg font-semibold"
                >
                  Request Access
                </Button>
              </div>
              <p className="text-sm text-neutral-400 mt-4">
                No credit card required. Priority access for early adopters.
              </p>
            </form>
          ) : (
            <div className="max-w-md mx-auto">
              <Card className="p-8 bg-white/5 border-white/10">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-white text-lg font-medium mb-2">You&apos;re on the list!</p>
                <p className="text-neutral-300">
                  We&apos;ll be in touch soon with your access details.
                </p>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-neutral-900 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-neutral-900 font-bold text-lg">EU</span>
              </div>
              <div>
                <div className="font-bold text-white">EU AI Act Evaluator</div>
                <div className="text-xs text-neutral-400">by Cartho</div>
              </div>
            </div>

            <div className="flex gap-6 text-sm text-neutral-400">
              <Link href="/" className="hover:text-white transition-colors">
                App
              </Link>
              <Link href="/landing#features" className="hover:text-white transition-colors">
                Features
              </Link>
              <a href="mailto:hello@cartho.com" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>

            <div className="text-sm text-neutral-400">
              © 2025 Cartho. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
