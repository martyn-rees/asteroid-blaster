const asteroid1SVG = `
  <svg viewBox="0 0 140 140" version="1.1">
    <path d="M22,115 L55,90 L60,129 L82,139 L93,114 L137,80 L129,35 L86,5 L66,27 L39,9 L6,52 L12,100 Z"></path>
  </svg>
  `;

const asteroid2SVG = `
  <svg viewBox="0 0 140 140" version="1.1">
    <path d="M23,118 L86,137 L133,99 L138,56 L94,8 L52,4 L39,45 L6,62 Z"></path>
  </svg>
  `;

const asteroid3SVG = `
  <svg viewBox="0 0 140 140" version="1.1">
    <path d="M71,136 L96,95 L133,98 L130,55 L94,6 L18,29 L9,99 Z"></path>
  </svg>
  `;

export const asteroidsSVG = [asteroid1SVG, asteroid2SVG, asteroid3SVG];

export const shipSVG = (thrustId: string = "ship-thrust") => `
<svg viewBox="0 0 12 12" version="1.1">
	<path d="M12,6 L0,12 L6,6 L0,0 L12,6 Z"></path>
	<path id="${thrustId}" d="M4,6 L0,5 L0,7 L4,6 Z"></path>
</svg>
`;
