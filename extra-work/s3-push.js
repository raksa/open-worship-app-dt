'use strict';
/* eslint-disable */
const { createReadStream } = require('node:fs');

const { fromIni } = require('@aws-sdk/credential-providers');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const appInfo = require('../package.json');
const downloadInfo = require('./download-info.json');
const { resolve } = require('node:path');

const BASE_KEY_PREFIX = 'www/download';

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

function getFileName(fileInfo){
    const artifactName = appInfo.build.artifactName;
    
}

function getWindowsBinFilePath(prefix, info) {
    if (info.is64System) {
        return [
            {
                key: `${BASE_KEY_PREFIX}/${key}`,
                filePath: resolve(
                    __dirname,
                    '..',
                    'release',`${appInfo.build.productionName}-2025.6.26-win-x64.zip`,
                ),
            },
        ];
    }
}

function getUploadList() {
    const uploadList = [];
    for (const [key, value] of Object.entries(downloadInfo)) {
        if (isWindows && value.isWindows) {
            uploadList.push(...getWindowsBinFilePath(key, value));
        }
    }
    return uploadList;
}

function genClient() {
    const client = new S3Client({
        region: process.env.REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
    return client;
}

async function uploadToS3(client, baseKey, body, optionalFileFullName) {
    const fileFullName = optionalFileFullName || filePath.split('/').pop();
    const key = `${baseKey}/${fileFullName}`;
    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: body,
    });
    const url = `s3://${process.env.BUCKET_NAME}/${key}`;
    console.log(`Uploading to "${url}"`);
    await client.send(command);
    console.log(`Uploaded to "${url}"`);
}

async function main() {
    const s3Client = genClient();
    await uploadToS3(
        s3Client,
        BASE_KEY_PREFIX,
        JSON.stringify(downloadInfo, null, 2),
        'info.json',
    );
    const uploadList = getUploadList();
}

console.log('Pushing to S3...');
main()
    .then(() => {
        console.log('Done pushing to S3.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error pushing to S3:', err);
        process.exit(1);
    });
