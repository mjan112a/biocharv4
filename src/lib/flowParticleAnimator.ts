/**
 * Flow Particle Animator
 * Handles animated particles that move along flow paths to visualize material movement
 */

export interface FlowParticle {
  id: string;
  linkId: string;
  shape: 'circle' | 'square' | 'icon';
  size: number;
  color: string;
  opacity: number;
  blur?: number;
  speed: number;         // pixels per second
  pathOffset: number;    // 0.0-1.0 position on path
  delay: number;         // ms delay before starting
  startTime: number;     // When particle started
  lifetime: number;      // Total lifetime in ms (0 = infinite)
  birthTime: number;     // When particle was created
  fadeInOut: boolean;
  iconPath?: string;     // Path to icon image for icon-based particles
}

export interface ParticleConfig {
  particleCount: number;
  size: number;
  speed: number;
  opacity: number;
  blur?: number;
  color?: string;
  flowRate?: number;        // Particles spawned per second
  lifetime?: number;        // Particle lifetime in ms (0 = infinite)
  spacing?: number;         // Minimum distance between particles
}

export interface ParticleAnimationConfig {
  enabled: boolean;
  flowRate: number;          // Particles per second
  velocity: number;          // Speed multiplier
  particleSize: number;      // Dot radius in pixels
  particleColor?: string | ((linkType: string) => string);
  animationDuration: number; // Base traverse time in ms
  particleLifetime: number;  // How long particles exist (0 = infinite)
  particleSpacing: number;   // Minimum distance between particles in pixels
  pauseOnHover: boolean;     // Stop animation on interaction
  particleShape: 'circle' | 'square' | 'custom';
}

/**
 * Get particle configuration based on flow type
 */
export function getParticleConfigForFlowType(
  type: string,
  value: number
): ParticleConfig {
  // Base config on flow type
  let config: ParticleConfig;

  switch (type.toLowerCase()) {
    case 'biochar':
      config = {
        particleCount: 8,
        size: 6,
        speed: 60,
        opacity: 0.85,
        blur: 2,
      };
      break;

    case 'energy':
    case 'syngas':
      config = {
        particleCount: 15,
        size: 5,
        speed: 120,
        opacity: 0.9,
        blur: 3,
      };
      break;

    case 'manure':
    case 'material':
      config = {
        particleCount: 10,
        size: 7,
        speed: 80,
        opacity: 0.75,
      };
      break;

    case 'gas':
    case 'methane':
      config = {
        particleCount: 12,
        size: 4,
        speed: 100,
        opacity: 0.8,
        blur: 2,
      };
      break;

    default:
      config = {
        particleCount: 6,
        size: 6,
        speed: 80,
        opacity: 0.7,
      };
  }

  // Scale particle count based on flow value
  if (value > 1000) {
    config.particleCount = Math.min(config.particleCount * 1.5, 20);
  } else if (value < 200) {
    config.particleCount = Math.max(config.particleCount * 0.6, 3);
  }

  return config;
}

/**
 * FlowParticleAnimator class
 * Manages all particle animations using requestAnimationFrame
 */
export class FlowParticleAnimator {
  private particles: Map<string, FlowParticle[]> = new Map();
  private pathElements: Map<string, SVGPathElement> = new Map();
  private particleElements: Map<string, SVGElement[]> = new Map();
  private animationFrameId?: number;
  private isRunning = false;
  private isPaused = false;
  private lastTime = 0;
  private svgGroup?: SVGGElement;
  private animationConfig: ParticleAnimationConfig;

  constructor(
    private svg: SVGSVGElement,
    config?: Partial<ParticleAnimationConfig>
  ) {
    this.animationConfig = {
      enabled: true,
      flowRate: 3,
      velocity: 1.0,
      particleSize: 6,
      animationDuration: 3000,
      particleLifetime: 0, // 0 = infinite
      particleSpacing: 50,
      pauseOnHover: false,
      particleShape: 'circle',
      ...config
    };
  }

  /**
   * Initialize particles for all links
   */
  initializeParticles(
    links: Array<{
      id: string;
      source: string;
      target: string;
      value: number;
      color: string;
      type: string;
      iconPath?: string;
    }>,
    pathElements: Map<string, SVGPathElement>
  ): void {
    this.pathElements = pathElements;
    this.particles.clear();
    this.particleElements.clear();

    // Create or get particle group
    let group = this.svg.querySelector('.particle-group') as SVGGElement;
    if (!group) {
      group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'particle-group');
      group.setAttribute('pointer-events', 'none');
      this.svg.appendChild(group);
    }
    this.svgGroup = group;

    // Create particles for each link
    links.forEach((link) => {
      const pathElement = pathElements.get(link.id);
      if (!pathElement) return;

      const config = getParticleConfigForFlowType(link.type, link.value);
      const particles = this.createParticlesForLink(link, config);
      this.particles.set(link.id, particles);

      // Create SVG elements for particles
      const elements = this.createParticleSVGElements(
        particles,
        link.id,
        config
      );
      this.particleElements.set(link.id, elements);
    });

    this.start();
  }

  /**
   * Create particle data for a link
   */
  private createParticlesForLink(
    link: { id: string; color: string; value: number; type: string; iconPath?: string },
    config: ParticleConfig
  ): FlowParticle[] {
    const particles: FlowParticle[] = [];
    const now = performance.now();

    for (let i = 0; i < config.particleCount; i++) {
      const particle: FlowParticle = {
        id: `${link.id}-particle-${i}`,
        linkId: link.id,
        shape: link.iconPath ? 'icon' : 'circle',
        size: config.size,
        color: config.color || link.color,
        opacity: config.opacity,
        blur: config.blur,
        speed: config.speed,
        pathOffset: i / config.particleCount,
        delay: (i / config.particleCount) * 2000,
        startTime: now + (i / config.particleCount) * 2000,
        lifetime: config.lifetime || 0,  // 0 = infinite lifetime
        birthTime: now,
        fadeInOut: true,
        iconPath: link.iconPath,
      };

      particles.push(particle);
    }

    return particles;
  }

  /**
   * Create SVG circle elements for particles
   */
  private createParticleSVGElements(
    particles: FlowParticle[],
    linkId: string,
    config: ParticleConfig
  ): SVGElement[] {
    if (!this.svgGroup) return [];

    const elements: SVGElement[] = [];

    particles.forEach((particle) => {
      let element: SVGElement;

      if (particle.shape === 'icon' && particle.iconPath) {
        // Create image element for icon-based particle
        const image = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'image'
        );
        image.setAttribute('class', `particle particle-icon particle-${linkId}`);
        image.setAttribute('href', particle.iconPath);
        image.setAttribute('width', particle.size.toString());
        image.setAttribute('height', particle.size.toString());
        image.setAttribute('opacity', '0'); // Start hidden
        image.style.pointerEvents = 'none';
        element = image;
      } else {
        // Create circle element for dot-based particle
        const circle = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle'
        );
        circle.setAttribute('class', `particle particle-${linkId}`);
        circle.setAttribute('r', (particle.size / 2).toString());
        circle.setAttribute('fill', particle.color);
        circle.setAttribute('opacity', '0'); // Start hidden
        circle.style.mixBlendMode = 'screen'; // Additive blending for glow

        // Add blur filter if specified
        if (config.blur) {
          const filterId = `particle-glow-${particle.id}`;
          this.createGlowFilter(filterId, config.blur);
          circle.setAttribute('filter', `url(#${filterId})`);
        }
        element = circle;
      }

      this.svgGroup!.appendChild(element);
      elements.push(element);
    });

    return elements;
  }

  /**
   * Create glow filter for particle
   */
  private createGlowFilter(filterId: string, blurAmount: number): void {
    let defs = this.svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      this.svg.insertBefore(defs, this.svg.firstChild);
    }

    // Check if filter already exists
    if (defs.querySelector(`#${filterId}`)) return;

    const filter = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'filter'
    );
    filter.setAttribute('id', filterId);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');

    const blur = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'feGaussianBlur'
    );
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', blurAmount.toString());

    filter.appendChild(blur);
    defs.appendChild(filter);
  }

  /**
   * Start animation loop
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate(this.lastTime);
  }

  /**
   * Animation loop using requestAnimationFrame
   */
  private animate = (currentTime: number): void => {
    if (!this.isRunning) return;

    // Skip updates if paused
    if (this.isPaused) {
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update all particles
    this.particles.forEach((particles, linkId) => {
      const pathElement = this.pathElements.get(linkId);
      const particleElements = this.particleElements.get(linkId);

      if (!pathElement || !particleElements) return;

      particles.forEach((particle, index) => {
        // Check if particle should be visible yet
        if (currentTime < particle.startTime) {
          particleElements[index].setAttribute('opacity', '0');
          return;
        }

        // Check if particle has expired (if lifetime is set)
        if (particle.lifetime > 0) {
          const age = currentTime - particle.birthTime;
          if (age > particle.lifetime) {
            particleElements[index].setAttribute('opacity', '0');
            return;
          }
        }

        this.updateParticle(particle, pathElement, deltaTime);
        this.renderParticle(particle, particleElements[index], pathElement);
      });
    });

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Update particle position along path
   */
  private updateParticle(
    particle: FlowParticle,
    pathElement: SVGPathElement,
    deltaTime: number
  ): void {
    const pathLength = pathElement.getTotalLength();
    
    // Validate path length
    if (!pathLength || !isFinite(pathLength) || pathLength === 0) {
      return;
    }
    
    const distance = (particle.speed * deltaTime) / 1000; // Convert to px
    const offsetIncrement = distance / pathLength;
    
    // Validate offset increment
    if (!isFinite(offsetIncrement)) {
      return;
    }

    particle.pathOffset += offsetIncrement;

    // Loop back to start when reaching end
    if (particle.pathOffset > 1.0) {
      particle.pathOffset = 0.0;
    }
  }

  /**
   * Render particle at current position
   */
  private renderParticle(
    particle: FlowParticle,
    element: SVGElement,
    pathElement: SVGPathElement
  ): void {
    const pathLength = pathElement.getTotalLength();
    
    // Validate path length and offset
    if (!pathLength || !isFinite(pathLength) || pathLength === 0) {
      element.setAttribute('opacity', '0');
      return;
    }
    
    if (!isFinite(particle.pathOffset)) {
      particle.pathOffset = 0;
    }
    
    // Clamp pathOffset to valid range
    const clampedOffset = Math.max(0, Math.min(1, particle.pathOffset));
    const pointPosition = clampedOffset * pathLength;
    
    if (!isFinite(pointPosition)) {
      element.setAttribute('opacity', '0');
      return;
    }
    
    const point = pathElement.getPointAtLength(pointPosition);

    // Position element based on type
    if (particle.shape === 'icon') {
      // For images, position by x,y (top-left corner)
      element.setAttribute('x', (point.x - particle.size / 2).toString());
      element.setAttribute('y', (point.y - particle.size / 2).toString());
    } else {
      // For circles, position by cx,cy (center)
      element.setAttribute('cx', point.x.toString());
      element.setAttribute('cy', point.y.toString());
    }

    // Apply fade in/out at path ends
    let opacity = particle.opacity;
    if (particle.fadeInOut) {
      const fadeDistance = 0.1; // Fade in first/last 10%

      if (clampedOffset < fadeDistance) {
        opacity *= clampedOffset / fadeDistance;
      } else if (clampedOffset > 1.0 - fadeDistance) {
        opacity *= (1.0 - clampedOffset) / fadeDistance;
      }
    }

    element.setAttribute('opacity', opacity.toString());
  }

  /**
   * Stop animation
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.particles.clear();
    this.pathElements.clear();
    
    // Remove all particle elements
    this.particleElements.forEach((elements) => {
      elements.forEach((el) => el.remove());
    });
    this.particleElements.clear();

    // Remove particle group
    if (this.svgGroup) {
      this.svgGroup.remove();
      this.svgGroup = undefined;
    }
  }

  /**
   * Pause animation
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume animation
   */
  resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  /**
   * Toggle pause state
   */
  togglePause(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /**
   * Update animation configuration
   */
  updateConfig(config: Partial<ParticleAnimationConfig>): void {
    this.animationConfig = { ...this.animationConfig, ...config };
    
    // Apply velocity change to all particles
    if (config.velocity !== undefined) {
      this.particles.forEach((particles) => {
        particles.forEach((particle) => {
          particle.speed = particle.speed * config.velocity!;
        });
      });
    }
  }

  /**
   * Set speed multiplier for all particles
   */
  setSpeedMultiplier(multiplier: number): void {
    this.particles.forEach((particles) => {
      particles.forEach((particle) => {
        particle.speed *= multiplier;
      });
    });
  }

  /**
   * Highlight particles for specific link (on hover)
   */
  highlightLink(linkId: string): void {
    const particles = this.particles.get(linkId);
    const elements = this.particleElements.get(linkId);

    if (!particles || !elements) return;

    particles.forEach((particle, index) => {
      particle.size *= 1.5;
      particle.opacity = Math.min(1.0, particle.opacity * 1.3);
      particle.speed *= 1.5;

      const element = elements[index];
      element.setAttribute('r', (particle.size / 2).toString());
    });
  }

  /**
   * Reset particle highlighting
   */
  resetHighlight(linkId: string): void {
    const particles = this.particles.get(linkId);
    const elements = this.particleElements.get(linkId);

    if (!particles || !elements) return;

    particles.forEach((particle, index) => {
      particle.size /= 1.5;
      particle.opacity /= 1.3;
      particle.speed /= 1.5;

      const element = elements[index];
      element.setAttribute('r', (particle.size / 2).toString());
    });
  }

  /**
   * Dim particles for links not in active set
   */
  filterLinks(activeLinks: Set<string>): void {
    this.particles.forEach((particles, linkId) => {
      const isActive = activeLinks.has(linkId);
      const opacity = isActive ? 1.0 : 0.1;
      const speed = isActive ? 1.0 : 0.3;

      particles.forEach((particle) => {
        particle.opacity *= opacity;
        particle.speed *= speed;
      });
    });
  }
}