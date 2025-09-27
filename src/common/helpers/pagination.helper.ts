import { PaginatedResult } from '../interfaces/paginated-result.interface';

export class PaginationHelper {

  //?Good
  static paginate<T>(params): any{
    const { users, total, page, limit } = params;

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
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
