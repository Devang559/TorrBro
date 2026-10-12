import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

export type TorrentDownload = {
  id: string;
  title: string;
  progress: number;
  status: 'Downloading' | 'Paused' | 'Seeding';
  speedBytesPerSecond: number;
  downloadedBytes: number;
  totalBytes: number;
  peers: number;
  seeds: number;
  savePath: string;
};

type NativeTorrentDownloadManager = {
  addTorrent: (title: string, magnet: string) => Promise<string>;
  getDownloads: () => Promise<TorrentDownload[]>;
  pauseTorrent: (id: string) => Promise<void>;
  resumeTorrent: (id: string) => Promise<void>;
  removeTorrent: (id: string) => Promise<void>;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
};

const nativeManager = NativeModules.TorrentDownloadManager as
  | NativeTorrentDownloadManager
  | undefined;
const emitter =
  Platform.OS === 'android' && nativeManager
    ? new NativeEventEmitter(nativeManager as never)
    : undefined;

export const isTorrentDownloadsSupported =
  Platform.OS === 'android' && nativeManager !== undefined;

function requireManager(): NativeTorrentDownloadManager {
  if (!isTorrentDownloadsSupported || !nativeManager) {
    throw new Error('Torrent downloads are currently supported on Android only.');
  }
  return nativeManager;
}

export const torrentDownloadService = {
  add: (title: string, magnet: string) =>
    requireManager().addTorrent(title, magnet),
  getAll: () => requireManager().getDownloads(),
  pause: (id: string) => requireManager().pauseTorrent(id),
  resume: (id: string) => requireManager().resumeTorrent(id),
  remove: (id: string) => requireManager().removeTorrent(id),
  subscribe: (listener: (downloads: TorrentDownload[]) => void) => {
    if (!emitter) {
      return () => undefined;
    }
    const subscription = emitter.addListener('torrentDownloadsUpdated', listener);
    return () => subscription.remove();
  },
};

export function formatTransferRate(bytesPerSecond: number): string {
  if (bytesPerSecond >= 1024 ** 2) {
    return `${(bytesPerSecond / 1024 ** 2).toFixed(1)} MB/s`;
  }
  if (bytesPerSecond >= 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  }
  return `${Math.round(bytesPerSecond)} B/s`;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) {
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  }
  if (bytes >= 1024 ** 2) {
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}
