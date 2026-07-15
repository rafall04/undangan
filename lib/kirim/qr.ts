import QRCode from 'qrcode';

// ============================================================================
// Pembuatan QR code di sisi klien (paket `qrcode`), menghasilkan PNG data-URL.
// ============================================================================

export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 640,
    color: { dark: '#3a2c1e', light: '#fdf9f0' },
  });
}

/** Unduh data-URL sebagai file. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
