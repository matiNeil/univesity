import "server-only";
import QRCode from "qrcode";
import { customAlphabet } from "nanoid";

const tokenAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const generateToken = customAlphabet(tokenAlphabet, 32);

export function newPassToken() {
  return generateToken();
}

export async function passQrDataUrl(token: string) {
  return QRCode.toDataURL(token, { margin: 1, width: 240 });
}
