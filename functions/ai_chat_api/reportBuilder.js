'use strict';

function buildCaseContext(caseData) {

    return `

========== FIR ==========
${JSON.stringify(caseData.fir, null, 2)}

========== ACCUSED ==========
${JSON.stringify(caseData.accused, null, 2)}

========== VICTIMS ==========
${JSON.stringify(caseData.victims, null, 2)}

========== INVESTIGATION ==========
${JSON.stringify(caseData.investigation, null, 2)}

========== TIMELINE ==========
${JSON.stringify(caseData.timeline, null, 2)}

========== VEHICLES ==========
${JSON.stringify(caseData.vehicles, null, 2)}

========== PHONES ==========
${JSON.stringify(caseData.phones, null, 2)}

========== EVIDENCE ==========
${JSON.stringify(caseData.evidence, null, 2)}

========== TRANSACTIONS ==========
${JSON.stringify(caseData.transactions, null, 2)}

`;

}

module.exports = {

    buildCaseContext

};