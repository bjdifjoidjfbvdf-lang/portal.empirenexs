import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NicheSheetItem {
  id: string;
  rowNumber: number;
  url: string;
  title: string;
  channelName: string;
  category: string;
  tabName: string;
  tabGid: string;
  type: 'channel' | 'video';
  tags: string[];
  description: string;
  directTabUrl: string;
}

interface SheetTabMeta {
  name: string;
  gid: string;
  slug: string;
  count: number;
}

const SHEET_TABS_CONFIG: { name: string; gid: string; slug: string }[] = [
  { name: 'Elon Musk', gid: '0', slug: 'elon-musk' },
  { name: 'Carl Jung', gid: '331544996', slug: 'carl-jung' },
  { name: 'Urdu Stories', gid: '1817895956', slug: 'urdu-stories' },
  { name: 'Russian Stories', gid: '1282848236', slug: 'russian-stories' },
  { name: 'Joker', gid: '96686562', slug: 'joker' },
  { name: 'Space', gid: '1403038898', slug: 'space' },
  { name: 'motivational', gid: '1214444991', slug: 'motivational' },
  { name: 'Face Cloning', gid: '1487514818', slug: 'face-cloning' },
  { name: 'Prayers', gid: '2027798229', slug: 'prayers' },
  { name: 'youngi cho', gid: '1218222988', slug: 'youngi-cho' },
  { name: 'Story', gid: '268093005', slug: 'story' },
  { name: 'Trump', gid: '428722131', slug: 'trump' },
  { name: 'food', gid: '271645373', slug: 'food' },
  { name: 'judge', gid: '2043461382', slug: 'judge' },
  { name: 'news', gid: '2103532665', slug: 'news' },
  { name: 'Others', gid: '2053988009', slug: 'others' },
  { name: 'princes', gid: '1670299079', slug: 'princes' },
  { name: 'History', gid: '1026726497', slug: 'history' },
];

const DEFAULT_SHEET_BASE = 'https://docs.google.com/spreadsheets/d/1p_3ENMU4jL3BzqOk2bekdPc_l-x6sxaFnQ1moaJ4UGs';

// Full pre-indexed catalog from all tabs
const PRE_INDEXED_TAB_ITEMS: { tabName: string; gid: string; links: string[] }[] = [
  {
    tabName: 'Elon Musk',
    gid: '0',
    links: [
      'https://www.youtube.com/@Dark-Reality3/videos',
      'https://www.youtube.com/@v.musman1971',
      'https://www.youtube.com/channel/UCmoM0uNzupZMonwBW-Kh9ew',
      'https://www.youtube.com/watch?v=J9YXAyJ6lG8',
      'https://www.youtube.com/@TheGenieusFiles',
      'https://www.youtube.com/@peakmindsetfacts',
      'https://www.youtube.com/channel/UCGBltk6lhsuPXL0wssYiqwQ',
      'https://www.youtube.com/channel/UCVEGdJBJfo-ctY9hKsjE-Gw',
      'https://www.youtube.com/channel/UCx-k9Ccc1HWM131S0ag3vGw',
      'https://www.youtube.com/channel/UCUr1xioRjTd8jA9Om19eRYQ',
      'https://www.youtube.com/channel/UCylKO05iP4MPdKy5eYZ9qCg',
      'https://www.youtube.com/channel/UCPXjG7TZmzDgoKR76S-KYGQ',
      'https://www.youtube.com/watch?v=GmoSAdJ_ZGQ&pp=ugUEEgJlbg%3D%3D',
      'https://www.youtube.com/channel/UCYp8WzwbgTNmOys8L5zULyQ',
      'https://www.youtube.com/watch?v=jcC8Ky_a9v8',
      'https://www.youtube.com/@DeepDeal-f5m',
      'https://www.youtube.com/@TitanMindLegacy',
      'https://www.youtube.com/@LoveMuskDaily',
    ],
  },
  {
    tabName: 'Carl Jung',
    gid: '331544996',
    links: ['https://www.youtube.com/@CarlJungExplained-b9o'],
  },
  {
    tabName: 'Urdu Stories',
    gid: '1817895956',
    links: [],
  },
  {
    tabName: 'Russian Stories',
    gid: '1282848236',
    links: ['https://www.youtube.com/@Mindset2025-z4k'],
  },
  {
    tabName: 'Joker',
    gid: '96686562',
    links: [
      'https://www.youtube.com/@HiddenDominion-l6w',
      'https://www.youtube.com/@JokerSpeaks-p9k',
      'https://www.youtube.com/@SaneMadness-s2k',
      'https://www.youtube.com/@VeiledMind-q7z',
      'https://www.youtube.com/@PurePoison12k',
    ],
  },
  {
    tabName: 'Space',
    gid: '1403038898',
    links: [
      'https://www.youtube.com/channel/UCnJULEGLWAddf-BjrY2aYjQ',
      'https://www.youtube.com/channel/UCANhj_HEb31MUufwmV6CLPw',
      'https://www.youtube.com/watch?v=dUBhV5oZ8Ig',
      'https://www.youtube.com/@Awesome-SpaceX',
      'https://www.youtube.com/@quantumnexus_yt',
      'https://www.youtube.com/@QuantumAwakening-1',
      'https://www.youtube.com/watch?v=pmgIWlFm_AM',
    ],
  },
  {
    tabName: 'motivational',
    gid: '1214444991',
    links: ['https://www.youtube.com/channel/UCXsIQW-yw6tmRIzma2fSxMA'],
  },
  {
    tabName: 'Face Cloning',
    gid: '1487514818',
    links: ['https://www.youtube.com/@theGentlePathForward/videos'],
  },
  {
    tabName: 'Prayers',
    gid: '2027798229',
    links: [
      'https://www.youtube.com/watch?v=2leETWvw5_w',
      'https://www.youtube.com/@Sacred-Light-Within',
      'https://www.youtube.com/@JapGod-q1c',
      'https://www.youtube.com/@MichaelPropheticWord',
      'https://www.youtube.com/@MadnessWithin-r3z',
      'https://www.youtube.com/channel/UCmZ8tW0ZBJhO0sHAOu965bg',
      'https://www.youtube.com/channel/UCDOLPA2JisOAUpnANV-Ipkw',
      'https://www.youtube.com/channel/UCxDNPHzuiI3igLkawuhn5wA',
      'https://www.youtube.com/@DivineSacredVoice',
      'https://www.youtube.com/@ArchangelMichaelSays333',
      'https://www.youtube.com/@Devine_Touch',
      'https://www.youtube.com/@ChosenMindset-q9o',
      'https://www.youtube.com/@WORDOFGRACE3.1M',
      'https://www.youtube.com/@ChosenMiracles365',
      'https://www.youtube.com/@Whispers-from-the-Pleiades',
      'https://www.youtube.com/@CosmicTransmission1',
      'https://www.youtube.com/@AngelSays1111',
      'https://www.youtube.com/@ThedivinePathj',
      'https://www.youtube.com/@RadiantFaith-d7i',
      'https://www.youtube.com/@GodsLightGuide',
      'https://www.youtube.com/@HeavenHoldsHope',
      'https://www.youtube.com/@ChosenSigns-999',
      'https://www.youtube.com/@HeavenlyGlory9999',
      'https://www.youtube.com/@The-Quantum-Grimoire',
      'https://www.youtube.com/@messagefromtheangels',
    ],
  },
  {
    tabName: 'youngi cho',
    gid: '1218222988',
    links: ['https://www.youtube.com/@YonngiChoTeachings-j2c'],
  },
  {
    tabName: 'Story',
    gid: '268093005',
    links: ['https://youtube.com/@clarknationhoops-n3z?si=eA51jDVGoPvmc94v'],
  },
  {
    tabName: 'Trump',
    gid: '428722131',
    links: [
      'https://www.youtube.com/@AHMindForge',
      'https://www.youtube.com/@MindDecoded-u8n',
      'https://www.youtube.com/channel/UCGmBUdt6IDaOsHG1mWxnkwA',
      'https://www.youtube.com/@TheInfluenceCode-z3c/videos',
    ],
  },
  {
    tabName: 'food',
    gid: '271645373',
    links: ['https://www.youtube.com/@foodshockofficial'],
  },
  {
    tabName: 'judge',
    gid: '2043461382',
    links: [],
  },
  {
    tabName: 'news',
    gid: '2103532665',
    links: ['https://www.youtube.com/@DiscoverywithGideon'],
  },
  {
    tabName: 'Others',
    gid: '2053988009',
    links: [
      'https://www.youtube.com/@Theeternaltruths-j8d',
      'https://www.youtube.com/@Fr.BenedictSpiritualPath',
      'https://www.youtube.com/watch?v=Uqh_pJDA7Xg',
      'https://www.youtube.com/@InnerThrone-t1g/videos',
      'https://www.youtube.com/@JokerSpeaks-p9k',
      'https://www.youtube.com/@PadrePioWisdom-6868/videos',
      'https://www.youtube.com/@TuckerWes',
    ],
  },
  {
    tabName: 'princes',
    gid: '1670299079',
    links: ['https://www.youtube.com/@Mindset2025-z4k'],
  },
  {
    tabName: 'History',
    gid: '1026726497',
    links: ['https://www.youtube.com/@JamesHurt-g2u'],
  },
];

// Helper to deduce clean title and details for any link
function buildItem(rawUrl: string, tabName: string, tabGid: string, idx: number): NicheSheetItem {
  const url = rawUrl.trim().replace(/^"|"$/g, '').trim();
  const lowerUrl = url.toLowerCase();
  const isVideo = lowerUrl.includes('/watch?v=');

  // Channel handle match
  let handle = '';
  const handleMatch = url.match(/@([a-zA-Z0-9_\-\.]+)/);
  if (handleMatch) {
    handle = `@${handleMatch[1].replace(/\/videos$/, '')}`;
  }

  // Create friendly readable title
  let title = handle ? handle.replace('@', '').replace(/[-_]/g, ' ') : isVideo ? `Video #${idx}` : `Channel #${idx}`;

  // Custom known clean titles
  if (handle.includes('CarlJungExplained')) title = 'Carl Jung Explained';
  else if (handle.includes('AHMindForge')) title = 'AH Mind Forge (Trump Mindset)';
  else if (handle.includes('MindDecoded')) title = 'Mind Decoded (Trump Analysis)';
  else if (handle.includes('TheInfluenceCode')) title = 'The Influence Code';
  else if (handle.includes('HiddenDominion')) title = 'Hidden Dominion (Joker Dark Mind)';
  else if (handle.includes('JokerSpeaks')) title = 'Joker Speaks (Dark Psychology)';
  else if (handle.includes('SaneMadness')) title = 'Sane Madness (Joker Mindset)';
  else if (handle.includes('VeiledMind')) title = 'Veiled Mind';
  else if (handle.includes('PurePoison')) title = 'Pure Poison (Villain Motivation)';
  else if (handle.includes('LoveMuskDaily')) title = 'Love Musk Daily';
  else if (handle.includes('Dark-Reality3')) title = 'Dark Reality';
  else if (handle.includes('TheGenieusFiles')) title = 'The Genius Files';
  else if (handle.includes('peakmindsetfacts')) title = 'Peak Mindset Facts';
  else if (handle.includes('foodshockofficial')) title = 'Food Shock Official';
  else if (handle.includes('DiscoverywithGideon')) title = 'Discovery with Gideon';
  else if (handle.includes('Sacred-Light-Within')) title = 'Sacred Light Within';
  else if (handle.includes('YonngiChoTeachings')) title = 'David Yonggi Cho Teachings';
  else if (handle.includes('Awesome-SpaceX')) title = 'Awesome SpaceX';
  else if (handle.includes('quantumnexus')) title = 'Quantum Nexus Space';
  else if (handle.includes('QuantumAwakening')) title = 'Quantum Awakening';
  else if (handle.includes('JamesHurt')) title = 'James Hurt History';
  else if (handle.includes('theGentlePathForward')) title = 'The Gentle Path Forward (Face Cloning)';
  else if (handle.includes('clarknationhoops')) title = 'Clark Nation Hoops (Storytelling)';

  const directTabUrl = `${DEFAULT_SHEET_BASE}/edit#gid=${tabGid}`;

  const tags = [
    tabName.toLowerCase(),
    title.toLowerCase(),
    handle.toLowerCase(),
    isVideo ? 'video' : 'channel',
    'competitor',
  ].filter(Boolean);

  let description = `Competitor resource in "${tabName}" niche from Google Sheets tab #${tabGid}.`;
  if (tabName.toLowerCase().includes('carl jung')) {
    description = 'Carl Jung psychology, shadow self, archetypes, and subconscious mind competitor channel.';
  } else if (tabName.toLowerCase().includes('trump')) {
    description = 'Donald Trump mindset, speeches, persuasion psychology, and influence breakdowns.';
  } else if (tabName.toLowerCase().includes('joker')) {
    description = 'Joker philosophy, anti-hero dark psychology, societal critique, and viral reels.';
  } else if (tabName.toLowerCase().includes('prayers')) {
    description = 'Spiritual prayers, blessings, angelic messages, and biblical/faith monologues.';
  } else if (tabName.toLowerCase().includes('space')) {
    description = 'Space exploration, astrophysics, SpaceX, cosmos mysteries, and quantum science.';
  } else if (tabName.toLowerCase().includes('elon')) {
    description = 'Elon Musk visionary stories, romantic monologues, ambient lo-fi music, and tech.';
  } else if (tabName.toLowerCase().includes('food')) {
    description = 'Shocking food facts, industry secrets, and culinary documentary storytelling.';
  } else if (tabName.toLowerCase().includes('news')) {
    description = 'World events investigations, geopolitics, and informative news documentaries.';
  }

  return {
    id: `item-${tabGid}-${idx}`,
    rowNumber: idx,
    url,
    title,
    channelName: handle || title,
    category: tabName,
    tabName,
    tabGid,
    type: isVideo ? 'video' : 'channel',
    tags,
    description,
    directTabUrl,
  };
}

// In-memory cache for live Google Sheet items
let cachedLiveItems: NicheSheetItem[] | null = null;
let lastCacheFetchTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds fresh cache

async function fetchLiveTabLinks(gid: string): Promise<string[]> {
  try {
    const liveCsvUrl = `https://docs.google.com/spreadsheets/d/1p_3ENMU4jL3BzqOk2bekdPc_l-x6sxaFnQ1moaJ4UGs/gviz/tq?tqx=out:csv&gid=${gid}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(liveCsvUrl, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);
    if (res.ok) {
      const csv = await res.text();
      const urls: string[] = [];
      const lines = csv.split('\n');
      for (const line of lines) {
        const matches = line.match(/(https?:\/\/[^\s",]+)/gi);
        if (matches) {
          for (const m of matches) {
            const clean = m.replace(/^"|"$/g, '').trim();
            if (clean && !urls.includes(clean)) {
              urls.push(clean);
            }
          }
        }
      }
      return urls;
    }
  } catch (e) {
    // Silently fall back to cached/pre-indexed
  }
  return [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('query') || '').toLowerCase().trim();
  const categoryFilter = (searchParams.get('category') || '').toLowerCase().trim();
  const tabFilter = (searchParams.get('tab') || '').toLowerCase().trim();
  const forceRefresh = searchParams.get('refresh') === 'true';

  const now = Date.now();
  let allItems: NicheSheetItem[] = [];

  // Use fast 30s cache unless expired or refresh requested
  if (!forceRefresh && cachedLiveItems && (now - lastCacheFetchTime < CACHE_TTL_MS)) {
    allItems = cachedLiveItems;
  } else {
    // Concurrently fetch live data from all configured Google Sheet tabs
    const tabPromises = SHEET_TABS_CONFIG.map(async (tab) => {
      const liveLinks = await fetchLiveTabLinks(tab.gid);
      const preIndexed = PRE_INDEXED_TAB_ITEMS.find((p) => p.gid === tab.gid);
      const fallbackLinks = preIndexed ? preIndexed.links : [];

      // Combine links, ensuring new sheet rows are included alongside existing catalog
      const combined = Array.from(new Set([...liveLinks, ...fallbackLinks]));
      return combined.map((l, idx) => buildItem(l, tab.name, tab.gid, idx + 1));
    });

    const results = await Promise.allSettled(tabPromises);
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === 'fulfilled') {
        allItems.push(...r.value);
      } else {
        const tab = SHEET_TABS_CONFIG[i];
        const preIndexed = PRE_INDEXED_TAB_ITEMS.find((p) => p.gid === tab.gid);
        if (preIndexed) {
          preIndexed.links.forEach((l, idx) => {
            allItems.push(buildItem(l, tab.name, tab.gid, idx + 1));
          });
        }
      }
    }

    if (allItems.length > 0) {
      cachedLiveItems = allItems;
      lastCacheFetchTime = now;
    } else if (cachedLiveItems) {
      allItems = cachedLiveItems;
    }
  }

  // Build tabs metadata with counts
  const tabsMeta: SheetTabMeta[] = SHEET_TABS_CONFIG.map((cfg) => {
    const count = allItems.filter((i) => i.tabGid === cfg.gid).length;
    return {
      name: cfg.name,
      gid: cfg.gid,
      slug: cfg.slug,
      count,
    };
  });

  // Filter items
  let filtered = allItems;

  if (tabFilter) {
    filtered = filtered.filter(
      (i) => i.tabName.toLowerCase().includes(tabFilter) || i.tabGid === tabFilter
    );
  }

  if (categoryFilter && categoryFilter !== 'all') {
    filtered = filtered.filter(
      (i) =>
        i.category.toLowerCase().includes(categoryFilter) ||
        i.tabName.toLowerCase().includes(categoryFilter)
    );
  }

  if (query) {
    filtered = filtered.filter((i) => {
      const searchTarget = `${i.title} ${i.channelName} ${i.category} ${i.tabName} ${i.description} ${i.url} ${i.tags.join(' ')}`.toLowerCase();
      return searchTarget.includes(query);
    });
  }

  return NextResponse.json({
    success: true,
    sheetUrl: DEFAULT_SHEET_BASE + '/edit?usp=sharing',
    totalLinks: allItems.length,
    totalTabs: tabsMeta.length,
    tabs: tabsMeta,
    categories: tabsMeta.map((t) => ({ name: t.name, count: t.count })),
    items: allItems,
    filteredItems: filtered,
  });
}
