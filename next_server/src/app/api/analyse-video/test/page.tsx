'use client';

import { useState, useRef } from 'react';

export default function TestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getVideoDuration = (videoFile: File): Promise<number> => {
    return new Promise((resolve) => {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => {
        window.URL.revokeObjectURL(v.src);
        resolve(Math.round(v.duration));
      };
      v.onerror = () => resolve(0);
      v.src = URL.createObjectURL(videoFile);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);
    setStatus('');
    setProgress(null);

    if (selectedFile) {
      setStatus('Extracting video duration...');
      const dur = await getVideoDuration(selectedFile);
      setDuration(dur);
      setStatus(`Video selected. Duration: ${dur} seconds.`);
    } else {
      setDuration(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus('Error: Please select a file.');
      return;
    }

    setResult(null);
    setStatus('Uploading... 0%');
    setProgress(0);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('duration', duration !== null ? duration.toString() : '0');

    const xhr = new XMLHttpRequest();

    // Listen to upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
        setStatus(`Uploading... ${percent}%`);
      }
    });

    // When the upload completes, we transition to processing/analysing on the server
    xhr.upload.addEventListener('load', () => {
      setProgress(null);
      setStatus('Analysing frames...');
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        try {
          const responseData = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            setStatus('Complete');
            setResult(responseData);
          } else {
            setStatus(`Error: ${responseData.error || 'Request failed'}`);
            setResult(responseData);
          }
        } catch (err: any) {
          setStatus(`Error: Request failed with status ${xhr.status}`);
          setResult({ error: xhr.responseText || 'Failed to parse server response' });
        }
      }
    };

    xhr.open('POST', '/api/analyse-video');
    xhr.send(formData);
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>SafeGuard MU — OpenRouter Vision Analysis Test Page</h1>
      <p style={{ color: '#666' }}>This page uploads a video, extracts frames server-side, and runs visual risk assessment with Qwen2.5-VL.</p>

      <form onSubmit={handleSubmit} style={{ margin: '24px 0', border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Video File (MP4, MOV, WEBM, max 100MB):</label>
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={handleFileChange}
            ref={fileInputRef}
            required
          />
        </div>

        {duration !== null && (
          <p style={{ margin: '8px 0', fontSize: '14px', color: '#333' }}>
            <strong>Client-extracted Duration:</strong> {duration} seconds
          </p>
        )}

        <button
          type="submit"
          disabled={!file}
          style={{
            padding: '10px 20px',
            backgroundColor: file ? '#10b981' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: file ? 'pointer' : 'default',
            fontWeight: 'bold',
          }}
        >
          Analyse Video
        </button>
      </form>

      {status && (
        <div style={{ margin: '16px 0', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px', borderLeft: '4px solid #10b981' }}>
          <strong>Status:</strong> {status}
          {progress !== null && (
            <div style={{ width: '100%', backgroundColor: '#ddd', height: '10px', borderRadius: '5px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, backgroundColor: '#10b981', height: '100%', transition: 'width 0.1s ease' }} />
            </div>
          )}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '24px' }}>
          <h2>Result JSON:</h2>
          <pre style={{ backgroundColor: '#222', color: '#fff', padding: '16px', borderRadius: '6px', overflowX: 'auto', fontSize: '14px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
