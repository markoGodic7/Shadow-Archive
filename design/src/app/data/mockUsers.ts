export type UserRole = "admin" | "user";
export type UserStatus = "active" | "suspended" | "pending";

export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastSeen: string;
  wishlistCount: number;
  avatar?: string;
  country: string;
  favoriteArchetype: string;
}

export const MOCK_USERS: AppUser[] = [
  {
    id: "u1",
    username: "YamiYugi",
    email: "yami@yugioh.com",
    role: "admin",
    status: "active",
    joinedAt: "2023-01-15",
    lastSeen: "2026-06-16",
    wishlistCount: 48,
    country: "Egypt",
    favoriteArchetype: "Dark Magician",
  },
  {
    id: "u2",
    username: "SetoKaiba",
    email: "kaiba@kaibacorp.com",
    role: "user",
    status: "active",
    joinedAt: "2023-02-20",
    lastSeen: "2026-06-15",
    wishlistCount: 12,
    country: "Japan",
    favoriteArchetype: "Blue-Eyes",
  },
  {
    id: "u3",
    username: "JoeyWheeler",
    email: "joey@duelmonsters.com",
    role: "user",
    status: "active",
    joinedAt: "2023-03-05",
    lastSeen: "2026-06-14",
    wishlistCount: 31,
    country: "USA",
    favoriteArchetype: "Red-Eyes",
  },
  {
    id: "u4",
    username: "TeaGardner",
    email: "tea@duelist.net",
    role: "user",
    status: "active",
    joinedAt: "2023-04-11",
    lastSeen: "2026-06-10",
    wishlistCount: 7,
    country: "USA",
    favoriteArchetype: "HERO",
  },
  {
    id: "u5",
    username: "MalikIshtar",
    email: "malik@tombkeeper.org",
    role: "user",
    status: "suspended",
    joinedAt: "2023-05-22",
    lastSeen: "2026-05-30",
    wishlistCount: 0,
    country: "Egypt",
    favoriteArchetype: "Gimmick Puppet",
  },
  {
    id: "u6",
    username: "RyouBakura",
    email: "bakura@millenium.com",
    role: "user",
    status: "active",
    joinedAt: "2023-06-01",
    lastSeen: "2026-06-12",
    wishlistCount: 22,
    country: "UK",
    favoriteArchetype: "Fiend",
  },
  {
    id: "u7",
    username: "IshizuIshtar",
    email: "ishizu@tombkeeper.org",
    role: "user",
    status: "pending",
    joinedAt: "2026-06-14",
    lastSeen: "2026-06-14",
    wishlistCount: 3,
    country: "Egypt",
    favoriteArchetype: "Fairy",
  },
  {
    id: "u8",
    username: "MaximilionPegasus",
    email: "pegasus@industrialillusions.com",
    role: "user",
    status: "active",
    joinedAt: "2023-07-18",
    lastSeen: "2026-06-09",
    wishlistCount: 56,
    country: "USA",
    favoriteArchetype: "Toon",
  },
];

export const ANALYTICS = {
  totalUsers: 4821,
  activeToday: 312,
  newThisWeek: 94,
  totalSearches: 182450,
  wishlistEntries: 28734,
  mostSearched: [
    { name: "Blue-Eyes White Dragon", count: 8410 },
    { name: "Dark Magician", count: 7203 },
    { name: "Exodia the Forbidden One", count: 5980 },
    { name: "Stardust Dragon", count: 4672 },
    { name: "Number 39: Utopia", count: 3891 },
    { name: "Mirror Force", count: 3210 },
  ],
  dailySignups: [
    { day: "Mon", count: 12 },
    { day: "Tue", count: 19 },
    { day: "Wed", count: 8 },
    { day: "Thu", count: 24 },
    { day: "Fri", count: 31 },
    { day: "Sat", count: 42 },
    { day: "Sun", count: 28 },
  ],
  cardTypeDistribution: [
    { type: "Monster", count: 7842, pct: 65 },
    { type: "Spell", count: 2418, pct: 20 },
    { type: "Trap", count: 1806, pct: 15 },
  ],
  wishlistByArchetype: [
    { name: "Blue-Eyes", count: 3210 },
    { name: "Dark Magician", count: 2940 },
    { name: "HERO", count: 2580 },
    { name: "Stardust", count: 1870 },
    { name: "Utopia", count: 1640 },
    { name: "Red-Eyes", count: 1420 },
  ],
};
