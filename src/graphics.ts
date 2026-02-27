const asteroid1SVG = `
  <svg viewBox="0 0 140 140" version="1.1">
    <path d="M22,110 L55,80 L60,99 L82,132 L93,114 L134,80 L111,35 L86,15 L66,27 L39,23 L6,62 L22,110 Z"></path>
  </svg>
  `;

const asteroid2SVG = `
  <svg viewBox="0 0 140 140" version="1.1">
    <path d="M23,112 L86,133 L123,99 L128,76 L94,8 L52,14 L39,45 L6,62 L23,112 Z"></path>
  </svg>
  `;

const asteroid3SVG = `
  <svg viewBox="0 0 140 140" version="1.1">
    <path d="M71,129 L96,95 L123,98 L130,55 L94,9 L18,39 L13,99 L71,129 Z"></path>
  </svg>
  `;

export const asteroidsSVG = [asteroid1SVG, asteroid2SVG, asteroid3SVG];

export const shipSVG = () => `
<svg viewBox="0 0 12 12" version="1.1">
	<path d="M6,0 L12,12 L6,6 L0,12 L6,0 Z"></path>
	<path id="thrust" d="M6,8 L7,11 L5,11 L6,8 Z"></path>
</svg>
`;
