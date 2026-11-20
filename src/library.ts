import { parseSong, type Song } from './song.js';

/*
 * Built-in songs (phase 1). Traditional / public-domain melodies, written in
 * the app's song text format. C4 is middle C.
 */
const SOURCES: Record<string, string> = {
  'hot-cross-buns': `
titulo: Hot Cross Buns
tom: C
E4:Hot D4:cross C4:buns . E4:hot D4:cross C4:buns
C4:One C4:a C4:pen- C4:ny . D4:two D4:a D4:pen- D4:ny
E4:hot D4:cross C4:buns
`,

  'mary-had-a-little-lamb': `
titulo: Mary Had a Little Lamb
tom: C
E4:Ma- D4:ry C4:had D4:a E4:lit- E4:tle E4:lamb
D4:lit- D4:tle D4:lamb . E4:lit- G4:tle G4:lamb
E4:Ma- D4:ry C4:had D4:a E4:lit- E4:tle E4:lamb E4:its
D4:fleece D4:was E4:white D4:as C4:snow
`,

  'twinkle-twinkle': `
titulo: Twinkle, Twinkle, Little Star
tom: C
C4:Twin- C4:kle G4:twin- G4:kle A4:lit- A4:tle G4:star
F4:How F4:I E4:won- E4:der D4:what D4:you C4:are
G4:Up G4:a- F4:bove F4:the E4:world E4:so D4:high
G4:Like G4:a F4:dia- F4:mond E4:in E4:the D4:sky
C4:Twin- C4:kle G4:twin- G4:kle A4:lit- A4:tle G4:star
F4:How F4:I E4:won- E4:der D4:what D4:you C4:are
`,

  'frere-jacques': `
titulo: Frère Jacques
tom: C
C4:Frè- D4:re E4:Jac- C4:ques . C4:frè- D4:re E4:Jac- C4:ques
E4:dor- F4:mez G4:vous . E4:dor- F4:mez G4:vous
G4:Son- A4:nez G4:les F4:ma- E4:ti- C4:nes
G4:son- A4:nez G4:les F4:ma- E4:ti- C4:nes
C4:Ding G3:daing C4:dong . C4:ding G3:daing C4:dong
`,

  'ode-to-joy': `
titulo: Hino da Alegria
tom: C
autor: L. van Beethoven
E4 E4 F4 G4 G4 F4 E4 D4
C4 C4 D4 E4 E4 D4 D4
E4 E4 F4 G4 G4 F4 E4 D4
C4 C4 D4 E4 D4 C4 C4
D4 D4 E4 C4 D4 E4 F4 E4 C4
D4 E4 F4 E4 D4 C4 D4 G3
E4 E4 F4 G4 G4 F4 E4 D4
C4 C4 D4 E4 D4 C4 C4
`,

  'jingle-bells': `
titulo: Jingle Bells
tom: C
E4:Jin- E4:gle E4:bells . E4:jin- E4:gle E4:bells
E4:jin- G4:gle C4:all D4:the E4:way
F4:Oh F4:what F4:fun F4:it F4:is E4:to E4:ride
E4:in E4:a D4:one D4:horse E4:o- D4:pen G4:sleigh
E4:Jin- E4:gle E4:bells . E4:jin- E4:gle E4:bells
E4:jin- G4:gle C4:all D4:the E4:way
F4:Oh F4:what F4:fun F4:it F4:is E4:to E4:ride
E4:in E4:a G4:one G4:horse F4:o- D4:pen C4:sleigh
`,

  'we-wish-you-a-merry-christmas': `
titulo: We Wish You a Merry Christmas
tom: C
G3:We C4:wish C4:you . D4:a C4:mer- B3:ry A3:Christ- A3:mas
A3:We D4:wish D4:you . E4:a D4:mer- C4:ry B3:Christ- G3:mas
G3:We E4:wish E4:you . F4:a E4:mer- D4:ry C4:Christ- A3:mas
G3:And G3:a . A3:hap- D4:py B3:New . C4:Year
`,
};

export const LIBRARY: Song[] = Object.entries(SOURCES).map(([id, text]) => parseSong(text, id));

export function findSong(id: string): Song | undefined {
  return LIBRARY.find((s) => s.id === id);
}
