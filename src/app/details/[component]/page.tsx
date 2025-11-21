'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SplitSankeyComparison } from '@/components/comparison/SplitSankeyComparison';
import { BenefitMetricsBar, COMPONENT_METRICS } from '@/components/comparison/BenefitMetricsBar';

// Import diagram data
import farmCurrentData from '@/data/diagrams/detail-farms-current.json';
import farmProposedData from '@/data/diagrams/detail-farms-proposed.json';
import chickenHouseCurrentData from '@/data/diagrams/detail-chicken-house-current.json';
import chickenHouseProposedData from '@/data/diagrams/detail-chicken-house-proposed.json';
import processingPlantCurrentData from '@/data/diagrams/detail-processing-plant-current.json';
import processingPlantProposedData from '@/data/diagrams/detail-processing-plant-proposed.json';
import waterwaysCurrentData from '@/data/diagrams/detail-waterways-current.json';
import waterwaysProposedData from '@/data/diagrams/detail-waterways-proposed.json';
import anaerobicDigesterProposedData from '@/data/diagrams/detail-anaerobic-digester-proposed.json';
import pyrolysisUnitProposedData from '@/data/diagrams/detail-pyrolysis-unit-proposed.json';

// Component configuration with diagram data
const COMPONENT_CONFIG = {
  'farm': {
    name: 'Farm Operations',
    icon: '/images/iconslibrary/farm-01.svg',
    description: 'Comprehensive overview of farm-level inputs and outputs, tracking feed, water, and energy consumption alongside waste generation.',
    currentDiagram: farmCurrentData,
    proposedDiagram: farmProposedData,
    hasCurrentSystem: true
  },
  'chicken-house': {
    name: 'Chicken House',
    icon: '/images/iconslibrary/chicken-house-01.svg',
    description: 'Detailed analysis of poultry housing environments, focusing on litter management, ammonia reduction, and bird health optimization.',
    currentDiagram: chickenHouseCurrentData,
    proposedDiagram: chickenHouseProposedData,
    hasCurrentSystem: true
  },
  'processing-plant': {
    name: 'Processing Plant',
    icon: '/images/iconslibrary/processing-plant-01.svg',
    description: 'Processing facility operations, managing offal, wastewater, and energy consumption while recovering value from processing byproducts.',
    currentDiagram: processingPlantCurrentData,
    proposedDiagram: processingPlantProposedData,
    hasCurrentSystem: true
  },
  'waterways': {
    name: 'Waterways',
    icon: '/images/iconslibrary/farm-waterways-01.svg',
    description: 'Impact analysis on local water systems, highlighting nutrient runoff reduction and water quality protection measures.',
    currentDiagram: waterwaysCurrentData,
    proposedDiagram: waterwaysProposedData,
    hasCurrentSystem: true
  },
  'anaerobic-digester': {
    name: 'Anaerobic Digester',
    icon: '/images/iconslibrary/anaerobic-digester-01.svg',
    description: 'Advanced waste treatment system converting organic matter into biogas for renewable energy and nutrient-rich digestate.',
    currentDiagram: null,
    proposedDiagram: anaerobicDigesterProposedData,
    hasCurrentSystem: false
  },
  'pyrolysis-unit': {
    name: 'Pyrolysis Unit',
    icon: '/images/iconslibrary/pyrolysis-unit-01.svg',
    description: 'Thermal conversion technology transforming poultry litter into stable biochar and renewable heat energy.',
    currentDiagram: null,
    proposedDiagram: pyrolysisUnitProposedData,
    hasCurrentSystem: false
  }
} as const;

type ComponentSlug = keyof typeof COMPONENT_CONFIG;

interface DiagramData {
  metadata?: {
    title: string;
    description: string;
    type: string;
    system: string;
  };
  nodes: any[];
  links: any[];
  config: {
    width: number;
    height: number;
  };
}

export default function ComponentDetailPage() {
  const params = useParams();
  const componentSlug = params.component as ComponentSlug;
  
  const config = COMPONENT_CONFIG[componentSlug];

  // Get diagram data from config (already imported)
  const currentDiagram = useMemo(() => {
    return config?.currentDiagram as DiagramData | null;
  }, [config]);

  const proposedDiagram = useMemo(() => {
    return config?.proposedDiagram as DiagramData;
  }, [config]);

  const metrics = COMPONENT_METRICS[componentSlug] || [];

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 border border-destructive/20 bg-destructive/5">
          <h1 className="text-4xl font-bold text-destructive mb-4 uppercase tracking-wider">System Error</h1>
          <p className="text-muted-foreground mb-6 font-mono">COMPONENT_ID "{componentSlug}" NOT FOUND</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-mono text-sm"
          >
            <ArrowLeft size={20} />
            RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  if (!proposedDiagram) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 border border-destructive/20 bg-destructive/5">
          <h1 className="text-4xl font-bold text-destructive mb-4 uppercase tracking-wider">Data Error</h1>
          <p className="text-muted-foreground mb-6 font-mono">TELEMETRY DATA CORRUPTED</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-mono text-sm"
          >
            <ArrowLeft size={20} />
            RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50 w-full">
        <div className="w-full px-8 py-4">
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
            <div className="flex-1">
              <Link 
                href="/" 
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-1 transition-colors font-mono uppercase tracking-wide"
              >
                <ArrowLeft size={16} />
                Back to System View
              </Link>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-3 uppercase tracking-tight">
                <div className="relative w-12 h-12">
                  <Image src={config.icon} alt="" fill className="object-contain" />
                </div>
                {config.name} <span className="text-primary text-sm font-mono ml-2 opacity-75"> // DETAIL_VIEW</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full space-y-0">
        {/* Hero Section */}
        <section className="w-full bg-card border-b border-border py-16 px-8 relative overflow-hidden">
          <div className="max-w-[1600px] mx-auto">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl" />
            <div className="flex items-center gap-8 relative z-10">
              <div className="flex-shrink-0 p-4 bg-secondary/30 border border-border shadow-sm w-24 h-24 relative flex items-center justify-center">
                 <Image src={config.icon} alt={config.name} width={64} height={64} className="object-contain" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2 text-foreground uppercase tracking-wide flex items-center gap-2">
                  <span className="text-primary">›</span> {config.name}
                </h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed max-w-4xl">
                  {/* @ts-ignore - description exists on updated config */}
                  {config.description || `Detailed analysis of ${config.name.toLowerCase()} within the biochar circular economy system.`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Split Sankey Comparison */}
        <section className="w-full py-12 bg-secondary/30">
          <div className="w-full px-8">
             <SplitSankeyComparison
               currentDiagram={currentDiagram}
               proposedDiagram={proposedDiagram}
               componentName={config.name}
             />
          </div>
        </section>

        {/* Benefit Metrics */}
        {metrics.length > 0 && (
          <section className="w-full py-16 px-8 bg-card border-t border-border">
            <div className="max-w-[1600px] mx-auto">
              <BenefitMetricsBar metrics={metrics} />
            </div>
          </section>
        )}

        {/* Navigation Hint */}
        <section className="w-full bg-slate-950 border-t border-slate-800 py-12 px-8">
          <div className="max-w-[1600px] mx-auto flex items-center justify-center gap-4">
            <span className="text-2xl animate-pulse">💡</span>
            <p className="text-slate-400 font-mono text-sm">
              <span className="text-primary font-bold mr-2">SYSTEM TIP:</span> 
              CLICK COMPONENT NODES IN DIAGRAM TO NAVIGATE SUBSYSTEMS
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-slate-900 w-full">
        <div className="w-full px-12 py-6 flex justify-between items-center">
          <p className="text-xs text-slate-600 font-mono">
            © 2025 WASTE HUB SYSTEMS.
          </p>
          <div className="text-xs text-slate-600 font-mono">
            SYSTEM ID: {componentSlug.toUpperCase()}
          </div>
        </div>
      </footer>
    </div>
  );
}
