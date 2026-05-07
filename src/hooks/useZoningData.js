import { useState, useEffect } from 'react';
import { ZONING_URL } from '../constants/zoning';

export function useZoningData() {
  const [geojson, setGeojson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch_() {
      try {
        const pageSize = 1000;
        let offset = 0;
        const all = [];
        let exceeded = true;

        while (exceeded) {
          const url = `${ZONING_URL}&resultOffset=${offset}&resultRecordCount=${pageSize}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Zoning API ${res.status}`);
          const data = await res.json();
          if (cancelled) return;
          all.push(...(data.features ?? []));
          exceeded = data.exceededTransferLimit === true;
          offset += pageSize;
        }

        if (!cancelled) {
          setGeojson({ type: 'FeatureCollection', features: all });
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch_();
    return () => { cancelled = true; };
  }, []);

  return { geojson, loading, error };
}
