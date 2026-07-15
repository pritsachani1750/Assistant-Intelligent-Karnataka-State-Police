const xlsx = require("xlsx");

const workbook = xlsx.readFile(
    "C:/Users/Prit Sachani/Music/ksp/dataset/data/KSP Crime Database Tables.xlsx"
);

const sheets = [
    "FIR",
    "FIR_Accused",
    "FIR_Victim",
    "Accused",
    "Victim",
    "Gang",
    "Officer",
    "Investigation"
];

for (const sheetName of sheets) {

    const data =
        xlsx.utils.sheet_to_json(
            workbook.Sheets[sheetName]
        );

    console.log("\n================");
    console.log(sheetName);
    console.log("================");

    console.log(
        Object.keys(data[0])
    );

}