// ===================================
// Données complètes des personnages de Smash Ultimate
// 89 personnages avec leurs images officielles
// ===================================

// Images depuis le site officiel: https://www.smashbros.com/assets_v2/img/fighter/
const ALL_CHARACTERS = [
  // Fighters 01-10
    {
    id: 'mario',
    name: 'Mario',
    number: '01',
    series: 'Super Mario',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/mario.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/mario/main.png'
    }
  },
    {
    id: 'donkey-kong',
    name: 'Donkey Kong',
    number: '02',
    series: 'Donkey Kong',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/donkey_kong.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/donkey_kong/main.png'
    }
  },
    {
    id: 'link',
    name: 'Link',
    number: '03',
    series: 'The Legend of Zelda',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/link.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/link/main.png'
    }
  },
    {
    id: 'samus',
    name: 'Samus',
    number: '04',
    series: 'Metroid',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/samus.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/samus/main.png'
    }
  },
    {
    id: 'dark-samus',
    name: 'Dark Samus',
    number: '04ε',
    series: 'Metroid',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/dark_samus.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/dark_samus/main.png'
    }
  },
    {
    id: 'yoshi',
    name: 'Yoshi',
    number: '05',
    series: 'Yoshi',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/yoshi.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/yoshi/main.png'
    }
  },
    {
    id: 'kirby',
    name: 'Kirby',
    number: '06',
    series: 'Kirby',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/kirby.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/kirby/main.png'
    }
  },
    {
    id: 'fox',
    name: 'Fox',
    number: '07',
    series: 'Star Fox',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/fox.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/fox/main.png'
    }
  },
    {
    id: 'pikachu',
    name: 'Pikachu',
    number: '08',
    series: 'Pokémon',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/pikachu.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/pikachu/main.png'
    }
  },
    {
    id: 'luigi',
    name: 'Luigi',
    number: '09',
    series: 'Super Mario',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/luigi.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/luigi/main.png'
    }
  },
    {
    id: 'ness',
    name: 'Ness',
    number: '10',
    series: 'EarthBound',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/ness.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/ness/main.png'
    }
  },

  // Fighters 11-20
    {
    id: 'captain-falcon',
    name: 'Captain Falcon',
    number: '11',
    series: 'F-Zero',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/captain_falcon.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/captain_falcon/main.png'
    }
  },
    {
    id: 'jigglypuff',
    name: 'Jigglypuff',
    number: '12',
    series: 'Pokémon',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/purin.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/purin/main.png'
    }
  },
    {
    id: 'peach',
    name: 'Peach',
    number: '13',
    series: 'Super Mario',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/peach.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/peach/main.png'
    }
  },
    {
    id: 'daisy',
    name: 'Daisy',
    number: '13ε',
    series: 'Super Mario',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/daisy.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/daisy/main.png'
    }
  },
    {
    id: 'bowser',
    name: 'Bowser',
    number: '14',
    series: 'Super Mario',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/koopa.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/koopa/main.png'
    }
  },
    {
    id: 'ice-climbers',
    name: 'Ice Climbers',
    number: '15',
    series: 'Ice Climber',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/ice_climber.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/ice_climber/main.png'
    }
  },
    {
    id: 'sheik',
    name: 'Sheik',
    number: '16',
    series: 'The Legend of Zelda',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/sheik.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/sheik/main.png'
    }
  },
    {
    id: 'zelda',
    name: 'Zelda',
    number: '17',
    series: 'The Legend of Zelda',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/zelda.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/zelda/main.png'
    }
  },
    {
    id: 'dr-mario',
    name: 'Dr. Mario',
    number: '18',
    series: 'Super Mario',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/dr_mario.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/dr_mario/main.png'
    }
  },
    {
    id: 'pichu',
    name: 'Pichu',
    number: '19',
    series: 'Pokémon',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/pichu.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/pichu/main.png'
    }
  },
    {
    id: 'falco',
    name: 'Falco',
    number: '20',
    series: 'Star Fox',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/falco.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/falco/main.png'
    }
  },

  // Fighters 21-30
    {
    id: 'marth',
    name: 'Marth',
    number: '21',
    series: 'Fire Emblem',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/marth.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/marth/main.png'
    }
  },
    {
    id: 'lucina',
    name: 'Lucina',
    number: '21ε',
    series: 'Fire Emblem',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/lucina.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/lucina/main.png'
    }
  },
    {
    id: 'young-link',
    name: 'Young Link',
    number: '22',
    series: 'The Legend of Zelda',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/young_link.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/young_link/main.png'
    }
  },
    {
    id: 'ganondorf',
    name: 'Ganondorf',
    number: '23',
    series: 'The Legend of Zelda',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/ganondorf.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/ganondorf/main.png'
    }
  },
    {
    id: 'mewtwo',
    name: 'Mewtwo',
    number: '24',
    series: 'Pokémon',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/mewtwo.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/mewtwo/main.png'
    }
  },
    {
    id: 'roy',
    name: 'Roy',
    number: '25',
    series: 'Fire Emblem',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/roy.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/roy/main.png'
    }
  },
    {
    id: 'chrom',
    name: 'Chrom',
    number: '25ε',
    series: 'Fire Emblem',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/chrom.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/chrom/main.png'
    }
  },
    {
    id: 'game-and-watch',
    name: 'Mr. Game & Watch',
    number: '26',
    series: 'Game & Watch',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/mr_game_and_watch.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/mr_game_and_watch/main.png'
    }
  },
    {
    id: 'meta-knight',
    name: 'Meta Knight',
    number: '27',
    series: 'Kirby',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/meta_knight.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/meta_knight/main.png'
    }
  },
    {
    id: 'pit',
    name: 'Pit',
    number: '28',
    series: 'Kid Icarus',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/pit.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/pit/main.png'
    }
  },
    {
    id: 'dark-pit',
    name: 'Dark Pit',
    number: '28ε',
    series: 'Kid Icarus',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/dark_pit.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/dark_pit/main.png'
    }
  },
    {
    id: 'zero-suit-samus',
    name: 'Zero Suit Samus',
    number: '29',
    series: 'Metroid',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/zero_suit_samus.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/zero_suit_samus/main.png'
    }
  },
    {
    id: 'wario',
    name: 'Wario',
    number: '30',
    series: 'Wario',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/wario.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/wario/main.png'
    }
  },

  // Fighters 31-40
    {
    id: 'snake',
    name: 'Snake',
    number: '31',
    series: 'Metal Gear',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/snake.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/snake/main.png'
    }
  },
    {
    id: 'ike',
    name: 'Ike',
    number: '32',
    series: 'Fire Emblem',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/ike.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/ike/main.png'
    }
  },
    {
    id: 'pokemon-trainer',
    name: 'Pokémon Trainer',
    number: '33-35',
    series: 'Pokémon',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/pokemon_trainer.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/pokemon_trainer/main.png'
    }
  },
    {
    id: 'diddy-kong',
    name: 'Diddy Kong',
    number: '36',
    series: 'Donkey Kong',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/diddy_kong.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/diddy_kong/main.png'
    }
  },
    {
    id: 'lucas',
    name: 'Lucas',
    number: '37',
    series: 'EarthBound',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/lucas.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/lucas/main.png'
    }
  },
    {
    id: 'sonic',
    name: 'Sonic',
    number: '38',
    series: 'Sonic',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/sonic.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/sonic/main.png'
    }
  },
    {
    id: 'king-dedede',
    name: 'King Dedede',
    number: '39',
    series: 'Kirby',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/dedede.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/dedede/main.png'
    }
  },
    {
    id: 'olimar',
    name: 'Olimar',
    number: '40',
    series: 'Pikmin',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/olimar.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/olimar/main.png'
    }
  },
    {
    id: 'lucario',
    name: 'Lucario',
    number: '41',
    series: 'Pokémon',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/lucario.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/lucario/main.png'
    }
  },
    {
    id: 'rob',
    name: 'R.O.B.',
    number: '42',
    series: 'R.O.B.',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/robot.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/robot/main.png'
    }
  },
    {
    id: 'toon-link',
    name: 'Toon Link',
    number: '43',
    series: 'The Legend of Zelda',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/toon_link.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/toon_link/main.png'
    }
  },
    {
    id: 'wolf',
    name: 'Wolf',
    number: '44',
    series: 'Star Fox',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/wolf.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/wolf/main.png'
    }
  },

  // Fighters 41-50
    {
    id: 'villager',
    name: 'Villager',
    number: '45',
    series: 'Animal Crossing',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/villager.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/villager/main.png'
    }
  },
    {
    id: 'mega-man',
    name: 'Mega Man',
    number: '46',
    series: 'Mega Man',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/mega_man.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/mega_man/main.png'
    }
  },
    {
    id: 'wii-fit-trainer',
    name: 'Wii Fit Trainer',
    number: '47',
    series: 'Wii Fit',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/wii_fit_trainer.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/wii_fit_trainer/main.png'
    }
  },
    {
    id: 'rosalina',
    name: 'Rosalina & Luma',
    number: '48',
    series: 'Super Mario',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/rosalina_and_luma.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/rosalina_and_luma/main.png'
    }
  },
    {
    id: 'little-mac',
    name: 'Little Mac',
    number: '49',
    series: 'Punch-Out!!',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/little_mac.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/little_mac/main.png'
    }
  },
    {
    id: 'greninja',
    name: 'Greninja',
    number: '50',
    series: 'Pokémon',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/greninja.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/greninja/main.png'
    }
  },
    {
    id: 'mii-brawler',
    name: 'Mii Brawler',
    number: '51',
    series: 'Mii',
    images: {
      icon: 'https://media.eventhubs.com/images/ssbu/character_header_mii-brawler_alt.jpg',
      portrait: 'https://www.ssbwiki.com/images/e/e4/Mii_Brawler_SSBU.png?210ea'
    }
  },
    {
    id: 'mii-swordfighter',
    name: 'Mii Swordfighter',
    number: '52',
    series: 'Mii',
    images: {
      icon: 'https://media.eventhubs.com/images/ssbu/character_header_mii-swordfighter_alt.jpg',
      portrait: 'https://ssb.wiki.gallery/images/thumb/f/fa/Mii_Swordfighter_SSBU.png/1200px-Mii_Swordfighter_SSBU.png'
    }
  },
    {
    id: 'mii-gunner',
    name: 'Mii Gunner',
    number: '53',
    series: 'Mii',
    images: {
      icon: 'https://media.eventhubs.com/images/ssbu/character_header_mii-gunner_alt.jpg',
      portrait: 'https://ssb.wiki.gallery/images/thumb/e/e5/Mii_Gunner_SSBU.png/1200px-Mii_Gunner_SSBU.png'
    }
  },
    {
    id: 'palutena',
    name: 'Palutena',
    number: '54',
    series: 'Kid Icarus',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/palutena.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/palutena/main.png'
    }
  },
    {
    id: 'pac-man',
    name: 'Pac-Man',
    number: '55',
    series: 'Pac-Man',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/pac_man.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/pac_man/main.png'
    }
  },
    {
    id: 'robin',
    name: 'Robin',
    number: '56',
    series: 'Fire Emblem',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/reflet.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/reflet/main.png'
    }
  },
    {
    id: 'shulk',
    name: 'Shulk',
    number: '57',
    series: 'Xenoblade',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/shulk.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/shulk/main.png'
    }
  },
    {
    id: 'bowser-jr',
    name: 'Bowser Jr.',
    number: '58',
    series: 'Super Mario',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/bowser_jr.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/bowser_jr/main.png'
    }
  },
    {
    id: 'duck-hunt',
    name: 'Duck Hunt',
    number: '59',
    series: 'Duck Hunt',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/duck_hunt.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/duck_hunt/main.png'
    }
  },
    {
    id: 'ryu',
    name: 'Ryu',
    number: '60',
    series: 'Street Fighter',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/ryu.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/ryu/main.png'
    }
  },
    {
    id: 'ken',
    name: 'Ken',
    number: '60ε',
    series: 'Street Fighter',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/ken.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/ken/main.png'
    }
  },
    {
    id: 'cloud',
    name: 'Cloud',
    number: '61',
    series: 'Final Fantasy',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/cloud.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/cloud/main.png'
    }
  },
    {
    id: 'corrin',
    name: 'Corrin',
    number: '62',
    series: 'Fire Emblem',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/kamui.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/kamui/main.png'
    }
  },
    {
    id: 'bayonetta',
    name: 'Bayonetta',
    number: '63',
    series: 'Bayonetta',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/bayonetta.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/bayonetta/main.png'
    }
  },
    {
    id: 'inkling',
    name: 'Inkling',
    number: '64',
    series: 'Splatoon',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/inkling.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/inkling/main.png'
    }
  },
    {
    id: 'ridley',
    name: 'Ridley',
    number: '65',
    series: 'Metroid',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/ridley.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/ridley/main.png'
    }
  },
    {
    id: 'simon',
    name: 'Simon',
    number: '66',
    series: 'Castlevania',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/simon.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/simon/main.png'
    }
  },
    {
    id: 'richter',
    name: 'Richter',
    number: '66ε',
    series: 'Castlevania',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/richter.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/richter/main.png'
    }
  },
    {
    id: 'king-k-rool',
    name: 'King K. Rool',
    number: '67',
    series: 'Donkey Kong',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/king_k_rool.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/king_k_rool/main.png'
    }
  },
    {
    id: 'isabelle',
    name: 'Isabelle',
    number: '68',
    series: 'Animal Crossing',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/shizue.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/shizue/main.png'
    }
  },
    {
    id: 'incineroar',
    name: 'Incineroar',
    number: '69',
    series: 'Pokémon',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/gaogaen.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/gaogaen/main.png'
    }
  },
    {
    id: 'piranha-plant',
    name: 'Piranha Plant',
    number: '70',
    series: 'Super Mario',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/packun_flower.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/piranha_plant/main.png'
    }
  },
    {
    id: 'joker',
    name: 'Joker',
    number: '71',
    series: 'Persona',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/joker.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/joker/main.png'
    }
  },
    {
    id: 'hero',
    name: 'Hero',
    number: '72',
    series: 'Dragon Quest',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/dq_hero.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/dq_hero/main.png'
    }
  },
    {
    id: 'banjo-kazooie',
    name: 'Banjo & Kazooie',
    number: '73',
    series: 'Banjo-Kazooie',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/banjo_and_kazooie.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/banjo_and_kazooie/main.png'
    }
  },
    {
    id: 'terry',
    name: 'Terry',
    number: '74',
    series: 'Fatal Fury',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/terry.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/terry/main.png'
    }
  },
    {
    id: 'byleth',
    name: 'Byleth',
    number: '75',
    series: 'Fire Emblem',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/byleth.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/byleth/main.png'
    }
  },
    {
    id: 'min-min',
    name: 'Min Min',
    number: '76',
    series: 'ARMS',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/minmin.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/minmin/main.png'
    }
  },
    {
    id: 'steve',
    name: 'Steve',
    number: '77',
    series: 'Minecraft',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/steve.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/steve/main.png'
    }
  },
    {
    id: 'sephiroth',
    name: 'Sephiroth',
    number: '78',
    series: 'Final Fantasy',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/sephiroth.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/sephiroth/main.png'
    }
  },
    {
    id: 'pyra-mythra',
    name: 'Pyra / Mythra',
    number: '79-80',
    series: 'Xenoblade',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/homura.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/homura/main.png'
    }
  },
    {
    id: 'kazuya',
    name: 'Kazuya',
    number: '81',
    series: 'Tekken',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/kazuya.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/kazuya/main.png'
    }
  },
    {
    id: 'sora',
    name: 'Sora',
    number: '82',
    series: 'Kingdom Hearts',
    images: {
      icon: 'https://www.smashbros.com/assets_v2/img/fighter/thumb_a/sora.png',
      portrait: 'https://www.smashbros.com/assets_v2/img/fighter/sora/main.png'
    }
  }
];

// Exporter pour utilisation dans d'autres fichiers
window.ALL_CHARACTERS = ALL_CHARACTERS;