// utils/windUtils.js

export function getCardinalDirection(angle, idioma = 'en') {
    angle = (angle + 360) % 360;
    const directions = {
      en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
      es: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
    };
    const index = Math.floor((angle + 22.5) / 45) % 8;
    return directions[idioma][index];
  }
  
  export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}`;
  }
  