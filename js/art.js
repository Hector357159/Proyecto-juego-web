/* ============================================================
   TOROGOZ: Vuelo sobre el Añil
   art.js — paletas y matrices de pixel art
   ============================================================ */
var ART = {};

/* Paleta base de los sprites del personaje. */
ART.palette = {
  '.': null,
  'T': '#54f0d4', 't': '#1fb9b0', 'd': '#127f86',
  'G': '#4aae5d', 'g': '#2b7a43', 'h': '#17552f', 'L': '#8fdc6a',
  'K': '#101820', 'B': '#3a4048', 'b': '#7d8792',
  'W': '#fdf7e3', 'E': '#0a0d10',
  'O': '#e8873a', 'o': '#b8561f', 'p': '#f6ad62',
  'C': '#2fc9d8', 'c': '#1587a0',
  'U': '#2e6fe0', 'u': '#17409e'
};

/* Cuatro poses: aleteo arriba, medio, abajo y choque. */
ART.bird = { frames: [
  [
    "................................",
    "................................",
    "......................ttttt.....",
    ".....................TTTTTTt....",
    ".............hhh....TTTTTTTTt...",
    "...........hhLLLLh.KKttTTTTtt...",
    "..........hLLLLLLLtTTTWWWttK....",
    ".........hLLLLLLLLKKKKWEWKKKK...",
    ".........hLLGGLLLLKKKKWWWKKbbBB.",
    ".........hLgggGGGLKKKKKKKKKBBBK.",
    "..........hgLLgggKKKKKKKKKKK....",
    "...........hhLLLhKKKKKKKKKKK....",
    "...........GGhhhGKKKKKKKKKK.....",
    "..........hGGGGGGGKKKKKKKgh.....",
    "..........hGGGGGGGGGKKKOggh.....",
    "..........hgGGGGGGGoOOOOOoh.....",
    "...........hgGGGGGoOOOOOOOo.....",
    ".....uCCu..hgggGGGooOOOOOoo.....",
    ".....uUUu.cChhggggoooOOOooo.....",
    ".....uUUuCcc.hhhgggooooooo......",
    ".....uuuuc......hhhhhooo........",
    ".uCCu.cc........................",
    ".uUUuc..........................",
    ".uuuu..........................."
  ],
  [
    "................................",
    "................................",
    "......................ttttt.....",
    ".....................TTTTTTt....",
    "....................TTTTTTTTt...",
    "...................KKttTTTTtt...",
    "..................tTTTWWWttK....",
    "..................KKKKWEWKKKK...",
    "................hhKKKKWWWKKbbBB.",
    "............hhhGGGKKKKKKKKKBBBK.",
    "..........hhLLLhhKKKKKKKKKKK....",
    ".........hLLLLLLLKKKKKKKKKKK....",
    "........hLLLLLLLLKKKKKKKKKK.....",
    "........hLLGGLLLLLKKKKKKKgh.....",
    "........hLgggGGGLLhGKKKOggh.....",
    ".........hLLLgggLhGoOOOOOoh.....",
    "..........hhLLLhhGoOOOOOOOo.....",
    ".....uCCu..hhhhGGGooOOOOOoo.....",
    ".....uUUu.cChhggggoooOOOooo.....",
    ".....uUUuCcc.hhhgggooooooo......",
    ".....uuuuc......hhhhhooo........",
    ".uCCu.cc........................",
    ".uUUuc..........................",
    ".uuuu..........................."
  ],
  [
    "................................",
    "................................",
    "......................ttttt.....",
    ".....................TTTTTTt....",
    "....................TTTTTTTTt...",
    "...................KKttTTTTtt...",
    "..................tTTTWWWttK....",
    "..................KKKKWEWKKKK...",
    "................hhKKKKWWWKKbbBB.",
    ".............hhGGGKKKKKKKKKBBBK.",
    "............hGGGGKKKKKKKKKKK....",
    "...........hGGGGGKKKKKKKKKKK....",
    "...........GGGGGGKKKKKKKKKK.....",
    "..........hGGGGGGGKKKKKKKgh.....",
    "..........hGGGGGGGGGKKKOggh.....",
    "..........hghhhhhGGoOOOOOoh.....",
    "..........hhLLLLLhhOOOOOOOo.....",
    ".....uCCuhhLLLLLLLhhOOOOOoo.....",
    ".....uUUuhLLGGLLLLLhoOOOooo.....",
    ".....uUUuhhgggGGGLhhoooooo......",
    ".....uuuuchgLLgggghhhooo........",
    ".uCCu.cc....hhhhh...............",
    ".uUUuc..........................",
    ".uuuu..........................."
  ],
  /* Pose de impacto: ojo en X. */
  [
    "................................",
    "................................",
    "......................ttttt.....",
    ".....................TTTTTTt....",
    "....................TTTTTTTTt...",
    "...................KKttTTTTtt...",
    "..................tTTTWtWttK....",
    "..................KKKKKWKKKKK...",
    "................hhKKKKWKWKKbbBB.",
    "............hhhGGGKKKKKKKKKBBBK.",
    "..........hhLLLhhKKKKKKKKKKK....",
    ".........hLLLLLLLKKKKKKKKKKK....",
    "........hLLLLLLLLKKKKKKKKKK.....",
    "........hLLGGLLLLLKKKKKKKgh.....",
    "........hLgggGGGLLhGKKKOggh.....",
    ".........hLLLgggLhGoOOOOOoh.....",
    "..........hhLLLhhGoOOOOOOOo.....",
    ".....uCCu..hhhhGGGooOOOOOoo.....",
    ".....uUUu.cChhggggoooOOOooo.....",
    ".....uUUuCcc.hhhgggooooooo......",
    ".....uuuuc......hhhhhooo........",
    ".uCCu.cc........................",
    ".uUUuc..........................",
    ".uuuu..........................."
  ]
]};

/* Medalla (se recolorea por nivel). */
ART.medal = [
  "...XRX....XRX...",
  "....XRX..XRX....",
  "....XRX..XRX....",
  ".....XRXXRX.....",
  ".....XRXXRX.....",
  "......XRRX......",
  ".....YYYYYY.....",
  "....YLLLLLLY....",
  "...YLLYYYYLLY...",
  "..YYLYYCCYYLYY..",
  "..YLYYCCCCYYLY..",
  "..YLYCCCCCCYLY..",
  "..YLYYCCCCYYLY..",
  "..YYLYYCCYYLYY..",
  "...YLLYYYYLLY...",
  "....YLLLLLLY....",
  ".....YYYYYY.....",
  "................"
];

ART.medalTiers = [
  { id: 'barro', label: 'BARRO', min: 0,
    palette: { X: '#5a2a24', R: '#8a4636', Y: '#7a4e33', L: '#b07a4e', y: '#5e3a26', C: '#54f0d4' } },
  { id: 'copal', label: 'COPAL', min: 5,
    palette: { X: '#1d3f5e', R: '#2f6288', Y: '#d98b3a', L: '#f2c184', y: '#8f541f', C: '#54f0d4' } },
  { id: 'oro',   label: 'ORO',   min: 10,
    palette: { X: '#1d5c4a', R: '#2f8a68', Y: '#f2c14e', L: '#fff0a8', y: '#a87a1c', C: '#54f0d4' } },
  { id: 'anil',  label: 'AÑIL',  min: 20,
    palette: { X: '#1a2f5e', R: '#2f4f96', Y: '#5a8cff', L: '#a9c4ff', y: '#2b4a9e', C: '#54f0d4' } }
];

/* Utilidad: devuelve la medalla que corresponde a una puntuación. */
ART.medalFor = function (score) {
  var tier = ART.medalTiers[0];
  for (var i = 0; i < ART.medalTiers.length; i++) {
    if (score >= ART.medalTiers[i].min) tier = ART.medalTiers[i];
  }
  return tier;
};
