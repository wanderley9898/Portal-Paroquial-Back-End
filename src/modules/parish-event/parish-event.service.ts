import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchResult } from 'src/@types/search.type';
import { ParishEvent } from 'src/entities';
import { S3Service } from 'src/services/aws/s3.service';
import { Repository } from 'typeorm';
import {
  CreateParishEventDto,
  SearchParishEventDto,
  UpdateParishEventDto,
} from './dto';

const CREATE_ERROR = 'Erro ao criar evento paroquial';
const UPDATE_ERROR = 'Erro ao atualizar evento paroquial';
const FIND_ERROR = 'Erro ao buscar eventos paroquiais';
const DELETE_ERROR = 'Erro ao remover evento paroquial';
const NOT_FOUND = 'Evento paroquial não encontrado';

@Injectable()
export class ParishEventService {
  constructor(
    @InjectRepository(ParishEvent)
    private readonly repository: Repository<ParishEvent>,
    private readonly s3Service: S3Service,
  ) {}

  async create(data: CreateParishEventDto): Promise<ParishEvent> {
    try {
      const event = this.repository.create(data);
      await this.repository.save(event);
      return this.findById(event.id);
    } catch {
      throw new InternalServerErrorException(CREATE_ERROR);
    }
  }

  async update(id: string, data: UpdateParishEventDto): Promise<ParishEvent> {
    try {
      const event = await this.findById(id);
      const oldImage = event.image;
      const nextImage =
        data.image === undefined ? event.image : data.image || null;

      Object.assign(event, {
        ...data,
        image: nextImage,
      });

      await this.repository.save(event);

      if (oldImage && oldImage !== nextImage) {
        await this.s3Service.deleteImageFromS3IfNeeded(oldImage);
      }

      return this.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(UPDATE_ERROR);
    }
  }

  async search({
    filter,
    page = 1,
    per_page = 10,
  }: SearchParishEventDto): Promise<SearchResult<ParishEvent[]>> {
    try {
      const qb = this.repository.createQueryBuilder('event');
      const skip = (page - 1) * per_page;

      if (filter?.q) {
        qb.andWhere(
          '(event.name ILIKE :q OR event.description ILIKE :q OR event.location ILIKE :q OR event.responsible ILIKE :q)',
          { q: `%${filter.q}%` },
        );
      }
      if (filter?.category) {
        qb.andWhere('event.category = :category', {
          category: filter.category,
        });
      }
      if (filter?.dateFrom) {
        qb.andWhere('event.date >= :dateFrom', { dateFrom: filter.dateFrom });
      }
      if (filter?.dateTo) {
        qb.andWhere('event.date <= :dateTo', { dateTo: filter.dateTo });
      }

      qb.orderBy('event.date', 'ASC')
        .addOrderBy('event.time', 'ASC')
        .addOrderBy('event.created_at', 'DESC')
        .skip(skip)
        .take(per_page);

      const [items, total] = await qb.getManyAndCount();
      return {
        items,
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / per_page),
      };
    } catch {
      throw new InternalServerErrorException(FIND_ERROR);
    }
  }

  async findById(id: string): Promise<ParishEvent> {
    const event = await this.repository.findOne({ where: { id } });
    if (!event) throw new NotFoundException(NOT_FOUND);
    return event;
  }

  async findByIdPublic(id: string): Promise<ParishEvent> {
    const event = await this.findById(id);
    await this.repository.increment({ id }, 'views', 1);
    event.views += 1;
    return event;
  }

  async remove(id: string): Promise<void> {
    try {
      const event = await this.findById(id);

      await this.s3Service.deleteImageFromS3IfNeeded(event.image);
      await this.repository.delete(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(DELETE_ERROR);
    }
  }
}
