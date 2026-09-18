import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectAclCommand,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import envs from 'src/config/configuration';
import { s3Config } from 'src/config/s3-config';

const awsCredentials = envs().aws;

export class S3Service {
  /**
   * Gera uma URL temporária (assinada) para download privado de um arquivo.
   * @param key Caminho completo do arquivo no bucket.
   * @param expiresIn Tempo em segundos de validade da URL (padrão: 3600 = 1 hora)
   * @returns URL temporária de download
   */
  static async generateSignedUrl(
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: awsCredentials.bucketName,
      Key: key,
    });

    try {
      const url = await getSignedUrl(s3Config, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      throw error;
    }
  }
  /**
   * Deleta um objeto do S3 pelo key.
   * @param key Chave do objeto no S3.
   * @returns Retorno da operação de deleção.
   */
  static async deleteObjectByKey(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Key: key,

        Bucket: awsCredentials.bucketName,
      });

      return await s3Config.send(command);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gera uma URL temporária para download de um objeto.
   * @param key Chave do objeto no S3.
   * @returns URL temporária para download do objeto.
   */
  static async generateDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Key: key,
      Bucket: awsCredentials.bucketName,
    });

    try {
      return await getSignedUrl(s3Config, command as any, {
        expiresIn: 3600,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtém um objeto do S3 pelo key.
   * @param key Chave do objeto na S3.
   * @returns Conteúdo do objeto.
   */
  static async getObjectByKey(key: string) {
    const command = new GetObjectCommand({
      Key: key,
      Bucket: awsCredentials.bucketName,
    });

    try {
      return s3Config.send(command);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retorna vários objetos do S3.
   * @param keys Array de chaves dos objetos no S3.
   * @returns Array de objetos.
   */
  static async getMultipleObjectsByKeys(keys: string[]) {
    try {
      const objects = await Promise.all(
        keys.map(async (key) => ({
          key,
          object: await this.getObjectByKey(key),
        })),
      );

      return objects;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Faz upload de um objeto para o S3.
   * @param input Dados para o comando de upload.
   * @returns Retorno da operação de upload.
   */
  static async putObject(input: PutObjectCommandInput) {
    const command = new PutObjectCommand({
      ...input,
      Bucket: awsCredentials.bucketName,
    });

    try {
      return await s3Config.send(command);
    } catch (error) {
      throw error;
    }
  }
  /**
   * Torna um objeto público no S3.
   * @param key Chave do objeto no bucket.
   */
  static async makeObjectPublic(key: string): Promise<void> {
    try {
      const command = new PutObjectAclCommand({
        Bucket: awsCredentials.bucketName,
        Key: key,
        ACL: 'public-read',
      });

      await s3Config.send(command);
    } catch (error) {
      throw error;
    }
  }
  /**
   * Extrai a key do S3 a partir de uma URL pública do bucket
   * @param url URL do S3 (location)
   * @returns key (caminho dentro do bucket)
   */
  static extractKeyFromS3Url(url: string): string {
    try {
      const { host, pathname } = new URL(url);

      // opcional: valida se é um host S3
      if (!host.includes('amazonaws.com')) {
        throw new Error('URL não parece ser do S3');
      }

      // então basta remover o "/" inicial e fazer decode
      return decodeURIComponent(
        pathname.startsWith('/') ? pathname.slice(1) : pathname,
      );
    } catch (error) {
      console.error('Erro ao extrair key do S3:', error);
      return '';
    }
  }

  static async deleteImageFromS3IfNeeded(
    imageUrl?: string | null,
  ): Promise<void> {
    if (!imageUrl) {
      return;
    }

    const key = S3Service.extractKeyFromS3Url(imageUrl);

    if (!key) {
      return;
    }

    try {
      await S3Service.deleteObjectByKey(key);
    } catch (error) {
      console.warn(
        'Não foi possível remover a imagem antiga da notícia:',
        error,
      );
    }
  }
}
