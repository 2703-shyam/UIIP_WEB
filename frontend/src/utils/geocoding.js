/**
 * Geocoding and Reverse Geocoding helpers for high-accuracy location search and address resolution.
 * Uses Photon (OpenStreetMap based, high performance, no rate-limiting blocks) with Nominatim fallback.
 */

export async function searchPlaces(query, biasCoords = { lat: 22.5586, lng: 72.9627 }) {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Try Photon API first with geographical bias for Anand, Gujarat
  try {
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6`;
    if (biasCoords && biasCoords.lat != null && biasCoords.lng != null) {
      url += `&lat=${biasCoords.lat}&lon=${biasCoords.lng}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        return data.features.map((feature, idx) => {
          const props = feature.properties || {};
          const [lon, lat] = feature.geometry?.coordinates || [];

          const parts = [
            props.name,
            props.street,
            props.locality || props.district,
            props.city,
            props.state,
            props.postcode
          ].filter(Boolean);

          const uniqueParts = [...new Set(parts)];
          const title = props.name || uniqueParts[0] || 'Unknown Place';
          const subtitle = uniqueParts.slice(1).join(', ') || props.country || '';

          return {
            id: `photon-${idx}-${lat}-${lon}`,
            title,
            subtitle,
            fullAddress: uniqueParts.join(', '),
            lat,
            lng: lon
          };
        }).filter(item => item.lat != null && item.lng != null);
      }
    }
  } catch (err) {
    console.warn('Photon search failed, falling back to Nominatim:', err);
  }

  // Fallback to Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=5&addressdetails=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return (data || []).map((item, idx) => ({
        id: `nom-${idx}-${item.place_id}`,
        title: item.name || item.display_name?.split(',')[0] || trimmed,
        subtitle: item.display_name?.split(',').slice(1, 4).join(',').trim() || '',
        fullAddress: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      })).filter(item => !isNaN(item.lat) && !isNaN(item.lng));
    }
  } catch (err) {
    console.warn('Nominatim search failed:', err);
  }

  return [];
}

export async function reverseGeocode(lat, lng) {
  if (lat == null || lng == null) return null;

  // Try Photon Reverse Geocoding
  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const feature = data?.features?.[0];
      if (feature && feature.properties) {
        const props = feature.properties;
        const parts = [
          props.name !== props.street ? props.name : null,
          props.street,
          props.locality || props.district,
          props.city,
          props.state,
          props.postcode
        ].filter(Boolean);

        const unique = [...new Set(parts)];
        if (unique.length > 0) {
          return {
            formattedAddress: unique.join(', '),
            city: props.city || props.county || '',
            state: props.state || '',
            postcode: props.postcode || ''
          };
        }
      }
    }
  } catch (err) {
    console.warn('Photon reverse geocode failed:', err);
  }

  // Fallback to Nominatim Reverse Geocoding
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        return {
          formattedAddress: data.display_name,
          city: addr.city || addr.town || addr.village || '',
          state: addr.state || '',
          postcode: addr.postcode || ''
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode failed:', err);
  }

  return null;
}
