import { useState, useEffect, useCallback } from 'react';

interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface UseSettingsOptions {
  keys?: string[]; // Specific keys to fetch
  type?: string; // Filter by type
  cache?: boolean; // Cache results (default: true)
}

interface UseSettingsReturn {
  settings: Record<string, string>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getSetting: (key: string, defaultValue?: string) => string;
}

// Simple in-memory cache
const settingsCache: Record<string, Record<string, string>> = {};
const cacheTimestamps: Record<string, number> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSettings(options: UseSettingsOptions = {}): UseSettingsReturn {
  const { keys, type, cache = true } = options;
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = JSON.stringify({ keys, type });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (cache && settingsCache[cacheKey] && cacheTimestamps[cacheKey]) {
        const cacheAge = Date.now() - cacheTimestamps[cacheKey];
        if (cacheAge < CACHE_DURATION) {
          setSettings(settingsCache[cacheKey]);
          setLoading(false);
          return;
        }
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (keys && keys.length > 0) {
        params.append('keys', keys.join(','));
      }
      if (type) {
        params.append('type', type);
      }

      const response = await fetch(`/api/settings?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const data = await response.json();

      // Convert settings array to object with key-value pairs
      const settingsObject = data.settings.reduce((acc: Record<string, string>, setting: Setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      // Cache the results
      if (cache) {
        settingsCache[cacheKey] = settingsObject;
        cacheTimestamps[cacheKey] = Date.now();
      }

      setSettings(settingsObject);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, [cache, cacheKey, keys, type]);

  const getSetting = (key: string, defaultValue = '') => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  const refetch = () => {
    // Clear cache for this query
    if (cache) {
      delete settingsCache[cacheKey];
      delete cacheTimestamps[cacheKey];
    }
    fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch,
    getSetting,
  };
}

// Convenience hook for hero settings
export function useHeroSettings() {
  return useSettings({
    keys: [
      'hero_title',
      'hero_subtitle',
      'hero_primary_button',
      'hero_secondary_button',
      'hero_images'
    ]
  });
}

// Convenience hook for contact settings
export function useContactSettings() {
  return useSettings({
    keys: [
      'contact_title',
      'contact_address',
      'contact_phone',
      'contact_email',
      'contact_whatsapp',
      'contact_whatsapp_button',
      'location_name',
      'location_coordinates',
      'maps_embed_url'
    ]
  });
}

// Convenience hook for welcome settings
export function useWelcomeSettings() {
  return useSettings({
    keys: [
      'welcome_enabled',
      'welcome_title',
      'welcome_person_name',
      'welcome_person_title',
      'welcome_message',
      'welcome_photo'
    ]
  });
}

// Convenience hook for site settings
export function useSiteSettings() {
  return useSettings({
    keys: [
      'site_title',
      'site_subtitle',
      'site_description',
      'logo_url',
      'primary_color',
      'secondary_color'
    ]
  });
}