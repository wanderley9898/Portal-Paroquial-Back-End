import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchResult } from 'src/@types/search.type';
import { News, User } from 'src/entities';
import { S3Service } from 'src/services/aws/s3.service';
import { Repository } from 'typeorm';
import { CreateNewsDto, SearchNewsDto, UpdateNewsDto } from './dto';

// Mensagens
const MESSAGE_ERR_CREATE = 'Oops! Erro ao criar notícia';
const MESSAGE_ERR_UPDATE = 'Oops! Erro ao atualizar notícia';
const MESSAGE_ERR_FIND = 'Oops! Erro ao buscar notícias';
const MESSAGE_ERR_DELETE = 'Oops! Erro ao remover notícia';
const NOT_FOUND_MESSAGE = 'Oops! Notícia não encontrada';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly repository: Repository<News>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /* =====================================================
   * CREATE
   ===================================================== */

  async create(data: CreateNewsDto, user: User): Promise<News> {
    try {
      const author = await this.userRepository.findOne({
        where: {
          id: user.id,
        },
      });

      if (!author) {
        throw new BadRequestException('Autor não encontrado.');
      }

      const news = this.repository.create({
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        coverImage: data.coverImage,
        thumbnail: data.thumbnail,
        category: data.category,
        featured: data.featured ?? false,
        published: data.published ?? true,
        publishedAt: data.publishedAt,
        expiresAt: data.expiresAt,
        youtubeUrl: data.youtubeUrl,
        externalUrl: data.externalUrl,
        tags: data.tags,
        author,
      });

      await this.repository.save(news);

      return this.findById(news.id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(MESSAGE_ERR_CREATE);
    }
  }

  /* =====================================================
   * UPDATE
   ===================================================== */

  async update(id: string, data: UpdateNewsDto): Promise<News> {
    try {
      const news = await this.findById(id);
      const oldCoverImage = news.coverImage;
      const oldThumbnail = news.thumbnail;

      const nextCoverImage =
        data.coverImage === undefined
          ? news.coverImage
          : data.coverImage || null;
      const nextThumbnail =
        data.thumbnail === undefined ? news.thumbnail : data.thumbnail || null;

      Object.assign(news, {
        title: data.title ?? news.title,
        subtitle: data.subtitle ?? news.subtitle,
        content: data.content ?? news.content,
        coverImage: nextCoverImage,
        thumbnail: nextThumbnail,
        category: data.category ?? news.category,
        featured: data.featured ?? news.featured,
        published: data.published ?? news.published,
        publishedAt: data.publishedAt ?? news.publishedAt,
        expiresAt: data.expiresAt ?? news.expiresAt,
        youtubeUrl: data.youtubeUrl ?? news.youtubeUrl,
        externalUrl: data.externalUrl ?? news.externalUrl,
        tags: data.tags ?? news.tags,
      });

      await this.repository.save(news);

      if (oldCoverImage && oldCoverImage !== nextCoverImage) {
        await S3Service.deleteImageFromS3IfNeeded(oldCoverImage);
      }

      if (oldThumbnail && oldThumbnail !== nextThumbnail) {
        await S3Service.deleteImageFromS3IfNeeded(oldThumbnail);
      }

      return this.findById(id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(MESSAGE_ERR_UPDATE);
    }
  }

  /* =====================================================
   * SEARCH
   ===================================================== */

  async search({
    filter,
    page = 1,
    per_page = 10,
  }: SearchNewsDto): Promise<SearchResult<News[]>> {
    try {
      const skip = (page - 1) * per_page;

      const qb = this.repository
        .createQueryBuilder('news')
        .leftJoinAndSelect('news.author', 'author');

      if (filter?.q) {
        qb.andWhere(
          `(news.title ILIKE :q
          OR news.subtitle ILIKE :q
          OR news.content ILIKE :q)`,
          {
            q: `%${filter.q}%`,
          },
        );
      }

      if (filter?.category) {
        qb.andWhere('news.category = :category', {
          category: filter.category,
        });
      }

      if (filter?.featured !== undefined) {
        qb.andWhere('news.featured = :featured', {
          featured: filter.featured,
        });
      }

      if (filter?.published !== undefined) {
        qb.andWhere('news.published = :published', {
          published: filter.published,
        });
      }

      if (filter?.authorId) {
        qb.andWhere('author.id = :authorId', {
          authorId: filter.authorId,
        });
      }

      if (filter?.publishedFrom) {
        qb.andWhere('news.publishedAt >= :from', {
          from: filter.publishedFrom,
        });
      }

      if (filter?.publishedTo) {
        qb.andWhere('news.publishedAt <= :to', {
          to: filter.publishedTo,
        });
      }

      if (filter?.tag) {
        qb.andWhere(":tag = ANY(string_to_array(news.tags, ','))", {
          tag: filter.tag,
        });
      }

      if (filter?.onlyVisible) {
        qb.andWhere('news.published = true')
          .andWhere('(news.publishedAt IS NULL OR news.publishedAt <= NOW())')
          .andWhere('(news.expiresAt IS NULL OR news.expiresAt >= NOW())');
      }

      qb.orderBy('news.featured', 'DESC')
        .addOrderBy('news.publishedAt', 'DESC')
        .addOrderBy('news.created_at', 'DESC')
        .skip(skip)
        .take(per_page);

      const [items, total] = await qb.getManyAndCount();

      return {
        items,
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / per_page),
      };
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);

      throw new InternalServerErrorException(MESSAGE_ERR_FIND);
    }
  }

  /* =====================================================
   * FIND BY ID
   ===================================================== */

  async findById(id: string): Promise<News> {
    const news = await this.repository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!news) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }

    return news;
  }

  async findByIdPublic(id: string): Promise<News> {
    const news = await this.repository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!news) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }

    // Só permite visualizar notícias públicas
    if (
      !news.published ||
      (news.publishedAt && news.publishedAt > new Date()) ||
      (news.expiresAt && news.expiresAt < new Date())
    ) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }

    await this.repository.increment({ id }, 'views', 1);

    news.views += 1;

    return news;
  }

  /* =====================================================
   * DELETE
   ===================================================== */

  async remove(id: string): Promise<void> {
    try {
      const news = await this.findById(id);

      await Promise.all([
        S3Service.deleteImageFromS3IfNeeded(news.coverImage),
        S3Service.deleteImageFromS3IfNeeded(news.thumbnail),
      ]);

      await this.repository.delete(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(MESSAGE_ERR_DELETE);
    }
  }
}
