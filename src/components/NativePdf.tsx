import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useColorScheme } from '@/hooks/use-color-scheme';

interface NativePdfProps {
    url: string;
    remoteUrl?: string;
    targetPage?: number;
    zoom?: number;
    onPageChanged?: (page: number) => void;
}

const NativePdf: React.FC<NativePdfProps> = ({ url, remoteUrl, targetPage = 1, zoom = 1.0, onPageChanged }) => {
    const webViewRef = useRef<WebView>(null);
    const colorScheme = useColorScheme() ?? 'light';

    // Apply zoom when it changes
    useEffect(() => {
        if (webViewRef.current) {
            webViewRef.current?.injectJavaScript(`
                if (typeof applyZoom !== "undefined") {
                    applyZoom(${zoom});
                }
            `);
        }
    }, [zoom]);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    background: ${colorScheme === 'dark' ? '#151718' : '#525659'}; 
                    overflow-x: hidden;
                    font-family: -apple-system, system-ui, sans-serif;
                }
                #viewer { 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center;
                    padding-bottom: 50px;
                }
                .page-container { 
                    margin-bottom: 20px; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
                    background: white; 
                    width: 100vw; 
                    display: flex; 
                    justify-content: center; 
                    position: relative;
                }
                canvas { 
                    max-width: 100%; 
                    height: auto !important; 
                    display: block;
                }
                #loading { 
                    color: white; 
                    text-align: center; 
                    padding: 40px; 
                    font-size: 18px;
                }
                .page-label { 
                    position: absolute; 
                    top: 10px; 
                    left: 10px; 
                    background: rgba(0,0,0,0.5); 
                    color: white; 
                    padding: 2px 8px; 
                    border-radius: 4px; 
                    font-size: 12px; 
                    z-index: 10;
                }
            </style>
        </head>
        <body>
            <div id="loading">Loading PDF...</div>
            <div id="viewer"></div>
            <script>
                const pdfUrl = "${url}";
                const targetPage = ${targetPage};
                const isDark = ${colorScheme === 'dark'};
                
                let pdfDoc = null;
                let baseScale = 1.0;
                let pageTotalHeight = 0;
                let renderedPages = new Set();
                let observer = null;

                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

                async function loadPdf() {
                    try {
                        const loadingTask = pdfjsLib.getDocument({
                            url: pdfUrl,
                            disableRange: true, // Fetch whole file for local storage compatibility
                            disableAutoFetch: true
                        });
                        
                        pdfDoc = await loadingTask.promise;
                        document.getElementById('loading').style.display = 'none';
                        await setupViewer();
                    } catch (e) {
                        console.error('PDF loading error:', e);
                        if (e.name === 'InvalidPDFException') {
                            document.getElementById('loading').innerText = 'Error: Invalid PDF structure. The file might be corrupted or not fully downloaded.';
                        } else {
                            document.getElementById('loading').innerText = 'Error: ' + e.message;
                        }
                    }
                }

                async function setupViewer() {
                    const viewer = document.getElementById('viewer');
                    const firstPage = await pdfDoc.getPage(1);
                    const unscaledViewport = firstPage.getViewport({ scale: 1.0 });
                    baseScale = window.innerWidth / unscaledViewport.width;
                    
                    const pageHeight = unscaledViewport.height * baseScale;
                    pageTotalHeight = pageHeight + 20;

                    for (let i = 1; i <= pdfDoc.numPages; i++) {
                        const container = document.createElement('div');
                        container.className = 'page-container';
                        container.style.height = pageHeight + 'px';
                        container.id = 'page-' + i;
                        if (isDark) container.style.background = '#1a1a1b';
                        
                        const label = document.createElement('div');
                        label.className = 'page-label';
                        label.innerText = 'Page ' + i;
                        container.appendChild(label);
                        
                        viewer.appendChild(container);
                    }

                    observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const pageNum = parseInt(entry.target.id.split('-')[1]);
                                renderPage(pageNum);
                            }
                        });
                    }, { rootMargin: '600px 0px' });

                    document.querySelectorAll('.page-container').forEach(el => observer.observe(el));

                    // Scroll to target page
                    const targetY = (targetPage - 1) * pageTotalHeight;
                    window.scrollTo(0, targetY);

                    // Track current page
                    let lastSentPage = targetPage;
                    window.addEventListener('scroll', () => {
                        const pageIndex = Math.floor((window.scrollY + window.innerHeight/3) / pageTotalHeight) + 1;
                        const bounded = Math.min(Math.max(pageIndex, 1), pdfDoc.numPages);
                        if (bounded !== lastSentPage) {
                            lastSentPage = bounded;
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'page', page: bounded }));
                        }
                    }, { passive: true });
                    
                    renderPage(targetPage);
                }

                async function renderPage(pageNum) {
                    if (renderedPages.has(pageNum)) return;
                    renderedPages.add(pageNum);
                    
                    try {
                        const page = await pdfDoc.getPage(pageNum);
                        const viewport = page.getViewport({ scale: baseScale });
                        const canvas = document.createElement('canvas');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        
                        const container = document.getElementById('page-' + pageNum);
                        if (container) {
                            container.appendChild(canvas);
                            await page.render({ 
                                canvasContext: canvas.getContext('2d', { alpha: false }), 
                                viewport 
                            }).promise;
                        }
                    } catch (e) {
                        console.error('Render error for page ' + pageNum, e);
                    }
                }

                window.applyZoom = function(zoomLevel) {
                    const viewer = document.getElementById('viewer');
                    viewer.style.transform = 'scale(' + zoomLevel + ')';
                    viewer.style.transformOrigin = 'top center';
                    // Adjust container width to prevent horizontal scroll bars when not needed
                    document.body.style.width = (100 * zoomLevel) + 'vw';
                };

                // Start loading after a short delay to ensure scripts are ready
                setTimeout(loadPdf, 100);
            </script>
        </body>
        </html>
    `;

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'page' && onPageChanged) {
                onPageChanged(data.page);
            }
        } catch (e) { }
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: htmlContent, baseUrl: 'file:///' }}
                style={styles.webview}
                onMessage={handleMessage}
                originWhitelist={['*']}
                allowFileAccess={true}
                allowFileAccessFromFileURLs={true}
                allowUniversalAccessFromFileURLs={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
                mixedContentMode="always"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
});

export default NativePdf;
