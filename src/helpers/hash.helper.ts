import * as bcrypt from 'bcrypt';

export class Hash {
  static encrypt(text: string) {
    return bcrypt.hashSync(text, bcrypt.genSaltSync(10));
  }

  static compare(plainText: string, encrypted: string) {
    return bcrypt.compareSync(plainText, encrypted);
  }
}
