import { toPng } from 'html-to-image';

interface ShareOptions {
  platform: 'linkedin' | 'twitter';
}

export const captureAndShare = async (elementIds: string[], title: string, description: string, options: ShareOptions) => {
  try {
    // Capture all elements
    const screenshots = await Promise.all(
      elementIds.map(id => {
        const element = document.getElementById(id);
        if (!element) throw new Error(`Element ${id} not found`);
        return toPng(element, {
          quality: 0.95,
          backgroundColor: '#0d1117',
          style: {
            opacity: '1',
            visibility: 'visible'
          }
        });
      })
    );

    // Convert all screenshots to files
    const files = await Promise.all(
      screenshots.map(async (dataUrl, index) => {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return new File([blob], `achievement-${index + 1}.png`, { type: 'image/png' });
      })
    );

    const shareText = `${title}\n${description}`;
    const url = window.location.href;

    if (options.platform === 'linkedin') {
      // For LinkedIn, we'll open the share dialog and provide the images for manual upload
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(shareText)}`;
      window.open(shareUrl, '_blank');

      // Download the images for manual upload
      files.forEach((_, index) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = screenshots[index];
        downloadLink.download = `achievement-${index + 1}.png`;
        downloadLink.click();
      });
    } else if (options.platform === 'twitter') {
      // For Twitter, we'll use the Web Intent URL
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
      window.open(tweetUrl, '_blank');

      // Download the images for manual upload
      files.forEach((_, index) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = screenshots[index];
        downloadLink.download = `achievement-${index + 1}.png`;
        downloadLink.click();
      });
    }
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  }
}; 