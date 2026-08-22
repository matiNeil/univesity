import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const nano = customAlphabet(alphabet, 20);

export function newId(prefix: string) {
  return `${prefix}_${nano()}`;
}
