import {afterEach, expect, it, jest} from '@jest/globals';
import {searchTorrents} from '../src/services/torrentSearch';

const serverUrl = 'https://torrents.example';

function apiResponse(torrents: unknown[], status = 200): Response {
  return {
    ok: status === 200,
    status,
    json: async () => ({torrents}),
  } as Response;
}

afterEach(() => {
  jest.restoreAllMocks();
});

it.each([
  {source: 'MagnetDL' as const, route: 'magnetdl'},
  {source: 'LimeTorrents' as const, route: 'limetorrents'},
])('searches $source through its Torrents API route', async ({source, route}) => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
      apiResponse([
        {
          Name: 'Open media bundle',
          Size: '1.5 GB',
          Seeders: '24',
          Leechers: '7',
          Magnet: 'magnet:?xt=urn:btih:0123456789abcdef',
          Url: 'https://tracker.example/item',
        },
      ]),
    );

    const response = await searchTorrents('open media', source, serverUrl);

    expect(fetchSpy).toHaveBeenCalledWith(
      `${serverUrl}/torrents/api/v1/${route}`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({page: 1, search: 'open media'}),
      }),
    );
    expect(response.results).toHaveLength(1);
    expect(response.results[0]).toMatchObject({
      title: 'Open media bundle',
      size: '1.5 GB',
      sizeBytes: 1.5 * 1024 ** 3,
      seeds: 24,
      peers: 7,
      provider: source,
      magnet: 'magnet:?xt=urn:btih:0123456789abcdef',
    });
});

it('requires a Torrents API host for MagnetDL and LimeTorrents', async () => {
  await expect(searchTorrents('open media', 'MagnetDL')).rejects.toThrow(
    'Set your Torrents API server URL in Settings',
  );
  await expect(searchTorrents('open media', 'LimeTorrents')).rejects.toThrow(
    'Set your Torrents API server URL in Settings',
  );
});

it('includes the configured trackers in all-source searches', async () => {
  const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
    const url = String(input);
    if (url.includes('apibay.org')) {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            id: '1',
            name: 'Public distribution',
            info_hash: '0123456789abcdef',
            leechers: '2',
            seeders: '8',
            size: '1000',
            added: '0',
          },
        ],
      } as Response;
    }
    if (url.includes('yts.mx')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({status: 'ok', data: {movies: []}}),
      } as Response;
    }
    return apiResponse([]);
  });

  await searchTorrents('public distribution', 'All', serverUrl);

  const calledUrls = fetchSpy.mock.calls.map(([url]) => String(url));
  expect(calledUrls).toContain(
    `${serverUrl}/torrents/api/v1/magnetdl`,
  );
  expect(calledUrls).toContain(
    `${serverUrl}/torrents/api/v1/limetorrents`,
  );
});
