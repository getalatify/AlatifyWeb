'use client';

import React from 'react';
import { Lightbulb, MousePointerClick, Smartphone, AlertCircle, Check, X } from 'lucide-react';

export function UrlInputHelp() {
  return (
    <section id="url-help-section" className="mt-10 p-6 sm:p-8 bg-card rounded-2xl border border-border/60 shadow-md animate-fade-in">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border/40">
        <Lightbulb className="w-5 h-5 text-primary shrink-0" />
        <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground">
          How to get the right image URL
        </h2>
      </div>
      
      <div className="space-y-4 mb-6">
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          You can paste either a direct image URL (right-clicked &rarr; Copy Image Address) OR a webpage URL that displays the image. We&apos;ll automatically find the main image on the page in most cases.
        </p>
        <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            <strong>Note:</strong> If pasting the webpage URL doesn&apos;t work (some sites block this), fall back to the Copy Image Address method below.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Desktop instructions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <MousePointerClick className="w-4 h-4 text-primary" />
            <h3>On Desktop</h3>
          </div>
          <ol className="space-y-2.5 text-xs sm:text-sm text-muted-foreground list-decimal pl-5 leading-relaxed">
            <li>Navigate to the source image (e.g. on Unsplash, Imgur).</li>
            <li><strong>Right-click directly on the image</strong> itself.</li>
            <li>Select <strong>&quot;Copy Image Address&quot;</strong> (Chrome/Edge) or <strong>&quot;Copy Image Link&quot;</strong> (Firefox/Safari).</li>
            <li>Paste the URL directly in the input box above.</li>
          </ol>
          <div className="mt-3 flex items-start gap-2.5 p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs leading-relaxed text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Important:</strong> Do not select &quot;Copy Link Address&quot; — that will copy the webpage URL instead of the image.
            </p>
          </div>
        </div>
        
        {/* Mobile instructions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <Smartphone className="w-4 h-4 text-primary" />
            <h3>On Mobile</h3>
          </div>
          <ol className="space-y-2.5 text-xs sm:text-sm text-muted-foreground list-decimal pl-5 leading-relaxed">
            <li>Find the image on your mobile browser.</li>
            <li><strong>Long-press the image</strong> until the context menu appears.</li>
            <li>Select <strong>&quot;Copy Image Link&quot;</strong> / <strong>&quot;Copy Image Address&quot;</strong>, or choose <strong>&quot;Open image in new tab&quot;</strong>.</li>
            <li>If opened in a new tab: tap the address bar and copy the full URL.</li>
            <li>Paste the URL in the input box above.</li>
          </ol>
        </div>
      </div>
      
      {/* Examples: good vs bad URLs */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs sm:text-sm text-foreground">
          What a direct image URL looks like
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-foreground shrink-0" />
              <span className="font-bold text-xs text-foreground">
                Correct — Direct Image URLs
              </span>
            </div>
            <ul className="space-y-1.5 font-mono text-[10px] sm:text-[11px] text-muted-foreground break-all leading-normal">
              <li>https://images.unsplash.com/photo-xxx.jpg</li>
              <li>https://i.imgur.com/xxx.png</li>
              <li>https://i.redd.it/xxx.jpg</li>
              <li>https://cdn.example.com/photos/sunset.jpeg</li>
            </ul>
          </div>
          
          <div className="p-4 bg-destructive/5 border border-destructive/15 rounded-xl space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-destructive shrink-0" />
              <span className="font-bold text-xs text-destructive">
                Wrong — Webpage URLs
              </span>
            </div>
            <ul className="space-y-1.5 font-mono text-[10px] sm:text-[11px] text-muted-foreground break-all leading-normal">
              <li>https://unsplash.com/photos/sunset-abc</li>
              <li>https://imgur.com/gallery/xyz</li>
              <li>https://reddit.com/r/pics/comments/abc</li>
              <li>https://google.com/imgres?imgurl=...</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Common issues */}
      <div className="mt-6 pt-5 border-t border-border/40 space-y-2">
        <h3 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-primary shrink-0" />
          Some websites block external image access
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pinterest, Instagram, Facebook, and TikTok intentionally block their images from being loaded outside their platforms (known as hotlink protection). If you get an access block error, follow these steps:
        </p>
        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal pl-5 leading-relaxed">
          <li>Save the image directly to your computer or mobile device.</li>
          <li>Switch to the <strong>&quot;Upload File&quot;</strong> tab at the top of the workspace.</li>
          <li>Select or drag your saved file to start processing locally.</li>
        </ol>
      </div>
    </section>
  );
}
