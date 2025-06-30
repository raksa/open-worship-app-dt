'use strict';
/* eslint-disable */

const { createReadStream, readFileSync } = require('node:fs');
const {
    CloudFrontClient,
    CreateInvalidationCommand,
} = require('@aws-sdk/client-cloudfront');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const instanceInitData = {
    apiVersion: 'latest',
    region: process.env.RELEASE_AWS_REGION,
    credentials: {
        accessKeyId: process.env.RELEASE_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.RELEASE_AWS_SECRET_ACCESS_KEY,
    },
};

const downloadInfo = require('./download-info.json');
const { resolve } = require('node:path');

const PUBLIC_BASE_KEY_PREFIX = 'download';
const BASE_KEY_PREFIX = 'www/download';

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isArm64 = process.arch === 'arm64';
const isLinux = process.platform === 'linux';
const isUbuntu = process.env.RELEASE_LINUX_IS_UBUNTU === 'true';
const isFedora = process.env.RELEASE_LINUX_IS_FEDORA === 'true';

function filterBinFileInfo(prefix, data, ext) {
    return data
        .filter((item) => {
            return item.fileFullName.endsWith(ext);
        })
        .map((item) => {
            const date = new Date(item.releaseDate);
            return {
                fileFullName: item.fileFullName,
                checksum: item.checksum,
                publicPath: `${PUBLIC_BASE_KEY_PREFIX}/${prefix}/${item.fileFullName}`,
                releaseDate: date.toISOString(),
            };
        });
}

function readDataFile(prefix) {
    const filePath = resolve(
        process.env.RELEASE_STORAGE_DIR,
        prefix,
        process.env.RELEASE_BIN_FILE_INFO,
    );
    const fileContext = readFileSync(filePath, 'utf-8');
    const data = fileContext
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);
    return data;
}

function getWindowsBinFilePath(prefix, systemInfo) {
    const fileContextData = readDataFile(prefix);
    const data = fileContextData.map((line) => {
        const [fileFullName, checksum, releaseDate, version] = line.split(
            process.env.RELEASE_BIN_FILE_SEPARATOR,
        );
        return {
            fileFullName,
            checksum,
            releaseDate,
            version,
        };
    });
    const info = {
        version: data[0].version,
        isWindows: true,
        is64System: !!systemInfo.is64System,
        portable: filterWindowsBinFileInfo(prefix, data, '.zip'),
        installer: filterWindowsBinFileInfo(prefix, data, '.exe'),
    };
    const s3Key = `${BASE_KEY_PREFIX}/${prefix}`;
    return [
        {
            key: s3Key,
            body: JSON.stringify(info, null, 2),
            fileFullName: 'info.json',
        },
        ...data.map((item) => {
            return {
                key: `${s3Key}/${item.fileFullName}`,
                filePath: resolve(
                    process.env.RELEASE_STORAGE_DIR,
                    prefix,
                    item.fileFullName,
                ),
            };
        }),
    ];
}

function getMacBinFilePath(prefix, systemInfo) {
    const fileContextData = readDataFile(prefix);
    const data = fileContextData.map((line) => {
        const [fileFullName, checksum, releaseDate, version] = line.split(
            process.env.RELEASE_BIN_FILE_SEPARATOR,
        );
        return {
            fileFullName,
            checksum,
            releaseDate,
            version,
        };
    });
    const info = {
        version: data[0].version,
        isMac: true,
        isArm64: !!systemInfo.isArm64,
        isUniversal: !!systemInfo.isUniversal,
        portable: filterBinFileInfo(prefix, data, '.zip'),
        installer: filterBinFileInfo(prefix, data, '.dmg'),
    };
    const s3Key = `${BASE_KEY_PREFIX}/${prefix}`;
    return [
        {
            key: s3Key,
            body: JSON.stringify(info, null, 2),
            fileFullName: 'info.json',
        },
        ...data.map((item) => {
            return {
                key: `${s3Key}/${item.fileFullName}`,
                filePath: resolve(
                    process.env.RELEASE_STORAGE_DIR,
                    prefix,
                    item.fileFullName,
                ),
            };
        }),
    ];
}

function getLinuxBinFilePath(prefix, systemInfo) {
    const fileContextData = readDataFile(prefix);
    const data = fileContextData.map((line) => {
        const [fileFullName, checksum, releaseDate, version] = line.split(
            process.env.RELEASE_BIN_FILE_SEPARATOR,
        );
        return {
            fileFullName,
            checksum,
            releaseDate,
            version,
        };
    });
    const info = {
        version: data[0].version,
        isLinux: true,
        isUbuntu: !!systemInfo.isUbuntu,
        isFedora: !!systemInfo.isFedora,
        portable: filterBinFileInfo(prefix, data, '.AppImage'),
        installer: systemInfo.isUbuntu ? filterBinFileInfo(prefix, data, '.deb') : [],
    };
    const s3Key = `${BASE_KEY_PREFIX}/${prefix}`;
    return [
        {
            key: s3Key,
            body: JSON.stringify(info, null, 2),
            fileFullName: 'info.json',
        },
        ...data.map((item) => {
            return {
                key: `${s3Key}/${item.fileFullName}`,
                filePath: resolve(
                    process.env.RELEASE_STORAGE_DIR,
                    prefix,
                    item.fileFullName,
                ),
            };
        }),
    ];
}

function getUploadList() {
    const uploadList = [];
    for (const [key, value] of Object.entries(downloadInfo)) {
        if (isWindows && value.isWindows) {
            uploadList.push(...getWindowsBinFilePath(key, value));
        } else if (isMac && value.isMac) {
            if ((isArm64 && value.isArm64) || (!isArm64 && !value.isArm64)) {
                uploadList.push(...getMacBinFilePath(key, value));
            }
        } else if (isLinux && value.isLinux) {
            if ((isUbuntu && value.isUbuntu) || (isFedora && value.isFedora)) {
                uploadList.push(...getLinuxBinFilePath(key, value));
            }
        }
    }
    return uploadList;
}

async function uploadToS3(client, baseKey, body, optionalFileFullName) {
    const key = `${baseKey}${optionalFileFullName ? `/${optionalFileFullName}` : ''}`;
    const bucketName = process.env.RELEASE_AWS_BUCKET_NAME;
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
    });
    const url = `s3://${bucketName}/${key}`;
    console.log(`Uploading to "${url}"`);
    await client.send(command);
    console.log(`*Uploaded to "${url}"`);
}

async function clearCache(key) {
    const item = `/${key}`;
    const cloudfront = new CloudFrontClient(instanceInitData);
    const command = new CreateInvalidationCommand({
        DistributionId: process.env.RELEASE_AWS_DISTRIBUTION_ID,
        InvalidationBatch: {
            CallerReference: `caller-reference-${new Date().getTime()}`,
            Paths: {
                Quantity: 1,
                Items: [item],
            },
        },
    });
    await cloudfront.send(command);
    console.log('Clear cache done for', item);
}

async function main() {
    const s3Client = new S3Client(instanceInitData);
    await uploadToS3(
        s3Client,
        BASE_KEY_PREFIX,
        JSON.stringify(downloadInfo, null, 2),
        'info.json',
    );
    const uploadList = getUploadList();
    await Promise.all(
        uploadList.map((item) => {
            if (item.body) {
                return uploadToS3(
                    s3Client,
                    item.key,
                    item.body,
                    item.fileFullName,
                );
            } else {
                return uploadToS3(
                    s3Client,
                    item.key,
                    createReadStream(item.filePath),
                );
            }
        }),
    );
    await clearCache('download/*');
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
