/**
 * Extracts GPS coordinates (Latitude & Longitude) from JPEG images (e.g. smartphone photos).
 * Uses pure JavaScript ArrayBuffer/DataView without external dependencies.
 */
export async function extractGpsFromImage(file) {
  if (!file || !file.type || !file.type.includes('jpeg') && !file.name.match(/\.jpe?g$/i)) {
    return null;
  }

  try {
    const arrayBuffer = await file.slice(0, 131072).arrayBuffer(); // read first 128KB which contains EXIF
    const view = new DataView(arrayBuffer);

    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xFFD8) {
      return null; // Not a JPEG
    }

    let offset = 2;
    while (offset < view.byteLength - 4) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xFFE1) {
        const length = view.getUint16(offset, false);
        const markerStart = offset;

        // Check for 'Exif\0\0'
        if (
          view.getUint8(markerStart + 2) === 0x45 && // E
          view.getUint8(markerStart + 3) === 0x78 && // x
          view.getUint8(markerStart + 4) === 0x69 && // i
          view.getUint8(markerStart + 5) === 0x66 && // f
          view.getUint8(markerStart + 6) === 0x00 &&
          view.getUint8(markerStart + 7) === 0x00
        ) {
          const tiffOffset = markerStart + 8;
          const endianTag = view.getUint16(tiffOffset, false);
          const le = endianTag === 0x4949; // 'II' = Little Endian, 'MM' = Big Endian
          const firstIfdOffset = view.getUint32(tiffOffset + 4, le);

          let ifdPtr = tiffOffset + firstIfdOffset;
          if (ifdPtr + 2 > view.byteLength) return null;
          const numEntries = view.getUint16(ifdPtr, le);
          ifdPtr += 2;

          let gpsIfdOffset = null;
          for (let i = 0; i < numEntries; i++) {
            const entryOffset = ifdPtr + i * 12;
            if (entryOffset + 12 > view.byteLength) break;
            const tag = view.getUint16(entryOffset, le);
            if (tag === 0x8825) { // GPSInfo IFD pointer
              gpsIfdOffset = view.getUint32(entryOffset + 8, le);
              break;
            }
          }

          if (!gpsIfdOffset) return null;
          const gpsPtr = tiffOffset + gpsIfdOffset;
          if (gpsPtr + 2 > view.byteLength) return null;
          const numGpsEntries = view.getUint16(gpsPtr, le);

          let latRef = 'N';
          let lonRef = 'E';
          let latValues = null;
          let lonValues = null;

          const readRational = (valOffset) => {
            const ptr = tiffOffset + valOffset;
            if (ptr + 8 > view.byteLength) return 0;
            const num = view.getUint32(ptr, le);
            const den = view.getUint32(ptr + 4, le);
            return den === 0 ? 0 : num / den;
          };

          for (let j = 0; j < numGpsEntries; j++) {
            const entryOffset = gpsPtr + 2 + j * 12;
            if (entryOffset + 12 > view.byteLength) break;
            const tag = view.getUint16(entryOffset, le);

            if (tag === 0x0001) { // GPSLatitudeRef
              latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
            } else if (tag === 0x0002) { // GPSLatitude
              const valOffset = view.getUint32(entryOffset + 8, le);
              latValues = [
                readRational(valOffset),
                readRational(valOffset + 8),
                readRational(valOffset + 16)
              ];
            } else if (tag === 0x0003) { // GPSLongitudeRef
              lonRef = String.fromCharCode(view.getUint8(entryOffset + 8));
            } else if (tag === 0x0004) { // GPSLongitude
              const valOffset = view.getUint32(entryOffset + 8, le);
              lonValues = [
                readRational(valOffset),
                readRational(valOffset + 8),
                readRational(valOffset + 16)
              ];
            }
          }

          if (latValues && lonValues && latValues[0] != null && lonValues[0] != null) {
            let lat = latValues[0] + latValues[1] / 60 + latValues[2] / 3600;
            let lon = lonValues[0] + lonValues[1] / 60 + lonValues[2] / 3600;
            if (latRef === 'S') lat = -lat;
            if (lonRef === 'W') lon = -lon;

            if (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
              return {
                lat: Number(lat.toFixed(6)),
                lng: Number(lon.toFixed(6)),
                fileName: file.name
              };
            }
          }
        }
        offset += length;
      } else if ((marker & 0xFF00) === 0xFF00) {
        if (marker === 0xFFDA || marker === 0xFFD9) break; // Start of Scan or EOI
        const length = view.getUint16(offset, false);
        offset += length;
      } else {
        break;
      }
    }
  } catch (err) {
    console.warn('Could not extract EXIF GPS:', err);
  }
  return null;
}
