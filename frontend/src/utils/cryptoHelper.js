// utils/cryptoHelper.js
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  if (typeof base64 !== "string" || !/^[A-Za-z0-9+/=]+$/.test(base64)) {
    console.error("base64ToArrayBuffer: invalid base64 input:", base64);
    throw new Error("Invalid base64 string");
  }

  try {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  } catch (e) {
    console.error("base64ToArrayBuffer failed for:", base64, e);
    throw e;
  }
}

async function deriveKeyFromPassword(password) {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("vault_salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return key;
}

// AES Encryption
export async function encryptData(data, walletAddress) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));

  const key = await deriveKeyFromPassword(walletAddress);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuf = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );

  return {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(encryptedBuf),
  };
}

// AES Decryption (robust)
export async function decryptData(encryptedObjOrString, walletAddress) {
  let encryptedObj = encryptedObjOrString;
  if (typeof encryptedObjOrString === "string") {
    try {
      encryptedObj = JSON.parse(encryptedObjOrString);
    } catch (e) {
      console.error("decryptData: failed to JSON.parse encrypted string", e);
      throw new Error("Invalid encrypted object format (not JSON)");
    }
  }

  // support legacy field name "data" as well as "ciphertext"
  if (encryptedObj && encryptedObj.data && !encryptedObj.ciphertext) {
    encryptedObj.ciphertext = encryptedObj.data;
  }

  if (!encryptedObj || !encryptedObj.iv || !encryptedObj.ciphertext) {
    console.error("decryptData: invalid encrypted object:", encryptedObj);
    throw new Error("Invalid encrypted object format");
  }

  // convert base64 to ArrayBuffers with checks
  const ivBuf = base64ToArrayBuffer(encryptedObj.iv);
  const cipherBuf = base64ToArrayBuffer(encryptedObj.ciphertext);

  try {
    const key = await deriveKeyFromPassword(walletAddress);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuf },
      key,
      cipherBuf
    );

    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded);
  } catch (err) {
    console.error("decryptData: decryption failed - wrong key or corrupted data", err);
    throw new Error("Decryption failed: wrong key or corrupted data");
  }
}
