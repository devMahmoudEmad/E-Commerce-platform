export function paginate(data, page = 1, itemsPerPage = 5) {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = page * itemsPerPage;
  
  return {
    data: data.slice(start, end),
    currentPage: page,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    getPage: (newPage) => paginate(data, newPage, itemsPerPage)
  };
}