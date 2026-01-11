
export function transformShutterstockUrl(url: string): string | null {
  if (!url.includes("shutterstock.com/image")) {
    return null;
  }

  // Common pattern: https://www.shutterstock.com/image-photo/happy-man-2144342341
  // We want to transform it to a preview image URL.
  // The ID is usually the last set of digits.
  const idMatch = url.match(/(\d+)$/);
  if (!idMatch) return null;

  const id = idMatch[1];
  
  // High quality preview pattern often used in Shutterstock CDNs
  // This varies but a common one is: 
  // https://www.shutterstock.com/shutterstock/photos/ID/display_1500/stock-photo-ID.jpg
  // Or the user's provided regex:
  return url.replace(/-\w+-(\d+)$/, "-600nw-$1") + ".jpg";
}

export async function downloadImageAsBlob(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback: Open in new tab
    window.open(url, '_blank');
  }
}
