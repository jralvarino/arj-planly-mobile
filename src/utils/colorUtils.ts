export function getCalendarColorByHabits(baseColor: string, completed: number, total: number): string {
   // Se não houver total, retorna branco (será substituído por cor padrão)
   if (total === 0) return 'white';

   // Se todos estão completos, retorna a cor primária completa
   if (completed === total && total > 0) {
      return baseColor; // Usa a cor base diretamente quando completo
   }

   // Calcula o progresso (0 a 1)
   const range = completed / total;

   // Converte a cor base
   const { r, g, b } = hexToRgb(baseColor);
   let { h, s, l } = rgbToHsl(r, g, b);

   // AUMENTO progressivo da saturação conforme completa mais hábitos
   // Começa com saturação bem baixa (cor bem clara) e aumenta até a saturação original
   const minSaturation = 0.1;
   s = minSaturation + (s - minSaturation) * range;
   s = Math.min(1, s); // Garante que não ultrapasse 1

   // DIMINUI progressivamente a luminosidade quanto mais completo (cor mais escura/forte)
   // Começa bem claro (luminosidade alta) e vai escurecendo até a luminosidade da cor base
   const maxLightness = Math.min(0.9, 0.85 + (1 - l) * 0.2); // Luminosidade inicial bem alta
   l = maxLightness - (maxLightness - l) * range;
   l = Math.max(0, Math.min(1, l)); // Garante que esteja entre 0 e 1

   const { r: nr, g: ng, b: nb } = hslToRgb(h, s, l);
   return rgbToHex(nr, ng, nb);
}

// Função principal: deixar a cor mais forte
export function makeColorStronger(hexColor: string): string {
   const { r, g, b } = hexToRgb(hexColor);
   let { h, s, l } = rgbToHsl(r, g, b);

   // Aumenta saturação em 20% (sem passar de 1)
   s = Math.min(1, s * 1.2);

   // Diminui a luminosidade em 10% (sem passar de 0)
   l = Math.max(0, l * 0.9);

   const { r: nr, g: ng, b: nb } = hslToRgb(h, s, l);
   return rgbToHex(nr, ng, nb);
}

// Função auxiliar para converter HEX em RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
   hex = hex.replace(/^#/, '');
   if (hex.length === 3) {
      hex = hex
         .split('')
         .map((x: string) => x + x)
         .join('');
   }
   const num = parseInt(hex, 16);
   return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
   };
}

// Converter RGB para HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
   r /= 255;
   g /= 255;
   b /= 255;
   const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
   let h: number,
      s: number,
      l = (max + min) / 2;

   if (max === min) {
      h = s = 0; // cinza
   } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
         case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
         case g:
            h = (b - r) / d + 2;
            break;
         case b:
            h = (r - g) / d + 4;
            break;
         default:
            h = 0;
      }
      h /= 6;
   }
   return { h, s, l };
}

// Converter HSL para RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
   let r: number, g: number, b: number;

   if (s === 0) {
      r = g = b = l; // cinza
   } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
         if (t < 0) t += 1;
         if (t > 1) t -= 1;
         if (t < 1 / 6) return p + (q - p) * 6 * t;
         if (t < 1 / 2) return q;
         if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
         return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
   }

   return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
   };
}

// Converter RGB para HEX
function rgbToHex(r: number, g: number, b: number): string {
   return (
      '#' +
      [r, g, b]
         .map((x: number) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
         })
         .join('')
   );
}




