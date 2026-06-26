---
name: Editorial Pulse
colors:
  surface: '#fff8f6'
  surface-dim: '#f4d3cd'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ee'
  surface-container: '#ffe9e6'
  surface-container-high: '#ffe2dd'
  surface-container-highest: '#fddbd6'
  on-surface: '#291714'
  on-surface-variant: '#5d3f3b'
  inverse-surface: '#402b28'
  inverse-on-surface: '#ffedea'
  outline: '#926f69'
  outline-variant: '#e7bdb6'
  surface-tint: '#c00002'
  primary: '#bc0002'
  on-primary: '#ffffff'
  primary-container: '#e22418'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a8'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#5f5c54'
  on-tertiary: '#ffffff'
  tertiary-container: '#78746c'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930001'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e8e2d8'
  tertiary-fixed-dim: '#ccc6bc'
  on-tertiary-fixed: '#1e1b16'
  on-tertiary-fixed-variant: '#4a463f'
  background: '#fff8f6'
  on-background: '#291714'
  surface-variant: '#fddbd6'
typography:
  display-lg:
    fontFamily: Fraunces
    fontSize: 84px
    fontWeight: '900'
    lineHeight: 92px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Fraunces
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 52px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Fraunces
    fontSize: 60px
    fontWeight: '700'
    lineHeight: 68px
    letterSpacing: -0.01em
  headline-xl-mobile:
    fontFamily: Fraunces
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
  headline-md:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  body-lg:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-bold:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
---

## Brand & Style

This design system is built for a premium, bold editorial experience. It merges the warmth of physical media with the high-fidelity interactions of modern digital products. The aesthetic is defined by "Editorial Warmth"—utilizing massive high-contrast serif typography and generous negative space to create a rhythm that feels curated rather than cluttered.

The design style is a hybrid of **High-Contrast Bold** and **Minimalism**. It relies on structural integrity and color blocking rather than shadows or gradients. Every element should feel intentional, using substantial rounded corners and crisp borders to define the UI hierarchy. The emotional response should be one of confidence, playfulness, and sophisticated craftsmanship.

## Colors

The palette is rooted in a warm, physical-paper feel. The primary background (#FDFAF6) provides a softer, more luxurious canvas than pure white. 

- **ToyBerry Red (#E8291C)**: Used exclusively for calls to action, high-priority notifications, and key brand moments. It is the "pulse" of the design.
- **Near-Black (#111111)**: Used for all primary text and heavy UI containers to provide maximum legibility and a grounded, authoritative feel.
- **Warm Amber-Tinted (#FFF8EE)**: Specifically for card surfaces and secondary containers to create a subtle "layered paper" effect without relying on elevation.

## Typography

The typographic strategy hinges on the tension between the expressive, high-contrast serif **Fraunces** and the functional, geometric **DM Sans**.

- **Headlines**: Use Fraunces for all narrative and display text. Utilize the 900 weight for major landing sections to command attention. The 300 weight can be used for sophisticated, large-scale sub-headers.
- **Body & UI**: DM Sans provides a neutral, highly readable counterpoint. 
- **Scale**: Display sizes are intentionally massive. Ensure negative space around display type is at least 1.5x the x-height of the font to maintain the editorial feel.

## Layout & Spacing

This design system uses a **Fluid Grid** model with strict vertical rhythm based on an 8px baseline. 

- **Desktop**: A 12-column grid with a maximum container width of 1280px. Gutters are fixed at 24px to maintain a dense but breathable look.
- **Negative Space**: "Power Margins" of 80px (xl) should be used between major sections to emphasize the editorial nature of the content.
- **Mobile**: Transition to a 4-column grid with 20px side margins. Typography should downscale according to the defined mobile tokens to prevent overflow.

## Elevation & Depth

This design system completely eschews drop shadows. Depth is communicated through **Tonal Layers** and **Bold Outlines**.

- **Structural Depth**: Content sits on the Primary Background (#FDFAF6). Cards and secondary modules use the Warm Amber-Tinted surface (#FFF8EE).
- **Outlines**: Use 1px or 2px solid borders in Near-Black (#111111) for interactive elements and card boundaries. This creates a "print-shop" look.
- **Interactions**: Instead of rising (shadows), elements respond with color fills or subtle scale transforms.

## Shapes

The shape language is "Boldly Rounded." While the system generally follows a roundedness level of 2 (0.5rem), key components use specific exaggerated radii to enhance the premium feel.

- **Cards**: All containers and cards must use a fixed **20px** corner radius.
- **Buttons**: Primary buttons are fully pill-shaped (100px radius) to contrast against the structured grid.
- **Inputs**: Use a 12px radius to bridge the gap between the sharpness of the text and the roundness of the cards.

## Components

- **Buttons**: High-impact. Primary buttons use a ToyBerry Red fill with white DM Sans Bold text. On hover, the button should perform a subtle "pulse" scale (1.02x).
- **Cards**: Use the Warm Amber surface (#FFF8EE) with a 1px solid Near-Black (#111111) border. No shadow. Padding should be generous (32px).
- **Chips/Tags**: Small, pill-shaped with a 1px Near-Black border. Use for categories or metadata.
- **Inputs**: Clean white backgrounds with 2px solid Near-Black borders. Labels use DM Sans Bold in uppercase (label-bold).
- **Lists**: Separated by 1px solid rules in #111111 with 10% opacity.
- **Animations**: Use "soft-spring" transitions for all state changes (300ms, cubic-bezier(0.4, 0, 0.2, 1)). Include a subtle pulse animation for primary CTA icons to draw the eye.