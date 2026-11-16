import type { PlatformId, VideoMediaInfo } from '../../src/shared/types.ts';

export interface BasePlatformAdapter {
  id: PlatformId;
  name: string;
  domains: string[];
  authRequired: boolean;
  status: 'active' | 'limited' | 'configured';
  notes: string;

  /**
   * Returns true if this adapter handles the given URL.
   */
  matches(url: string): boolean;

  /**
   * Extracts media info from the given URL.
   */
  extract(url: string): Promise<VideoMediaInfo>;
}
