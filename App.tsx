
import React, { useState, useEffect, useCallback } from 'react';
import { ImageHistoryItem, GeminiAnalysisResponse } from './types';
import { transformShutterstockUrl, downloadImageAsBlob } from './services/shutterstockService';
import { analyzeImageContext } from './services/geminiService';
import HistoryCard from './components/HistoryCard';

const App: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<ImageHistoryItem | null>(null);
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lenscraft_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lenscraft_history', JSON.stringify(history));
  }, [history]);

  const handleProcessUrl = async () => {
    setError(null);
    const previewUrl = transformShutterstockUrl(urlInput);
    
    if (!previewUrl) {
      setError("Please enter a valid Shutterstock image URL");
      return;
    }

    const id = urlInput.match(/(\d+)$/)?.[1] || 'unknown';
    const newItem: ImageHistoryItem = {
      id,
      originalUrl: urlInput,
      previewUrl,
      timestamp: Date.now(),
    };

    setCurrentImage(newItem);
    setAnalysis(null);
    setIsAnalyzing(true);

    try {
      const result = await analyzeImageContext(urlInput);
      setAnalysis(result);
      
      const updatedItem = { ...newItem, tags: result.tags, aiAnalysis: result.description };
      setCurrentImage(updatedItem);
      
      // Update history
      setHistory(prev => {
        const filtered = prev.filter(i => i.id !== id);
        return [updatedItem, ...filtered].slice(0, 10);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (currentImage) {
      downloadImageAsBlob(currentImage.previewUrl, `shutterstock_${currentImage.id}.jpg`);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-pink-500 via-rose-400 to-orange-400 bg-clip-text text-transparent mb-4">
          LensCraft Pro
        </h1>
        <p className="text-slate-400 text-lg">Sophisticated Preview & AI Insights for Shutterstock Assets</p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Input and History */}
        <div className="lg:col-span-1 space-y-8">
          <section className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-6 bg-pink-500 rounded-full"></span>
              Import Asset
            </h2>
            <div className="relative">
              <input 
                type="text" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste Shutterstock URL..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 focus:ring-2 focus:ring-pink-500 outline-none transition-all pr-12 text-sm"
              />
              <button 
                onClick={handleProcessUrl}
                className="absolute right-2 top-2 bottom-2 bg-pink-500 hover:bg-pink-600 px-4 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {error && <p className="text-rose-400 text-xs mt-2 px-1">{error}</p>}
          </section>

          {history.length > 0 && (
            <section className="glass p-6 rounded-3xl">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-4">Recent Searches</h2>
              <div className="grid grid-cols-2 gap-3">
                {history.map(item => (
                  <HistoryCard key={item.id} item={item} onClick={setCurrentImage} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Preview & Analysis */}
        <div className="lg:col-span-2 space-y-8">
          {currentImage ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="glass p-4 rounded-3xl overflow-hidden shadow-2xl relative group">
                <img 
                  src={currentImage.previewUrl} 
                  alt="Asset Preview" 
                  className="w-full h-auto rounded-2xl"
                />
                <div className="absolute top-8 right-8 flex gap-2">
                  <button 
                    onClick={handleDownload}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-full font-bold flex items-center gap-2 border border-white/10 transition-all active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    High Quality Preview
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="glass p-6 rounded-3xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95l.141 2.825a1 1 0 00.916.945l2.818.308a1 1 0 01.742 1.648l-2.07 1.932a1 1 0 00-.272.838l.608 2.781a1 1 0 01-1.487 1.08l-2.414-1.386a1 1 0 00-1.02 0l-2.414 1.386a1 1 0 01-1.487-1.08l.608-2.781a1 1 0 00-.272-.838l-2.07-1.932a1 1 0 01.742-1.648l2.818-.308a1 1 0 00.916-.945l.141-2.825a1 1 0 01.897-.95zM10 6a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
                    </svg>
                    AI Context Analysis
                  </h3>
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="h-4 w-full shimmer rounded"></div>
                      <div className="h-4 w-3/4 shimmer rounded"></div>
                      <div className="h-4 w-1/2 shimmer rounded"></div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {analysis?.description || "No analysis available for this asset."}
                    </p>
                  )}
                </section>

                <section className="glass p-6 rounded-3xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 011.414-1.414L9 14.586V3a1 1 0 112 0v11.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Meta & Semantic Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {isAnalyzing ? (
                      [1,2,3,4,5].map(i => <div key={i} className="h-8 w-16 shimmer rounded-full"></div>)
                    ) : (
                      analysis?.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))
                    )}
                  </div>
                </section>
              </div>

              <section className="glass p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4">Recommended AI Prompts</h3>
                <div className="space-y-3">
                  {isAnalyzing ? (
                    [1,2].map(i => <div key={i} className="h-10 w-full shimmer rounded-xl"></div>)
                  ) : (
                    analysis?.suggestedPrompts.map((prompt, idx) => (
                      <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 italic group cursor-pointer hover:border-pink-500/50 transition-colors">
                        "{prompt}"
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass rounded-3xl border-dashed border-2 border-slate-700">
              <div className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-500">Ready to Analyze</h2>
                <p className="text-slate-600 max-w-xs">Paste a Shutterstock URL on the left to start generating previews and AI insights.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 py-8 text-slate-600 text-sm border-t border-slate-800 w-full max-w-5xl text-center">
        <p>&copy; {new Date().getFullYear()} LensCraft Pro. For educational preview purposes.</p>
      </footer>
    </div>
  );
};

export default App;
