use std::path::Path;

fn main() {
    // Generate placeholder icons if they don't exist.
    // These are minimal valid PNG files required by tauri::generate_context!().
    // Replace with real icons before shipping a production build.
    let icons_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("icons");
    std::fs::create_dir_all(&icons_dir).ok();

    let icon_files = [
        (icons_dir.join("icon.png"), 32u32),
        (icons_dir.join("32x32.png"), 32),
        (icons_dir.join("128x128.png"), 128),
        (icons_dir.join("128x128@2x.png"), 256),
    ];

    for (path, size) in &icon_files {
        // Regenerate if missing or if the file is not a valid RGBA PNG
        // (detectable by checking the colour-type byte at offset 25: must be 6 for RGBA)
        let needs_regen = if path.exists() {
            std::fs::read(path)
                .map(|b| b.get(25).copied() != Some(6))
                .unwrap_or(true)
        } else {
            true
        };
        if needs_regen {
            if let Ok(bytes) = make_placeholder_png(*size) {
                std::fs::write(path, bytes).ok();
            }
        }
    }

    // Create placeholder .icns and .ico (empty files — bundler fills these)
    for name in &["icon.icns", "icon.ico"] {
        let path = icons_dir.join(name);
        if !path.exists() {
            std::fs::write(&path, b"").ok();
        }
    }

    tauri_build::build();
}

/// Build a minimal valid PNG with a solid color fill.
/// Uses only flate2-free zlib via the DEFLATE stored-blocks format (no compression).
/// Format: PNG signature + IHDR + IDAT + IEND, all CRC-32 verified.
fn make_placeholder_png(size: u32) -> Result<Vec<u8>, ()> {
    let mut out = Vec::new();

    // PNG signature
    out.extend_from_slice(b"\x89PNG\r\n\x1a\n");

    // IHDR: width, height, bit depth 8, colour type 6 (RGBA), compression 0, filter 0, interlace 0
    let ihdr_data: Vec<u8> = {
        let mut d = Vec::new();
        d.extend_from_slice(&size.to_be_bytes());
        d.extend_from_slice(&size.to_be_bytes());
        d.extend_from_slice(&[8u8, 6, 0, 0, 0]); // 8-bit RGBA (colour type 6)
        d
    };
    write_chunk(&mut out, b"IHDR", &ihdr_data);

    // Image data: one filter byte (0 = None) followed by RGBA pixels per row
    let row_len = 1 + size as usize * 4; // filter byte + RGBA
    let raw_len = row_len * size as usize;
    let mut raw = vec![0u8; raw_len];
    // Fill with a steel-blue colour (70, 130, 180, 255) to distinguish placeholder icons
    for y in 0..size as usize {
        let base = y * row_len;
        raw[base] = 0; // filter = None
        for x in 0..size as usize {
            let off = base + 1 + x * 4;
            raw[off] = 70;
            raw[off + 1] = 130;
            raw[off + 2] = 180;
            raw[off + 3] = 255; // alpha = fully opaque
        }
    }

    let idat = deflate_stored(&raw);
    write_chunk(&mut out, b"IDAT", &idat);

    // IEND
    write_chunk(&mut out, b"IEND", b"");

    Ok(out)
}

/// Write a PNG chunk: length (4 bytes BE) + type (4 bytes) + data + CRC-32
fn write_chunk(out: &mut Vec<u8>, chunk_type: &[u8; 4], data: &[u8]) {
    let len = data.len() as u32;
    out.extend_from_slice(&len.to_be_bytes());
    out.extend_from_slice(chunk_type);
    out.extend_from_slice(data);
    let crc = crc32(chunk_type, data);
    out.extend_from_slice(&crc.to_be_bytes());
}

/// Compute CRC-32 over chunk type + data (PNG spec).
fn crc32(chunk_type: &[u8], data: &[u8]) -> u32 {
    // CRC-32 lookup table (polynomial 0xEDB88320, reflected)
    static TABLE: std::sync::OnceLock<[u32; 256]> = std::sync::OnceLock::new();
    let table = TABLE.get_or_init(|| {
        let mut t = [0u32; 256];
        for (n, entry) in t.iter_mut().enumerate() {
            let mut c = n as u32;
            for _ in 0..8 {
                c = if c & 1 != 0 {
                    0xEDB88320 ^ (c >> 1)
                } else {
                    c >> 1
                };
            }
            *entry = c;
        }
        t
    });

    let mut crc: u32 = 0xFFFF_FFFF;
    for &byte in chunk_type.iter().chain(data.iter()) {
        let idx = ((crc ^ byte as u32) & 0xFF) as usize;
        crc = table[idx] ^ (crc >> 8);
    }
    crc ^ 0xFFFF_FFFF
}

/// Wrap raw bytes in a zlib stream using DEFLATE stored blocks (no compression).
/// This avoids any dependency on a compression library.
fn deflate_stored(data: &[u8]) -> Vec<u8> {
    // zlib header: CMF=0x78 (deflate, window 32KB), FLG must satisfy (CMF*256+FLG) % 31 == 0
    // 0x78 * 256 = 30720; 30720 % 31 = 2; need FLG such that (30720 + FLG) % 31 == 0
    // FLG = 31 - 2 = 29 → 0x1D, but FLG bit 5 (FDICT) must be 0, so 0x1D is fine.
    let mut out = vec![0x78u8, 0x9C]; // zlib header (default compression)

    // DEFLATE stored blocks: max 65535 bytes per block
    const MAX_BLOCK: usize = 65535;
    let chunks: Vec<&[u8]> = data.chunks(MAX_BLOCK).collect();
    for (i, chunk) in chunks.iter().enumerate() {
        let is_last = i == chunks.len() - 1;
        let bfinal: u8 = if is_last { 1 } else { 0 }; // BFINAL | BTYPE=00 (stored)
        out.push(bfinal);
        let len = chunk.len() as u16;
        let nlen = !len;
        out.extend_from_slice(&len.to_le_bytes());
        out.extend_from_slice(&nlen.to_le_bytes());
        out.extend_from_slice(chunk);
    }

    // Adler-32 checksum (zlib trailer)
    let adler = adler32(data);
    out.extend_from_slice(&adler.to_be_bytes());

    out
}

/// Compute Adler-32 checksum (zlib trailer requirement).
fn adler32(data: &[u8]) -> u32 {
    const MOD_ADLER: u32 = 65521;
    let mut a: u32 = 1;
    let mut b: u32 = 0;
    for &byte in data {
        a = (a + byte as u32) % MOD_ADLER;
        b = (b + a) % MOD_ADLER;
    }
    (b << 16) | a
}
