"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    buildPagination(data, total, page, limit) {
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=repository.js.map