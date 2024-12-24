export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface SortingOptions {
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface FilterOptions {
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  totalCount: number;
  data: T[];
}

const getFilterOptions = (query: FilterOptions) => {
  const filterOptions: FilterOptions = {};

  Object.keys(query).forEach((key) => {
    if (!["page", "limit", "sortBy", "order"].includes(key)) {
      const value = query[key];

      if (key.includes(".")) {
        const keys = key.split(".");
        let current = filterOptions;

        keys.forEach((subKey, index) => {
          if (index === keys.length - 1) {
            current[subKey] = value;
          } else {
            current[subKey] = current[subKey] || {};
            current = current[subKey];
          }
        });
      } else if (
        typeof value === "string" &&
        value.includes(",") &&
        (value.startsWith("from") || value.startsWith("to"))
      ) {
        const parts = value.split(",");
        const fromIndex = parts.indexOf("from");
        const toIndex = parts.indexOf("to");

        const [fromDay, fromMonth, fromYear] = parts[fromIndex + 1].split("-");
        const [toDay, toMonth, toYear] = parts[toIndex + 1].split("-");

        const fromDate =
          fromIndex !== -1
            ? new Date(
                Number(fromYear),
                Number(fromMonth) - 1,
                Number(fromDay) + 1,
                -21
              )
            : null;
        const toDate =
          toIndex !== -1
            ? new Date(Number(toYear), Number(toMonth) - 1, Number(toDay) + 1)
            : null;

        filterOptions[key] = { from: fromDate, to: toDate };
      } else if (typeof value === "string" && value.includes(",")) {
        filterOptions[key] = value.split(",").map((v) => v.trim());
      } else {
        filterOptions[key] = value;
      }
    }
  });

  return filterOptions;
};

const applyFilters = <T extends Record<string, any>>(
  data: T[],
  filterOptions: FilterOptions
) => {
  const getValue = (obj: any, path: string): any =>
    path.split(".").reduce((acc, part) => acc?.[part], obj);

  return data.filter((item) => {
    return Object.entries(filterOptions).every(([key, value]) => {
      const itemValue = getValue(item, key);

      if (
        typeof value === "object" &&
        value !== null &&
        !value.from &&
        !value.to
      ) {
        return Object.entries(value).every(([nestedKey, nestedValue]) => {
          if (
            typeof nestedValue !== "string" &&
            typeof nestedValue !== "number"
          ) {
            return false;
          }

          const nestedItemValue = itemValue?.[nestedKey];
          return (
            nestedItemValue?.toString().toLowerCase() ===
            nestedValue.toString().toLowerCase()
          );
        });
      }

      if (Array.isArray(value)) {
        return value.includes(itemValue?.toString());
      }

      if (value && (value.from || value.to)) {
        const itemDate = new Date(itemValue);
        if (value.from && value.to) {
          return itemDate >= value.from && itemDate <= value.to;
        } else if (value.from) {
          return itemDate >= value.from;
        } else if (value.to) {
          return itemDate <= value.to;
        }
      }

      if (typeof value === "object" && value.is) {
        return itemValue?.toString() === value.is.toString();
      }

      return itemValue
        ?.toString()
        .toLowerCase()
        .includes(value.toString().toLowerCase());
    });
  });
};

export function manageData<T extends Record<string, any>>(
  data: T[],
  query: PaginationOptions & SortingOptions & FilterOptions,
  enableFiltering = false
): PaginatedResponse<T> {
  const { page = 1, limit = 10, sortBy = "createdAt", order = "asc" } = query;

  const filterOptions = getFilterOptions(query);

  const filteredData = enableFiltering
    ? applyFilters(data, filterOptions)
    : data;

  const sortedData = filteredData.sort((a, b) => {
    if (typeof a[sortBy] === "string" && typeof b[sortBy] === "string") {
      if (a[sortBy].toLowerCase() < b[sortBy].toLowerCase())
        return order === "asc" ? -1 : 1;
      if (a[sortBy].toLowerCase() > b[sortBy].toLowerCase())
        return order === "asc" ? 1 : -1;
    }

    if (a[sortBy] < b[sortBy]) return order === "asc" ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return order === "asc" ? 1 : -1;
    return 0;
  });

  const totalCount = sortedData.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return {
    totalCount,
    data: paginatedData,
  };
}
