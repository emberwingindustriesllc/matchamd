import React, { useState } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Share2, Download, Twitter, Facebook, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareMilestone({ 
  isOpen, 
  onClose, 
  guideTitle, 
  completionPercentage,
  visualRef 
}) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const captureProgress = async () => {
    if (!visualRef.current) return;
    
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(visualRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });
      
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
    } catch (error) {
      toast.error('Failed to capture image');
    }
    setIsCapturing(false);
  };

  const shareText = `🎉 Just completed ${completionPercentage}% of "${guideTitle}" on FMG Pathway! 🏆`;
  const shareUrl = window.location.origin;

  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast.error('Sharing not supported on this device');
      return;
    }

    try {
      if (capturedImage) {
        const blob = await (await fetch(capturedImage)).blob();
        const file = new File([blob], 'milestone.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My FMG Pathway Progress',
          text: shareText,
          files: [file],
          url: shareUrl
        });
      } else {
        await navigator.share({
          title: 'My FMG Pathway Progress',
          text: shareText,
          url: shareUrl
        });
      }
      toast.success('Shared successfully!');
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  };

  const downloadImage = () => {
    if (!capturedImage) return;
    
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `fmg-pathway-${guideTitle.toLowerCase().replace(/\s/g, '-')}.png`;
    link.click();
    toast.success('Image downloaded!');
  };

  const shareToSocial = (platform) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            Share Your Progress
          </DialogTitle>
          <DialogDescription>
            Celebrate your achievement with friends and family!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          {capturedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <img src={capturedImage} alt="Progress preview" className="w-full" />
            </motion.div>
          )}

          {/* Capture Button */}
          {!capturedImage && (
            <Button
              onClick={captureProgress}
              disabled={isCapturing}
              className="w-full rounded-xl"
              variant="outline"
            >
              {isCapturing ? 'Capturing...' : '📸 Capture Progress Visual'}
            </Button>
          )}

          {/* Share Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Share via:</p>
            
            {/* Native Share (Mobile) */}
            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share with Friends
              </Button>
            )}

            {/* Download */}
            {capturedImage && (
              <Button
                onClick={downloadImage}
                variant="outline"
                className="w-full rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
            )}

            {/* Social Media */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => shareToSocial('twitter')}
                variant="outline"
                className="rounded-xl"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => shareToSocial('facebook')}
                variant="outline"
                className="rounded-xl"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => shareToSocial('linkedin')}
                variant="outline"
                className="rounded-xl"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>

            {/* Copy Link */}
            <Button
              onClick={copyLink}
              variant="outline"
              className="w-full rounded-xl"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Link Copied!
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Share Text Preview */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {shareText}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}