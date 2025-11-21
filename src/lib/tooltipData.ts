/**
 * Tooltip Data for Material Flows
 * Provides hover information for animated icons
 */

export interface TooltipMetric {
  label: string;
  value: string;
  icon: string;
}

export interface TooltipData {
  title: string;
  metrics: TooltipMetric[];
  highlights: string[];
}

const TOOLTIP_DATA: Record<string, TooltipData> = {
  'fresh-pine-shavings': {
    title: "PINE SHAVINGS (INPUT)",
    metrics: [
      { label: "Cost per Ton", value: "$150-250", icon: "💵" },
      { label: "Supply Distance", value: "100-300 miles", icon: "🚚" },
      { label: "Replacement Frequency", value: "Every 60 days", icon: "📅" },
      { label: "Annual Cost", value: "$75,000-125,000", icon: "💰" }
    ],
    highlights: [
      "🌲 External resource dependency",
      "🚚 High transportation costs",
      "📈 Price volatility & supply risk"
    ]
  },
  'chicken-feed': {
    title: "CHICKEN FEED (INPUT)",
    metrics: [
      { label: "Cost per Ton", value: "$400-600", icon: "💵" },
      { label: "Feed Conversion", value: "1.8:1 ratio", icon: "📊" },
      { label: "NPK Content", value: "18-20-10", icon: "🌾" },
      { label: "Annual Cost", value: "$2M-3M", icon: "💰" }
    ],
    highlights: [
      "💰 Major operational expense",
      "📈 Commodity price fluctuation",
      "🌾 High nutritional requirements"
    ]
  },
  'meat': {
    title: "MEAT OUTPUT (REVENUE)",
    metrics: [
      { label: "Market Value", value: "$1.50-2.50/lb", icon: "💵" },
      { label: "Annual Production", value: "5-10M lbs", icon: "📦" },
      { label: "Processing Yield", value: "72-75%", icon: "📊" },
      { label: "Revenue Stream", value: "$10-25M/year", icon: "💰" }
    ],
    highlights: [
      "🥇 Primary revenue source",
      "📈 Consistent market demand",
      "⭐ Quality standards critical"
    ]
  },
  'fossil-fuels': {
    title: "FOSSIL FUELS (PROBLEM)",
    metrics: [
      { label: "Cost per MMBTU", value: "$8-15", icon: "💵" },
      { label: "CO₂ Emissions", value: "117 lbs/MMBTU", icon: "🏭" },
      { label: "Grid Dependency", value: "100%", icon: "⚡" },
      { label: "Annual Energy Cost", value: "$500K-1M", icon: "💰" }
    ],
    highlights: [
      "🌍 High carbon footprint",
      "📈 Rising energy costs",
      "⚠️ Supply chain vulnerability"
    ]
  },
  'used-poultry-litter': {
    title: "USED LITTER (POLLUTION)",
    metrics: [
      { label: "Ammonia Content", value: "90% higher vs Proposed", icon: "💨" },
      { label: "N₂O Emissions", value: "54-97% more", icon: "🏭" },
      { label: "Disposal Cost", value: "$20-40/ton", icon: "💵" },
      { label: "Environmental Impact", value: "High", icon: "⚠️" }
    ],
    highlights: [
      "🌍 Major pollutant source",
      "💰 Expensive disposal required",
      "🌊 Water contamination risk"
    ]
  },
  'fertilizers': {
    title: "CHEMICAL FERTILIZERS",
    metrics: [
      { label: "Cost per Ton", value: "$600-1,200", icon: "💵" },
      { label: "NPK Content", value: "10-10-10 typical", icon: "🧪" },
      { label: "Runoff Pollution", value: "30-50%", icon: "🌊" },
      { label: "Soil Degradation", value: "Long-term", icon: "⚠️" }
    ],
    highlights: [
      "💰 Expensive recurring cost",
      "🌊 Causes water pollution",
      "🌍 Depletes soil health over time"
    ]
  },
  'biochar': {
    title: "BIOCHAR (CIRCULAR SOLUTION)",
    metrics: [
      { label: "Carbon Sequestration", value: "2.5 tonnes CO₂-eq/tonne", icon: "🌍" },
      { label: "Carbon Credit Value", value: "$177/tonne CO₂", icon: "💵" },
      { label: "Ammonia Reduction", value: "90% in bedding", icon: "✅" },
      { label: "Nutrient Retention", value: "95% P, 70% N", icon: "🌾" }
    ],
    highlights: [
      "♻️ Creates circular economy",
      "💰 Multiple revenue streams",
      "🌍 Net-negative emissions"
    ]
  },
  'bio-methane': {
    title: "BIO-METHANE (RENEWABLE ENERGY)",
    metrics: [
      { label: "Energy Value", value: "$6-12/MMBTU", icon: "⚡" },
      { label: "Production Increase", value: "25-37% more vs AD alone", icon: "📈" },
      { label: "Grid Independence", value: "100% self-sufficient", icon: "✅" },
      { label: "Carbon Offset", value: "Replaces fossil fuels", icon: "🌍" }
    ],
    highlights: [
      "♻️ Renewable energy source",
      "💰 Reduces energy costs",
      "⚡ On-site power generation"
    ]
  },
  'syngas': {
    title: "SYNGAS (PROCESS HEAT)",
    metrics: [
      { label: "Heating Value", value: "4-6 MJ/Nm³", icon: "🔥" },
      { label: "AD Enhancement", value: "Boosts methane 25-37%", icon: "📈" },
      { label: "Energy Recovery", value: "Powers pyrolysis", icon: "⚡" },
      { label: "Emissions", value: "Net-negative system", icon: "🌍" }
    ],
    highlights: [
      "♻️ Energy self-sufficiency",
      "⚡ Powers AD heating",
      "🔥 Process integration"
    ]
  },
  'digestate': {
    title: "DIGESTATE (ORGANIC FERTILIZER)",
    metrics: [
      { label: "Nutrient Content", value: "High NPK", icon: "🌾" },
      { label: "Pathogen Reduction", value: "99%+ destroyed", icon: "✅" },
      { label: "Market Value", value: "$20-40/ton", icon: "💵" },
      { label: "Application", value: "Direct land application", icon: "🚜" }
    ],
    highlights: [
      "♻️ Replaces chemical fertilizers",
      "🌾 Enriches soil organic matter",
      "💧 Reduces nutrient runoff"
    ]
  },
  'live-chickens': {
    title: "LIVE CHICKENS (TRANSPORT)",
    metrics: [
      { label: "Transport Weight", value: "5-7 lbs/bird", icon: "🐔" },
      { label: "Flock Size", value: "20,000-30,000 birds", icon: "📊" },
      { label: "Mortality Rate", value: "3-5% (reduced with biochar)", icon: "✅" },
      { label: "Transport Time", value: "2-4 hours", icon: "🚚" }
    ],
    highlights: [
      "🐔 Critical quality control",
      "⏱️ Timing affects meat quality",
      "✅ Biochar improves bird health"
    ]
  },
  'anaerobic-digester': {
    title: "ANAEROBIC DIGESTER (COMPONENT)",
    metrics: [
      { label: "Capacity", value: "500-1000 m³", icon: "📦" },
      { label: "Retention Time", value: "20-40 days", icon: "⏱️" },
      { label: "Biogas Production", value: "200-400 m³/day", icon: "⚡" },
      { label: "Efficiency", value: "60-80% VS reduction", icon: "📊" }
    ],
    highlights: [
      "♻️ Converts organic waste to energy",
      "💰 Generates revenue from waste streams",
      "🌍 Reduces methane emissions by 95%"
    ]
  },
  'pyrolysis-unit': {
    title: "PYROLYSIS UNIT (COMPONENT)",
    metrics: [
      { label: "Temperature", value: "400-600°C", icon: "🔥" },
      { label: "Biochar Yield", value: "30-40% by weight", icon: "⚖️" },
      { label: "Processing Rate", value: "500-1000 kg/hr", icon: "⚡" },
      { label: "Energy Output", value: "Self-sustaining", icon: "🔋" }
    ],
    highlights: [
      "♻️ Transforms waste into 4 valuable products",
      "⚡ Energy self-sufficient process",
      "🌍 Net-negative carbon emissions"
    ]
  },
  'chicken-house': {
    title: "CHICKEN HOUSE (COMPONENT)",
    metrics: [
      { label: "Capacity", value: "20,000-30,000 birds", icon: "🐔" },
      { label: "Grow Cycle", value: "42-49 days", icon: "📅" },
      { label: "Ammonia Levels", value: "Reduced 90% with biochar", icon: "✅" },
      { label: "Mortality Rate", value: "3-5% (lower with biochar)", icon: "📊" }
    ],
    highlights: [
      "🐔 Primary production facility",
      "✅ Biochar improves air quality",
      "💰 Better bird health = higher profits"
    ]
  },
  'processing-plant': {
    title: "PROCESSING PLANT (COMPONENT)",
    metrics: [
      { label: "Capacity", value: "100,000-200,000 birds/day", icon: "🏭" },
      { label: "Meat Yield", value: "72-75% of live weight", icon: "📊" },
      { label: "Water Usage", value: "7-10 gal/bird", icon: "💧" },
      { label: "By-Products", value: "FOG, offal, feathers", icon: "♻️" }
    ],
    highlights: [
      "🥩 Converts live birds to meat products",
      "♻️ Generates valuable waste streams",
      "💰 Primary revenue generation point"
    ]
  },
  'farm-waterways': {
    title: "FARM WATERWAYS (ENVIRONMENT)",
    metrics: [
      { label: "Pollution Level", value: "95% reduced vs current", icon: "🌊" },
      { label: "Nitrogen Runoff", value: "90% lower with biochar", icon: "🌾" },
      { label: "Phosphorus Runoff", value: "95% lower with biochar", icon: "🧪" },
      { label: "Ecosystem Health", value: "Dramatically improved", icon: "🐟" }
    ],
    highlights: [
      "🌊 Clean water critical for environment",
      "✅ Biochar system prevents pollution",
      "🐟 Healthy aquatic ecosystems restored"
    ]
  },
  'bio-oils': {
    title: "BIO-OILS (RENEWABLE FUEL)",
    metrics: [
      { label: "Yield", value: "10-20% by weight", icon: "⚖️" },
      { label: "Energy Content", value: "16-19 MJ/kg", icon: "⚡" },
      { label: "Market Value", value: "$300-500/ton", icon: "💵" },
      { label: "Uses", value: "Heating, power generation", icon: "🔥" }
    ],
    highlights: [
      "♻️ Renewable liquid fuel from waste",
      "💰 Additional revenue stream",
      "⚡ Can supplement energy needs"
    ]
  },
  'wood-vinegars': {
    title: "WOOD VINEGAR (BIO-PRODUCT)",
    metrics: [
      { label: "Yield", value: "5-15% by weight", icon: "⚖️" },
      { label: "Acetic Acid Content", value: "3-7%", icon: "🧪" },
      { label: "Market Value", value: "$500-1,500/ton", icon: "💵" },
      { label: "Uses", value: "Pesticide, fertilizer, feed additive", icon: "🌾" }
    ],
    highlights: [
      "🌾 Natural agricultural input",
      "💰 High-value specialty product",
      "♻️ Zero-waste pyrolysis output"
    ]
  },
  'water': {
    title: "WATER (UNIVERSAL RESOURCE)",
    metrics: [
      { label: "Processing Use", value: "7-10 gal/bird", icon: "💧" },
      { label: "Farm Use", value: "Critical for crops", icon: "🌾" },
      { label: "Quality Impact", value: "95% cleaner with biochar", icon: "✅" },
      { label: "Recycling", value: "Biochar enables reuse", icon: "♻️" }
    ],
    highlights: [
      "💧 Essential for all operations",
      "✅ Biochar dramatically improves quality",
      "♻️ Circular system enables conservation"
    ]
  },
  'dead-chickens': {
    title: "DEAD CHICKENS (WASTE → RESOURCE)",
    metrics: [
      { label: "Mortality Rate", value: "3-5% of flock", icon: "📊" },
      { label: "Weight", value: "50-100 birds/week", icon: "⚖️" },
      { label: "Energy Content", value: "High protein for AD", icon: "⚡" },
      { label: "Biogas Yield", value: "0.5-0.8 m³/kg VS", icon: "💨" }
    ],
    highlights: [
      "♻️ Problem becomes energy source",
      "⚡ High biogas production potential",
      "🌍 Eliminates disposal costs & emissions"
    ]
  },
  'fog-fats-oils-greases': {
    title: "FOG (FATS, OILS, GREASES)",
    metrics: [
      { label: "Source", value: "Processing plant waste", icon: "🏭" },
      { label: "Production", value: "200-300 kg/day", icon: "📊" },
      { label: "Energy Content", value: "Very high for AD", icon: "⚡" },
      { label: "Biogas Yield", value: "0.8-1.2 m³/kg VS", icon: "💨" }
    ],
    highlights: [
      "♻️ Highest energy waste stream",
      "💰 Prevents disposal costs",
      "⚡ Boosts biogas production 25-37%"
    ]
  },
  'litter-char-from-chicken-house': {
    title: "LITTER + CHAR (ENHANCED BEDDING)",
    metrics: [
      { label: "Ammonia Reduction", value: "90% vs plain litter", icon: "✅" },
      { label: "Moisture Control", value: "40% better", icon: "💧" },
      { label: "Bird Health", value: "Improved respiratory", icon: "🐔" },
      { label: "Pyrolysis Input", value: "Higher quality feedstock", icon: "🔥" }
    ],
    highlights: [
      "🐔 Healthier birds, lower mortality",
      "✅ Dramatically reduces ammonia",
      "♻️ Premium feedstock for pyrolysis"
    ]
  },
  'crops-corn': {
    title: "CROPS (FARM OUTPUT)",
    metrics: [
      { label: "Yield Increase", value: "20-40% with biochar", icon: "📈" },
      { label: "Quality", value: "Higher nutrient content", icon: "🌾" },
      { label: "Water Efficiency", value: "30% less irrigation", icon: "💧" },
      { label: "Carbon Storage", value: "Soil acts as sink", icon: "🌍" }
    ],
    highlights: [
      "🌾 Biochar dramatically improves yields",
      "💰 Higher quality = premium prices",
      "🌍 Carbon-negative agriculture"
    ]
  },
  'renewable-biofuels': {
    title: "RENEWABLE BIOFUELS (ENERGY)",
    metrics: [
      { label: "Sources", value: "Bio-methane, syngas, bio-oils", icon: "⚡" },
      { label: "Energy Value", value: "$6-15/MMBTU", icon: "💵" },
      { label: "Independence", value: "100% self-sufficient", icon: "✅" },
      { label: "Carbon Impact", value: "Net-negative system", icon: "🌍" }
    ],
    highlights: [
      "⚡ Complete energy independence",
      "💰 Eliminates fossil fuel costs",
      "🌍 Carbon-negative energy production"
    ]
  },
  'c02': {
    title: "CO₂ EMISSIONS (ENVIRONMENTAL)",
    metrics: [
      { label: "Current System", value: "High emissions", icon: "🏭" },
      { label: "Proposed System", value: "Net-negative", icon: "🌍" },
      { label: "Reduction", value: "95%+ vs current", icon: "✅" },
      { label: "Carbon Credits", value: "$177/tonne CO₂", icon: "💵" }
    ],
    highlights: [
      "🌍 Biochar sequesters carbon permanently",
      "💰 Generates carbon credit revenue",
      "✅ Climate-positive agriculture"
    ]
  },
  'ghg': {
    title: "GREENHOUSE GASES (IMPACT)",
    metrics: [
      { label: "Major Sources", value: "CH₄, N₂O, CO₂", icon: "🏭" },
      { label: "Current Impact", value: "Significant emissions", icon: "⚠️" },
      { label: "Biochar Reduction", value: "54-97% lower", icon: "✅" },
      { label: "Climate Benefit", value: "Carbon-negative system", icon: "🌍" }
    ],
    highlights: [
      "🌍 Biochar eliminates major GHG sources",
      "✅ Methane capture prevents release",
      "💰 Carbon credits offset costs"
    ]
  },
  'diesel': {
    title: "DIESEL (TRANSPORTATION)",
    metrics: [
      { label: "Cost", value: "$3-5/gallon", icon: "💵" },
      { label: "Usage", value: "Feed delivery, bird transport", icon: "🚚" },
      { label: "Emissions", value: "10.2 kg CO₂/gallon", icon: "🏭" },
      { label: "Alternative", value: "Bio-oils can substitute", icon: "♻️" }
    ],
    highlights: [
      "🚚 Essential for logistics",
      "💰 Volatile fuel costs",
      "♻️ Bio-oils offer alternative"
    ]
  },
  'electricity': {
    title: "ELECTRICITY (ENERGY)",
    metrics: [
      { label: "Current Cost", value: "$0.10-0.15/kWh", icon: "💵" },
      { label: "Usage", value: "Lighting, HVAC, equipment", icon: "⚡" },
      { label: "Bio-Methane CHP", value: "Can generate on-site", icon: "🔋" },
      { label: "Grid Independence", value: "100% possible", icon: "✅" }
    ],
    highlights: [
      "⚡ Major operational expense",
      "🔋 Bio-methane enables self-sufficiency",
      "💰 Eliminates utility bills"
    ]
  },
  'farm': {
    title: "FARM (AGRICULTURAL LAND)",
    metrics: [
      { label: "Soil Health", value: "Improved with biochar", icon: "🌾" },
      { label: "Water Retention", value: "40% better", icon: "💧" },
      { label: "Nutrient Holding", value: "95% P, 70% N retained", icon: "🧪" },
      { label: "Carbon Storage", value: "Long-term sequestration", icon: "🌍" }
    ],
    highlights: [
      "🌾 Biochar transforms soil quality",
      "💧 Reduces irrigation needs",
      "🌍 Permanent carbon storage"
    ]
  },
  'labor': {
    title: "LABOR (HUMAN RESOURCE)",
    metrics: [
      { label: "Current System", value: "Standard operations", icon: "👷" },
      { label: "Biochar System", value: "New skilled jobs created", icon: "👨‍🔧" },
      { label: "Training", value: "Technical expertise needed", icon: "📚" },
      { label: "Economic Impact", value: "Local job creation", icon: "💰" }
    ],
    highlights: [
      "👷 Creates high-value jobs",
      "📚 Builds local expertise",
      "💰 Strengthens rural economy"
    ]
  },
  'other-waste': {
    title: "OTHER WASTE (MISCELLANEOUS)",
    metrics: [
      { label: "Sources", value: "Feathers, offal, blood", icon: "🏭" },
      { label: "Current Handling", value: "Disposal cost", icon: "💵" },
      { label: "Biochar System", value: "Can feed to AD", icon: "♻️" },
      { label: "Value Recovery", value: "Energy + nutrients", icon: "⚡" }
    ],
    highlights: [
      "♻️ Zero-waste philosophy",
      "💰 Turns cost into revenue",
      "🌍 Eliminates disposal emissions"
    ]
  },
  'waterways': {
    title: "WATERWAYS (ECOSYSTEM)",
    metrics: [
      { label: "Current Pollution", value: "High nutrient loading", icon: "⚠️" },
      { label: "Biochar Impact", value: "95% pollution reduction", icon: "✅" },
      { label: "Fish Population", value: "Restored & thriving", icon: "🐟" },
      { label: "Water Quality", value: "Drinking water safe", icon: "💧" }
    ],
    highlights: [
      "🌊 Critical environmental restoration",
      "🐟 Aquatic life recovers completely",
      "💧 Clean water for communities"
    ]
  }
};

export function getTooltipData(materialName: string): TooltipData | undefined {
  const key = materialName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/,/g, '');
  
  return TOOLTIP_DATA[key];
}