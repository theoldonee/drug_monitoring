import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';

const EXTENSION_MAP: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
};

/**
 * Extracts up to 10 frames at 1fps from a video buffer using ffmpeg-static
 * and returns them as an array of base64-encoded JPEG strings.
 */
export async function extractFrames(buffer: Buffer, mimeType: string): Promise<string[]> {
  if (!ffmpegStatic) {
    throw new Error('ffmpeg-static binary path could not be resolved.');
  }

  // Resolve virtual root /ROOT paths or invalid relative paths returned under some Next.js virtualized runtimes.
  let ffmpegPath = ffmpegStatic;
  if (ffmpegPath.includes('ROOT') || ffmpegPath.startsWith('\\') || ffmpegPath.startsWith('/')) {
    const binaryName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
    ffmpegPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', binaryName);
  }

  const extension = EXTENSION_MAP[mimeType] || 'mp4';
  const tempFileName = `input-${Date.now()}-${Math.floor(Math.random() * 100000)}.${extension}`;
  const tempInputPath = path.join(os.tmpdir(), tempFileName);

  // Write video buffer to temp file on disk
  fs.writeFileSync(tempInputPath, buffer);

  try {
    // Run ffmpeg to extract up to 10 frames at 1fps, piping output as mjpeg to stdout
    // quotes around ffmpegPath and tempInputPath are required to handle spaces in paths on Windows
    const ffmpegCommand = `"${ffmpegPath}" -i "${tempInputPath}" -vf fps=1 -frames:v 10 -f image2pipe -vcodec mjpeg pipe:1`;
    
    // Set a large maxBuffer (50MB) to prevent buffer overflow for larger image pipelines
    const stdoutBuffer = execSync(ffmpegCommand, {
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'], // ignore stdin, pipe stdout, ignore stderr
    });

    // Clean up temporary video file immediately after command execution
    if (fs.existsSync(tempInputPath)) {
      fs.unlinkSync(tempInputPath);
    }

    // Parse the stdout buffer containing concatenated JPEG images into individual frames
    const frames: Buffer[] = [];
    let i = 0;
    const len = stdoutBuffer.length;

    while (i < len - 1) {
      // Find JPEG Start of Image marker (0xFF 0xD8)
      if (stdoutBuffer[i] === 0xFF && stdoutBuffer[i + 1] === 0xD8) {
        const start = i;
        i += 2;
        
        // Scan forward to find JPEG End of Image marker (0xFF 0xD9)
        let foundEnd = false;
        while (i < len - 1) {
          if (stdoutBuffer[i] === 0xFF && stdoutBuffer[i + 1] === 0xD9) {
            const end = i + 2;
            frames.push(stdoutBuffer.subarray(start, end));
            i = end;
            foundEnd = true;
            break;
          }
          i++;
        }
        
        // If we didn't find a proper end, break to prevent infinite scan/malformed slices
        if (!foundEnd) {
          break;
        }
      } else {
        i++;
      }
    }

    return frames.map(frame => frame.toString('base64'));

  } catch (error) {
    // Always guarantee cleanup of the temporary video file on extraction failure
    if (fs.existsSync(tempInputPath)) {
      try {
        fs.unlinkSync(tempInputPath);
      } catch (cleanupError) {
        console.error('Failed to clean up temp file during error handling:', cleanupError);
      }
    }
    throw error;
  }
}
