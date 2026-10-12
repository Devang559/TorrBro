import type {TorrentResult} from '../data/mockData';

const PIRATE_BAY_API = 'https://apibay.org/q.php';
const YTS_API = 'https://yts.mx/api/v2/list_movies.json';
const NO_RESULTS_SENTINEL = 'No results returned';

type PirateBayRecord = {
  id: string;
  name: string;
  info_hash: string;
  leechers: string;
  seeders: string;
  num_files: string;
  size: string;
  added: string;
};

type TorrentsApiRecord = {
  Name?: string;
  Size?: string;
  Seeders?: number | string;
  Leechers?: number | string;
  Magnet?: string;
  Url?: string;
};

type TorrentsApiResponse = {
  torrents?: TorrentsApiRecord[];
  error?: string;
};

type YtsTorrent = {
  hash: string;
  quality: string;
  type: string;
  seeds: number;
  peers: number;
  size: string;
  date_uploaded_unix: number;
};

type YtsMovie = {
  id: number;
  title: string;
  year: number;
  rating: number;
  summary: string;
  torrents: YtsTorrent[];
};

type YtsResponse = {
  status: string;
  status_message?: string;
  data?: {
    movies?: YtsMovie[];
  };
};

export type TorrentSource =
  | 'All'
  | 'The Pirate Bay'
  | 'YTS'
  | 'MagnetDL'
  | 'LimeTorrents';

export type TorrentSearchResponse = {
  results: TorrentResult[];
  warning?: string;
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return 'Unknown size';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex >= 3 ? 1 : 0)} ${units[unitIndex]}`;
}

function toMagnet(hash: string): string {
  return `magnet:?xt=urn:btih:${hash}`;
}

function parseSize(size: string): number {
  const match = size.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) {
    return 0;
  }
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };
  return Number(match[1]) * units[match[2].toUpperCase()];
}

function toPirateBayResult(record: PirateBayRecord): TorrentResult | null {
  const sizeBytes = Number(record.size);
  if (!record.name || !record.info_hash || !Number.isFinite(sizeBytes)) {
    return null;
  }
  return {
    id: `tpb-${record.id}`,
    title: record.name,
    size: formatBytes(sizeBytes),
    sizeBytes,
    seeds: Number(record.seeders) || 0,
    peers: Number(record.leechers) || 0,
    source: 'The Pirate Bay',
    provider: 'The Pirate Bay',
    category: 'Torrent',
    magnet: toMagnet(record.info_hash),
    age: record.added ? new Date(Number(record.added) * 1000).toLocaleDateString() : '—',
  };
}

function toYtsResult(movie: YtsMovie, torrent: YtsTorrent): TorrentResult {
  const sizeBytes = parseSize(torrent.size);
  return {
    id: `yts-${movie.id}-${torrent.quality}-${torrent.type}`,
    title: `${movie.title} (${movie.year})`,
    size: torrent.size,
    sizeBytes,
    seeds: torrent.seeds,
    peers: torrent.peers,
    source: `YTS · ${torrent.quality}`,
    provider: 'YTS',
    category: 'Movies',
    magnet: toMagnet(torrent.hash),
    age: torrent.date_uploaded_unix
      ? new Date(torrent.date_uploaded_unix * 1000).toLocaleDateString()
      : '—',
    year: movie.year,
    quality: torrent.quality,
    rating: movie.rating,
    summary: movie.summary,
  };
}

async function searchPirateBay(query: string): Promise<TorrentResult[]> {
  const response = await fetch(
    `${PIRATE_BAY_API}?q=${encodeURIComponent(query)}&cat=0`,
  );
  if (!response.ok) {
    throw new Error(`The Pirate Bay request failed (${response.status}).`);
  }
  const data: PirateBayRecord[] = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('The Pirate Bay returned an unexpected response.');
  }
  return data
    .filter(
      record =>
        record.id !== '0' && record.name !== NO_RESULTS_SENTINEL,
    )
    .map(toPirateBayResult)
    .filter((result): result is TorrentResult => result !== null);
}

async function searchYts(query: string): Promise<TorrentResult[]> {
  const response = await fetch(
    `${YTS_API}?query_term=${encodeURIComponent(query)}&limit=20&sort_by=seeds&order_by=desc`,
  );
  if (!response.ok) {
    throw new Error(`YTS request failed (${response.status}).`);
  }
  const payload: YtsResponse = await response.json();
  if (payload.status !== 'ok') {
    throw new Error(payload.status_message ?? 'YTS returned an unexpected response.');
  }
  return (payload.data?.movies ?? []).flatMap(movie =>
    (movie.torrents ?? []).map(torrent => toYtsResult(movie, torrent)),
  );
}

function toTorrentsApiResult(
  record: TorrentsApiRecord,
  provider: 'MagnetDL' | 'LimeTorrents',
  index: number,
): TorrentResult | null {
  const title = record.Name?.trim();
  const magnet = record.Magnet?.trim();
  if (!title || !magnet?.startsWith('magnet:?')) {
    return null;
  }
  const size = record.Size?.trim() || 'Unknown size';
  const hash = magnet.match(/btih:([^&]+)/i)?.[1] ?? `${provider}-${index}`;
  return {
    id: `${provider.toLowerCase()}-${hash}`,
    title,
    size,
    sizeBytes: parseSize(size),
    seeds: Number(record.Seeders) || 0,
    peers: Number(record.Leechers) || 0,
    source: provider,
    provider,
    category: 'Torrent',
    magnet,
    age: '—',
  };
}

async function searchTorrentsApi(
  query: string,
  provider: 'MagnetDL' | 'LimeTorrents',
  baseUrl: string,
): Promise<TorrentResult[]> {
  const normalizedBase = baseUrl.trim().replace(/\/+$/, '');
  if (!normalizedBase) {
    throw new Error(
      'Set your Torrents API server URL in Settings to search MagnetDL and LimeTorrents.',
    );
  }
  if (!/^https?:\/\/[^/\s]+(?:\/.*)?$/i.test(normalizedBase)) {
    throw new Error(
      'Enter a valid Torrents API server URL starting with http:// or https://.',
    );
  }

  const route = provider === 'MagnetDL' ? 'magnetdl' : 'limetorrents';
  const response = await fetch(
    `${normalizedBase}/torrents/api/v1/${route}`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({page: 1, search: query}),
    },
  );
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new Error(`${provider} request failed (${response.status}).`);
  }
  const payload: TorrentsApiResponse = await response.json();
  if (!Array.isArray(payload.torrents)) {
    throw new Error(
      payload.error || `${provider} returned an unexpected response.`,
    );
  }
  return payload.torrents
    .map((record, index) => toTorrentsApiResult(record, provider, index))
    .filter((result): result is TorrentResult => result !== null);
}

export async function searchTorrents(
  query: string,
  source: TorrentSource,
  torrentsApiBaseUrl = '',
): Promise<TorrentSearchResponse> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return {results: []};
  }

  if (source === 'The Pirate Bay') {
    return {results: await searchPirateBay(trimmedQuery)};
  }
  if (source === 'YTS') {
    return {results: await searchYts(trimmedQuery)};
  }
  if (source === 'MagnetDL' || source === 'LimeTorrents') {
    return {
      results: await searchTorrentsApi(
        trimmedQuery,
        source,
        torrentsApiBaseUrl,
      ),
    };
  }

  const requests = [
    searchPirateBay(trimmedQuery),
    searchYts(trimmedQuery),
    ...(torrentsApiBaseUrl.trim()
      ? [
          searchTorrentsApi(trimmedQuery, 'MagnetDL', torrentsApiBaseUrl),
          searchTorrentsApi(trimmedQuery, 'LimeTorrents', torrentsApiBaseUrl),
        ]
      : []),
  ];
  const sourceResults = await Promise.allSettled(requests);
  const results = [
    ...sourceResults.flatMap(result =>
      result.status === 'fulfilled' ? result.value : [],
    ),
  ];
  const hasUnavailableSource = sourceResults.some(
    result => result.status === 'rejected',
  );
  if (results.length > 0) {
    return {
      results: results.sort((first, second) => second.seeds - first.seeds),
      warning: !torrentsApiBaseUrl.trim()
        ? 'MagnetDL and LimeTorrents are available after you configure your Torrents API server in Settings.'
        : hasUnavailableSource
          ? 'One or more search sources are unavailable; showing results from the sources that responded.'
          : undefined,
    };
  }
  if (hasUnavailableSource) {
    throw new Error('Torrent search sources are unavailable right now.');
  }
  return {
    results,
  };
}
