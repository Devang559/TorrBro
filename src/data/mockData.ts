export type TorrentResult = {
  id: string;
  title: string;
  size: string;
  sizeBytes: number;
  seeds: number;
  peers: number;
  source: string;
  provider: 'The Pirate Bay' | 'YTS' | 'MagnetDL' | 'LimeTorrents';
  category: string;
  magnet: string;
  age: string;
  year?: number;
  quality?: string;
  rating?: number;
  summary?: string;
};

export type DownloadItem = {
  id: string;
  title: string;
  progress: number;
  status: 'Seeding' | 'Downloading' | 'Paused' | 'Queued';
  speed: string;
  eta: string;
  ratio: string;
  color: string;
};

export type FileNode = {
  id: string;
  name: string;
  size?: string;
  type: 'folder' | 'file';
  children?: FileNode[];
};

export const downloads: DownloadItem[] = [
  {
    id: 'd1',
    title: 'The Silent Horizon 2025',
    progress: 78,
    status: 'Downloading',
    speed: '2.7 MB/s',
    eta: '00:18:21',
    ratio: '1.8',
    color: '#4f7cff',
  },
  {
    id: 'd2',
    title: 'Midnight Circuit S2',
    progress: 44,
    status: 'Seeding',
    speed: '1.1 MB/s',
    eta: '01:12:00',
    ratio: '2.4',
    color: '#22c55e',
  },
  {
    id: 'd3',
    title: 'Quantum Drift',
    progress: 92,
    status: 'Paused',
    speed: '0 MB/s',
    eta: '00:03:45',
    ratio: '1.2',
    color: '#fbbf24',
  },
];

export const fileTree: FileNode[] = [
  {
    id: 'root',
    name: 'The Silent Horizon 2025',
    type: 'folder',
    children: [
      {
        id: 'folder-1',
        name: 'Movie',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'The.Silent.Horizon.2025.1080p.mkv', size: '2.1 GB', type: 'file' },
          { id: 'file-2', name: 'The.Silent.Horizon.2025.English.srt', size: '65 MB', type: 'file' },
        ],
      },
      {
        id: 'folder-2',
        name: 'Bonus',
        type: 'folder',
        children: [
          { id: 'file-3', name: 'Trailer.mp4', size: '94 MB', type: 'file' },
          { id: 'file-4', name: 'Behind.the.scenes.mkv', size: '1.7 GB', type: 'file' },
        ],
      },
    ],
  },
];

export const commonSettings = [
  { label: 'Dark mode', enabled: true },
  { label: 'Auto-start downloads', enabled: true },
  { label: 'Remote streaming', enabled: true },
  { label: 'Keep files on torrent complete', enabled: false },
];
