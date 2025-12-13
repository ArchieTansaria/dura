function formatTable(report) {
  const headers = [
    "name",
    "type",
    "currentRange",
    "currentResolved",
    "latest",
    "diff",
    "breaking",
    "riskScore",
    "riskLevel",
  ];

  const rows = report.map((dep) => [
    dep.name || "",
    dep.type || "",
    dep.currentRange || "",
    dep.currentResolved || "N/A",
    dep.latest || "N/A",
    dep.diff || "unknown",
    dep.breaking ? "yes" : "no",
    dep.riskScore?.toString() || "0",
    dep.riskLevel || "low",
  ]);

  const allRows = [headers, ...rows];
  const colWidths = headers.map((_, colIdx) => {
    return Math.max(
      ...allRows.map((row) => (row[colIdx] || "").toString().length),
      headers[colIdx].length
    );
  });

  const pad = (str, width) => {
    const s = (str || "").toString();
    return s.padEnd(width);
  };

  const separator = "+" + colWidths.map((w) => "-".repeat(w + 2)).join("+") + "+";

  let output = separator + "\n";
  output +=
    "| " +
    headers.map((h, i) => pad(h, colWidths[i])).join(" | ") +
    " |\n";
  output += separator + "\n";

  for (const row of rows) {
    output +=
      "| " +
      row.map((cell, i) => pad(cell, colWidths[i])).join(" | ") +
      " |\n";
  }

  output += separator;
  return output;
}

module.exports = { formatTable }