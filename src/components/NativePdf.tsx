import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
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
    const [base64Data, setBase64Data] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(Platform.OS === 'android');

    // Load PDF as base64 for Android
    useEffect(() => {
        const loadPdfData = async () => {
            if (Platform.OS !== 'android') {
                setIsLoading(false);
                return;
            }

            try {
                const content = await FileSystem.readAsStringAsync(url, {
                    encoding: FileSystem.EncodingType.Base64
                });
                setBase64Data(content);
            } catch (e) {
                console.error('Error loading PDF:', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadPdfData();
    }, [url]);

    // Inject base64 data once ready
    useEffect(() => {
        if (base64Data && !isLoading && webViewRef.current && Platform.OS === 'android') {
            setTimeout(() => {
                webViewRef.current?.injectJavaScript(`
                    if (typeof loadPdfFromBase64 !== "undefined") {
                        loadPdfFromBase64("${base64Data}");
                    }
                `);
            }, 500);
        }
    }, [base64Data, isLoading]);

    // Apply zoom when it changes
    useEffect(() => {
        if (webViewRef.current) {
            setTimeout(() => {
                webViewRef.current?.injectJavaScript(`
                    if (typeof applyZoom !== "undefined") {
                        applyZoom(${zoom});
                    }
                `);
            }, 300);
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
                }
                #viewer { 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center;
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
                    font-family: sans-serif; 
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
                    font-family: sans-serif;
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
                const isAndroid = ${Platform.OS === 'android'};
                
                let pdfDoc = null;
                let baseScale = 1.0;
                let pageHeight = 0;
                let pageTotalHeight = 0;
                let renderedPages = new Set();

                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

                function convertBase64ToUint8Array(base64) {
                    const binaryString = atob(base64);
                    const len = binaryString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    return bytes;
                }

                async function loadPdfFromBase64(base64) {
                    try {
                        const pdfData = convertBase64ToUint8Array(base64);
                        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                        pdfDoc = await loadingTask.promise;
                        document.getElementById('loading').style.display = 'none';
                        await setupViewer();
                    } catch (e) {
                        console.error('PDF loading error:', e);
                        document.getElementById('loading').innerText = 'Error: ' + e.message;
                    }
                }

                async function loadPdfFromUrl() {
                    try {
                        const loadingTask = pdfjsLib.getDocument(pdfUrl);
                        pdfDoc = await loadingTask.promise;
                        document.getElementById('loading').style.display = 'none';
                        await setupViewer();
                    } catch (e) {
                        console.error('PDF loading error:', e);
                        document.getElementById('loading').innerText = 'Error: ' + e.message;
                    }
                }

                async function setupViewer() {
                    const viewer = document.getElementById('viewer');
                    const firstPage = await pdfDoc.getPage(1);
                    const unscaledViewport = firstPage.getViewport({ scale: 1.0 });
                    baseScale = window.innerWidth / unscaledViewport.width;
                    const scale = baseScale;
                    pageHeight = unscaledViewport.height * scale;
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

                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const pageNum = parseInt(entry.target.id.split('-')[1]);
                                renderPage(pageNum);
                            }
                        });
                    }, { rootMargin: '500px' });

                    document.querySelectorAll('.page-container').forEach(el => observer.observe(el));

                    const targetY = (targetPage - 1) * pageTotalHeight;
                    window.scrollTo(0, targetY);

                    let lastSentPage = targetPage;
                    window.addEventListener('scroll', () => {
                        const pageIndex = Math.floor((window.scrollY + window.innerHeight/4) / pageTotalHeight) + 1;
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
                        const scale = baseScale;
                        const viewport = page.getViewport({ scale: scale });
                        const canvas = document.createElement('canvas');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        
                        const container = document.getElementById('page-' + pageNum);
                        if (container) {
                            container.appendChild(canvas);
                            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                        }
                    } catch (e) {
                        console.error('Render error for page ' + pageNum, e);
                    }
                }

                // Simple zoom using CSS transform
                window.applyZoom = function(zoomLevel) {
                    const viewer = document.getElementById('viewer');
                    viewer.style.transform = 'scale(' + zoomLevel + ')';
                    viewer.style.transformOrigin = 'top center';
                };

                if (!isAndroid) {
                    loadPdfFromUrl();
                }
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

    if (Platform.OS === 'ios') {
        return (
            <View style={styles.container}>
                <WebView
                    source={{ uri: url }}
                    style={styles.webview}
                    scalesPageToFit={true}
                />
            </View>
        );
    }

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
