import { PaginatedResult } from '../interfaces/paginated-result.interface';

export class PaginationHelper {

  //?Good
  static paginate<T>(params): any{
    const { data, total, page, limit } = params;

    const totalPages = Math.ceil(total / limit);

    return {
      data: data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
