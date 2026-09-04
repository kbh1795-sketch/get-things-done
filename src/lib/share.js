export async function shareAchievement(cardEl, text) {
  if (!cardEl) return { shared: false };
  const html2canvas = (await import('html2canvas')).default;
  const bgChannels = window.getComputedStyle(document.documentElement).getPropertyValue('--share-grad-1').trim();
  const bgColor = bgChannels ? `hsl(${bgChannels})` : '#4f46e5';
  const canvas = await html2canvas(cardEl, { backgroundColor: bgColor, scale: 2, useCORS: true });
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
  const file = new File([blob], 'mytask-achievement.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return { shared: true };
    } catch (e) {
      if (e.name === 'AbortError') return { shared: false };
    }
  }
  // Fallback: download image + open X intent
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mytask-achievement.png';
  a.click();
  URL.revokeObjectURL(url);
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  return { shared: true, fallback: true };
}

export function shareToX(text) {
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}