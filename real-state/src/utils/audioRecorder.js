// 100% Reliable Real-Time Microphone Audio Recorder using Web Audio API PCM WAV Encoder
// Records actual microphone voice on Chrome, Safari (macOS & iOS), Edge, and Android without fake speech synthesis

export class UniversalAudioRecorder {
  constructor() {
    this.stream = null;
    this.audioContext = null;
    this.source = null;
    this.processor = null;
    this.analyser = null;
    this.leftChannel = [];
    this.recordingLength = 0;
    this.sampleRate = 44100;
    this.isRecording = false;
    this.audioBlob = null;
    this.audioUrl = null;
    this.base64Data = null;
  }

  async start() {
    this.leftChannel = [];
    this.recordingLength = 0;
    this.audioBlob = null;
    this.audioUrl = null;
    this.base64Data = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Microphone is not supported in this browser.");
    }

    // 1. Request real microphone access
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: false, // keep natural voice clarity
        autoGainControl: true
      }
    });

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioCtx();
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.sampleRate = this.audioContext.sampleRate || 44100;
    this.source = this.audioContext.createMediaStreamSource(this.stream);

    // Analyser for real-time visualizer
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.source.connect(this.analyser);

    // Script Processor for raw PCM audio capture (Buffer size: 4096)
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const input = e.inputBuffer.getChannelData(0);
      this.leftChannel.push(new Float32Array(input));
      this.recordingLength += input.length;
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.isRecording = true;
    console.log("[UniversalAudioRecorder] Real microphone PCM recording started at sampleRate:", this.sampleRate);
  }

  getVolumeLevel() {
    if (!this.analyser || !this.isRecording) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return Math.min(100, Math.round((sum / dataArray.length) * 1.5));
  }

  async stop() {
    this.isRecording = false;

    // Disconnect Web Audio Nodes
    if (this.processor) {
      try { this.processor.disconnect(); } catch (e) {}
    }
    if (this.source) {
      try { this.source.disconnect(); } catch (e) {}
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch (e) {}
    }

    // Stop real microphone hardware stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    // If samples were captured, encode to 16-bit PCM WAV
    if (this.leftChannel.length > 0 && this.recordingLength > 0) {
      this.audioBlob = this.encodeWAV(this.leftChannel, this.recordingLength, this.sampleRate);
      this.audioUrl = URL.createObjectURL(this.audioBlob);

      // Convert to Base64 string
      this.base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(this.audioBlob);
      });

      console.log("[UniversalAudioRecorder] Real voice WAV created successfully, size:", this.audioBlob.size, "bytes");
    }

    return {
      blob: this.audioBlob,
      url: this.audioUrl,
      base64: this.base64Data
    };
  }

  encodeWAV(samplesArray, totalLength, sampleRate) {
    const flattened = new Float32Array(totalLength);
    let offset = 0;
    for (let i = 0; i < samplesArray.length; i++) {
      flattened.set(samplesArray[i], offset);
      offset += samplesArray[i].length;
    }

    const buffer = new ArrayBuffer(44 + flattened.length * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + flattened.length * 2, true);
    this.writeString(view, 8, "WAVE");

    // FMT sub-chunk
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1 for Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)

    // DATA sub-chunk
    this.writeString(view, 36, "data");
    view.setUint32(40, flattened.length * 2, true);

    // Write PCM 16-bit amplitude values
    let index = 44;
    for (let i = 0; i < flattened.length; i++) {
      let s = Math.max(-1, Math.min(1, flattened[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      index += 2;
    }

    return new Blob([view], { type: "audio/wav" });
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
