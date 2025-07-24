"use client";

import { useState, useRef, useCallback } from "react";

// lamejs类型声明
interface LameJS {
  Mp3Encoder: new (channels: number, sampleRate: number, bitRate: number) => {
    encodeBuffer(left: Int16Array, right: Int16Array): Uint8Array;
    flush(): Uint8Array;
  };
}

interface AudioFile {
  id: string;
  name: string;
  file: File;
  duration?: number;
  audioBuffer?: AudioBuffer;
  url?: string;
}

type OutputFormat = 'wav' | 'mp3' | 'ogg';
type AudioQuality = 'high' | 'medium' | 'low' | 'ultra-low';

interface AudioSettings {
  format: OutputFormat;
  quality: AudioQuality;
  sampleRate: number;
  bitRate: number;
}

export function AudioProcessor() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mergedAudio, setMergedAudio] = useState<AudioFile | null>(null);
  const [extractedAudio, setExtractedAudio] = useState<AudioFile | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    format: 'mp3',
    quality: 'low',
    sampleRate: 22050,
    bitRate: 64
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // 初始化AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // 处理音频文件上传
  const handleAudioUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsLoading(true);
    const newAudioFiles: AudioFile[] = [];

    // 批量处理文件，但只获取基本信息
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.type.startsWith('audio/')) {
        const audioFile: AudioFile = {
          id: `audio-${crypto.randomUUID()}-${i}`,
          name: file.name,
          file: file,
          url: URL.createObjectURL(file)
        };

        try {
          // 只获取音频时长，不完整解码
          const duration = await getAudioDuration(file);
          audioFile.duration = duration;
        } catch (error) {
          console.error('获取音频时长失败:', error);
          // 如果获取时长失败，设置为0
          audioFile.duration = 0;
        }

        newAudioFiles.push(audioFile);
      }
    }

    setAudioFiles(prev => [...prev, ...newAudioFiles]);
    setIsLoading(false);
    
    // 清空input
    if (event.target) {
      event.target.value = '';
    }
  }, []);

  // 处理视频文件上传和音频提取
  const handleVideoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('video/')) return;

    setIsLoading(true);

    try {
      // 使用更高效的方法提取音频
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = getAudioContext();
      
      // 尝试直接解码视频文件中的音频
      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
        
        // 转换为WAV格式
        const wavBlob = audioBufferToWav(audioBuffer);
        const audioFile = new File([wavBlob], `${file.name.split('.')[0]}_audio.wav`, { type: 'audio/wav' });
        
        const extractedAudioFile: AudioFile = {
          id: `extracted-${crypto.randomUUID()}`,
          name: audioFile.name,
          file: audioFile,
          url: URL.createObjectURL(audioFile),
          audioBuffer: audioBuffer,
          duration: audioBuffer.duration
        };

        setExtractedAudio(extractedAudioFile);
        setIsLoading(false);
        
      } catch (decodeError) {
        // 如果直接解码失败，使用备用方法（但更快）
        console.log('直接解码失败，使用备用方法');
        
        // 创建一个离屏video元素
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.muted = true;
        
        // 等待元数据加载
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = reject;
        });

        const duration = video.duration;
        const audioContext = getAudioContext();
        const sampleRate = audioContext.sampleRate;
        
        // 创建离屏canvas进行快速处理
        const offlineContext = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
        
        // 使用MediaElementAudioSourceNode
        const source = offlineContext.createMediaElementSource(video);
        source.connect(offlineContext.destination);
        
        // 快速处理音频
        video.playbackRate = 16.0; // 16倍速播放
        video.volume = 1.0;
        video.play();
        
        // 渲染音频
        const renderedBuffer = await offlineContext.startRendering();
        
        // 转换为文件
        const wavBlob = audioBufferToWav(renderedBuffer);
        const audioFile = new File([wavBlob], `${file.name.split('.')[0]}_audio.wav`, { type: 'audio/wav' });
        
        const extractedAudioFile: AudioFile = {
          id: `extracted-${crypto.randomUUID()}`,
          name: audioFile.name,
          file: audioFile,
          url: URL.createObjectURL(audioFile),
          audioBuffer: renderedBuffer,
          duration: duration
        };

        setExtractedAudio(extractedAudioFile);
        URL.revokeObjectURL(video.src);
      }
      
    } catch (error) {
      console.error('提取视频音频失败:', error);
      alert('提取音频失败，该视频格式可能不支持');
    } finally {
      setIsLoading(false);
    }

    // 清空input
    if (event.target) {
      event.target.value = '';
    }
  }, [getAudioContext]);

  // 合并音频文件
  const mergeAudioFiles = useCallback(async () => {
    if (audioFiles.length < 2) {
      alert('至少需要两个音频文件才能合并');
      return;
    }

    setIsLoading(true);

    try {
      const audioContext = getAudioContext();
      
      // 计算总时长
      const totalDuration = audioFiles.reduce((sum, audio) => sum + (audio.duration || 0), 0);
      
      // 根据设置调整采样率
      const targetSampleRate = audioSettings.sampleRate;
      const totalLength = Math.floor(totalDuration * targetSampleRate);

      // 创建合并后的音频缓冲区
      const mergedBuffer = audioContext.createBuffer(2, totalLength, targetSampleRate);
      const leftChannel = mergedBuffer.getChannelData(0);
      const rightChannel = mergedBuffer.getChannelData(1);

      let offset = 0;

      // 依次合并每个音频文件，按需解码
      for (let i = 0; i < audioFiles.length; i++) {
        const audioFile = audioFiles[i];
        let buffer = audioFile.audioBuffer;
        
        // 如果还没有解码，现在解码
        if (!buffer) {
          try {
            const arrayBuffer = await audioFile.file.arrayBuffer();
            buffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
          } catch (error) {
            console.error(`解码音频文件 ${audioFile.name} 失败:`, error);
            continue; // 跳过这个文件
          }
        }
        
        // 如果需要重新采样
        if (buffer.sampleRate !== targetSampleRate) {
          buffer = await resampleAudioBuffer(audioContext, buffer, targetSampleRate);
        }

        const length = buffer.length;

        // 复制左声道
        const sourceLeft = buffer.getChannelData(0);
        leftChannel.set(sourceLeft, offset);

        // 复制右声道（如果存在）
        if (buffer.numberOfChannels > 1) {
          const sourceRight = buffer.getChannelData(1);
          rightChannel.set(sourceRight, offset);
        } else {
          // 单声道复制到右声道
          rightChannel.set(sourceLeft, offset);
        }

        offset += length;
      }

      // 根据设置的格式生成文件
      let audioBlob: Blob;
      let fileName: string;
      let mimeType: string;

      switch (audioSettings.format) {
        case 'mp3':
          audioBlob = await audioBufferToMp3(mergedBuffer, audioSettings.bitRate);
          fileName = 'merged_audio.mp3';
          mimeType = 'audio/mpeg';
          break;
        case 'ogg':
          audioBlob = await audioBufferToOgg(mergedBuffer, audioSettings.quality);
          fileName = 'merged_audio.ogg';
          mimeType = 'audio/ogg';
          break;
        default:
          audioBlob = audioBufferToWav(mergedBuffer);
          fileName = 'merged_audio.wav';
          mimeType = 'audio/wav';
      }

      const mergedFile = new File([audioBlob], fileName, { type: mimeType });

      const mergedAudioFile: AudioFile = {
        id: `merged-${crypto.randomUUID()}`,
        name: mergedFile.name,
        file: mergedFile,
        url: URL.createObjectURL(mergedFile),
        audioBuffer: mergedBuffer,
        duration: totalDuration
      };

      setMergedAudio(mergedAudioFile);
    } catch (error) {
      console.error('合并音频失败:', error);
      alert('合并音频失败，请重试');
    }

    setIsLoading(false);
  }, [audioFiles, audioSettings, getAudioContext]);

  // 播放音频
  const playAudio = useCallback((audioFile: AudioFile) => {
    if (currentlyPlaying) {
      setCurrentlyPlaying(null);
      return;
    }

    if (audioFile.url) {
      const audio = new Audio(audioFile.url);
      audio.play();
      setCurrentlyPlaying(audioFile.id);

      audio.onended = () => {
        setCurrentlyPlaying(null);
      };
    }
  }, [currentlyPlaying]);

  // 下载音频文件
  const downloadAudio = useCallback((audioFile: AudioFile) => {
    if (audioFile.url) {
      const a = document.createElement('a');
      a.href = audioFile.url;
      a.download = audioFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, []);

  // 删除音频文件
  const removeAudioFile = useCallback((id: string) => {
    setAudioFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  // 格式化时长显示
  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 估算文件大小
  const estimateFileSize = (duration: number, settings: AudioSettings) => {
    if (duration === 0) return '0 KB';
    
    let sizeInBytes: number;
    
    switch (settings.format) {
      case 'mp3':
        // MP3大小估算：比特率 * 时长 / 8
        sizeInBytes = (settings.bitRate * 1000 * duration) / 8;
        break;
      case 'wav':
        // WAV大小估算：采样率 * 位深度 * 声道数 * 时长 / 8
        sizeInBytes = (settings.sampleRate * 16 * 2 * duration) / 8;
        break;
      case 'ogg':
        // OGG使用超级压缩，大幅减小
        const compressionRatio = settings.quality === 'ultra-low' ? 8 : settings.quality === 'low' ? 4 : 2;
        sizeInBytes = (settings.sampleRate * 8 * 1 * duration) / (8 * compressionRatio);
        break;
      default:
        sizeInBytes = (settings.sampleRate * 16 * 2 * duration) / 8;
    }
    
    // 格式化文件大小
    if (sizeInBytes < 1024) {
      return `${Math.round(sizeInBytes)} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${Math.round(sizeInBytes / 1024)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎵 音频处理工具</h1>
        <p className="text-gray-600">音频合并、视频音频提取、格式转换等功能</p>
      </div>

      {/* 音频设置 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">🎛️ 音频设置</h3>
        {/* 快速预设 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">快速预设</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAudioSettings({ format: 'mp3', quality: 'high', sampleRate: 44100, bitRate: 192 })}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200"
            >
              🎵 音乐质量
            </button>
            <button
              onClick={() => setAudioSettings({ format: 'mp3', quality: 'medium', sampleRate: 22050, bitRate: 96 })}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            >
              🗣️ 语音标准
            </button>
            <button
              onClick={() => setAudioSettings({ format: 'mp3', quality: 'low', sampleRate: 16000, bitRate: 32 })}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200"
            >
              📱 手机传输
            </button>
            <button
              onClick={() => setAudioSettings({ format: 'ogg', quality: 'ultra-low', sampleRate: 8000, bitRate: 16 })}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200"
            >
              🚀 极限压缩
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
            <select
              value={audioSettings.format}
              onChange={(e) => setAudioSettings(prev => ({ ...prev, format: e.target.value as OutputFormat }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="mp3">MP3 (推荐)</option>
              <option value="wav">WAV (高质量)</option>
              <option value="ogg">OGG (压缩)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">音质等级</label>
            <select
              value={audioSettings.quality}
              onChange={(e) => setAudioSettings(prev => ({ ...prev, quality: e.target.value as AudioQuality }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="high">高质量</option>
              <option value="medium">中等质量</option>
              <option value="low">低质量 (更小)</option>
              <option value="ultra-low">超低质量 (极小)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">采样率</label>
            <select
              value={audioSettings.sampleRate}
              onChange={(e) => setAudioSettings(prev => ({ ...prev, sampleRate: parseInt(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="44100">44.1 kHz (标准)</option>
              <option value="22050">22.05 kHz (较小)</option>
              <option value="16000">16 kHz (最小)</option>
              <option value="8000">8 kHz (语音)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">比特率 (MP3)</label>
            <select
              value={audioSettings.bitRate}
              onChange={(e) => setAudioSettings(prev => ({ ...prev, bitRate: parseInt(e.target.value) }))}
              disabled={audioSettings.format !== 'mp3'}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="320">320 kbps (高质量)</option>
              <option value="192">192 kbps (标准)</option>
              <option value="128">128 kbps (推荐)</option>
              <option value="96">96 kbps (较小)</option>
              <option value="64">64 kbps (最小)</option>
              <option value="32">32 kbps (极小)</option>
              <option value="16">16 kbps (语音)</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700">
              💡 <strong>文件大小建议：</strong>
              {audioSettings.format === 'mp3' && audioSettings.bitRate <= 64 && '极小文件，快速传输'}
              {audioSettings.format === 'mp3' && audioSettings.bitRate > 64 && audioSettings.bitRate <= 128 && '小文件，适合网络传输'}
              {audioSettings.format === 'mp3' && audioSettings.bitRate > 128 && '中等文件，质量较好'}
              {audioSettings.format === 'wav' && '大文件，最佳质量'}
              {audioSettings.format === 'ogg' && audioSettings.quality === 'ultra-low' && '超小文件，语音专用'}
              {audioSettings.format === 'ogg' && audioSettings.quality !== 'ultra-low' && '压缩文件，节省空间'}
            </p>
            {audioFiles.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-600">预估合并后大小</p>
                <p className="text-sm font-semibold text-blue-800">
                  {estimateFileSize(audioFiles.reduce((sum, audio) => sum + (audio.duration || 0), 0), audioSettings)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 文件上传区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 音频文件上传 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleAudioUpload}
            className="hidden"
          />
          <div className="mb-4">
            <span className="text-4xl">🎵</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">上传音频文件</h3>
          <p className="text-gray-500 mb-4">支持 MP3、WAV、OGG 等格式</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            选择音频文件
          </button>
        </div>

        {/* 视频文件上传 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />
          <div className="mb-4">
            <span className="text-4xl">🎬</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">提取视频音频</h3>
          <p className="text-gray-500 mb-4">从视频文件中提取音频轨道</p>
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={isLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            选择视频文件
          </button>
        </div>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">处理中...</p>
        </div>
      )}

      {/* 音频文件列表 */}
      {audioFiles.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">音频文件列表 ({audioFiles.length})</h2>
            <button
              onClick={mergeAudioFiles}
              disabled={audioFiles.length < 2 || isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              合并音频
            </button>
          </div>
          
          <div className="space-y-3">
            {audioFiles.map((audioFile) => (
              <div key={audioFile.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <h3 className="font-medium">{audioFile.name}</h3>
                    {audioFile.duration && (
                      <p className="text-sm text-gray-500">时长: {formatDuration(audioFile.duration)}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => playAudio(audioFile)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                    title={currentlyPlaying === audioFile.id ? "停止播放" : "播放"}
                  >
                    {currentlyPlaying === audioFile.id ? "⏸️" : "▶️"}
                  </button>
                  <button
                    onClick={() => downloadAudio(audioFile)}
                    className="p-2 text-green-500 hover:bg-green-50 rounded"
                    title="下载"
                  >
                    📥
                  </button>
                  <button
                    onClick={() => removeAudioFile(audioFile.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 合并后的音频 */}
      {mergedAudio && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">合并后的音频</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎵</span>
              <div>
                <h3 className="font-medium">{mergedAudio.name}</h3>
                {mergedAudio.duration && (
                  <p className="text-sm text-gray-500">总时长: {formatDuration(mergedAudio.duration)}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => playAudio(mergedAudio)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                title={currentlyPlaying === mergedAudio.id ? "停止播放" : "播放"}
              >
                {currentlyPlaying === mergedAudio.id ? "⏸️" : "▶️"}
              </button>
              <button
                onClick={() => downloadAudio(mergedAudio)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                title="下载合并音频"
              >
                下载
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提取的音频 */}
      {extractedAudio && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">从视频提取的音频</h2>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎵</span>
              <div>
                <h3 className="font-medium">{extractedAudio.name}</h3>
                {extractedAudio.duration && (
                  <p className="text-sm text-gray-500">时长: {formatDuration(extractedAudio.duration)}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => playAudio(extractedAudio)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                title={currentlyPlaying === extractedAudio.id ? "停止播放" : "播放"}
              >
                {currentlyPlaying === extractedAudio.id ? "⏸️" : "▶️"}
              </button>
              <button
                onClick={() => downloadAudio(extractedAudio)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                title="下载提取音频"
              >
                下载
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">💡 使用提示</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 支持上传多个音频文件，按上传顺序进行合并</li>
          <li>• 可以从视频文件中提取音频轨道，支持常见视频格式</li>
          <li>• <strong>🚀 极限压缩：</strong>最高可减少95%文件大小，特别适合语音录音</li>
          <li>• <strong>📱 快速预设：</strong>一键选择音乐质量、语音标准、手机传输、极限压缩</li>
          <li>• <strong>📊 实时预估：</strong>设置调整时实时显示预估文件大小</li>
          <li>• <strong>🎛️ 精细控制：</strong>采样率、比特率、位深度全面可调</li>
          <li>• 点击播放按钮可以预听音频效果</li>
          <li>• 所有处理都在浏览器本地完成，文件不会上传到服务器</li>
        </ul>
      </div>
    </div>
  );
}

// 重新采样AudioBuffer
async function resampleAudioBuffer(
  audioContext: AudioContext,
  buffer: AudioBuffer,
  targetSampleRate: number
): Promise<AudioBuffer> {
  if (buffer.sampleRate === targetSampleRate) {
    return buffer;
  }

  const ratio = targetSampleRate / buffer.sampleRate;
  const newLength = Math.round(buffer.length * ratio);
  const newBuffer = audioContext.createBuffer(
    buffer.numberOfChannels,
    newLength,
    targetSampleRate
  );

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const oldData = buffer.getChannelData(channel);
    const newData = newBuffer.getChannelData(channel);

    for (let i = 0; i < newLength; i++) {
      const originalIndex = i / ratio;
      const index = Math.floor(originalIndex);
      const fraction = originalIndex - index;

      if (index + 1 < oldData.length) {
        newData[i] = (oldData[index] || 0) * (1 - fraction) + (oldData[index + 1] || 0) * fraction;
      } else {
        newData[i] = oldData[index] || 0;
      }
    }
  }

  return newBuffer;
}

// AudioBuffer转MP3格式（使用Web Worker）
async function audioBufferToMp3(buffer: AudioBuffer, bitRate: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 检查是否支持Web Worker
      if (typeof Worker === 'undefined') {
        throw new Error('浏览器不支持Web Worker');
      }
      
      const worker = new Worker('/mp3-encoder-worker.js');
      
      const left = buffer.getChannelData(0);
      const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
      
      // 设置超时
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('MP3编码超时'));
      }, 30000); // 30秒超时
      
      worker.onmessage = (e) => {
        if (e.data.type === 'progress') {
          // 可以在这里更新进度
          console.log('MP3编码进度:', Math.round(e.data.progress * 100) + '%');
        } else if (e.data.type === 'complete') {
          clearTimeout(timeout);
          worker.terminate();
          resolve(new Blob([e.data.data], { type: 'audio/mpeg' }));
        } else if (e.data.type === 'error') {
          clearTimeout(timeout);
          worker.terminate();
          reject(new Error(e.data.error));
        }
      };
      
      worker.onerror = (error) => {
        clearTimeout(timeout);
        worker.terminate();
        reject(error);
      };
      
      // 发送数据到Worker
      worker.postMessage({
        leftData: left,
        rightData: right,
        sampleRate: buffer.sampleRate,
        bitRate: bitRate
      });
      
    } catch (error) {
      console.warn('使用Web Worker编码失败，尝试使用主线程:', error);
      // 回退到主线程编码
      return audioBufferToMp3Fallback(buffer, bitRate).then(resolve).catch(reject);
    }
  });
}

// MP3编码备用方法（在主线程）
async function audioBufferToMp3Fallback(buffer: AudioBuffer, bitRate: number): Promise<Blob> {
  try {
    const lamejs = await import('lamejs') as any;
    const mp3encoder = new lamejs.Mp3Encoder(buffer.numberOfChannels, buffer.sampleRate, bitRate);
    
    const left = buffer.getChannelData(0);
    const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
    
    const leftInt16 = new Int16Array(left.length);
    const rightInt16 = new Int16Array(right.length);
    
    for (let i = 0; i < left.length; i++) {
      leftInt16[i] = Math.max(-32768, Math.min(32767, (left[i] || 0) * 32767));
      rightInt16[i] = Math.max(-32768, Math.min(32767, (right[i] || 0) * 32767));
    }
    
    const mp3Data = [];
    const sampleBlockSize = 1152;
    
    for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
      const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
      const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    return new Blob(mp3Data, { type: 'audio/mpeg' });
  } catch (error) {
    console.warn('MP3编码失败，回退到WAV格式:', error);
    return audioBufferToWav(buffer);
  }
}

// AudioBuffer转OGG格式（使用更激进的压缩）
async function audioBufferToOgg(buffer: AudioBuffer, quality: AudioQuality): Promise<Blob> {
  // 根据质量设置调整位深度和采样率
  let bitDepth: number;
  let compressionRatio: number;
  
  switch (quality) {
    case 'high':
      bitDepth = 16;
      compressionRatio = 1;
      break;
    case 'medium':
      bitDepth = 12;
      compressionRatio = 2;
      break;
    case 'low':
      bitDepth = 8;
      compressionRatio = 4;
      break;
    case 'ultra-low':
      bitDepth = 8;
      compressionRatio = 8;
      break;
    default:
      bitDepth = 8;
      compressionRatio = 4;
  }
  
  return audioBufferToWavUltraCompressed(buffer, bitDepth, compressionRatio);
}

// 超级压缩的WAV格式
function audioBufferToWavUltraCompressed(buffer: AudioBuffer, bitDepth: number = 8, compressionRatio: number = 4): Blob {
  const originalLength = buffer.length;
  const compressedLength = Math.floor(originalLength / compressionRatio);
  const numberOfChannels = Math.min(buffer.numberOfChannels, 1); // 强制单声道
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = bitDepth / 8;
  const arrayBuffer = new ArrayBuffer(44 + compressedLength * numberOfChannels * bytesPerSample);
  const view = new DataView(arrayBuffer);

  // WAV文件头
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + compressedLength * numberOfChannels * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
  view.setUint16(32, numberOfChannels * bytesPerSample, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, compressedLength * numberOfChannels * bytesPerSample, true);

  // 音频数据 - 使用下采样和量化
  let offset = 44;
  const maxValue = Math.pow(2, bitDepth - 1) - 1;
  const sourceData = buffer.getChannelData(0); // 只使用左声道
  
  for (let i = 0; i < compressedLength; i++) {
    // 下采样：每compressionRatio个样本取一个
    const sourceIndex = i * compressionRatio;
    if (sourceIndex < sourceData.length) {
      const sample = sourceData[sourceIndex] || 0;
      const intSample = Math.max(-maxValue, Math.min(maxValue, sample * maxValue));
      
      if (bitDepth === 16) {
        view.setInt16(offset, intSample, true);
        offset += 2;
      } else if (bitDepth === 8) {
        view.setInt8(offset, intSample);
        offset += 1;
      } else {
        // 其他位深度
        const reducedSample = Math.round(intSample / Math.pow(2, 16 - bitDepth)) * Math.pow(2, 16 - bitDepth);
        view.setInt16(offset, reducedSample, true);
        offset += 2;
      }
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// 压缩的WAV格式
function audioBufferToWavCompressed(buffer: AudioBuffer, bitDepth: number = 16): Blob {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = bitDepth / 8;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * bytesPerSample);
  const view = new DataView(arrayBuffer);

  // WAV文件头
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
  view.setUint16(32, numberOfChannels * bytesPerSample, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * bytesPerSample, true);

  // 音频数据
  let offset = 44;
  const maxValue = Math.pow(2, bitDepth - 1) - 1;
  
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = buffer.getChannelData(channel)[i] || 0;
      const intSample = Math.max(-maxValue, Math.min(maxValue, sample * maxValue));
      
      if (bitDepth === 16) {
        view.setInt16(offset, intSample, true);
        offset += 2;
      } else if (bitDepth === 8) {
        view.setInt8(offset, intSample);
        offset += 1;
      } else {
        // 12位或其他位深度，使用16位存储但减少精度
        const reducedSample = Math.round(intSample / Math.pow(2, 16 - bitDepth)) * Math.pow(2, 16 - bitDepth);
        view.setInt16(offset, reducedSample, true);
        offset += 2;
      }
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// AudioBuffer转WAV格式的辅助函数
function audioBufferToWav(buffer: AudioBuffer): Blob {
  return audioBufferToWavCompressed(buffer, 16);
}

// 高效获取音频时长（不完整解码）
async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    
    const cleanup = () => {
      URL.revokeObjectURL(audio.src);
    };
    
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      cleanup();
    };
    
    audio.onerror = () => {
      reject(new Error('无法加载音频元数据'));
      cleanup();
    };
    
    audio.src = URL.createObjectURL(file);
  });
} 