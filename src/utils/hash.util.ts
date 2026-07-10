import * as bcrypt from 'bcrypt';

export const hash = {
  async compare(plainText: string, hashText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashText);
  },

  generate: (text: string) => {
    return bcrypt.hashSync(text, bcrypt.genSaltSync(10));
  },
};
