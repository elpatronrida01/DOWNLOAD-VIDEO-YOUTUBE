export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  size?: string;
}

/**
 * Searches for or creates a dedicated 'ClipVory Downloads' folder in user's Google Drive.
 */
export async function getOrCreateClipVoryFolder(accessToken: string): Promise<string> {
  const query = encodeURIComponent("name = 'ClipVory Downloads' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'ClipVory Downloads',
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder for videos and media exported from ClipVory',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Could not create ClipVory Downloads folder in Google Drive.');
  }

  const folder = await createRes.json();
  return folder.id;
}

/**
 * Uploads a video or audio file to Google Drive using the Drive v3 multipart upload API.
 */
export async function uploadMediaToDrive(
  accessToken: string,
  options: {
    filename: string;
    mimeType: string;
    blob: Blob;
    folderId?: string;
  }
): Promise<DriveFileItem> {
  const { filename, mimeType, blob, folderId } = options;

  const metadata: any = {
    name: filename,
    mimeType,
    description: 'Saved via ClipVory Universal Downloader',
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------ClipVoryDriveBoundary' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const mediaHeader = `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;

  const metadataBuffer = new TextEncoder().encode(metadataPart);
  const mediaHeaderBuffer = new TextEncoder().encode(mediaHeader);
  const closeDelimiterBuffer = new TextEncoder().encode(closeDelimiter);
  const mediaBuffer = new Uint8Array(await blob.arrayBuffer());

  const multipartBody = new Uint8Array(
    metadataBuffer.length + mediaHeaderBuffer.length + mediaBuffer.length + closeDelimiterBuffer.length
  );

  let offset = 0;
  multipartBody.set(metadataBuffer, offset);
  offset += metadataBuffer.length;
  multipartBody.set(mediaHeaderBuffer, offset);
  offset += mediaHeaderBuffer.length;
  multipartBody.set(mediaBuffer, offset);
  offset += mediaBuffer.length;
  multipartBody.set(closeDelimiterBuffer, offset);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,createdTime', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Google Drive upload failed (${res.status}): ${errorBody}`);
  }

  return await res.json();
}

/**
 * Fetches the user's videos saved in Google Drive.
 */
export async function listClipVoryDriveFiles(accessToken: string, folderId?: string): Promise<DriveFileItem[]> {
  let query = 'trashed = false';
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  } else {
    query += " and (mimeType contains 'video/' or mimeType contains 'audio/' or mimeType = 'application/zip')";
  }

  const encodedQuery = encodeURIComponent(query);
  const fields = encodeURIComponent('files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime,size)');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&fields=${fields}&orderBy=createdTime desc&pageSize=30`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to retrieve files from Google Drive.');
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Deletes a file from Google Drive (MUST be called only after user confirmation).
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete file from Google Drive (status ${res.status}).`);
  }
}
