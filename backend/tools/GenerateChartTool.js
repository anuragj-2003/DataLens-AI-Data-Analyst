const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const { getChartData } = require("../utils/chartUtils");

const generateChartTool = new DynamicStructuredTool({
    name: "generate_chart",
    description: "Generates a chart/graph from the CSV data. Use this tool when the user asks to visualize data.",
    schema: z.object({
        file_path: z.string().describe("The absolute path to the CSV file to analyze"),
        chart_type: z.enum(["bar", "line", "scatter", "pie", "histogram", "area"]).describe("The type of chart to generate"),
        x_column: z.string().describe("The column name for the X-axis"),
        series_columns: z.array(z.string()).describe("Array of column names for the Y-axis/Series. Leave empty for Histogram or generic Count."),
        title: z.string().describe("A descriptive title for the chart"),
        description: z.string().describe("A brief explanation of what the chart shows")
    }),
    func: async ({ file_path, chart_type, x_column, series_columns, title, description }) => {
        try {
            console.log(`[Tool: generate_chart] Request: ${chart_type} for ${x_column}`);

            // Call the utility function logic
            let rawChartData = await getChartData(file_path, {
                x_column,
                series_columns,
                chart_type
            });

            if (!rawChartData || rawChartData.length === 0) {
                return JSON.stringify({ error: "No data generated. Check column names or filters." });
            }

            // Smart Key Inference for Histogram/Count (Duplicating logic from chat.js for robustness inside tool)
            let finalSeriesKeys = series_columns || [];
            if (finalSeriesKeys.length === 0 && rawChartData.length > 0) {
                const sample = rawChartData[0];
                if (sample['Count'] !== undefined) finalSeriesKeys = ['Count'];
                else if (sample['Frequency'] !== undefined) finalSeriesKeys = ['Frequency'];
            }

            // Return the full object structure so the AgentExecutor returns it in steps
            const result = {
                type: chart_type,
                data: rawChartData,
                xKey: x_column,
                seriesKeys: finalSeriesKeys,
                title: title,
                description: description
            };

            // We return a string for the LLM to read. 
            // We summarize data to avoid token limit overflow for the LLM, 
            // BUT we need the FULL object for the frontend.
            // PRO TIP: We can put the full object in a "hidden" field or just return the JSON.
            // Given Groq holds 8k context, 150 rows is small (~2k tokens). 
            // If data is huge, we should truncate for LLM but keep full for frontend.
            // For now, let's return JSON.stringify(result).
            return JSON.stringify(result);

        } catch (error) {
            console.error("[Tool Error]", error);
            return `Error generating chart: ${error.message}`;
        }
    }
});

module.exports = { generateChartTool };
