import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchResult } from 'src/@types/search.type';
import { Broadcast, User } from 'src/entities';
import { Repository } from 'typeorm';
import {
  CreateBroadcastDto,
  SearchBroadcastDto,
  UpdateBroadcastDto,
} from './dto';

// Mensagens
const MESSAGE_ERR_CREATE = 'Oops! Erro ao criar transmissão';
const MESSAGE_ERR_UPDATE = 'Oops! Erro ao atualizar transmissão';
const MESSAGE_ERR_FIND = 'Oops! Erro ao buscar transmissões';
const MESSAGE_ERR_DELETE = 'Oops! Erro ao remover transmissão';
const NOT_FOUND_MESSAGE = 'Oops! Transmissão não encontrada';

@Injectable()
export class BroadcastService {
  constructor(
    @InjectRepository(Broadcast)
    private readonly repository: Repository<Broadcast>,
  ) {}

  /* =====================================================
   * CREATE
   ===================================================== */

  async create(data: CreateBroadcastDto, user: User): Promise<Broadcast> {
    try {
      const broadcast = this.repository.create({
        title: data.title,
        description: data.description,
        youtubeUrl: data.youtubeUrl,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        status: data.status,
        thumbnail: data.thumbnail,
        author: user,
      });

      await this.repository.save(broadcast);

      return this.findById(broadcast.id);
    } catch (error) {
      console.error(error);

      throw new InternalServerErrorException(MESSAGE_ERR_CREATE);
    }
  }

  /* =====================================================
   * UPDATE
   ===================================================== */

  async update(id: string, data: UpdateBroadcastDto): Promise<Broadcast> {
    try {
      const broadcast = await this.findById(id);

      Object.assign(broadcast, {
        title: data.title ?? broadcast.title,
        description: data.description ?? broadcast.description,
        youtubeUrl: data.youtubeUrl ?? broadcast.youtubeUrl,
        scheduledAt: data.scheduledAt
          ? new Date(data.scheduledAt)
          : broadcast.scheduledAt,
        status: data.status ?? broadcast.status,
        thumbnail: data.thumbnail ?? broadcast.thumbnail,
      });

      await this.repository.save(broadcast);

      return this.findById(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
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
  }: SearchBroadcastDto): Promise<SearchResult<Broadcast[]>> {
    try {
      const skip = (page - 1) * per_page;

      const qb = this.repository.createQueryBuilder('broadcast');

      if (filter?.q) {
        qb.andWhere(
          `(broadcast.title ILIKE :q
          OR broadcast.description ILIKE :q)`,
          {
            q: `%${filter.q}%`,
          },
        );
      }

      if (filter?.status) {
        qb.andWhere('broadcast.status = :status', {
          status: filter.status,
        });
      }

      if (filter?.scheduledFrom) {
        qb.andWhere('broadcast.scheduledAt >= :from', {
          from: filter.scheduledFrom,
        });
      }

      if (filter?.scheduledTo) {
        qb.andWhere('broadcast.scheduledAt <= :to', {
          to: filter.scheduledTo,
        });
      }

      qb.orderBy('broadcast.scheduledAt', 'DESC')
        .addOrderBy('broadcast.created_at', 'DESC')
        .skip(skip)
        .take(per_page);

      const [items, total] = await qb.getManyAndCount();

      return {
        items,
        totalItems: total,
        totalPages: Math.ceil(total / per_page),
        currentPage: page,
      };
    } catch (error) {
      console.error('Erro ao buscar transmissões:', error);

      throw new InternalServerErrorException(MESSAGE_ERR_FIND);
    }
  }

  /* =====================================================
   * FIND BY ID
   ===================================================== */

  async findById(id: string): Promise<Broadcast> {
    const broadcast = await this.repository.findOne({
      where: { id },
    });

    if (!broadcast) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }

    return broadcast;
  }

  /* =====================================================
   * DELETE
   ===================================================== */

  async remove(id: string): Promise<void> {
    try {
      await this.findById(id);

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
