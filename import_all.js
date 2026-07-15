const XLSX = require("xlsx");

const excelFile =
    "C:/Users/Prit Sachani/Music/ksp/dataset/data/KSP Crime Database Tables.xlsx";

const workbook = XLSX.readFile(excelFile);

console.log("Sheets Found:");

console.log(workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {

    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(
        `${sheetName} : ${data.length} rows`
    );
}