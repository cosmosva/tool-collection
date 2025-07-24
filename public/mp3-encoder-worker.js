// MP3编码器 Web Worker
importScripts('https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js');

self.onmessage = function(e) {
  const { leftData, rightData, sampleRate, bitRate } = e.data;
  
  try {
    // 创建MP3编码器
    const mp3encoder = new lamejs.Mp3Encoder(2, sampleRate, bitRate);
    
    // 转换为16位整数
    const leftInt16 = new Int16Array(leftData.length);
    const rightInt16 = new Int16Array(rightData.length);
    
    for (let i = 0; i < leftData.length; i++) {
      leftInt16[i] = Math.max(-32768, Math.min(32767, leftData[i] * 32767));
      rightInt16[i] = Math.max(-32768, Math.min(32767, rightData[i] * 32767));
    }
    
    // 编码
    const mp3Data = [];
    const sampleBlockSize = 1152;
    let encoded = 0;
    const total = leftInt16.length;
    
    for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
      const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
      const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
      
      encoded = i + sampleBlockSize;
      
      // 发送进度
      if (i % (sampleBlockSize * 10) === 0) {
        self.postMessage({
          type: 'progress',
          progress: Math.min(1, encoded / total)
        });
      }
    }
    
    // 刷新编码器缓冲区
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    // 合并所有数据
    let totalLength = 0;
    mp3Data.forEach(buf => totalLength += buf.length);
    
    const result = new Uint8Array(totalLength);
    let offset = 0;
    mp3Data.forEach(buf => {
      result.set(buf, offset);
      offset += buf.length;
    });
    
    // 发送结果
    self.postMessage({
      type: 'complete',
      data: result.buffer
    }, [result.buffer]);
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};