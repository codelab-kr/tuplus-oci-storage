/**
 * Copyright (c) 2020, 2021 Oracle and/or its affiliates.  All rights reserved.
 * This software is dual-licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl or Apache License 2.0 as shown at http://www.apache.org/licenses/LICENSE-2.0. You may choose either license.
 */

import * as os from 'oci-objectstorage';
import * as common from 'oci-common';
import { NodeFSBlob } from 'oci-objectstorage';
import { statSync } from 'fs';

const provider: common.ConfigFileAuthenticationDetailsProvider =
  new common.ConfigFileAuthenticationDetailsProvider();

if (!process.env.NAMESPACE) {
  throw new Error(
    'Please specify the string for the NAMESPACE server with the environment variable NAMESPACE.',
  );
}

const bucket = process.env.BUCKET_NAME as string;
const namespace = process.env.NAMESPACE;

const client = new os.ObjectStorageClient({
  authenticationDetailsProvider: provider,
});

export async function isExists(bucketName: string): Promise<boolean> {
  const getBucketRequest: os.requests.GetBucketRequest = {
    namespaceName: namespace,
    bucketName,
  };
  try {
    await client.getBucket(getBucketRequest);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return false;
  }
}

export async function getObject(objectName: string) {
  const getObjectRequest = {
    objectName,
    bucketName: bucket,
    namespaceName: namespace,
  };
  const getObjectResponse: os.responses.GetObjectResponse =
    await client.getObject(getObjectRequest);
  console.log('Get Object executed successfully.');
  console.log('etag:', getObjectResponse.eTag);

  if (!getObjectResponse.value) {
    throw new Error('Object value is undefined');
  }
  return getObjectResponse;
}

export async function putObject(objectName: string, path: string) {
  try {
    const contentLength = statSync(path).size;
    const nodeFsBlob = new NodeFSBlob(path, contentLength);
    const objectData = await nodeFsBlob.getData();

    const putObjectRequest = {
      namespaceName: namespace,
      bucketName: bucket,
      putObjectBody: objectData,
      objectName,
    };

    await client.putObject(putObjectRequest);
    console.log('Put Object executed successfully');
  } catch (error) {
    console.log(`Error put Object.... ${error}`);
    throw error;
  }
}
