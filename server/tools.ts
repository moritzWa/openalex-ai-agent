// OpenAlex API tools

export const searchAuthors = async (authorName: string) => {
  const response = await fetch(
    `https://api.openalex.org/authors?search=${encodeURIComponent(authorName)}&per_page=5`
  );
  const data = await response.json() as any;

  return data.results.map((author: any) => ({
    id: author.id,
    name: author.display_name,
    works_count: author.works_count,
    cited_by_count: author.cited_by_count
  }));
};

export const getAuthorWorks = async (authorId: string, limit: number = 10) => {
  const response = await fetch(
    `https://api.openalex.org/works?filter=author.id:${authorId}&per_page=${limit}&sort=cited_by_count:desc`
  );
  const data = await response.json() as any;

  return data.results.map((work: any) => ({
    title: work.display_name,
    year: work.publication_year,
    cited_by_count: work.cited_by_count,
    id: work.id
  }));
};

export const searchWorks = async (workTitle: string) => {
  const response = await fetch(
    `https://api.openalex.org/works?search=${encodeURIComponent(workTitle)}&per_page=5`
  );
  const data = await response.json() as any;

  return data.results.map((work: any) => ({
    id: work.id,
    title: work.display_name,
    year: work.publication_year,
    authors: work.authorships?.map((a: any) => a.author.display_name).join(", ") || "Unknown",
    cited_by_count: work.cited_by_count
  }));
};

export const getWorkCitations = async (workId: string, limit: number = 20) => {
  // Extract just the ID if full URL is provided
  const id = workId.includes('/') ? workId.split('/').pop() : workId;

  // Fetch 200 results (max per_page for OpenAlex API) to get the most cited ones
  const response = await fetch(
    `https://api.openalex.org/works?filter=cites:${id}&per_page=200`
  );
  const data = await response.json() as any;

  const slimmed = data.results.map((work: any) => ({
    id: work.id,
    title: work.display_name,
    year: work.publication_year,
    authors: work.authorships?.map((a: any) => a.author.display_name).join(", ") || "Unknown",
    cited_by_count: work.cited_by_count
  }));

  // Sort by citation count (descending) and take top N
  return slimmed
    .sort((a: any, b: any) => b.cited_by_count - a.cited_by_count)
    .slice(0, limit);
};

// Map tool names to actual functions
export const availableTools: Record<string, Function> = {
  searchAuthors,
  getAuthorWorks,
  searchWorks,
  getWorkCitations
};

// Tool definitions for OpenAI
export const toolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "searchAuthors",
      description: "Search for authors by name. Returns author IDs and names. Use this FIRST when user asks about an author.",
      parameters: {
        type: "object",
        properties: {
          authorName: {
            type: "string",
            description: "The name of the author to search for"
          }
        },
        required: ["authorName"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getAuthorWorks",
      description: "Get papers/works for a specific author by their OpenAlex ID",
      parameters: {
        type: "object",
        properties: {
          authorId: {
            type: "string",
            description: "The OpenAlex author ID (format starts with https://openalex.org/A)"
          },
          limit: {
            type: "number",
            description: "Number of works to return (default 10)"
          }
        },
        required: ["authorId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "searchWorks",
      description: "Search for papers/works by title. Returns work IDs, titles, and metadata. Use this FIRST when user asks about a specific paper or book.",
      parameters: {
        type: "object",
        properties: {
          workTitle: {
            type: "string",
            description: "The title of the work/paper to search for"
          }
        },
        required: ["workTitle"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getWorkCitations",
      description: "Get papers that cite a specific work. Returns the most cited papers that reference the given work.",
      parameters: {
        type: "object",
        properties: {
          workId: {
            type: "string",
            description: "The OpenAlex work ID (format: https://openalex.org/W... or just W...)"
          },
          limit: {
            type: "number",
            description: "Number of citations to return (default 20, max 100)"
          }
        },
        required: ["workId"]
      }
    }
  }
];
