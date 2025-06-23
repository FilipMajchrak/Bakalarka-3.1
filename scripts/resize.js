// HTML element pre resizer (vodorovny pruzok medzi vystupom a tabulkou)
const resizer = document.getElementById('v-resizer');

// Element vystupu, ktorému chceme menit vysku
const output = document.getElementById('output');

// Stav, ci pouzivatel momentalne taha resizer
let isResizing = false;

// Ked pouzivatel klikne a zacne tahat resizer
resizer.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Zablokuj vyber textu a defaultne spravanie
    isResizing = true;
    document.body.style.cursor = 'row-resize'; // Zmena kurzora pri tahani
});

// Sleduj pohyb mysi po obrazovke (ked je resizer aktivny)
document.addEventListener('mousemove', (e) => {
    if (!isResizing) return; // Ak netahame, nic nerob

    // Ziskaj hornu poziciu kontajnera, kde sa nachadza vystup
    const containerTop = output.parentElement.getBoundingClientRect().top;

    // Vypocitaj novu vysku vystupu na zaklade pozicie mysi
    const newHeight = e.clientY - containerTop;

    // Nastav vysku vystupu explicitne a vypni jeho automaticke roztahovanie
    output.style.height = `${newHeight}px`;
    output.style.flex = 'none';

    // Zabezpec, ze globals panel zaberie zvysny priestor
    const globals = document.querySelector('.globals-panel');
    globals.style.flex = '1';
});

// Po uvolneni tlacidla mysi prestan tahat a obnov kurzor
document.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = 'default';
});