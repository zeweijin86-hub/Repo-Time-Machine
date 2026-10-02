import type { RepoReport } from '../types'

const commit = (
  sha: string,
  date: string,
  author: string,
  message: string,
  additions: number,
  deletions: number,
  files: RepoReport['commits'][number]['files'],
  diff?: string,
  tags?: string[],
) => ({ sha, shortSha: sha.slice(0, 7), date, author: { name: author }, message, additions, deletions, files, diff, tags })

export const demoReport: RepoReport = {
  schemaVersion: '1.0',
  generatedAt: '2026-10-02T08:00:00.000Z',
  source: 'demo',
  repository: {
    name: 'Cobalt',
    fullName: 'cobalt-labs/cobalt',
    description: 'A small, evolving workspace for distributed field notes.',
    url: 'https://github.com/cobalt-labs/cobalt',
    defaultBranch: 'main',
    createdAt: '2021-02-14T10:00:00.000Z',
    updatedAt: '2025-05-24T17:30:00.000Z',
    baselineLines: 0,
  },
  commits: [
    commit('1f4aa76918e440b17f87d995199193bd37a2ea13', '2021-02-14T10:00:00.000Z', 'Lin Zhang', 'chore: initialize the field notebook', 248, 0, [
      { path: 'src/index.ts', status: 'added', additions: 78, deletions: 0 },
      { path: 'src/store/notes.ts', status: 'added', additions: 119, deletions: 0 },
      { path: 'README.md', status: 'added', additions: 51, deletions: 0 },
    ], '+ export const createNotebook = () => ({\n+   entries: [],\n+   version: 1,\n+ })\n', ['v0.1.0']),
    commit('5b6874cb3e9fc2a44fcc9d37fd5372a90eaa2e5f', '2021-05-18T11:42:00.000Z', 'Maya Patel', 'feat: add location-aware entries', 326, 18, [
      { path: 'src/location/geocode.ts', status: 'added', additions: 172, deletions: 0 },
      { path: 'src/store/notes.ts', status: 'modified', additions: 88, deletions: 18 },
      { path: 'src/ui/EntryForm.tsx', status: 'added', additions: 66, deletions: 0 },
    ], '+ export type Coordinates = { lat: number; lng: number }\n+ export async function locate(place: string) {\n+   return geocoder.search(place)\n+ }\n'),
    commit('8c31aa75def733d792cef255157b15e44c4bc543', '2021-10-02T08:15:00.000Z', 'Lin Zhang', 'feat: introduce the activity stream', 418, 34, [
      { path: 'src/activity/timeline.ts', status: 'added', additions: 284, deletions: 0 },
      { path: 'src/ui/ActivityPanel.tsx', status: 'added', additions: 101, deletions: 0 },
      { path: 'src/store/notes.ts', status: 'modified', additions: 33, deletions: 34 },
    ], '+ export const groupByDay = (events: Event[]) =>\n+   Object.groupBy(events, event => event.date.slice(0, 10))\n'),
    commit('a1e4882b2dcb8d5a7bd4acb93dba2fc40595f6ef', '2022-04-21T15:50:00.000Z', 'Noah Kim', 'refactor: isolate sync protocol', 610, 279, [
      { path: 'src/sync/protocol.ts', status: 'added', additions: 351, deletions: 0 },
      { path: 'src/store/notes.ts', status: 'modified', additions: 147, deletions: 233 },
      { path: 'src/index.ts', status: 'modified', additions: 112, deletions: 46 },
    ], '- export async function saveNote(note) {\n-   return storage.put(note)\n- }\n+ export async function applyRemoteChange(change: Change) {\n+   return protocol.merge(change)\n+ }\n'),
    commit('c6d0c40b483a2f5e034f113bc53f78d26cded659', '2022-09-09T09:30:00.000Z', 'Maya Patel', 'feat: ship offline workspace', 822, 126, [
      { path: 'src/offline/cache.ts', status: 'added', additions: 472, deletions: 0 },
      { path: 'src/offline/queue.ts', status: 'added', additions: 216, deletions: 0 },
      { path: 'src/sync/protocol.ts', status: 'modified', additions: 134, deletions: 126 },
    ], '+ export class OfflineQueue {\n+   enqueue(change: Change) {\n+     this.pending.push(change)\n+   }\n+ }\n', ['v1.0.0']),
    commit('d7ff6c0958d7d5f0b9a09ef66f6c72a5cd81eef7', '2023-03-14T14:10:00.000Z', 'Jae Lee', 'build: move the client to TypeScript', 1238, 903, [
      { path: 'tsconfig.json', status: 'added', additions: 38, deletions: 0 },
      { path: 'src/store/notes.ts', status: 'renamed', additions: 422, deletions: 355 },
      { path: 'src/sync/protocol.ts', status: 'modified', additions: 518, deletions: 548 },
      { path: 'src/ui/ActivityPanel.tsx', status: 'modified', additions: 260, deletions: 0 },
    ], '- function merge(change) {\n+ function merge(change: Change): MergeResult {\n    return resolve(change)\n  }\n'),
    commit('e9d4b8a5c4f312e1a0b8a9f27c771d6686acee24', '2023-10-28T18:25:00.000Z', 'Lin Zhang', 'feat: add shared notebook roles', 564, 65, [
      { path: 'src/permissions/roles.ts', status: 'added', additions: 277, deletions: 0 },
      { path: 'src/sync/protocol.ts', status: 'modified', additions: 168, deletions: 65 },
      { path: 'src/ui/ShareDialog.tsx', status: 'added', additions: 119, deletions: 0 },
    ], '+ export const canEdit = (role: Role) =>\n+   role === \'owner\' || role === \'editor\'\n'),
    commit('f0a982dca66b7496ca15d2d68b4ab3bf483a5a21', '2024-06-17T12:12:00.000Z', 'Noah Kim', 'perf: compact sync payloads', 176, 341, [
      { path: 'src/sync/protocol.ts', status: 'modified', additions: 74, deletions: 212 },
      { path: 'src/offline/queue.ts', status: 'modified', additions: 102, deletions: 129 },
    ], '- payload.entries = allEntries\n+ payload.entries = encodeDelta(allEntries)\n'),
    commit('b13ca8f60b4a4c018f39d5e3c4ace434dba4fc39', '2025-05-24T17:30:00.000Z', 'Jae Lee', 'feat: archive project field guides', 390, 84, [
      { path: 'src/archive/export.ts', status: 'added', additions: 251, deletions: 0 },
      { path: 'src/ui/ArchivePanel.tsx', status: 'added', additions: 139, deletions: 0 },
      { path: 'src/offline/cache.ts', status: 'modified', additions: 0, deletions: 84 },
    ], '+ export const buildArchive = (notebook: Notebook) =>\n+   JSON.stringify({ version: 2, notebook })\n', ['v2.0.0']),
  ],
  files: [
    { path: 'src/index.ts', createdAt: '2021-02-14T10:00:00.000Z', lastModified: '2022-04-21T15:50:00.000Z', contributors: ['Lin Zhang', 'Noah Kim'], commits: 2, additions: 190, deletions: 46, sizeSeries: [{ date: '2021-02-14', lines: 78 }, { date: '2022-04-21', lines: 144 }] },
    { path: 'src/store/notes.ts', createdAt: '2021-02-14T10:00:00.000Z', lastModified: '2023-03-14T14:10:00.000Z', contributors: ['Lin Zhang', 'Maya Patel', 'Noah Kim', 'Jae Lee'], commits: 5, additions: 809, deletions: 640, sizeSeries: [{ date: '2021-02-14', lines: 119 }, { date: '2021-05-18', lines: 189 }, { date: '2021-10-02', lines: 188 }, { date: '2022-04-21', lines: 102 }, { date: '2023-03-14', lines: 169 }] },
    { path: 'src/sync/protocol.ts', createdAt: '2022-04-21T15:50:00.000Z', lastModified: '2024-06-17T12:12:00.000Z', contributors: ['Noah Kim', 'Maya Patel', 'Jae Lee', 'Lin Zhang'], commits: 5, additions: 1245, deletions: 951, sizeSeries: [{ date: '2022-04-21', lines: 351 }, { date: '2022-09-09', lines: 359 }, { date: '2023-03-14', lines: 329 }, { date: '2023-10-28', lines: 432 }, { date: '2024-06-17', lines: 294 }] },
    { path: 'src/offline/cache.ts', createdAt: '2022-09-09T09:30:00.000Z', lastModified: '2025-05-24T17:30:00.000Z', contributors: ['Maya Patel', 'Jae Lee'], commits: 2, additions: 472, deletions: 84, sizeSeries: [{ date: '2022-09-09', lines: 472 }, { date: '2025-05-24', lines: 388 }] },
    { path: 'src/offline/queue.ts', createdAt: '2022-09-09T09:30:00.000Z', lastModified: '2024-06-17T12:12:00.000Z', contributors: ['Maya Patel', 'Noah Kim'], commits: 2, additions: 318, deletions: 129, sizeSeries: [{ date: '2022-09-09', lines: 216 }, { date: '2024-06-17', lines: 189 }] },
    { path: 'src/permissions/roles.ts', createdAt: '2023-10-28T18:25:00.000Z', lastModified: '2023-10-28T18:25:00.000Z', contributors: ['Lin Zhang'], commits: 1, additions: 277, deletions: 0, sizeSeries: [{ date: '2023-10-28', lines: 277 }] },
    { path: 'src/archive/export.ts', createdAt: '2025-05-24T17:30:00.000Z', lastModified: '2025-05-24T17:30:00.000Z', contributors: ['Jae Lee'], commits: 1, additions: 251, deletions: 0, sizeSeries: [{ date: '2025-05-24', lines: 251 }] },
    { path: 'src/ui/ActivityPanel.tsx', createdAt: '2021-10-02T08:15:00.000Z', lastModified: '2023-03-14T14:10:00.000Z', contributors: ['Maya Patel', 'Jae Lee'], commits: 2, additions: 361, deletions: 0, sizeSeries: [{ date: '2021-10-02', lines: 101 }, { date: '2023-03-14', lines: 361 }] },
    { path: 'README.md', createdAt: '2021-02-14T10:00:00.000Z', lastModified: '2021-02-14T10:00:00.000Z', contributors: ['Lin Zhang'], commits: 1, additions: 51, deletions: 0, sizeSeries: [{ date: '2021-02-14', lines: 51 }] },
  ],
  milestones: [
    { id: 'm1', date: '2021-02-14T10:00:00.000Z', title: 'Project initialized', description: 'The notebook starts with a minimal event store.', commitSha: '1f4aa76918e440b17f87d995199193bd37a2ea13', kind: 'phase' },
    { id: 'm2', date: '2021-10-02T08:15:00.000Z', title: 'Activity stream appears', description: 'A timeline becomes a first-class product surface.', commitSha: '8c31aa75def733d792cef255157b15e44c4bc543', kind: 'growth' },
    { id: 'm3', date: '2022-04-21T15:50:00.000Z', title: 'Sync protocol split', description: 'Storage concerns move into a dedicated synchronization module.', commitSha: 'a1e4882b2dcb8d5a7bd4acb93dba2fc40595f6ef', kind: 'refactor' },
    { id: 'm4', date: '2022-09-09T09:30:00.000Z', title: 'v1.0 — Offline workspace', description: 'The first stable release supports disconnected field work.', commitSha: 'c6d0c40b483a2f5e034f113bc53f78d26cded659', kind: 'release' },
    { id: 'm5', date: '2023-03-14T14:10:00.000Z', title: 'TypeScript migration', description: 'The project crosses a major internal architecture boundary.', commitSha: 'd7ff6c0958d7d5f0b9a09ef66f6c72a5cd81eef7', kind: 'refactor' },
    { id: 'm6', date: '2025-05-24T17:30:00.000Z', title: 'v2.0 — Portable archives', description: 'Field guides can now travel beyond the active workspace.', commitSha: 'b13ca8f60b4a4c018f39d5e3c4ace434dba4fc39', kind: 'release' },
  ],
  languages: { TypeScript: 77, TSX: 14, Markdown: 5, JSON: 4 },
}
