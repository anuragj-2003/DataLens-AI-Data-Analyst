
// FILE: chartUtils.js
// DESCRIPTION:
// Provides "Pandas-like" data analysis and "Matplotlib-like" data preparation
// for the backend. It handles CSV reading, statistical analysis, and
// formatting data for frontend visualization.


const fs = require('fs');
const csv = require('csv-parser');

// HELPER: Statistical Functions (Numpy-style)
const calculateMedian = (values) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const calculateStdDev = (values, mean) => {
    if (values.length === 0) return 0;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
};

// HELPER: Data Cleaning (Pandas-style str.extract)
const extractNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return null;
    // Regex to find the first valid float number (handles negative, decimals)
    // Similar to: df['col'].str.extract(r"([\d.-]+)").astype(float)
    const match = val.toString().match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
};

// FUNCTION: analyzeCsv
// DESCRIPTION: Analyzes CSV columns, detecting types and calculating stats.
// INPUT: filePath (String)
// OUTPUT: Promise<Object> (Metadata: rows, columns, column_stats)
const analyzeCsv = (filePath) => {
    return new Promise((resolve, reject) => {
        try {
            const results = [];
            let columns = [];

            const stream = fs.createReadStream(filePath);

            // Error handling for the file stream itself (e.g., file not found)
            stream.on('error', (err) => {
                console.error("Stream Error in analyzeCsv:", err);
                reject(err);
            });

            stream.pipe(csv())
                .on('headers', (headers) => {
                    columns = headers;
                })
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    try {
                        // INNER TRY-CATCH for logic safety
                        if (results.length === 0) {
                            return resolve({ rowCount: 0, columns: [], preview: [] });
                        }

                        // Calculate detailed stats
                        const columnStats = {};

                        columns.forEach(col => {
                            // 1. naive extraction
                            const rawValues = results.map(r => r[col]).filter(v => v !== undefined && v !== '' && v !== null);

                            if (rawValues.length === 0) {
                                columnStats[col] = { type: 'unknown', count: 0 };
                                return;
                            }

                            // 2. Try to parse numbers (strict first, then lenient/cleaning)
                            const cleanedValues = rawValues
                                .map(v => extractNumber(v))
                                .filter(v => v !== null && isFinite(v));

                            // Heuristic: If > 80% of rows are numeric after cleaning, treat as number
                            const isNumeric = (cleanedValues.length / rawValues.length) > 0.8;

                            if (isNumeric) {
                                const min = Math.min(...cleanedValues);
                                const max = Math.max(...cleanedValues);
                                const sum = cleanedValues.reduce((a, b) => a + b, 0);
                                const mean = sum / cleanedValues.length;
                                const median = calculateMedian(cleanedValues);
                                const stdDev = calculateStdDev(cleanedValues, mean);

                                columnStats[col] = {
                                    type: 'number',
                                    count: cleanedValues.length,
                                    min: min,
                                    max: max,
                                    mean: parseFloat(mean.toFixed(2)),
                                    median: parseFloat(median.toFixed(2)),
                                    std_dev: parseFloat(stdDev.toFixed(2))
                                };
                            } else {
                                // String stats
                                const unique = new Set(rawValues);
                                columnStats[col] = {
                                    type: 'string',
                                    count: rawValues.length,
                                    unique_count: unique.size,
                                    example_values: rawValues.slice(0, 3)
                                };
                            }
                        });

                        // Get Preview (First 5 rows)
                        const preview = results.slice(0, 5);

                        resolve({
                            rowCount: results.length,
                            columns: columns,
                            columnMetadata: columnStats,
                            preview: preview
                        });

                    } catch (innerError) {
                        console.error("Error processing CSV stats:", innerError);
                        reject(innerError);
                    }
                })
                .on('error', (err) => {
                    console.error("CSV Parser Error:", err);
                    reject(err);
                });

        } catch (e) {
            console.error("Setup Error in analyzeCsv:", e);
            reject(e);
        }
    });
};

// Helper to get full data for specific columns for charting
// Helper to get full data for specific columns for charting
// FUNCTION: getChartData
// DESCRIPTION: Extracts and processes data for visualization.
// INPUT: filePath, config { x_column, series_columns, filters: [{col, op, val}], chart_type }
// OUTPUT: Promise<Array> (Dataset for frontend)
const getChartData = (filePath, config) => {
    return new Promise((resolve, reject) => {
        try {
            const rawData = [];
            const { x_column, series_columns, filters } = config;

            if (!fs.existsSync(filePath)) {
                console.error("File not found for chart:", filePath);
                return reject(new Error(`File not found: ${filePath}`));
            }

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => rawData.push(data))
                .on('end', () => {
                    try {
                        // INNER TRY-CATCH for processing logic
                        if (rawData.length === 0) {
                            return resolve([]);
                        }

                        // 1. FILTERING (Boolean Masking Principle)
                        // If filters are provided, we reduce the dataset first.
                        // Example: filters = [{ column: "Price", operator: ">", value: 10000 }]
                        let filteredData = rawData;
                        if (filters && Array.isArray(filters) && filters.length > 0) {
                            filteredData = rawData.filter(row => {
                                return filters.every(filter => {
                                    const rowVal = extractNumber(row[filter.column]);
                                    const threshold = parseFloat(filter.value);

                                    if (rowVal === null || isNaN(threshold)) return false;

                                    switch (filter.operator) {
                                        case '>': return rowVal > threshold;
                                        case '<': return rowVal < threshold;
                                        case '>=': return rowVal >= threshold;
                                        case '<=': return rowVal <= threshold;
                                        case '==': return rowVal === threshold;
                                        case '!=': return rowVal !== threshold;
                                        default: return true;
                                    }
                                });
                            });
                        }

                        // Check if we need to aggregate (count)
                        const firstRow = filteredData[0] || {};
                        const fileColumns = Object.keys(firstRow);

                        const requestedCount = (series_columns && series_columns.some(col =>
                            col && col.toLowerCase() === 'count' && !fileColumns.includes(col)
                        )) || ((!series_columns || series_columns.length === 0) && (config.chart_type === 'bar' || config.chart_type === 'pie'));

                        let processedResults = [];

                        if (requestedCount && x_column) {
                            // PERFORM AGGREGATION: Count by x_column
                            const counts = {};
                            filteredData.forEach(row => {
                                const key = row[x_column] || 'Unknown';
                                counts[key] = (counts[key] || 0) + 1;
                            });

                            processedResults = Object.keys(counts).map(key => ({
                                [x_column]: key,
                                'Count': counts[key]
                            }));

                        } else if (config.chart_type === 'histogram' && x_column) {
                            // Histogram Logic: Manual Binning
                            const values = filteredData
                                .map(r => extractNumber(r[x_column]))
                                .filter(v => v !== null && isFinite(v));

                            if (values.length > 0) {
                                const min = Math.min(...values);
                                const max = Math.max(...values);
                                // Dynamic bin count based on data size, default 10-20
                                const binCount = Math.min(20, Math.max(5, Math.floor(Math.sqrt(values.length))));
                                const step = (max - min) / binCount;

                                // If step is 0 (all same values), default to 1
                                const safeStep = step === 0 ? 1 : step;

                                const bins = Array(binCount).fill(0);
                                const binLabels = [];

                                // Initialize Labels
                                for (let i = 0; i < binCount; i++) {
                                    const start = min + (i * safeStep);
                                    const end = min + ((i + 1) * safeStep);
                                    // Format label nicely
                                    const startStr = Number.isInteger(start) ? start.toString() : start.toFixed(2);
                                    const endStr = Number.isInteger(end) ? end.toString() : end.toFixed(2);
                                    binLabels.push(`${startStr}-${endStr}`);
                                }

                                values.forEach(v => {
                                    let binIndex = Math.floor((v - min) / safeStep);
                                    if (binIndex >= binCount) binIndex = binCount - 1;
                                    if (binIndex < 0) binIndex = 0;
                                    bins[binIndex]++;
                                });

                                processedResults = binLabels.map((label, i) => ({
                                    [x_column]: label, // X-axis label (range)
                                    'Frequency': bins[i] // Y-axis value
                                }));
                            } else {
                                processedResults = [];
                            }

                        } else {
                            // RAW DATA EXTRACTION (Cleaned)
                            processedResults = filteredData.map(data => {
                                const row = {};
                                if (x_column) {
                                    // Try to parse X if it looks numeric, else keep string
                                    const xNum = extractNumber(data[x_column]);
                                    // Heuristic: if extraction fails or is very different from original string, keep original string? 
                                    // Actually, for X-axis, we usually accept categorical strings.
                                    // Only parse if it was purely numeric? 
                                    // Let's rely on data[x_column] mostly, but if it looks numeric use that.
                                    row[x_column] = data[x_column];
                                }

                                if (series_columns && Array.isArray(series_columns)) {
                                    series_columns.forEach(col => {
                                        // Robust numeric extraction for Y-Axis
                                        const val = extractNumber(data[col]);
                                        row[col] = (val !== null) ? val : 0;
                                    });
                                }
                                return row;
                            });
                        }

                        // Limit size for frontend performance
                        const limitedResults = processedResults.length > 2000 ? processedResults.slice(0, 2000) : processedResults;
                        resolve(limitedResults);

                    } catch (innerErr) {
                        console.error("Error processing chart data:", innerErr);
                        reject(innerErr);
                    }
                })
                .on('error', (err) => {
                    console.error("CSV Read Error:", err);
                    reject(err);
                });

        } catch (e) {
            console.error("Setup Error in getChartData:", e);
            reject(e);
        }
    });
};

module.exports = { analyzeCsv, getChartData };
