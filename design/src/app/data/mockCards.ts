export type CardType = "Monster" | "Spell" | "Trap";
export type Attribute = "DARK" | "LIGHT" | "FIRE" | "WATER" | "EARTH" | "WIND" | "DIVINE";
export type BanlistStatus = "Unlimited" | "Semi-Limited" | "Limited" | "Forbidden";
export type Rarity = "Common" | "Rare" | "Super Rare" | "Ultra Rare" | "Secret Rare";

export interface CardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_rarity_code: string;
  set_price: string;
}

export interface YugiohCard {
  id: number;
  name: string;
  type: string;
  humanReadableCardType: string;
  frameType: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  rank?: number;
  race: string;
  attribute?: Attribute;
  archetype?: string;
  banlist_info?: { ban_tcg?: BanlistStatus; ban_ocg?: BanlistStatus };
  card_sets?: CardSet[];
  card_images: { id: number; image_url: string; image_url_small: string; image_url_cropped: string }[];
  rarity?: Rarity;
}

export const MOCK_CARDS: YugiohCard[] = [
  {
    id: 89631139,
    name: "Blue-Eyes White Dragon",
    type: "Normal Monster",
    humanReadableCardType: "Normal Monster",
    frameType: "normal",
    desc: "This legendary dragon is a powerful engine of destruction. Virtually invincible, very few have faced this awesome creature and survived.",
    atk: 3000,
    def: 2500,
    level: 8,
    race: "Dragon",
    attribute: "LIGHT",
    archetype: "Blue-Eyes",
    banlist_info: { ban_tcg: "Unlimited" },
    card_images: [{ id: 89631139, image_url: "https://images.ygoprodeck.com/images/cards/89631139.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/89631139.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/89631139.jpg" }],
    rarity: "Ultra Rare",
    card_sets: [{ set_name: "Legend of Blue Eyes White Dragon", set_code: "LOB-001", set_rarity: "Ultra Rare", set_rarity_code: "UR", set_price: "8.50" }],
  },
  {
    id: 46986414,
    name: "Dark Magician",
    type: "Normal Monster",
    humanReadableCardType: "Normal Monster",
    frameType: "normal",
    desc: "The ultimate wizard in terms of attack and defense.",
    atk: 2500,
    def: 2100,
    level: 7,
    race: "Spellcaster",
    attribute: "DARK",
    archetype: "Dark Magician",
    banlist_info: { ban_tcg: "Unlimited" },
    card_images: [{ id: 46986414, image_url: "https://images.ygoprodeck.com/images/cards/46986414.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/46986414.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/46986414.jpg" }],
    rarity: "Ultra Rare",
    card_sets: [{ set_name: "Legend of Blue Eyes White Dragon", set_code: "LOB-005", set_rarity: "Ultra Rare", set_rarity_code: "UR", set_price: "5.00" }],
  },
  {
    id: 74677422,
    name: "Red-Eyes Black Dragon",
    type: "Normal Monster",
    humanReadableCardType: "Normal Monster",
    frameType: "normal",
    desc: "A ferocious dragon with a deadly attack.",
    atk: 2400,
    def: 2000,
    level: 7,
    race: "Dragon",
    attribute: "DARK",
    archetype: "Red-Eyes",
    banlist_info: { ban_tcg: "Unlimited" },
    card_images: [{ id: 74677422, image_url: "https://images.ygoprodeck.com/images/cards/74677422.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/74677422.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/74677422.jpg" }],
    rarity: "Super Rare",
    card_sets: [{ set_name: "Legend of Blue Eyes White Dragon", set_code: "LOB-070", set_rarity: "Super Rare", set_rarity_code: "SR", set_price: "3.50" }],
  },
  {
    id: 55144522,
    name: "Exodia the Forbidden One",
    type: "Effect Monster",
    humanReadableCardType: "Effect Monster",
    frameType: "effect",
    desc: "If you have \"Right Leg of the Forbidden One\", \"Left Leg of the Forbidden One\", \"Right Arm of the Forbidden One\" and \"Left Arm of the Forbidden One\" in addition to this card in your hand, you win the Duel.",
    atk: 1000,
    def: 1000,
    level: 3,
    race: "Spellcaster",
    attribute: "DARK",
    archetype: "Forbidden One",
    banlist_info: { ban_tcg: "Limited" },
    card_images: [{ id: 55144522, image_url: "https://images.ygoprodeck.com/images/cards/55144522.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/55144522.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/55144522.jpg" }],
    rarity: "Secret Rare",
    card_sets: [{ set_name: "Legend of Blue Eyes White Dragon", set_code: "LOB-124", set_rarity: "Secret Rare", set_rarity_code: "ScR", set_price: "45.00" }],
  },
  {
    id: 5318639,
    name: "Pot of Greed",
    type: "Spell Card",
    humanReadableCardType: "Spell Card",
    frameType: "spell",
    desc: "Draw 2 cards.",
    race: "Normal",
    banlist_info: { ban_tcg: "Forbidden" },
    card_images: [{ id: 5318639, image_url: "https://images.ygoprodeck.com/images/cards/5318639.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/5318639.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/5318639.jpg" }],
    rarity: "Rare",
    card_sets: [{ set_name: "Metal Raiders", set_code: "MRD-138", set_rarity: "Rare", set_rarity_code: "R", set_price: "1.50" }],
  },
  {
    id: 83764719,
    name: "Mirror Force",
    type: "Trap Card",
    humanReadableCardType: "Trap Card",
    frameType: "trap",
    desc: "When an opponent's monster declares an attack: Destroy all your opponent's Attack Position monsters.",
    race: "Normal",
    banlist_info: { ban_tcg: "Unlimited" },
    card_images: [{ id: 83764719, image_url: "https://images.ygoprodeck.com/images/cards/83764719.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/83764719.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/83764719.jpg" }],
    rarity: "Super Rare",
    card_sets: [{ set_name: "Metal Raiders", set_code: "MRD-138", set_rarity: "Super Rare", set_rarity_code: "SR", set_price: "2.00" }],
  },
  {
    id: 38033121,
    name: "Stardust Dragon",
    type: "Synchro Monster",
    humanReadableCardType: "Synchro Monster",
    frameType: "synchro",
    desc: "1 Tuner + 1+ non-Tuner monsters. Once per turn, when a card or effect is activated that would destroy a card(s) on the field: You can Tribute this card; negate the activation, and if you do, destroy it. During the End Phase, if this effect was activated this turn: You can Special Summon this card from your Graveyard.",
    atk: 2500,
    def: 2000,
    level: 8,
    race: "Dragon",
    attribute: "WIND",
    archetype: "Stardust",
    banlist_info: { ban_tcg: "Unlimited" },
    card_images: [{ id: 38033121, image_url: "https://images.ygoprodeck.com/images/cards/38033121.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/38033121.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/38033121.jpg" }],
    rarity: "Ultra Rare",
    card_sets: [{ set_name: "The Duelist Genesis", set_code: "TDGS-EN040", set_rarity: "Ultra Rare", set_rarity_code: "UR", set_price: "6.00" }],
  },
  {
    id: 62873545,
    name: "Number 39: Utopia",
    type: "XYZ Monster",
    humanReadableCardType: "XYZ Monster",
    frameType: "xyz",
    desc: "2 Level 4 monsters. When any player's monster declares an attack: You can detach 1 material from this card; negate the attack. If this card has no Xyz Materials, destroy it.",
    atk: 2500,
    def: 2000,
    rank: 4,
    race: "Warrior",
    attribute: "LIGHT",
    archetype: "Utopia",
    banlist_info: { ban_tcg: "Unlimited" },
    card_images: [{ id: 62873545, image_url: "https://images.ygoprodeck.com/images/cards/62873545.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/62873545.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/62873545.jpg" }],
    rarity: "Ultra Rare",
    card_sets: [{ set_name: "Generation Force", set_code: "GENF-EN039", set_rarity: "Ultra Rare", set_rarity_code: "UR", set_price: "4.50" }],
  },
  {
    id: 1861629,
    name: "Elemental HERO Neos",
    type: "Normal Monster",
    humanReadableCardType: "Normal Monster",
    frameType: "normal",
    desc: "A new Legendary Warrior from Neo Space. When he initiates a Contact Fusion with a Neo-Spacian, he transforms into a new Elemental HERO.",
    atk: 2500,
    def: 2000,
    level: 7,
    race: "Warrior",
    attribute: "LIGHT",
    archetype: "HERO",
    banlist_info: { ban_tcg: "Unlimited" },
    card_images: [{ id: 1861629, image_url: "https://images.ygoprodeck.com/images/cards/01861629.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/01861629.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/01861629.jpg" }],
    rarity: "Rare",
    card_sets: [{ set_name: "Enemy of Justice", set_code: "EOJ-EN001", set_rarity: "Common", set_rarity_code: "C", set_price: "1.00" }],
  },
  {
    id: 24094653,
    name: "Dark Hole",
    type: "Spell Card",
    humanReadableCardType: "Spell Card",
    frameType: "spell",
    desc: "Destroy all monsters on the field.",
    race: "Normal",
    banlist_info: { ban_tcg: "Unlimited" },
    card_images: [{ id: 24094653, image_url: "https://images.ygoprodeck.com/images/cards/24094653.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/24094653.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/24094653.jpg" }],
    rarity: "Common",
    card_sets: [{ set_name: "Legend of Blue Eyes White Dragon", set_code: "LOB-052", set_rarity: "Common", set_rarity_code: "C", set_price: "0.50" }],
  },
  {
    id: 36361633,
    name: "Black Rose Dragon",
    type: "Synchro Monster",
    humanReadableCardType: "Synchro Monster",
    frameType: "synchro",
    desc: "1 Tuner + 1+ non-Tuner monsters. When this card is Synchro Summoned: You can destroy all cards on the field. Once per turn: You can banish 1 Plant monster from your Graveyard, then target 1 Defense Position monster your opponent controls; change that target to face-up Attack Position, and if you do, its ATK becomes 0 until the end of this turn.",
    atk: 2400,
    def: 1800,
    level: 7,
    race: "Dragon",
    attribute: "FIRE",
    banlist_info: { ban_tcg: "Unlimited" },
    card_images: [{ id: 36361633, image_url: "https://images.ygoprodeck.com/images/cards/36361633.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/36361633.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/36361633.jpg" }],
    rarity: "Ultra Rare",
    card_sets: [{ set_name: "The Duelist Genesis", set_code: "TDGS-EN039", set_rarity: "Ultra Rare", set_rarity_code: "UR", set_price: "3.00" }],
  },
  {
    id: 72989439,
    name: "Solemn Judgment",
    type: "Counter Trap Card",
    humanReadableCardType: "Counter Trap Card",
    frameType: "trap",
    desc: "When a monster(s) would be Summoned, OR a Spell/Trap Card is activated: Pay half your LP; negate the Summon or activation, and if you do, destroy that card.",
    race: "Counter",
    banlist_info: { ban_tcg: "Unlimited" },
    card_images: [{ id: 72989439, image_url: "https://images.ygoprodeck.com/images/cards/72989439.jpg", image_url_small: "https://images.ygoprodeck.com/images/cards_small/72989439.jpg", image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/72989439.jpg" }],
    rarity: "Super Rare",
    card_sets: [{ set_name: "Metal Raiders", set_code: "MRD-127", set_rarity: "Super Rare", set_rarity_code: "SR", set_price: "2.50" }],
  },
];

export const CARD_TYPES = ["Monster", "Spell", "Trap", "Effect Monster", "Normal Monster", "Fusion Monster", "Synchro Monster", "XYZ Monster", "Link Monster"];
export const ATTRIBUTES = ["DARK", "LIGHT", "FIRE", "WATER", "EARTH", "WIND", "DIVINE"];
export const RACES = ["Dragon", "Spellcaster", "Warrior", "Beast", "Machine", "Fairy", "Fiend", "Insect", "Zombie", "Aqua", "Pyro", "Rock", "Thunder", "Plant", "Reptile", "Sea Serpent", "Winged Beast", "Divine-Beast", "Psychic", "Cyberse"];
export const BANLIST_OPTIONS: BanlistStatus[] = ["Unlimited", "Semi-Limited", "Limited", "Forbidden"];

export function filterCards(cards: YugiohCard[], filters: {
  name?: string;
  type?: string;
  attribute?: string;
  archetype?: string;
  race?: string;
  minAtk?: number;
  maxAtk?: number;
  minDef?: number;
  maxDef?: number;
  level?: number;
  banlist?: BanlistStatus;
}): YugiohCard[] {
  return cards.filter(card => {
    if (filters.name && !card.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.type && !card.type.toLowerCase().includes(filters.type.toLowerCase())) return false;
    if (filters.attribute && card.attribute !== filters.attribute) return false;
    if (filters.archetype && (!card.archetype || !card.archetype.toLowerCase().includes(filters.archetype.toLowerCase()))) return false;
    if (filters.race && card.race !== filters.race) return false;
    if (filters.minAtk !== undefined && (card.atk === undefined || card.atk < filters.minAtk)) return false;
    if (filters.maxAtk !== undefined && (card.atk === undefined || card.atk > filters.maxAtk)) return false;
    if (filters.banlist && card.banlist_info?.ban_tcg !== filters.banlist) return false;
    return true;
  });
}
