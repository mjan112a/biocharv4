'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CircularSankeyHomepage } from '@/components/d3/CircularSankeyHomepage';
import { TitleDropdown } from '@/components/ui/TitleDropdown';

// Import the diagram data
import currentSystemData from '@/data/diagrams/system-overview-current.json';
import proposedSystemData from '@/data/diagrams/system-overview-proposed.json';

export default function HomePage() {
  const [showProposed, setShowProposed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm w-full">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/wastehub-logo.png"
              alt="WasteHub"
              width={200}
              height={60}
              className="h-12 w-auto"
              priority
            />
            <div className="h-8 w-px bg-border" />
            <TitleDropdown />
          </div>
          
          {/* Navigation Links */}
          <nav className="flex items-center justify-between mt-4 border-t border-border pt-3">
            <div className="flex items-center gap-4">
              <Link
                href="/trial-results"
                className="text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
              >
                📊 Trial Results
              </Link>
              <Link
                href="/intellectual-property"
                className="text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
              >
                🔒 Intellectual Property
              </Link>
              <Link
                href="/oldpage"
                className="text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
              >
                📄 Old Homepage
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full space-y-0">
        {/* Hero Section */}
        <section className="w-full">
          <div className="relative h-[500px] overflow-hidden group border-b border-border">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src="/images/hero-biochar.jpg"
                alt="The Biochar Revolution"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Technical Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
              <div className="absolute inset-0 bg-tech-grid opacity-20" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center px-12">
              <div className="max-w-3xl border-l-4 border-primary pl-8">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <span className="inline-block w-2 h-2 bg-primary animate-pulse" />
                  <span className="text-sm font-mono uppercase tracking-wider">System Operational</span>
                </div>
                <h1 className="text-6xl font-bold mb-4 text-white leading-none tracking-tight">
                  BIOCHAR<span className="text-primary">.OS</span>
                  <br />
                  <span className="text-3xl font-light text-slate-300">SYSTEM OVERVIEW</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-xl border-t border-slate-700 pt-4 mt-4">
                  Advanced poultry waste valorization. Turning liability into a carbon-negative asset class.
                </p>
              </div>
            </div>

            {/* Biochar Innovations Inc. watermark */}
            <div className="absolute bottom-4 right-6 text-slate-400 text-xs font-mono tracking-widest">
              BIOCHAR INNOVATIONS INC. // V2.0
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="w-full bg-card border-b border-border py-16 px-6 lg:px-12">
          <div className="max-w-[1440px] mx-auto relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary -ml-6 lg:-ml-12" />
            <h2 className="text-4xl font-bold mb-8 text-foreground">
              Poultry Waste to Value: A Circular Solution
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  The poultry industry generates <strong>40+ million tonnes of waste annually</strong>. Our integrated system transforms <strong>100% of poultry litter</strong> into biochar, renewable energy, and organic fertilizer.
                </p>
                <div className="flex items-center gap-4">
                   <div className="flex flex-col border border-border p-4 bg-secondary/30 min-w-[140px]">
                     <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Carbon Impact</span>
                     <span className="text-2xl font-bold text-primary">Net Negative</span>
                   </div>
                   <div className="flex flex-col border border-border p-4 bg-secondary/30 min-w-[140px]">
                     <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Waste Output</span>
                     <span className="text-2xl font-bold text-primary">0%</span>
                   </div>
                </div>
              </div>
              <div className="bg-secondary/10 p-6 flex flex-col justify-center border border-border">
                <p className="text-sm text-muted-foreground font-medium">
                  <span className="text-primary font-bold text-lg block mb-2">💡 Interactive Diagram</span>
                  Use the toggle below to compare current practices with our proposed circular system. Click on component icons to explore detailed metrics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* System Toggle & Diagram */}
        <section className="w-full py-12 px-6 lg:px-12 bg-secondary/30">
          <div className="max-w-[1440px] mx-auto bg-card border border-border shadow-sm">
            {/* Header Bar */}
            <div className="p-6 flex items-center justify-between border-b border-border">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  System Comparison
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {showProposed ? 'Proposed Biochar Circular Model' : 'Current Linear Waste Model'}
                </p>
              </div>

              {/* Toggle Buttons */}
              <div className="flex bg-secondary/50 p-1">
                <button
                  onClick={() => setShowProposed(false)}
                  className={`px-6 py-2.5 text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    !showProposed
                      ? 'bg-white text-destructive shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>⚠️</span>
                  Current
                </button>
                <button
                  onClick={() => setShowProposed(true)}
                  className={`px-6 py-2.5 text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    showProposed
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>✨</span>
                  Proposed
                </button>
              </div>
            </div>

            <div className="px-6 pb-8">
              {/* Status Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Current System Card */}
                <div className={`p-6 border transition-all ${
                  !showProposed 
                    ? 'border-destructive/30 bg-destructive/5 ring-1 ring-destructive/20' 
                    : 'border-border bg-secondary/10 opacity-60'
                }`}>
                  <h3 className="font-bold text-destructive mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive" />
                    Current Practice Issues
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-destructive/10 flex items-center justify-center text-destructive text-xs font-bold">!</span>
                      High ammonia emissions (+90%)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-destructive/10 flex items-center justify-center text-destructive text-xs font-bold">!</span>
                      Expensive waste disposal costs
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-destructive/10 flex items-center justify-center text-destructive text-xs font-bold">!</span>
                      100% fossil fuel dependency
                    </li>
                  </ul>
                </div>
                
                {/* Proposed System Card */}
                <div className={`p-6 border transition-all ${
                  showProposed 
                    ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20' 
                    : 'border-border bg-secondary/10 opacity-60'
                }`}>
                  <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary" />
                    Biochar System Benefits
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</span>
                      90% ammonia reduction
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</span>
                      Multiple new revenue streams
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</span>
                      100% energy self-sufficient
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sankey Diagram */}
              <div className="border border-border bg-white/50 backdrop-blur-sm p-8 shadow-inner">
                {/* Diagram Container */}
                <div>
                  <CircularSankeyHomepage
                    diagramData={showProposed ? proposedSystemData : currentSystemData}
                    width={1000}
                    height={850}
                  />
                </div>

                {/* Legend */}
                <div className="border-t border-border bg-secondary/20 p-4 flex justify-between items-center">
                  <div className="text-xs font-mono text-muted-foreground">
                    <span className="mr-4">LEGEND:</span>
                    <span className="mr-4">● NODES: COMPONENT SYSTEMS</span>
                    <span className="mr-4">〰 LINES: MASS FLOW</span>
                    <span className="mr-4">⟳ ANIMATION: DIRECTIONALITY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        {showProposed && (
          <section className="w-full py-16 px-6 lg:px-12 bg-card border-t border-border">
            <div className="max-w-[1440px] mx-auto grid md:grid-cols-3 gap-8">
              {/* Environmental */}
              <div className="bg-card p-8 border border-border hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-2xl mb-6 text-primary group-hover:scale-110 transition-transform duration-300">🌍</div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Environmental Impact</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary mt-1.5" />
                    Net-negative carbon emissions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary mt-1.5" />
                    95% reduction in water pollution
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary mt-1.5" />
                    Permanent carbon sequestration
                  </li>
                </ul>
              </div>

              {/* Economic */}
              <div className="bg-card p-8 border border-border hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center text-2xl mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">💰</div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Economic Benefits</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 mt-1.5" />
                    Carbon credits: $177/tonne CO₂
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 mt-1.5" />
                    100% energy independence
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 mt-1.5" />
                    Eliminate disposal costs
                  </li>
                </ul>
              </div>

              {/* Operational */}
              <div className="bg-card p-8 border border-border hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 bg-amber-500/10 flex items-center justify-center text-2xl mb-6 text-amber-600 group-hover:scale-110 transition-transform duration-300">⚡</div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Operational Gains</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 mt-1.5" />
                    Lower bird mortality rates
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 mt-1.5" />
                    Improved feed conversion
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 mt-1.5" />
                    25-37% more biogas production
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Call to Action Footer */}
      <footer className="relative border-t border-border bg-slate-950 text-slate-50 w-full">
        <div className="relative w-full px-6 lg:px-12 py-20">
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                Waste Hub <span className="text-primary font-light">Bioloop™</span>
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                Industrial-grade circular economy solutions. Transform liabilities into assets with our patent-pending process.
              </p>
              <div className="flex gap-4">
                <button className="bg-primary text-slate-950 font-bold px-8 py-3 hover:bg-emerald-400 transition-colors uppercase tracking-wider text-sm">
                  Request Protocol
                </button>
                <button className="border border-slate-700 text-white font-bold px-8 py-3 hover:bg-slate-900 transition-colors uppercase tracking-wider text-sm">
                  Contact Sales
                </button>
              </div>
            </div>
            <div className="border-l border-slate-800 pl-12 hidden md:block">
               <div className="grid grid-cols-2 gap-8">
                 <div>
                   <h4 className="text-xs font-mono text-slate-500 uppercase mb-2">Technology</h4>
                   <ul className="text-sm text-slate-300 space-y-2">
                     <li>Biochar Reactor V4</li>
                     <li>Anaerobic Digestion</li>
                     <li>Power Generation</li>
                   </ul>
                 </div>
                 <div>
                   <h4 className="text-xs font-mono text-slate-500 uppercase mb-2">Compliance</h4>
                   <ul className="text-sm text-slate-300 space-y-2">
                     <li>EPA Certified</li>
                     <li>ISO 14001</li>
                     <li>Carbon Registry</li>
                   </ul>
                 </div>
               </div>
            </div>
          </div>
        </div>
        
        {/* Copyright Bar */}
        <div className="border-t border-slate-900 bg-black w-full">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
            <p className="text-xs text-slate-600 font-mono">
              © 2025 WASTE HUB SYSTEMS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-4 text-xs text-slate-600 font-mono">
              <span>PRIVACY PROTOCOL</span>
              <span>TERMS OF SERVICE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
