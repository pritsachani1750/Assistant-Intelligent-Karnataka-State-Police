const xlsx = require("xlsx");

const file =
    "C:/Users/Prit Sachani/Music/ksp/dataset/data/KSP Crime Database Tables.xlsx";

const workbook = xlsx.readFile(file);

console.log("Sheets Found:");
console.log(workbook.SheetNames);

workbook.SheetNames.forEach(sheet => {

    const data =
        xlsx.utils.sheet_to_json(
            workbook.Sheets[sheet]
        );

    console.log(
        `${sheet} : ${data.length} rows`
    );

});