import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useRef, useState } from 'react';
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
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);

    useEffect(() => {
        const loadLocalFile = async () => {
            if (url.startsWith('file://')) {
                try {
                    // Read file as base64 to bypass WebView security restrictions on local files
                    const base64 = await FileSystem.readAsStringAsync(url, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    setPdfBase64(base64);
                } catch (error) {
                    console.error('Error reading local PDF as base64:', error);
                    setPdfBase64(null); // Fallback to URL in WebView
                }
            } else {
                setPdfBase64(null);
            }
        };
        loadLocalFile();
    }, [url]);

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
                const pdfBase64 = ${pdfBase64 ? JSON.stringify(pdfBase64) : 'null'};
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
                        let loadingTask;
                        
                        if (pdfBase64) {
                            console.log('Loading from Base64 data');
                            const binaryString = atob(pdfBase64);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            loadingTask = pdfjsLib.getDocument({ data: bytes });
                        } else {
                            console.log('Loading from URL:', pdfUrl);
                            loadingTask = pdfjsLib.getDocument({
                                url: pdfUrl,
                                disableRange: true,
                                disableAutoFetch: true
                            });
                        }
                        
                        pdfDoc = await loadingTask.promise;
                        document.getElementById('loading').style.display = 'none';
                        await setupViewer();
                    } catch (e) {
                        console.error('PDF loading error:', e);
                        
                        // Fallback to remote if first attempt (base64 or local url) fails
                        const remoteUrl = "${remoteUrl}";
                        if (remoteUrl && remoteUrl !== "undefined" && pdfUrl !== remoteUrl) {
                            console.log('Falling back to remote URL:', remoteUrl);
                            document.getElementById('loading').innerText = 'Local load failed. Fetching remote...';
                            
                            // Try loading from remote URL directly
                            try {
                                const fallbackTask = pdfjsLib.getDocument({
                                    url: remoteUrl,
                                    disableRange: true,
                                    disableAutoFetch: true
                                });
                                pdfDoc = await fallbackTask.promise;
                                document.getElementById('loading').style.display = 'none';
                                await setupViewer();
                                return;
                            } catch (fallbackError) {
                                console.error('Fallback failed:', fallbackError);
                            }
                        }

                        if (e.name === 'InvalidPDFException') {
                            document.getElementById('loading').innerText = 'Error: Invalid PDF structure.';
                        } else {
                            document.getElementById('loading').innerText = 'Error loading PDF: ' + e.message;
                        }
                    }
                }

                async function setupViewer() {
                    const viewer = document.getElementById('viewer');
                    if (!viewer) return;
                    viewer.innerHTML = '';
                    renderedPages = new Set();

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
                    if (viewer) {
                        viewer.style.transform = 'scale(' + zoomLevel + ')';
                        viewer.style.transformOrigin = 'top center';
                    }
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
                source={{ html: htmlContent, baseUrl: '' }}
                style={styles.webview}
                onMessage={handleMessage}
                originWhitelist={['*']}
                allowFileAccess={true}
                allowFileAccessFromFileURLs={true}
                allowUniversalAccessFromFileURLs={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={false}
                androidLayerType="hardware"
                mixedContentMode="always"
                mediaPlaybackRequiresUserAction={true}
                automaticallyAdjustContentInsets={false}
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
