import express from 'express';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { getObject, putObject, isExists } from './objectstorage';

if (!process.env.PORT) {
  throw new Error(
    'Please specify the port number for the HTTP server with the environment variable PORT.',
  );
}

if (!process.env.BUCKET_NAME || !isExists(process.env.BUCKET_NAME)) {
  throw new Error(
    'Please check the string for the BUCKET_NAME with the environment variable BUCKET_NAME if it exists..',
  );
}

const { PORT } = process.env;
const app = express();

//
// HTTP GET route that streams a video from storage.
//
app.get('/video', async (req, res) => {
  try {
    const videoId = req.query.id as string;
    const getObjectResponse = await getObject(videoId);
    res.writeHead(200, {
      'Content-Length': getObjectResponse.contentLength,
      'Content-Type': 'video/mp4',
    });
    (getObjectResponse.value as Readable).pipe(res);
    console.log('Video sent');
  } catch (error) {
    console.log('Error: ', error);
    res.send('Video not found');
  }
});

//
// HTTP POST route to upload a video to storage.
//
app.post('/upload', async (req, res) => {
  console.log('Uploading video... storage!!');
  const videoId = req.headers.id as string;
  const file = createWriteStream('./temp');

  req
    .pipe(file)
    .on('error', (err) => {
      console.error('Upload failed.');
      console.error((err && err.stack) || err);
    })
    .on('finish', () => {
      putObject(videoId, file.path as string);
      res.sendStatus(200);
    });

  //
  // Alternative way to upload a file
  //
  /*
  let sum = 0;
  req.on('data', (chunk) => {
    sum += chunk.length;
    console.log(`Received ${chunk.length} bytes of data ${sum} .`);
    file.write(chunk);
  });

  req.on('end', () => {
    console.log('Finished receiving data.');
    file.end(() => {
      putObject(videoId, contentLength, file.path as string);
    });
    res.sendStatus(200);
  });

  req.on('error', (err) => {
    console.error('Upload failed.');
    console.error((err && err.stack) || err);
  });
  */
});

app.listen(PORT, () => {
  console.log(`Microservice online ${PORT}`);
});
