const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const { getChartData } = require("../utils/chartUtils");

const generateChartTool = new DynamicStructuredTool({
    name: "generate_chart",
    description: "Generates a chart/graph from the CSV data. Use this tool when the user asks to visualize data.",
    schema: z.object({
        // DEBUG MODE: Relaxed Schema to catch LLM output errors
        file_path: z.string().optional().describe("The absolute path to the CSV file to analyze"),
        chart_type: z.string().optional().describe("The type of chart to generate (bar, line, scatter, pie, histogram, area)"),
        x_column: z.string().optional().describe("The column name for the X-axis"),
        series_columns: z.any().optional().describe("Array of column names for the Y-axis/Series."),
        title: z.string().optional().describe("A descriptive title for the chart"),
        description: z.string().optional().describe("A brief explanation of what the chart shows")
    }),
    func: async (input) => {
        try {
            console.log(`[Tool: generate_chart] Raw Input:`, JSON.stringify(input));

            // MANUAL VALIDATION / COERCION
            let { file_path, chart_type, x_column, series_columns, title, description } = input;

            if (!file_path || !chart_type || !x_column) {
                return `Error: Missing required fields (file_path, chart_type, or x_column). Received Input: ${JSON.stringify(input)}`;
            }

            // Coerce series_columns
            let finalSeries = [];
            if (Array.isArray(series_columns)) {
                finalSeries = series_columns;
            } else if (typeof series_columns === 'string') {
                finalSeries = [series_columns];
            }

            // Call the utility function logic
            let rawChartData = await getChartData(file_path, {
                x_column,
                series_columns: finalSeries,
                chart_type
            });

            if (!rawChartData || rawChartData.length === 0) {
                return JSON.stringify({ error: "No data generated. Check column names or filters." });
            }

            // Smart Key Inference for Histogram/Count
            let finalSeriesKeys = finalSeries;
            if (finalSeriesKeys.length === 0 && rawChartData.length > 0) {
                const sample = rawChartData[0];
                if (sample['Count'] !== undefined) finalSeriesKeys = ['Count'];
                else if (sample['Frequency'] !== undefined) finalSeriesKeys = ['Frequency'];
            }

            // Return the full object structure
            const result = {
                type: chart_type,
                data: rawChartData,
                xKey: x_column,
                seriesKeys: finalSeriesKeys,
                title: title || "Chart",
                description: description || ""
            };

            return JSON.stringify(result);

        } catch (error) {
            console.error("[Tool Error]", error);
            // Return error to LLM so it can retry
            return `System Error generating chart: ${error.message}`;
        }
    }
});

module.exports = { generateChartTool };
