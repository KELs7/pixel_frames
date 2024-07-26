import { promises as fsPromises } from 'fs';
import { decodeFrames, letter_to_color } from '$lib/js/utils';
import { config } from '$lib/js/config';
import { createCanvas, registerFont } from 'canvas';
import GIFEncoder2 from 'gif-encoder-2';
import http from 'http';
import { Server } from 'socket.io';
import * as socketserver from './socketserver.js';
import { getBlockService } from '../../blockserviceAPI/blockservice.mjs';
import { getDatabase } from "../../database/database.mjs";

const { DATABASE_SERVICE_PORT, DATABASE_SERVICE_URL, BLOCKSERVICE_URL, BLOCKSERVICE_PORT } = process.env;

process.env.FONTCONFIG_PATH = '/etc/fonts'
registerFont('../frontend/src/fonts/Roboto-Medium.ttf', { family: 'Roboto' })

let server;
let io;
let db;
let blockservice;

const initServices = async () => {
    if (!db) {
        db = await getDatabase();
    }
    if (!blockservice) {
        blockservice = getBlockService(BLOCKSERVICE_URL, BLOCKSERVICE_PORT || 3535);
    }
    // ... other initializations
}

export async function handle({ event, resolve }) {
  // Initialize server and socket.io if not already done
  if (!server) {
    await initServices();
    server = http.createServer();
    io = new Server(server);
    socketserver.start(io, DATABASE_SERVICE_URL, DATABASE_SERVICE_PORT, BLOCKSERVICE_PORT);
    
    // Start the server listening on a port
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server and Socket.IO are running on port ${port}`);
    });
  }

  // Attach services to event.locals
  event.locals.db = db;
  event.locals.blockservice = blockservice;
  event.locals.fetch = await import('node-fetch').then(mod => mod.default);

  // Existing GIF creation logic
  const response = await createGIF(event);
  if (response) return response;

  return await resolve(event);
}

// Modify createGIF to work with SvelteKit's event object
export async function createGIF(event) {
  const url = new URL(event.request.url);
  const pathMatch = url.pathname.match(/\/gif\/(\w+.gif)$/);

  if (pathMatch) {
    let uid = pathMatch[1].split(".")[0];
    let shareLink;

    if (uid.substring(0, 5) === "share") {
      uid = uid.split("_")[1];
      shareLink = pathMatch[1].split(".")[0];
      const shareLinkRes = await event.locals.db.models.ShareLinks.findOne({ link: shareLink });

      if (shareLink && !shareLinkRes) {
        return null;
      }
    }

    const thingInfo = await event.locals.db.models.PixelFrame.findOne({ uid });

    if (thingInfo) {
      const fileName = shareLink || uid;
      
      // Check if the GIF already exists on disk
      try {
        const existingGif = await sendGifFromDisk(fileName);
        if (existingGif) {
          return existingGif;
        }
      } catch (error) {
        console.error('Error checking for existing GIF:', error);
      }

      // If the GIF doesn't exist, create it
      const { createReadStream, contentLength } = await createAndSendGIF(thingInfo, shareLink);

      const response = new Response(createReadStream(), {
        headers: {
          'Content-Type': 'image/gif',
          'Content-Length': contentLength,
          'Cache-Control': 'public, max-age=31536000',
        }
      });

      return response;
    }
  }
  
  return null; // If no GIF was created, return null to continue to next handler
}

async function createAndSendGIF(thingInfo, shareLink = false) {
  const { createWriteStream } = await fsPromises;

  let pixelSize = 15;
  let numOfPixels = config.frameWidth;
  let watermark = {fillColor: "#21d6ab", strokeColor: "black"};
  const canvas = createCanvas(numOfPixels * pixelSize, numOfPixels * pixelSize);
  let ctx = canvas.getContext("2d");
  let frames = decodeFrames(thingInfo.thing);
  let fileName = shareLink || thingInfo.uid;

  let encoder = new GIFEncoder2(canvas.width, canvas.height);
  const filePath = `./GIFS/${fileName}.gif`;
  const writeStream = createWriteStream(filePath);
  encoder.createReadStream().pipe(writeStream);

  encoder.start();
  encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
  encoder.setDelay(thingInfo.speed);  // frame delay in ms
  encoder.setQuality(1); // image quality. 10 is default.
  encoder.setThreshold(0);
  encoder.setTransparent("0x00FF15");

  frames.forEach((frame, index) => {
    if (index <= frames.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame.forEach((letter, index) => {
        if (letter === "A") ctx.fillStyle = "#00ff15";
        else ctx.fillStyle = letter_to_color[letter];

        let rowBefore = Math.floor(index / numOfPixels);
        let rowAdj = (pixelSize * rowBefore);
        let y = Math.floor(index / numOfPixels);
        let x = (index - (y * numOfPixels)) * pixelSize;
        ctx.fillRect(x, rowAdj, pixelSize, pixelSize);

        if (shareLink === false) {
          ctx.font = `21pt Roboto`;
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.strokeStyle = watermark.strokeColor;
          ctx.lineWidth = 1;
          ctx.miterLimit = 2;
          ctx.strokeText(config.watermark, canvas.width / 2, canvas.height - (canvas.height / 7));
          ctx.fillStyle = watermark.fillColor;
          ctx.fillText(config.watermark, canvas.width / 2, canvas.height - (canvas.height / 7));
        }
      });
      encoder.addFrame(ctx);
    }
  });
  encoder.finish();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  const stat = await fsPromises.stat(filePath);

  return {
    createReadStream: () => fsPromises.createReadStream(filePath),
    contentLength: stat.size
  };
}

async function sendGifFromDisk(shareLink) {
  try {
    const filePath = `./GIFS/${shareLink}.gif`;
    const file = await fsPromises.readFile(filePath);
    const stat = await fsPromises.stat(filePath);

    return new Response(file, {
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': stat.size
      }
    });
  } catch (error) {
    console.error('Error reading GIF file:', error);
    return new Response('Error reading GIF file', { status: 500 });
  }
}