import { PaginatedResult } from '../interfaces/paginated-result.interface';

export class PaginationHelper {

   /**
   * Create a paginated response
   * @param params - Object containing pagination parameters
   * @param params.users - The data to paginate (can be any entity array)
   * @param params.total - Total number of items
   * @param params.page - Current page number
   * @param params.limit - Number of items per page
   * @returns Paginated result with data and pagination metadata
   */
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
