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

// Map tool names to actual functions
export const availableTools: Record<string, Function> = {
  searchAuthors,
  getAuthorWorks
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
  }
];
