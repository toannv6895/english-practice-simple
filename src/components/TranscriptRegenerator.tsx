import React, { useState, useMemo } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';
import { SubtitleEntry } from '../types';
import { regenerateTranscript, getTranscriptPreview, getTranscriptStats } from '../utils/transcriptFormatter';

interface TranscriptRegeneratorProps {
  originalSubtitles: SubtitleEntry[];
  onRegenerate: (regeneratedSubtitles: SubtitleEntry[]) => void;
  onCancel: () => void;
}

export const TranscriptRegenerator: React.FC<TranscriptRegeneratorProps> = ({
  originalSubtitles,
  onRegenerate,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewSubtitles, setPreviewSubtitles] = useState<SubtitleEntry[] | null>(null);

  const originalStats = useMemo(() => getTranscriptStats(originalSubtitles), [originalSubtitles]);
  const previewStats = useMemo(() => 
    previewSubtitles ? getTranscriptStats(previewSubtitles) : null, 
    [previewSubtitles]
  );

  const handlePreview = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const regenerated = regenerateTranscript(originalSubtitles);
      setPreviewSubtitles(regenerated);
      setIsProcessing(false);
    }, 100);
  };

  const handleConfirm = () => {
    if (previewSubtitles) {
      onRegenerate(previewSubtitles);
    }
  };

  const handleCancel = () => {
    setPreviewSubtitles(null);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Regenerate Transcript</h2>
          <p className="text-gray-600">
            Optimize your transcript display with smart sentence formatting
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!previewSubtitles ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw size={24} className="text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to regenerate transcript
              </h3>
              <p className="text-gray-600 mb-6">
                This will reformat your transcript by merging sentences that belong together:
                <br />
                • Sentences will be merged until a complete sentence ending with ., ?, or ! is formed
                <br />
                • Each merged sentence will have the combined time range of its parts
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Current transcript stats:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total sentences:</span>
                    <span className="ml-2 font-medium">{originalStats.totalSentences}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total words:</span>
                    <span className="ml-2 font-medium">{originalStats.totalWords}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Short sentences:</span>
                    <span className="ml-2 font-medium">{originalStats.shortSentences}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Long sentences:</span>
                    <span className="ml-2 font-medium">{originalStats.longSentences}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePreview}
                disabled={isProcessing}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium"
              >
                {isProcessing ? 'Processing...' : 'Preview Regenerated Transcript'}
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Original Transcript</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {originalSubtitles.slice(0, 5).map((subtitle, index) => (
                      <div key={subtitle.id} className="mb-3 last:mb-0">
                        <div className="text-xs text-gray-500 mb-1">
                          {index + 1}. {subtitle.text.split(' ').length} words
                        </div>
                        <div className="text-sm text-gray-700">{subtitle.text}</div>
                      </div>
                    ))}
                    {originalSubtitles.length > 5 && (
                      <div className="text-xs text-gray-500 mt-2">
                        ... and {originalSubtitles.length - 5} more sentences
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Regenerated Transcript</h3>
                  <div className="bg-primary-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {previewSubtitles.slice(0, 5).map((subtitle, index) => (
                      <div key={subtitle.id} className="mb-3 last:mb-0">
                        <div className="text-xs text-primary-600 mb-1">
                          {index + 1}. {subtitle.text.split(' ').length} words
                        </div>
                        <div className="text-sm text-gray-700">{subtitle.text}</div>
                      </div>
                    ))}
                    {previewSubtitles.length > 5 && (
                      <div className="text-xs text-primary-600 mt-2">
                        ... and {previewSubtitles.length - 5} more sentences
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Regeneration Results:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Original sentences:</span>
                    <span className="ml-2 font-medium">{originalStats.totalSentences}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">New sentences:</span>
                    <span className="ml-2 font-medium">{previewStats?.totalSentences}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Original words:</span>
                    <span className="ml-2 font-medium">{originalStats.totalWords}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">New words:</span>
                    <span className="ml-2 font-medium">{previewStats?.totalWords}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
          >
            <X size={16} className="inline mr-2" />
            Cancel
          </button>
          {previewSubtitles && (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors duration-200 font-medium"
            >
              <Check size={16} className="inline mr-2" />
              Confirm Regeneration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};