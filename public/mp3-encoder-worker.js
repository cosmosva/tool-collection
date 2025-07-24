// MP3编码器 Web Worker (JavaScript版本)
importScripts("https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js");

self.onmessage = (e) => {
	const { leftData, rightData, sampleRate, bitRate } = e.data;

	try {
		// 创建MP3编码器
		const mp3encoder = new lamejs.Mp3Encoder(2, sampleRate, bitRate);

		// 转换Float32Array到Int16Array
		const leftInt16 = new Int16Array(leftData.length);
		const rightInt16 = new Int16Array(rightData.length);

		for (let i = 0; i < leftData.length; i++) {
			leftInt16[i] = Math.max(
				-32768,
				Math.min(32767, (leftData[i] || 0) * 32767),
			);
			rightInt16[i] = Math.max(
				-32768,
				Math.min(32767, (rightData[i] || 0) * 32767),
			);
		}

		const mp3Data = [];
		const sampleBlockSize = 1152;

		// 分块编码并报告进度
		for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
			const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
			const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);

			const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
			if (mp3buf.length > 0) {
				mp3Data.push(mp3buf);
			}

			// 报告进度
			const progress = i / leftInt16.length;
			self.postMessage({
				type: "progress",
				progress: progress,
			});
		}

		// 完成编码
		const finalBuffer = mp3encoder.flush();
		if (finalBuffer.length > 0) {
			mp3Data.push(finalBuffer);
		}

		// 合并所有MP3数据
		let totalLength = 0;
		for (const chunk of mp3Data) {
			totalLength += chunk.length;
		}

		const result = new Uint8Array(totalLength);
		let offset = 0;
		for (const chunk of mp3Data) {
			result.set(chunk, offset);
			offset += chunk.length;
		}

		// 发送完成消息
		self.postMessage(
			{
				type: "complete",
				data: result.buffer,
			},
			[result.buffer],
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "未知错误";
		self.postMessage({
			type: "error",
			error: errorMessage,
		});
	}
};
