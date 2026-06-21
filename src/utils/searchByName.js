/**
 * Lọc danh sách theo tên (hoặc trường bất kỳ)
 * @param {Array} list - Mảng dữ liệu gốc
 * @param {string} keyword - Từ khoá tìm kiếm
 * @param {string} field - Trường cần tìm kiếm (mặc định là 'name')
 * @returns {Array}
 */
export function searchByName(list, keyword, field = 'name') {
  if (!keyword) return list;
  return list.filter(item =>
    (item[field] || '').toLowerCase().includes(keyword.toLowerCase())
  );
} 