export interface Recipe {
    id: string;
    title: string;
    description: string;
    date: string;
    thumbnail: string;
    tags: string[];
    content?: string;
}

const GITHUB_REPO = 'alevar/SparrowCooks';
const GITHUB_BRANCH = 'main';
const RECIPES_PATH = 'recipes';

/**
 * Fetch all recipes from GitHub repository
 */
export async function fetchAllRecipes(): Promise<Recipe[]> {
    try {
        // Fetch directory listing from GitHub API
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${RECIPES_PATH}?ref=${GITHUB_BRANCH}`
        );

        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Filter for directories only (each directory is a recipe)
        const recipeDirs = data.filter((item: any) => item.type === 'dir');

        // Fetch recipe metadata for each directory
        const recipePromises = recipeDirs.map(async (dir: any) => {
            const recipeId = dir.name;
            try {
                // Fetch the recipe.md file from this directory
                const recipeData = await fetchRecipeFile(recipeId);
                if (!recipeData) return null;

                // Parse frontmatter
                const frontmatter = parseFrontmatter(recipeData);
                if (!frontmatter) return null;

                // Create recipe object
                const recipe: Recipe = {
                    id: recipeId,
                    title: frontmatter.title || 'Untitled Recipe',
                    description: frontmatter.description || '',
                    date: frontmatter.date || new Date().toISOString(),
                    tags: frontmatter.tags || [],
                    thumbnail: frontmatter.thumbnail
                        ? generateRawGitHubUrl(recipeId, frontmatter.thumbnail.replace('./', ''))
                        : '',
                };

                return recipe;
            } catch (error) {
                console.error(`Error fetching recipe ${recipeId}:`, error);
                return null;
            }
        });

        // Wait for all recipe fetches to complete
        const recipes = (await Promise.all(recipePromises)).filter(recipe => recipe !== null) as Recipe[];

        // Sort recipes by date, newest first
        return recipes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
        console.error('Error fetching recipes:', error);
        throw new Error('Failed to load recipes from GitHub');
    }
}

/**
 * Fetch a recipe file from GitHub
 */
async function fetchRecipeFile(recipeId: string): Promise<string | null> {
    try {
        // First check if recipe.md exists
        const recipeUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${RECIPES_PATH}/${recipeId}/recipe.md?ref=${GITHUB_BRANCH}`;
        const response = await fetch(recipeUrl);

        if (!response.ok) {
            // If recipe.md doesn't exist, try README.md
            const readmeUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${RECIPES_PATH}/${recipeId}/README.md?ref=${GITHUB_BRANCH}`;
            const readmeResponse = await fetch(readmeUrl);

            if (!readmeResponse.ok) {
                console.error(`No recipe file found for ${recipeId}`);
                return null;
            }

            const readmeData = await readmeResponse.json();
            return atob(readmeData.content); // Decode base64 content
        }

        const data = await response.json();
        return atob(data.content); // Decode base64 content
    } catch (error) {
        console.error(`Error fetching recipe file for ${recipeId}:`, error);
        return null;
    }
}

/**
 * Generate a raw GitHub URL for a file
 */
function generateRawGitHubUrl(recipeId: string, filePath: string): string {
    return `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${RECIPES_PATH}/${recipeId}/${filePath}`;
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(markdown: string): Record<string, any> | null {
    const frontmatterRegex = /^---\s*([\s\S]*?)\s*---/;
    const match = markdown.match(frontmatterRegex);

    if (!match || !match[1]) {
        return null;
    }

    const frontmatter: Record<string, any> = {};
    const lines = match[1].split('\n');

    for (const line of lines) {
        const keyValue = line.split(':');
        if (keyValue.length < 2) continue;

        const key = keyValue[0].trim();
        let value = keyValue.slice(1).join(':').trim();

        // Handle arrays in frontmatter (like tags)
        if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(item => item.trim());
        }

        frontmatter[key] = value;
    }

    return frontmatter;
}

/**
 * Fetch a single recipe by ID
 */
export async function fetchRecipeById(recipeId: string): Promise<Recipe | null> {
    try {
        // Fetch the recipe file content
        const recipeContent = await fetchRecipeFile(recipeId);
        if (!recipeContent) return null;

        // Parse frontmatter
        const frontmatter = parseFrontmatter(recipeContent);
        if (!frontmatter) return null;

        // Create recipe object with content
        const recipe: Recipe = {
            id: recipeId,
            title: frontmatter.title || 'Untitled Recipe',
            description: frontmatter.description || '',
            date: frontmatter.date || new Date().toISOString(),
            tags: frontmatter.tags || [],
            thumbnail: frontmatter.thumbnail
                ? generateRawGitHubUrl(recipeId, frontmatter.thumbnail.replace('./', ''))
                : '',
            content: parseRecipeContent(recipeContent, recipeId) // Include processed content
        };

        return recipe;
    } catch (error) {
        console.error(`Error fetching recipe ${recipeId}:`, error);
        return null;
    }
}

/**
 * Parse recipe content (after frontmatter) and process image paths
 */
export function parseRecipeContent(markdown: string, recipeId: string): string {
    // Remove frontmatter
    const contentWithoutFrontmatter = markdown.replace(/^---\s*[\s\S]*?---/, '').trim();

    // Process relative image paths to use GitHub raw URLs
    const processedContent = contentWithoutFrontmatter.replace(
        /!\[(.*?)\]\((\.\/assets\/.*?)\)/g,
        (match, altText, imagePath) => {
            const githubPath = imagePath.replace('./', '');
            const rawUrl = generateRawGitHubUrl(recipeId, githubPath);
            return `![${altText}](${rawUrl})`;
        }
    );

    return processedContent;
}