import { NewsCategoryEnum } from 'src/utils/enums';
import { NewsController } from './news.controller';

describe('NewsController', () => {
  it('should use uploaded image URL when a file is sent', async () => {
    const service = {
      create: jest.fn().mockResolvedValue({ id: 'news-1' }),
    };

    const controller = new NewsController(service as any);
    const coverFile = {
      location: 'https://cdn.example.com/uploads/cover.jpg',
    } as any;
    const thumbFile = {
      location: 'https://cdn.example.com/uploads/thumb.jpg',
    } as any;

    await controller.create(
      {
        title: 'Notícia com imagem anexada',
        content: 'Conteúdo da notícia',
        category: NewsCategoryEnum.NOVENA,
      },
      { id: 'user-1' } as any,
      {
        coverImage: [coverFile],
        thumbnail: [thumbFile],
      },
    );

    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({
        coverImage: 'https://cdn.example.com/uploads/cover.jpg',
        thumbnail: 'https://cdn.example.com/uploads/thumb.jpg',
      }),
      { id: 'user-1' },
    );
  });
});
