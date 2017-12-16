var Chroma = {};

Chroma.Notes = [
  {
    name:'A',
    pitch:0,
    posY:0,
    posX:0,
    color:'#FE130C'
  },
  {
    name:'A#',
    pitch:1,
    posY:1,
    posX:1,
    color:'#FF8000'
  },
  {
    name:'B',
    pitch:2,
    posY:0,
    posX:2,
    color:'#fadc00'
  },
  {
    name:'C',
    pitch:3,
    posY:0,
    posX:4,
    color:'#7AC11D'
  },
  {
    name:'C#',
    pitch:4,
    posY:1,
    posX:5,
    color:'#5BB224'
  },
  {
    name:'D',
    pitch:5,
    posY:0,
    posX:6,
    color:'#41AF7F'
  },
  {
    name:'D#',
    pitch:6,
    posY:1,
    posX:7,
    color:'#6EC7C1'
  },
  {
    name:'E',
    pitch:7,
    posY:0,
    posX:8,
    color:'#3A59A6'
  },
  {
    name:'F',
    pitch:8,
    posY:0,
    posX:10,
    color:'#202C90'
  },
  {
    name:'F#',
    pitch:9,
    posY:1,
    posX:11,
    color:'#4F268E'
  },
  {
    name:'G',
    pitch:10,
    posY:0,
    posX:12,
    color:'#963396'
  },
  {
    name:'G#',
    pitch:11,
    posY:1,
    posX:13,
    color:'#F2187E'
  }
]

Chroma.Chords = {
  'maj':{
    handle:'maj',
    name:'Major',
    steps:[0,4,7]
  },
  'min':{
    handle:'min',
    name:'Minor',
    steps:[0,3,7]
  },
  'aug':{
    handle:'aug',
    name:'Augmented',
    steps:[0,4,8]
  },
  'dim':{
    handle:'dim',
    name:'Diminished',
    steps:[0,3,6]
  },
  'M7':{
    handle:'M7',
    name:'Major 7th',
    steps:[0,4,7,11]
  },
  'm7':{
    handle:'m7',
    name:'Minor 7th',
    steps:[0,3,7,10]
  },
  '7':{
    handle:'7',
    name:'Dominant 7th',
    steps:[0,4,7,10]
  },
  '+7':{
    handle:'+7',
    name:'Augmented 7th',
    steps:[0,4,8,10]
  },
  'o7':{
    handle:'o7',
    name:'Diminished 7th',
    steps:[0,3,6,9]
  },
  '07':{
    handle:'07',
    name:'Half-diminished 7th',
    steps:[0,3,6,10]
  },
  '+M7':{
    handle:'+M7',
    name:'Augmented major 7th',
    steps:[0,3,7,11]
  },
  '6':{
    handle:'6',
    name:'Major 6th',
    steps:[0,4,7,9]
  },
  'm6':{
    handle:'m6',
    name:'Minor 6th',
    steps:[0,3,7,9]
  },
  'sus2':{
    handle:'sus2',
    name:'Suspended 2nd',
    steps:[0,2,7]
  },
  'sus4':{
    handle:'sus4',
    name:'Suspended 4th',
    steps:[0,5,7]
  },
  '9':{
    handle:'9',
    name:'9th',
    steps:[0,3,7,13]
  }
}

Chroma.Scales = {

  major:{
    handle:'major',
    name:'Major (Ionian)',
    chords:['maj','','min','','min','maj','','7','','min','','dim'],
    steps:[1,0,1,0,1,1,0,1,0,1,0,1]
  },
  minor:{
    handle:'minor',
    name:'Minor (Aeolian)',
    chords:['min','','dim','maj','','min','','min','maj','','7',''],
    steps:[1,0,1,1,0,1,0,1,1,0,1,0]
  },
  dorian:{
    handle:'dorian',
    name:'Dorian',
    chords:['min','','min','maj','','7','','min','','dim','maj',''],
    steps:[1,0,1,1,0,1,0,1,0,1,1,0]
  },
  phrygian:{
    handle:'phrygian',
    name:'Phrygian',
    chords:['min','maj','','7','','min','','dim','maj','','min',''],
    steps:[1,1,0,1,0,1,0,1,1,0,1,0]
  },
  lydian:{
    handle:'lydian',
    name:'Lydian',
    chords:['maj','','7','','min','','dim','maj','','min','','min'],
    steps:[1,0,1,0,1,0,1,1,0,1,0,1]
  },
  mixolydian:{
    handle:'mixolydian',
    name:'Mixolydian',
    chords:['7','','min','','dim','maj','','min','','min','maj',''],
    steps:[1,0,1,0,1,1,0,1,0,1,1,0]
  },
  locrian:{
    handle:'locrian',
    name:'Locrian',
    chords:['dim','maj','','min','','min','maj','','7','','min',''],
    steps:[1,1,0,1,0,1,1,0,1,0,1,0]
  },
  majorPenta:{
    handle:'majorPenta',
    name:'Major pentatonic',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,0,1,0,0,1,0,1,0,0]
  },
  minorPenta:{
    handle:'minorPenta',
    name:'Minor pentatonic',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,0,1,0,1,0,1,0,0,1,0]
  },
  acoustic:{
    handle:'acoustic',
    name:'Acoustic',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,0,1,0,1,1,0,1,0,0]
  },
  adonai:{
    handle:'adonai',
    name:'Adonai malakh',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,0,1,1,0,1,1,0,1,0]
  },
  algerian:{
    handle:'algerian',
    name:'Algerian',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,1,0,0,1,1,1,0,0,1]
  },
  augmented:{
    handle:'augmented',
    name:'Augmented',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,0,1,1,0,0,1,1,0,0,1]
  },
  bebopDom:{
    handle:'bebopDom',
    name:'Bebop dominant',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,0,1,1,0,1,0,1,1,1]
  },
  bebopMaj:{
    handle:'bebopMaj',
    name:'Bebop major',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,0,1,1,0,1,1,1,0,1]
  },
  bluesHexa:{
    handle:'bluesHexa',
    name:'Blues hexatonic',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,0,1,0,1,1,1,0,0,1,0]
  },
  doubleHarmonic:{
    handle:'doubleHarmonic',
    name:'Double harmonic',
    chords:['','','','','','','','','','','',''],
    steps:[1,1,0,0,1,1,0,0,1,1,0,1]
  },
  enigmatic:{
    handle:'enigmatic',
    name:'Enigmatic',
    chords:['','','','','','','','','','','',''],
    steps:[1,1,0,0,1,0,1,0,1,0,1,1]
  },
  gypsy:{
    handle:'gypsy',
    name:'Gypsy',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,1,0,0,1,1,1,0,1,0]
  },
  halfDim:{
    handle:'halfDim',
    name:'Half diminished',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,1,0,1,1,0,1,0,1,0]
  },
  harmonicMaj:{
    handle:'harmonicMaj',
    name:'Harmonic major',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,0,1,1,0,1,1,0,0,1]
  },
  harmonicMin:{
    handle:'harmonicMin',
    name:'Harmonic minor',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,1,0,1,0,1,1,0,0,1]
  },
  hungarianMin:{
    handle:'hungarianMin',
    name:'Hungarian minor',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,1,0,0,1,1,1,0,0,1]
  },
  istrian:{
    handle:'istrian',
    name:'Istrian',
    chords:['','','','','','','','','','','',''],
    steps:[1,1,0,1,1,0,1,1,0,0,0,0]
  },
  lydianAug:{
    handle:'lydianAug',
    name:'Lydian augmented',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,0,1,0,1,0,1,1,0,1]
  },
  majLocrian:{
    handle:'majLocrian',
    name:'Major locrian',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,0,1,1,1,0,1,0,1,0]
  },
  jazzMin:{
    handle:'jazzMin',
    name:'Jazz minor',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,1,0,1,0,1,0,1,0,1]
  },
  neapolitanMaj:{
    handle:'neapolitanMaj',
    name:'Neapolitan major',
    chords:['','','','','','','','','','','',''],
    steps:[1,1,0,1,0,1,0,1,0,1,0,1]
  },
  neapolitanMin:{
    handle:'neapolitanMin',
    name:'Neapolitan minor',
    chords:['','','','','','','','','','','',''],
    steps:[1,1,0,1,0,1,0,1,1,0,0,1]
  },
  octatonic:{
    handle:'octatonic',
    name:'Octatonic (diminished)',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,1,0,1,1,0,1,1,0,1]
  },
  persian:{
    handle:'persian',
    name:'Persian',
    chords:['','','','','','','','','','','',''],
    steps:[1,1,0,0,1,1,1,0,1,0,0,1]
  },
  phrygianDom:{
    handle:'phrygianDom',
    name:'Phrygian dominant',
    chords:['','','','','','','','','','','',''],
    steps:[1,1,0,0,1,1,0,1,1,0,1,0]
  },
  prometheus:{
    handle:'prometheus',
    name:'Prometheus',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,0,1,0,1,0,0,1,1,0]
  },
  tritone:{
    handle:'tritone',
    name:'Tritone',
    chords:['','','','','','','','','','','',''],
    steps:[1,1,0,0,1,0,1,1,0,0,1,0]
  },
  ukranianDorian:{
    handle:'ukranianDorian',
    name:'Ukranian dorian',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,1,0,0,1,1,0,1,1,0]
  },
  wholeTone:{
    handle:'wholeTone',
    name:'Whole tone',
    chords:['','','','','','','','','','','',''],
    steps:[1,0,1,0,1,0,1,0,1,0,1,0]
  },
  chromatic:{
    handle:'chromatic',
    name:'Chromatic',
    chords:['1/1','25/24','9/8','6/5','5/4','4/3','45/32','3/2','8/5','5/3','9/5','15/8'],
    steps:[1,1,1,1,1,1,1,1,1,1,1,1]
  }
};
/*
  empty:{
    handle:'empty',
    name:'empty',
    chords:['','','','','','','','','','','',''],
    steps:[0,0,0,0,0,0,0,0,0,0,0,0]
  }
  */
