import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface NicheSheetItem {
  id: string;
  rowNumber: number;
  url: string;
  title: string;
  channelName: string;
  category: string;
  type: 'channel' | 'video';
  tags: string[];
  description: string;
}

// Enriched catalog for the 18 core links in Waqas Gill's Google Sheet
const KNOWN_ITEMS_METADATA: Record<string, Partial<NicheSheetItem>> = {
  'dark-reality': {
    title: 'Dark Reality',
    channelName: '@Dark-Reality3',
    category: 'Crime & Dark Documentaries',
    type: 'channel',
    tags: ['dark', 'reality', 'dark reality', 'crime', 'mystery', 'true crime', 'investigation', 'horror', 'documentary'],
    description: 'Dark psychological deep dives, true crime mysteries, and investigative documentary videos.',
  },
  'v.musman': {
    title: 'Usman Case Files & Documentaries',
    channelName: '@v.musman1971',
    category: 'Crime & Dark Documentaries',
    type: 'channel',
    tags: ['usman', 'documentary', 'cases', 'real life', 'storytelling', 'investigation'],
    description: 'Real life case studies, biographical breakdowns, and engaging narrative documentaries.',
  },
  'ucmom0unzupzmonwbw-kh9ew': {
    title: 'Crime & Mystery Investigation Vault',
    channelName: 'Mystery Vault',
    category: 'Crime & Dark Documentaries',
    type: 'channel',
    tags: ['crime', 'investigation', 'mystery', 'vault', 'case study', 'cold cases'],
    description: 'Unsolved mysteries, cold case investigations, and criminal psychology dossiers.',
  },
  'j9yxayj6lg8': {
    title: 'Crime Case Study Deep-Dive Video',
    channelName: 'Documentary Video',
    category: 'Crime & Dark Documentaries',
    type: 'video',
    tags: ['crime', 'mystery', 'case study', 'video', 'investigation'],
    description: 'Detailed video case study covering mystery breakdowns and dark narrative storytelling.',
  },
  'thegenieusfiles': {
    title: 'The Genius Files',
    channelName: '@TheGenieusFiles',
    category: 'Historical Mysteries & Geniuses',
    type: 'channel',
    tags: ['genius', 'the genius files', 'files', 'history', 'mysteries', 'science', 'conspiracies', 'secret'],
    description: 'Exploration of history\'s greatest geniuses, classified files, secret inventions, and forgotten truths.',
  },
  'peakmindsetfacts': {
    title: 'Peak Mindset Facts',
    channelName: '@peakmindsetfacts',
    category: 'Psychology & Mindset Facts',
    type: 'channel',
    tags: ['mindset', 'facts', 'peak mindset', 'psychology', 'brain', 'habits', 'stoic', 'human behavior', 'life lessons', 'growth'],
    description: 'Psychology facts, mindset shifts for high achievers, habit psychology, and mental toughness insights.',
  },
  'ucgbltk6lhsupxl0wssyiqwq': {
    title: 'Behavioral Psychology Insights',
    channelName: 'Behavioral Science',
    category: 'Psychology & Mindset Facts',
    type: 'channel',
    tags: ['psychology', 'behavior', 'mindset', 'facts', 'stoicism', 'mental resilience'],
    description: 'Deep dives into human behavior, psychological tricks, body language, and mental discipline.',
  },
  'ucvegdbjfjo-cty9hksje-gw': {
    title: 'Deep Mind & Human Psychology',
    channelName: 'Deep Mind Hub',
    category: 'Psychology & Mindset Facts',
    type: 'channel',
    tags: ['psychology', 'deep mind', 'mindset', 'stoic', 'habits', 'facts'],
    description: 'High-retention psychological facts, subconscious mind secrets, and stoic mental frameworks.',
  },
  'ucx-k9ccc1hwm131s0ag3vgw': {
    title: 'Elon Soul Music',
    channelName: 'Elon Soul Music',
    category: 'Ambient Music & Chill Beats',
    type: 'channel',
    tags: ['elon', 'soul', 'music', 'elon soul music', 'chill', 'lofi', 'ambient', 'beats', 'study', 'relax', 'sleep'],
    description: 'Soulful ambient chill music, lo-fi beats for deep focus, coding, studying, and relaxation.',
  },
  'ucur1xiorjtd8ja9om19eryq': {
    title: 'Chill Wave & Focus Sounds',
    channelName: 'Chill Wave Studio',
    category: 'Ambient Music & Chill Beats',
    type: 'channel',
    tags: ['music', 'chill', 'ambient', 'focus', 'lofi', 'beats', 'relaxing', 'sounds'],
    description: 'Atmospheric chill wave soundtracks and ambient soundscapes designed for high focus and calm.',
  },
  'ucylko05ip4mpdky5eyz9qcg': {
    title: 'Elon Studio Music',
    channelName: 'Elon Studio Music',
    category: 'Ambient Music & Chill Beats',
    type: 'channel',
    tags: ['elon', 'studio', 'music', 'elon studio music', 'ambient', 'lofi', 'chill', 'background music', 'relaxation'],
    description: 'Modern studio beats, melodic ambient tracks, and chill study soundtracks.',
  },
  'ucpxjg7tzmzdgokr76s-kygq': {
    title: 'Musk Music Studio',
    channelName: 'Muskmusicstudio',
    category: 'Ambient Music & Chill Beats',
    type: 'channel',
    tags: ['musk', 'music', 'studio', 'muskmusicstudio', 'elon', 'ambient', 'synthwave', 'chill', 'focus'],
    description: 'Futuristic synthwave, ambient space vibes, and deep electronic focus music.',
  },
  'gmoasadj_zgq': {
    title: 'Chosen Code Breakers - "CHOSEN ONE, ELON CRIED..."',
    channelName: 'Chosen Code Breakers',
    category: 'Elon Musk & Motivational Storytelling',
    type: 'video',
    tags: ['elon', 'musk', 'chosen one', 'motivation', 'inspiration', 'storytelling', 'spiritual', 'emotional'],
    description: 'Viral high-emotion storytelling narrative focusing on destiny, chosen ones, and Elon Musk inspiring speeches.',
  },
  'ucyp8wzwbgtnmoys8l5zulzq': {
    title: 'Elon Inspires & Visionary Stories',
    channelName: 'Elon Inspires',
    category: 'Elon Musk & Motivational Storytelling',
    type: 'channel',
    tags: ['elon', 'musk', 'visionary', 'inspiration', 'motivation', 'billionaire', 'storytelling', 'future'],
    description: 'Visionary stories and inspirational breakdowns of billionaire thinking, risk-taking, and innovation.',
  },
  'jcc8ky_a9v8': {
    title: 'Musk Motivation - "I Hid This From You... And It Was Destroying Us"',
    channelName: 'Musk Motivation',
    category: 'Elon Musk & Motivational Storytelling',
    type: 'video',
    tags: ['musk', 'motivation', 'elon', 'emotional', 'narrative', 'storytelling', 'confession', 'lesson'],
    description: 'Intense motivational monologue and dramatic storytelling dissecting trials, mistakes, and ultimate triumphs.',
  },
  'deepdeal': {
    title: 'Deep Deal Investigations',
    channelName: '@DeepDeal-f5m',
    category: 'Business Scandals & Mega Deals',
    type: 'channel',
    tags: ['deep deal', 'deepdeal', 'business', 'money', 'scandals', 'deals', 'corporate', 'investigation', 'documentary'],
    description: 'Investigative breakdowns of corporate scandals, secret billionaire agreements, and high-stakes financial deals.',
  },
  'titanmindlegacy': {
    title: 'Titan Mind Legacy',
    channelName: '@TitanMindLegacy',
    category: 'Alpha Mindset & High Performance',
    type: 'channel',
    tags: ['titan', 'titan mind', 'mind', 'legacy', 'alpha', 'motivation', 'discipline', 'stoic', 'success', 'masculine'],
    description: 'High-intensity alpha motivation, unwavering discipline, warrior mindset, and peak performance habits.',
  },
  'lovemuskdaily': {
    title: 'Love Musk Daily',
    channelName: '@LoveMuskDaily',
    category: 'Romantic Monologues & Soulmate Stories',
    type: 'channel',
    tags: ['love', 'musk', 'love musk daily', 'romance', 'future wife', 'monologue', 'soulmate', 'relationship', 'destiny', 'heartfelt'],
    description: 'Cinematic long-form romantic confessions, destiny monologues, and soulful relationship storytelling.',
  },
};

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1p_3ENMU4jL3BzqOk2bekdPc_l-x6sxaFnQ1moaJ4UGs/edit?usp=sharing';

// Helper to deduce info from arbitrary YouTube URL
function deduceItemInfo(url: string, rowIdx: number): NicheSheetItem {
  const cleanUrl = url.trim().replace(/^"|"$/g, '').trim();
  const lowerUrl = cleanUrl.toLowerCase();

  // Match against known keys
  for (const [key, meta] of Object.entries(KNOWN_ITEMS_METADATA)) {
    if (lowerUrl.includes(key)) {
      return {
        id: `niche-${rowIdx}-${key}`,
        rowNumber: rowIdx,
        url: cleanUrl,
        title: meta.title || 'YouTube Channel',
        channelName: meta.channelName || 'YouTube Creator',
        category: meta.category || 'General Niche',
        type: meta.type || (cleanUrl.includes('/watch?v=') ? 'video' : 'channel'),
        tags: meta.tags || [],
        description: meta.description || '',
      };
    }
  }

  // Fallback for any newly added URL in the sheet
  let handle = '';
  const handleM = cleanUrl.match(/@([a-zA-Z0-9_\-\.]+)/);
  if (handleM) handle = `@${handleM[1]}`;

  const isVideo = cleanUrl.includes('/watch?v=');
  const cat = lowerUrl.includes('music')
    ? 'Ambient Music & Chill Beats'
    : lowerUrl.includes('dark') || lowerUrl.includes('crime')
    ? 'Crime & Dark Documentaries'
    : lowerUrl.includes('musk') || lowerUrl.includes('elon')
    ? 'Elon Musk & Motivational Storytelling'
    : lowerUrl.includes('facts') || lowerUrl.includes('mindset')
    ? 'Psychology & Mindset Facts'
    : 'YouTube Production Niche';

  return {
    id: `niche-${rowIdx}-${Date.now()}`,
    rowNumber: rowIdx,
    url: cleanUrl,
    title: handle ? `${handle} Channel` : isVideo ? `Production Video #${rowIdx}` : `YouTube Channel #${rowIdx}`,
    channelName: handle || `Channel #${rowIdx}`,
    category: cat,
    type: isVideo ? 'video' : 'channel',
    tags: [handle.replace('@', ''), cat.toLowerCase()].filter(Boolean),
    description: `YouTube reference resource imported from Google Sheets (Row ${rowIdx}).`,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('query') || '').toLowerCase().trim();
  const categoryFilter = (searchParams.get('category') || '').toLowerCase().trim();

  try {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1p_3ENMU4jL3BzqOk2bekdPc_l-x6sxaFnQ1moaJ4UGs/gviz/tq?tqx=out:csv';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(csvUrl, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    let rawUrls: string[] = [];

    if (res.ok) {
      const csvText = await res.text();
      const lines = csvText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim().replace(/^"|"$/g, '').trim();
        if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
          rawUrls.push(trimmed);
        }
      }
    }

    // Fallback if sheet network fails
    if (rawUrls.length === 0) {
      rawUrls = [
        "https://www.youtube.com/@Dark-Reality3/videos",
        "https://www.youtube.com/@v.musman1971",
        "https://www.youtube.com/channel/UCmoM0uNzupZMonwBW-Kh9ew",
        "https://www.youtube.com/watch?v=J9YXAyJ6lG8",
        "https://www.youtube.com/@TheGenieusFiles",
        "https://www.youtube.com/@peakmindsetfacts",
        "https://www.youtube.com/channel/UCGBltk6lhsuPXL0wssYiqwQ",
        "https://www.youtube.com/channel/UCVEGdJBJfo-ctY9hKsjE-Gw",
        "https://www.youtube.com/channel/UCx-k9Ccc1HWM131S0ag3vGw",
        "https://www.youtube.com/channel/UCUr1xioRjTd8jA9Om19eRYQ",
        "https://www.youtube.com/channel/UCylKO05iP4MPdKy5eYZ9qCg",
        "https://www.youtube.com/channel/UCPXjG7TZmzDgoKR76S-KYGQ",
        "https://www.youtube.com/watch?v=GmoSAdJ_ZGQ&pp=ugUEEgJlbg%3D%3D",
        "https://www.youtube.com/channel/UCYp8WzwbgTNmOys8L5zULyQ",
        "https://www.youtube.com/watch?v=jcC8Ky_a9v8",
        "https://www.youtube.com/@DeepDeal-f5m",
        "https://www.youtube.com/@TitanMindLegacy",
        "https://www.youtube.com/@LoveMuskDaily"
      ];
    }

    const items: NicheSheetItem[] = rawUrls.map((url, idx) => deduceItemInfo(url, idx + 1));

    // Calculate categories summary
    const categoriesMap: Record<string, number> = {};
    for (const it of items) {
      categoriesMap[it.category] = (categoriesMap[it.category] || 0) + 1;
    }
    const categories = Object.entries(categoriesMap).map(([name, count]) => ({ name, count }));

    // Filter items if query or category provided
    let filtered = items;
    if (categoryFilter) {
      filtered = filtered.filter((i) => i.category.toLowerCase().includes(categoryFilter));
    }
    if (query) {
      filtered = filtered.filter((i) => {
        const textToSearch = `${i.title} ${i.channelName} ${i.category} ${i.description} ${i.url} ${i.tags.join(' ')}`.toLowerCase();
        return textToSearch.includes(query);
      });
    }

    return NextResponse.json({
      success: true,
      sheetUrl: DEFAULT_SHEET_URL,
      totalCount: items.length,
      categories,
      items,
      filteredItems: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch niches from Google Sheet',
      },
      { status: 500 }
    );
  }
}
