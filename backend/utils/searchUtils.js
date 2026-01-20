const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { HuggingFaceTransformersEmbeddings } = require("@langchain/community/embeddings/hf_transformers");
const { Document } = require("@langchain/core/documents");

const EMBEDDING_MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

class SearchManager {
    constructor() {
        this.embeddings = null;
        this.vectorStore = null;
        this.memoryStore = null;
    }

    // Initialize the Embeddings Model
    // We use a small, efficient model (MiniLM) that runs locally.
    // This converts text into number arrays (vectors).
    async getEmbeddings() {
        if (!this.embeddings) {
            console.log("Loading Embeddings Model... (This may take a moment)");
            this.embeddings = new HuggingFaceTransformersEmbeddings({
                modelName: EMBEDDING_MODEL_NAME,
            });
        }
        return this.embeddings;
    }

    async createVectorStore(documents) {
        if (!documents || documents.length === 0) return null;

        const embeddings = await this.getEmbeddings();
        this.vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
        return this.vectorStore;
    }

    // Add documents to the store
    // This allows us to search through them later using similarity search.
    async addDocuments(documents) {
        if (!documents || documents.length === 0) return;

        if (!this.vectorStore) {
            await this.createVectorStore(documents);
        } else {
            await this.vectorStore.addDocuments(documents);
        }
    }

    async getRetriever(k = 4) {
        if (!this.vectorStore) return null;
        return this.vectorStore.asRetriever(k);
    }

    async similaritySearch(query, k = 4) {
        if (!this.vectorStore) return [];
        return await this.vectorStore.similaritySearch(query, k);
    }
}

// Singleton handled in state.js usually, but class logic is here
module.exports = SearchManager;
