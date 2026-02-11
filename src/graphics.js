export const asteroidSVG = (rock) => `
  <svg height="${2 * rock.r}" width="${2 * rock.r}" viewbox="-${rock.r} -${rock.r} ${2 * rock.r} ${2 * rock.r}">
    <circle cx="0" cy="0" r="${rock.r - 1}" stroke="black" stroke-width="1" fill="black" />
   	<circle cx="0" cy="15" r="4" stroke="blue" stroke-width="1" fill="blue" />
 </svg>`;

export const asteroid1SVG = () => `
  <svg viewBox="0 0 140 140" version="1.1">
    <path d="M22,110 L55,80 L60,99 L82,132 L93,114 L134,80 L111,35 L86,15 L66,27 L39,23 L6,62 L22,110 Z"></path>
  </svg>
  `;

export const asteroid2SVG = () => `
  <svg viewBox="0 0 140 140" version="1.1">
    <path d="M23,112 L86,133 L123,99 L128,76 L94,8 L52,14 L39,45 L6,62 L23,112 Z"></path>
  </svg>
  `;

export const asteroid3SVG = () => `
  <svg viewBox="0 0 140 140" version="1.1">
    <path d="M71,129 L96,95 L123,98 L130,55 L94,9 L18,39 L13,99 L71,129 Z"></path>
  </svg>
  `;

export const shipSVG = () => `
<svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1">
	<path d="M6,0 L12,12 L6,6 L0,12 L6,0 Z" fill="#FFFFFF" fill-rule="nonzero"></path>
	<path id="thrust" d="M6,8 L7,11 L5,11 L6,8 Z" fill="#FFFFFF" fill-rule="nonzero"></path>
</svg>
`;
